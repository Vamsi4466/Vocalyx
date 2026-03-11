"use client";

import { BookCardProps } from "@/types";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";

const BookCard = ({
  title,
  author,
  coverURL,
  slug,
  size,        // in bytes
  uploadedAt,  // ISO string
}: BookCardProps & { size: number; uploadedAt: string }) => {
  return (
    <Link href={`/books/${slug}`} className="block group w-36 md:w-40">
      {/* Book Cover */}
      <div className="overflow-hidden rounded-lg shadow-lg">
        <Image
          src={coverURL}
          alt={title}
          width={160}
          height={220}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Text under cover */}
      <div className="mt-2 text-center space-y-1">
        <h3 className="text-sm font-semibold text-white bg-black/40 px-1 rounded line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-100 bg-black/30 px-1 rounded line-clamp-1">
          {author}
        </p>

        {/* File size and uploaded date */}
        <div className="flex justify-center gap-2 text-[10px] text-gray-200 bg-black/30 px-2 py-0.5 rounded mt-0.5">
          <span>{convertFileSize(size)}</span>
          <span>•</span>
          <FormattedDateTime date={uploadedAt} />
        </div>
      </div>
    </Link>
  );
};

export default BookCard;