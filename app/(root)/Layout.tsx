import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {

  return (
    <div>
      {/* <Navbar /> */}
      {children}
      {/* <Toaster /> */}
    </div>
  );
};

export default Layout;