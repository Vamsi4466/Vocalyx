'use client'; // ← add this

import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

const Layout = ({ children }: { children: React.ReactNode }) => {
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

  if (!currentUser) return null; // or a loading spinner

  return (
    <div>
      <Navbar />
      {children}
      <Toaster />
    </div>
  );
};

export default Layout;