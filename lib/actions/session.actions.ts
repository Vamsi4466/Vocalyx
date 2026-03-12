"use server";

import { EndSessionResult, StartSessionResult } from "@/types";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { ID } from "node-appwrite";

export const startVoiceSession = async (
  userId: string,
  bookId: string
): Promise<StartSessionResult> => {
  try {
    const { databases } = await createAdminClient();

    const startedAt = new Date().toISOString();

    const session = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sessionsCollectionId,
      ID.unique(),
      {
        userId,
        bookId,
        startedAt,
        endedAt: null,
        durationSeconds: 0,
      }
    );

    return {
      success: true,
      sessionId: session.$id,
    };
  } catch (error) {
    console.error('Error starting voice session', error);

    return {
      success: false,
      error: 'Failed to start voice session. Please try again later.',
    };
  }
};

export const endVoiceSession = async (
  sessionId: string
): Promise<EndSessionResult> => {
  try {
    const { databases } = await createAdminClient();

    // Get existing session
    const session = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sessionsCollectionId,
      sessionId
    );

    const startedAt = new Date(session.startedAt);
    const endedAt = new Date();

    // Calculate duration in seconds
    const durationSeconds = Math.floor(
      (endedAt.getTime() - startedAt.getTime()) / 1000
    );

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sessionsCollectionId,
      sessionId,
      {
        endedAt: endedAt.toISOString(),
        durationSeconds,
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error ending voice session', error);

    return {
      success: false,
      error: 'Failed to end voice session. Please try again later.',
    };
  }
};