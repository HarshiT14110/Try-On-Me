"use client";

import { useEffect } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import HeroContent from "@/components/hero-content";

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="D:\Try-On me\Image\BG-VIDEO.mp4"
        bgImageSrc="D:\Try-On me\Image/images/BG-IMAGE.png"
        title="Basic to boujee"
        date="Luxury Redefined"
        scrollToExpand="Scroll to explore"
        textBlend
      >
        <HeroContent />
      </ScrollExpandMedia>
    </main>
  );
}
