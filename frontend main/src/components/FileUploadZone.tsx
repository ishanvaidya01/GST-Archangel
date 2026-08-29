"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadZoneProps {
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({
  label,
  description,
  accept,
  multiple = false,
  files,
  onFilesChange,
  error,
  className,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const arr = Array.from(newFiles);
      onFilesChange(multiple ? [...files, ...arr] : [arr[0]]);
    },
    [files, multiple, onFilesChange]
  );

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = ""; // reset so same file can be re-added
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div>
        <p className="text-sm font-semibold text-[#e8eaf6] mb-1">{label}</p>
        <p className="text-xs text-[#5a6380]">{description}</p>
      </div>

      {/* Drop zone */}
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 cursor-pointer transition-all duration-200",
          isDragging
            ? "border-[#3b82f6] bg-[#0a1528]"
            : error
              ? "border-[#7f1d1d] bg-[#1a0808]"
              : files.length > 0
                ? "border-[#1d3a6e] bg-[#090e1a]"
                : "border-[#2d3250] bg-[#0f1017] hover:border-[#3b82f6] hover:bg-[#0a1528]"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
        />

        {isDragging ? (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-1 text-[#3b82f6]"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1d3a6e] flex items-center justify-center mb-1">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold">Drop files here</p>
          </motion.div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-lg bg-[#141520] border border-[#2d3250] flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#5a6380]" />
            </div>
            <div className="text-center">
              <p className="text-sm text-[#9ba3bf]">
                <span className="text-[#3b82f6] font-medium">
                  Click to upload
                </span>{" "}
                or drag & drop
              </p>
              <p className="text-xs text-[#5a6380] mt-1">
                {accept.replace(/,/g, ", ")}
              </p>
            </div>
          </>
        )}
      </label>

      {/* Error */}
      {error && (
        <p className="text-xs text-[#ef4444] flex items-center gap-1.5">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Selected files */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, i) => (
            <motion.div
              key={`${file.name}-${i}`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-2.5 bg-[#141520] border border-[#1e2130] rounded"
            >
              <FileText className="w-4 h-4 text-[#3b82f6] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#e8eaf6] truncate">
                  {file.name}
                </p>
                <p className="text-2xs text-[#5a6380]">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="p-1 hover:bg-[#1e2130] rounded transition-colors text-[#5a6380] hover:text-[#ef4444]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
