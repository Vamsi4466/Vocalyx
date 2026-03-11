'use server';

import { ID } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite';
import { EndSessionResult, StartSessionResult } from '@/types';
import { appwriteConfig } from '../appwrite/config';

const DATABASE_ID = process.env.APPWRITE_DATABASE!;
const VOICE_SESSION_COLLECTION_ID =
  process.env.APPWRITE_SESSION_COLLECTION!;

export const startVoiceSession = async (
  userId: string,
  bookId: string
): Promise<StartSessionResult> => {
  try {
    const { databases } = await createAdminClient();

    const session = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.sessionsCollectionId,
      ID.unique(),
      {
        userId,
        bookId,
        startedAt: new Date().toISOString(),
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
  sessionId: string,
  durationSeconds: number
): Promise<EndSessionResult> => {
  try {
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      DATABASE_ID,
      VOICE_SESSION_COLLECTION_ID,
      sessionId,
      {
        endedAt: new Date().toISOString(),
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