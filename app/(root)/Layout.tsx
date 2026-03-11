import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    console.log(currentUser);
    return redirect("/sign-in");
  
  }

  return (
    <div>
      <Navbar />
      {children}
      <Toaster />
    </div>
  );
};

export default Layout;