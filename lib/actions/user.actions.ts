"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
// import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

if (!appwriteConfig.databaseId || !appwriteConfig.usersCollectionId) {
  throw new Error("Missing Appwrite configuration values");
}

const dbId = appwriteConfig.databaseId;
const usersCollId = appwriteConfig.usersCollectionId;

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    dbId,            // now a string
    usersCollId,     // …and here
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();
    const filesCount = 0;
    const storageUsed = 0;

    await databases.createDocument(
      dbId,            // now a string
      usersCollId,     // …and here
      ID.unique(),
      {
        name:fullName,
        email,
        accountId,
        // joinedAt: new Date().toISOString(),
        // booksCount,
        // storageUsed,
      },
    );
  }

  return parseStringify({ accountId });
};

export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      dbId,            // now a string
      usersCollId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current");
    (await cookies()).delete("appwrite-session");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const getAllUsers = async (
  limit: number,
  offset: number,
  searchText?: string
) => {
  try {
    const { databases } = await createAdminClient();

    const queries = [
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (searchText && searchText.trim() !== "") {
      queries.push(
        Query.or([
          Query.contains("fullName", searchText),
          Query.contains("email", searchText),
        ])
      );
    }

    const { documents: users, total } =
      await databases.listDocuments(
        dbId,            // now a string
        usersCollId,
        queries
      );

    return { users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0 };
  }
};

