'use server';

// import { ID, Query } from "appwrite";
import { InputFile } from "node-appwrite/file";

import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { constructFileUrl, convertFileSize, serializeData } from "../utils";
import { ID, Query } from "node-appwrite";

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

// 'use server';

// import { ID, InputFile } from "node-appwrite";
// import { createAdminClient } from "@/lib/appwrite-server";
// import { appwriteConfig } from "@/lib/appwrite-config";

import { PDFDocument } from "pdf-lib"; // Make sure pdf-lib is installed

export const createBook = async ({
  userId,
  title,
  slug,
  author,
  persona,
  pdfFile,
  coverImage,
  segments,
  parsedCover,
}: any) => {
  const { storage, databases } = await createAdminClient();

  /* ---------- Prepare PDF ---------- */
  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  const pdfInputFile = InputFile.fromBuffer(pdfBuffer, pdfFile.name);

  /* ---------- Prepare Cover ---------- */
  let coverInputFile;

  if (coverImage) {
    const coverBuffer = Buffer.from(await coverImage.arrayBuffer());
    coverInputFile = InputFile.fromBuffer(coverBuffer, coverImage.name);
  } else if (parsedCover) {
    const response = await fetch(parsedCover);
    const buffer = Buffer.from(await response.arrayBuffer());
    coverInputFile = InputFile.fromBuffer(buffer, `${slug}_cover.png`);
  }

  /* ---------- Upload Files in Parallel ---------- */
  const [pdfUpload, coverUpload] = await Promise.all([
    storage.createFile(appwriteConfig.bucketId, ID.unique(), pdfInputFile),
    coverInputFile
      ? storage.createFile(appwriteConfig.bucketId, ID.unique(), coverInputFile)
      : null,
  ]);

  const pdfUrl = constructFileUrl(pdfUpload.$id);
  const coverUrl = coverUpload ? constructFileUrl(coverUpload.$id) : "";

  /* ---------- Compute extra info ---------- */
  const totalWords = segments.reduce((acc: number, segment: any) => acc + (segment.wordCount || 0), 0);
  const totalPages = segments.reduce((max: number, segment: any) => Math.max(max, segment.pageNumber ?? 0), 0);
  const fileSize = pdfUpload.sizeOriginal; // numeric bytes
  const readableSize = convertFileSize(fileSize); // optional string for UI

  /* ---------- Create Book ---------- */
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
      coverURL: coverUrl,
      totalWords,
      pages:totalPages,
      fileSize,     // numeric bytes ✅
      readableSize, // optional string
    }
  );

  /* ---------- Save Segments Efficiently ---------- */
  const batchSize = 25;
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
            segmentIndex: segment.segmentIndex,
            text: segment.text,
            wordCount: segment.wordCount,
            pageNumber: segment.pageNumber ?? null,
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