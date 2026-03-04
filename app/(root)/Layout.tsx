import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';
import React from 'react'

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();
  
      if (!currentUser) return redirect("/sign-in");
      console.log(currentUser.status);
  return (
    <div>Layout {children}</div>
  )
}

export default Layout;