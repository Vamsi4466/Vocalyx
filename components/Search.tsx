'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { getBooks } from "@/lib/actions/book.actions"; // Updated getBooks with full-text search

interface Book {
  $id: string;
  title: string;
  author: string;
  coverURL?: string;
  $createdAt: string;
  slug: string;
}

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const fetchBooks = async () => {
      const books = await getBooks({ title: debouncedQuery });
      const mappedBooks = books.map((book: any) => ({
        $id: book.$id,
        title: book.title,
        author: book.author,
        coverURL: book.coverURL,
        $createdAt: book.$createdAt,
        slug: book.slug,
      }));
      setResults(mappedBooks);
      setOpen(true);
    };

    fetchBooks();
  }, [debouncedQuery]);

  const handleClickBook = (book: Book) => {
    setOpen(false);
    setResults([]);
    router.push(`/books/${book.slug}`);
  };

  return (
    <div className="relative w-full md:max-w-md">
      <div className="flex items-center gap-2 h-12 px-4 rounded-full shadow-md bg-white">
        <Image src="/assets/icons/search.svg" alt="Search" width={24} height={24} />
        <Input
          value={query}
          placeholder="Search by book title..."
          className="w-full border-none p-0 text-sm placeholder:text-gray-400 focus:ring-0"
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {open && (
        <ul className="absolute left-0 mt-2 w-full max-h-96 overflow-auto rounded-xl bg-white p-2 shadow-lg z-50">
          {results.length > 0 ? (
            results.map((book) => (
              <li
                key={book.$id}
                className="flex justify-between items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => handleClickBook(book)}
              >
                <div className="flex items-center gap-3">
                  {book.coverURL && (
                    <Image
                      src={book.coverURL}
                      alt={book.title}
                      width={40}
                      height={60}
                      className="object-cover rounded-sm"
                    />
                  )}
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(book.$createdAt).toLocaleDateString()}
                </p>
              </li>
            ))
          ) : (
            <p className="p-2 text-center text-gray-400 text-sm">No books found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;