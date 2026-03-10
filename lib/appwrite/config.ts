export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,

  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,

  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION!,
  booksCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOK_COLLECTION!,
  segmentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SEGMENT_COLLECTION!,
  sessionsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SESSION_COLLECTION!,

  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,

  secretKey: process.env.NEXT_APPWRITE_KEY!,
};