'use client'

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, ImageIcon } from "lucide-react";

import { UploadSchema } from "@/lib/zod";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { parsePDFFile } from "@/lib/utils";
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

import LoadingOverlay from "./LoadingOverlay";
import FileUploader from "./FileUploader";

import { Button } from "./ui/button";
import { Form } from "@/components/ui/form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

import { checkBookExists, createBook } from "@/lib/actions/book.actions";
import VoiceSelector from "./VoiceSelector";

const UploadForm = () => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setUser(user);
    };

    fetchUser();
    setIsMounted(true);
  }, []);

  const form = useForm<any>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      title: "",
      author: "",
      persona: "",
      pdfFile: undefined,
      coverImage: undefined,
    },
  });

  const onSubmit = async (data: any) => {
    console.log("VALIDATION ERROR");

    setIsSubmitting(true);

    try {

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();

            const existsCheck = await checkBookExists(user.$id, fileTitle);

            if(existsCheck) {
                toast.info("Book with same title already exists.");
                form.reset()
                router.push(`/books/${existsCheck.slug}`)
                return;
            }
            const pdfFile = data.pdfFile;

      const parsedPDF = await parsePDFFile(data.pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF");
        return;
      }

      await createBook({
        userId: user?.$id,
        title: data.title,
        slug: fileTitle,
        author: data.author,
        persona: data.persona,
        pdfFile: data.pdfFile,
        coverImage: data.coverImage,
        segments: parsedPDF.content,
        parsedCover: parsedPDF.cover
      });

      form.reset();
      router.push("/");

    } catch (error) {

      console.error(error);
      toast.error("Failed to upload book");

    } finally {

      setIsSubmitting(false);

    }
  };

  if (!isMounted) return null;

  return (
    <>
      {isSubmitting && <LoadingOverlay />}

      <div className="new-book-wrapper">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <FileUploader
              control={form.control}
              name="pdfFile"
              label="Book PDF File"
              acceptTypes={ACCEPTED_PDF_TYPES}
              icon={Upload}
              placeholder="Click to upload PDF"
              hint="PDF file (max 50MB)"
              disabled={isSubmitting}
            />

            <FileUploader
              control={form.control}
              name="coverImage"
              label="Cover Image"
              acceptTypes={ACCEPTED_IMAGE_TYPES}
              icon={ImageIcon}
              placeholder="Click to upload cover image"
              disabled={isSubmitting}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Title</FormLabel>
                  <FormControl>
                    <Input 
                      className="form-input"
                      placeholder="ex: Rich Dad Poor Dad"
                      {...field}
                      disabled={isSubmitting}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Author Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Robert Kiyosaki"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
            />

            <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
            

            <Button type="submit" className="form-btn" disabled={isSubmitting}>
              Begin Synthesis
            </Button>

          </form>
        </Form>
      </div>
    </>
  );
};

export default UploadForm;