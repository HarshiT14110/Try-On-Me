"use client";

import React from "react";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  X,
  Sparkles,
  Plus,
  ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface UploadedImage {
  file: File;
  preview: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function UploadSlot({
  image,
  onUpload,
  onRemove,
  label,
  index,
}: {
  image: UploadedImage | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  label: string;
  index: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(file);
      }
    },
    [onUpload]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col gap-3"
    >
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !image && inputRef.current?.click()}
        className={`
          relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden
          ${
            image
              ? "border-transparent"
              : isDragging
                ? "border-amber-600/40 bg-amber-900/10 scale-[1.02]"
                : "border-amber-800/20 hover:border-amber-600/30 hover:bg-amber-900/5 cursor-pointer"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label={`Upload ${label}`}
        />

        <AnimatePresence mode="wait">
          {image ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full group"
            >
              <Image
                src={image.preview || "/placeholder.svg"}
                alt={`Uploaded ${label}`}
                fill
                className="object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 rounded-xl" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
                aria-label={`Remove ${label}`}
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="absolute bottom-3 left-3 right-3 py-2 rounded-lg bg-background/80 text-foreground text-xs font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-background"
              >
                Replace image
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3 px-4"
            >
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground font-medium">
                  Drop image here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function HeroContent() {
  const [images, setImages] = useState<(UploadedImage | null)[]>([null, null]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback((index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    setImages((prev) => {
      const next = [...prev];
      if (next[index]) {
        URL.revokeObjectURL(next[index]!.preview);
      }
      next[index] = { file, preview };
      return next;
    });
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setImages((prev) => {
      const next = [...prev];
      if (next[index]) {
        URL.revokeObjectURL(next[index]!.preview);
      }
      next[index] = null;
      return next;
    });
    setGeneratedImage(null);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!images[0] || !images[1]) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const [personBase64, outfitBase64] = await Promise.all([
        fileToBase64(images[0].file),
        fileToBase64(images[1].file),
      ]);

      const response = await fetch("/api/generate-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImage: personBase64,
          outfitImage: outfitBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.image) {
        const imgSrc = `data:${data.image.mediaType};base64,${data.image.base64}`;
        setGeneratedImage(imgSrc);
      } else {
        throw new Error("No image returned from the API");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [images]);

  const bothUploaded = images[0] !== null && images[1] !== null;

  return (
    <div className="relative max-w-6xl mx-auto px-6 py-20">
      {/* Golden gradient background */}
      <div className="absolute inset-0 -mx-6 -my-20 overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, rgba(180, 140, 60, 0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(200, 160, 80, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(160, 120, 40, 0.05) 0%, transparent 70%), linear-gradient(160deg, rgba(140, 110, 50, 0.06) 0%, transparent 40%, rgba(180, 150, 70, 0.04) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.3) 15%, rgba(10,10,10,0.1) 50%, rgba(10,10,10,0.3) 85%, rgba(10,10,10,0.9) 100%)",
          }}
        />
        <div className="absolute inset-0 border border-amber-800/10 rounded-3xl" />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative mb-14 text-center"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
          AI Style Fusion
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display leading-tight mb-5 text-balance">
          Try any outfit on you.
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Upload your photo and an outfit picture. Our AI will dress you in
          that outfit while keeping everything else perfectly natural.
        </p>
      </motion.div>

      {/* Upload + Generate Grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4 md:gap-6 mb-16">
        {/* Image 1 - Person */}
        <UploadSlot
          image={images[0]}
          onUpload={(f) => handleUpload(0, f)}
          onRemove={() => handleRemove(0)}
          label="Your Picture"
          index={0}
        />

        {/* Plus icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
          className="hidden md:flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Image 2 - Outfit */}
        <UploadSlot
          image={images[1]}
          onUpload={(f) => handleUpload(1, f)}
          onRemove={() => handleRemove(1)}
          label="Outfit Picture"
          index={1}
        />

        {/* Sparkles icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
          className="hidden md:flex items-center justify-center"
        >
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>

        {/* Generated Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="col-span-2 md:col-span-1 flex flex-col gap-3"
        >
          <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
            This is how you look in this outfit
          </p>
          <div className="relative aspect-[3/4] rounded-xl border border-amber-800/20 overflow-hidden bg-amber-950/5">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-amber-700/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-full border border-amber-600/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Generating your look...
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-3 px-4"
                >
                  <div className="w-12 h-12 rounded-full border border-red-800/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-xs text-red-400 text-center leading-relaxed">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="text-xs text-amber-500 hover:text-amber-400 underline underline-offset-2 transition-colors"
                  >
                    Try again
                  </button>
                </motion.div>
              ) : generatedImage ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={generatedImage || "/placeholder.svg"}
                    alt="Generated outfit preview"
                    fill
                    className="object-cover rounded-xl"
                    unoptimized
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-background/80 text-foreground text-xs font-medium backdrop-blur-sm">
                      AI Generated
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-3 px-4"
                >
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Your new look will appear here
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="relative flex justify-center mb-20"
      >
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!bothUploaded || isGenerating}
          className={`
            inline-flex items-center gap-3 px-10 py-4 rounded-xl font-medium text-sm transition-all duration-300
            ${
              bothUploaded && !isGenerating
                ? "bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 shadow-lg shadow-amber-900/30 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              See How You Look
            </>
          )}
        </button>
      </motion.div>

      {/* Subtle hint */}
      {!bothUploaded && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative text-center text-xs text-muted-foreground -mt-14 mb-20"
        >
          Upload both images to unlock generation
        </motion.p>
      )}
    </div>
  );
}
