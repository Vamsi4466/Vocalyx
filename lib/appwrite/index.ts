"use server";

import { Account, Avatars, Client, Databases, Storage, Users } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";
import { REAL_SESSION_COOKIE, DEMO_SESSION_COOKIE } from "../constants";

export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl!)
    .setProject(appwriteConfig.projectId!);

  const cookieStore = await cookies();

  const realSession = cookieStore.get(REAL_SESSION_COOKIE);
  const demoSession = cookieStore.get(DEMO_SESSION_COOKIE);

  const sessionSecret = realSession?.value || demoSession?.value;

  if (!sessionSecret) throw new Error("No session");

  client.setSession(sessionSecret);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
};

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl!)
    .setProject(appwriteConfig.projectId!)
    .setKey(appwriteConfig.secretKey!);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
    get users() {
      return new Users(client);
    },
  };
};
