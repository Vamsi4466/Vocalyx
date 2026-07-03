import BookCard from '@/components/BookCard';
import HeroSection from '@/components/HeroSection';
import Navbar from '@/components/Navbar';
import Search from '@/components/Search';
import DemoBanner from '@/components/DemoBanner';
import { getUserBooks } from '@/lib/actions/book.actions';
import { getCurrentUser, isDemoUser } from '@/lib/actions/user.actions';
import React from 'react';
import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

const page = async ({ searchParams }: { searchParams: Promise<{ query?: string }> }) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/demo-login?redirect=/");
  }

  const demo = await isDemoUser(user);
  const books = await getUserBooks(user.$id);
  const { query } = await searchParams;

  return (
    <div>
      <Navbar />
      <main className='wrapper container'>
        {await demo && <DemoBanner />}

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
  );
};

export default page;