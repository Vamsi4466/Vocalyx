"use client";

import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const page = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
      const router = useRouter();
  
    useEffect(() => {
      const fetchUser = async () => {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/sign-in");
        } else {
          setCurrentUser(user);
        }
      };
      fetchUser();
    }, [router]);
  
    if (!currentUser) return null;
  return (
    <div>
      <Navbar />
      <main className='new-book'>
        <section className='flex flex-col gap-5 text-center'>
            <h1 className='page-title-xl'>Add a new book</h1>
            <p className='subtitle'>Upload a PDF to generate your  interactive reading experience</p>
        </section>

        <UploadForm />
    </main>
    </div>
  )
}

export default page;