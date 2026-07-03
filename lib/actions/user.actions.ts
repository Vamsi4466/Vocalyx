"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { REAL_SESSION_COOKIE, DEMO_SESSION_COOKIE } from "../constants";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseStringify } from "../utils";

if (!appwriteConfig.databaseId || !appwriteConfig.usersCollectionId) {
  throw new Error("Missing Appwrite configuration values");
}

const dbId = appwriteConfig.databaseId;
const usersCollId = appwriteConfig.usersCollectionId;
const DEMO_EMAIL = "vocalyxdemo@gmail.com";

const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    dbId,
    usersCollId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// --- Demo account ID resolution (dynamic, cached in-memory per server instance) ---
let cachedDemoAccountId: string | null = null;

export const getDemoAccountId = async (): Promise<string> => {
  if (cachedDemoAccountId) return cachedDemoAccountId;

  const demoUserDoc = await getUserByEmail(DEMO_EMAIL);

  if (!demoUserDoc) {
    throw new Error(
      `Demo user document not found for ${DEMO_EMAIL}. Make sure it exists in ${usersCollId}.`
    );
  }

  cachedDemoAccountId = demoUserDoc.accountId;
  return cachedDemoAccountId!;
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

    await databases.createDocument(
      dbId,
      usersCollId,
      ID.unique(),
      {
        fullName,
        email,
        accountId,
        booksCount: 0,
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

    (await cookies()).set(REAL_SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });

    (await cookies()).delete(DEMO_SESSION_COOKIE);

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const signInAsDemoUser = async () => {
  try {
    const { users } = await createAdminClient();
    const demoAccountId = await getDemoAccountId();

    const session = await users.createSession(demoAccountId);

    (await cookies()).set(DEMO_SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });
  } catch (error) {
    console.log(error, "Failed to sign in as demo user");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      dbId,
      usersCollId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const isDemoUser = async (user: { accountId?: string } | null | undefined) => {
  if (!user) return false;
  const demoAccountId = await getDemoAccountId();
  return user.accountId === demoAccountId;
};

export const signOutUser = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    (await cookies()).delete(REAL_SESSION_COOKIE);
    redirect("/sign-in");
  }
};

export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

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

    const queries = [Query.limit(limit), Query.offset(offset)];

    if (searchText && searchText.trim() !== "") {
      queries.push(
        Query.or([
          Query.contains("fullName", searchText),
          Query.contains("email", searchText),
        ])
      );
    }

    const { documents: users, total } = await databases.listDocuments(
      dbId,
      usersCollId,
      queries
    );

    return { users, total };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0 };
  }
};