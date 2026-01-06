"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onFiles?: (files: File[]) => void;
  children?: React.ReactNode;
}

export function Dropzone({ accept = "*", multiple = false, disabled = false, className, onFiles, children }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const openFileDialog = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    onFiles?.(multiple ? list : [list[0]]);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFileDialog}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFileDialog(); }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "flex items-center justify-center rounded border-2 border-dashed transition-colors",
        "border-slate-600/50 hover:border-slate-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/20",
        dragActive && "border-white/70 bg-white/5",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {children ?? (
        <div className="text-center p-6">
          <p className="text-sm text-gray-300">Drag & drop image here, or click to upload</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  );
}
