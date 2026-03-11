import BookCard from '@/components/BookCard';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import { getUserBooks } from '@/lib/actions/book.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { sampleBooks } from '@/lib/constants';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'

export const dynamic = "force-dynamic";

const page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
  
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const books = await getUserBooks(user.$id);

  const { query } = await searchParams;

  return (
    <div>
      <Navbar />
      <main className='wrapper container'>
    
      <HeroSection />

      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10'>
        <h2 className='text-3xl font-serif font-bold text-[#212a3b]'>Recent Books</h2>
        <Search />
      </div>

      <div className='library-books-grid'>
        {books?.map((book: { $id: React.Key | null | undefined; title: string; author: string; coverURL: string; slug: string; $createdAt: string; fileSize: number }) => (
            <BookCard key={book.$id} book={book} />

        ))}
      </div>
    </main>
    </div>
  )
}

export default page;