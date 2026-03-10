'use server';

import { ID, Query } from "appwrite";
import { InputFile } from "node-appwrite/file";

import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, serializeData } from "../utils";

/* ---------------- Check if Book Exists ---------------- */

export const checkBookExists = async (userId: string, title: string) => {

  const { databases } = await createSessionClient();

  const existing = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.booksCollectionId,
    [
      Query.equal("userId", userId),
      Query.equal("slug", title)
    ]
  );

  return existing.documents.length > 0
    ? JSON.parse(JSON.stringify(existing.documents[0]))
    : null;
};

/* ---------------- Create Book ---------------- */

export const createBook = async ({
  userId,
  title,
  slug,
  author,
  persona,
  pdfFile,
  coverImage,
  segments,
  parsedCover // pass parsedPDF.cover from client
}: any) => {

  const { storage, databases } = await createAdminClient();

  /* ---------- Upload PDF ---------- */

  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

  const pdfInputFile = InputFile.fromBuffer(
    pdfBuffer,
    pdfFile.name
  );

  const pdfUpload = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    pdfInputFile
  );

  const pdfUrl = constructFileUrl(pdfUpload.$id);

  /* ---------- Upload Cover Image ---------- */

  let coverUrl: string;

  if (coverImage) {

    const coverBuffer = Buffer.from(await coverImage.arrayBuffer());

    const coverInputFile = InputFile.fromBuffer(
      coverBuffer,
      coverImage.name
    );

    const coverUpload = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      coverInputFile
    );

    coverUrl = constructFileUrl(coverUpload.$id);

  } else if (parsedCover) {

    // Fetch auto-generated cover from PDF
    const response = await fetch(parsedCover);
    const arrayBuffer = await response.arrayBuffer();

    const coverBuffer = Buffer.from(arrayBuffer);

    const coverInputFile = InputFile.fromBuffer(
      coverBuffer,
      `${slug}_cover.png`
    );

    const coverUpload = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      coverInputFile
    );

    coverUrl = constructFileUrl(coverUpload.$id);

  } else {

    // fallback safety
    coverUrl = "";

  }

  /* ---------- Create Book Document ---------- */

  const book = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.booksCollectionId,
    ID.unique(),
    {
      userId,
      title,
      slug,
      author,
      persona,
      fileURL: pdfUrl,
      coverURL: coverUrl
    }
  );

  /* ---------- Save Segments ---------- */

  const batchSize = 20;

  for (let i = 0; i < segments.length; i += batchSize) {

    const batch = segments.slice(i, i + batchSize);

    await Promise.all(
      batch.map((segment: any) =>
        databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.segmentsCollectionId,
          ID.unique(),
          {
            bookId: book.$id,
            userId,
            ...segment
          }
        )
      )
    );

  }

  return JSON.parse(JSON.stringify(book));
};

/* ---------------- Save Book Segments (Reusable) ---------------- */

export const saveBookSegments = async (
  bookId: string,
  userId: string,
  segments: any[]
) => {

  const { databases } = await createAdminClient();

  const batchSize = 20;

  for (let i = 0; i < segments.length; i += batchSize) {

    const batch = segments.slice(i, i + batchSize);

    await Promise.all(
      batch.map((segment) =>
        databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.segmentsCollectionId,
          ID.unique(),
          {
            bookId,
            userId,
            ...segment
          }
        )
      )
    );

  }
};

export const getUserBooks = async (userId: string) => {
  try {
    const { databases } = await createSessionClient();

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.booksCollectionId,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt")
      ]
    );

    // Convert to plain objects (important for Next.js)
    return JSON.parse(JSON.stringify(response.documents));

  } catch (error) {
    console.error("Error fetching user books:", error);
    return null;
  }
};

export const getBookBySlug = async (slug: string, userId: string) => {
  try {
    const { databases } = await createSessionClient();

    const queries: any[] = [Query.equal("slug", slug), Query.limit(1)];

    if (userId) {
      queries.push(Query.equal("userId", userId));
    }
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.booksCollectionId,
      queries
    );

    if (response.documents.length === 0) {
      return { success: false, error: "Book not found" };
    }

    // Appwrite documents have plain JSON structure, but serialize just in case
    const book = serializeData(response.documents[0]);

    return { success: true, data: book };
  } catch (e) {
    console.error("Error fetching book by slug", e);
    return { success: false, error: e instanceof Error ? e.message : e };
  }
};