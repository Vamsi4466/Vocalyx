'use client';

import React, { useCallback, useRef, useState } from "react";
import { useController, FieldValues } from "react-hook-form";
import { X } from "lucide-react";

import { FileUploadFieldProps } from "@/types";
import { cn } from "@/lib/utils";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileUploader = <T extends FieldValues>({
  control,
  name,
  label,
  acceptTypes,
  disabled,
  icon: Icon,
  placeholder,
  hint,
}: FileUploadFieldProps<T>) => {

  const {
    field: { onChange, value },
  } = useController({ name, control });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /* ---------- Validate file ---------- */

  const validateFile = (file: File) => {

    if (!acceptTypes.includes(file.type)) {
      alert("Invalid file type");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File too large (max 50MB)");
      return false;
    }

    return true;
  };

  /* ---------- File select ---------- */

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {

      const file = e.target.files?.[0];
      if (!file) return;

      if (!validateFile(file)) return;

      onChange(file);

    },
    [onChange, acceptTypes]
  );

  /* ---------- Drag events ---------- */

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {

    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    onChange(file);

  };

  /* ---------- Remove file ---------- */

  const onRemove = useCallback(
    (e: React.MouseEvent) => {

      e.stopPropagation();

      onChange(undefined);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

    },
    [onChange]
  );

  const isUploaded = !!value;

  return (
    <FormItem className="w-full">

      <FormLabel className="form-label">
        {label}
      </FormLabel>

      <FormControl>

        <div
          className={cn(
            "upload-dropzone border-2 border-dashed border-[#8B7355]/20 transition-colors",
            isUploaded && "upload-dropzone-uploaded",
            isDragging && "border-[#8B7355] bg-[#8B7355]/5"
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes.join(",")}
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />

          {isUploaded ? (

            <div className="flex flex-col items-center relative w-full px-4">

              <p className="upload-dropzone-text line-clamp-1">
                {(value as File).name}
              </p>

              <button
                type="button"
                onClick={onRemove}
                className="upload-dropzone-remove mt-2"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

          ) : (

            <>
              <Icon className="upload-dropzone-icon" />

              <p className="upload-dropzone-text">
                {placeholder}
              </p>

              {hint && (
                <p className="upload-dropzone-hint">
                  {hint}
                </p>
              )}

              <p className="text-xs text-gray-400 mt-2">
                Drag & drop file here
              </p>
            </>

          )}

        </div>

      </FormControl>

      <FormMessage />

    </FormItem>
  );
};

export default FileUploader;