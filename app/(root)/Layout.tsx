'use client'; // ← add this

import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <div>
      {/* <Navbar /> */}
      {children}
      <Toaster />
    </div>
  );
};

export default Layout;