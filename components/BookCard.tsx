"use client";

import { BookCardProps } from "@/types";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";

const BookCard = ({ book }: BookCardProps) => {
  return (
    <div className="relative w-36 md:w-40 group">
      {/* Book Cover */}
      <div className="overflow-hidden rounded-lg shadow-lg relative">
        <Link href={`/books/${book.slug}`} className="block">
          <Image
            src={book.coverURL}
            alt={book.title}
            width={160}
            height={220}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Action Dropdown (top-right corner) */}
        <div
          className="absolute top-2 right-2 z-10"
          onClick={(e) => e.stopPropagation()} // ⚡ Prevent navigation when clicking dropdown
        >
          <ActionDropdown book={book} />
        </div>
      </div>

      {/* Text under cover */}
      <div className="mt-2 text-center space-y-1 cursor-pointer">
        <Link href={`/books/${book.slug}`} className="block">
          <h3 className="text-sm font-semibold text-light-100 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-light-200 line-clamp-1">{book.author}</p>
          <div className="flex justify-center gap-2 text-[10px] text-light-300 mt-0.5">
            <span>{convertFileSize(book.fileSize)}</span>
            <span>•</span>
            <FormattedDateTime date={book.$updatedAt} className="text-light-300" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BookCard;