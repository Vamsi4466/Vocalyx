export const appwriteConfig = {
    endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_APPWRITE_API_KEY,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    // tripCollectionId: import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
    // bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
}