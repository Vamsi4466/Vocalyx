"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sessionId = await verifySecret({ accountId, password });
      if (sessionId) router.push("/");
    } catch (error) {
      console.log("Failed to verify OTP", error);
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    await sendEmailOTP({ email });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="space-y-6 max-w-[95%] sm:w-[400px] md:w-[480px] rounded-2xl bg-white px-6 md:px-10 py-10 shadow-lg outline-none">
        <AlertDialogHeader className="relative flex flex-col items-center">
          <AlertDialogTitle className="text-2xl md:text-[28px] font-bold text-center text-[#4b2e1f] mb-2">
            Enter Your OTP
          </AlertDialogTitle>
          <Image
            src="/assets/icons/close-dark.svg"
            alt="close"
            width={20}
            height={20}
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 cursor-pointer"
          />
          <AlertDialogDescription className="text-sm md:text-[15px] font-medium text-center text-[#7c6a5e]">
            We've sent a code to{" "}
            <span className="font-semibold text-[#4b2e1f]">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="w-full flex gap-2 justify-between mt-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="text-2xl md:text-[32px] font-medium text-center rounded-xl border border-[#d2c0a8] shadow-sm focus:border-[#4b2e1f] focus:ring-1 focus:ring-[#4b2e1f] transition-all w-12 md:w-14 h-14 md:h-16"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4 mt-6">
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-[#4b2e1f] hover:bg-[#5c3b2a] text-white text-sm md:text-[15px] font-medium rounded-full h-12 flex items-center justify-center transition-all"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="text-sm md:text-[15px] font-medium text-center text-[#7c6a5e]">
              Didn't get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-[#4b2e1f] underline"
                onClick={handleResendOtp}
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;