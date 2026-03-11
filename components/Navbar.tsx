"use client";

import { getCurrentUser, signOutUser } from '@/lib/actions/user.actions';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils';

const navItems = [
    { label: "Library", href: "/"},
    { label: "Add new", href: "/books/new"},
    { label: "Pricing", href: "/subscriptions"},
]

const Navbar = () => {
    const pathName = usePathname();
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
        <header className='w-full fixed z-50 bg-[var(--bg-primary)]'>
            <div className='wrapper navbar-height py-4 flex justify-between items-center'>
                <Link href="/" className='flex gap-0.5 items-center'>
                    <Image src="/assets/logo.png" alt="Bookfied" width={42} height={26} />
                    <span className="logo-text">Vocalyx</span>
                </Link>

                <nav className='w-fit flex gap-7.5 items-center'>
                    {navItems.map(({ label, href }) => {
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));
                        return (
                            <Link
                                href={href}
                                key={label}
                                className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:opacity-70')}
                            >
                                {label}
                            </Link>
                        )
                    })}

                    <div className='flex gap-7.5 items-center'>
                            <button onClick={() => signOutUser()}>Log Out</button>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Navbar;