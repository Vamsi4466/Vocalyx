import React from "react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <section className="hidden w-1/2 items-center justify-center bg-[#f3e4c7] p-10 lg:flex xl:w-2/5">
        <div className="flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-12">
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vocalyx Logo"
              width={72}
              height={72}
              className="h-auto drop-shadow-lg"
            />
            <span className="text-5xl font-extrabold tracking-wide text-[#4b2e1f] font-serif">
              Vocalyx
            </span>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-semibold text-[#4b2e1f]">
              Transform your books into interactive AI conversations
            </h2>
            <p className="text-base text-[#4b2e1f]">
              Upload PDFs, and chat with your books using voice. Discover a smarter, more intuitive way to interact with your knowledge.
            </p>
          </div>
          <Image
            src="/assets/image.png"
            alt="Files"
            width={342}
            height={342}
            className="transition-all hover:rotate-2 hover:scale-105"
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 lg:hidden">
          <div className="flex items-center space-x-4">
            <Image
              src="/assets/hero-illustration.png"
              alt="Vocalyx Logo"
              width={72}
              height={72}
              className="h-auto drop-shadow-lg"
            />
            <span className="text-5xl font-extrabold tracking-wide text-[#4b2e1f] font-serif">
              Vocalyx
            </span>
          </div>
        </div>

        {children}
      </section>
    </div>
  );
};

export default Layout;
