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
        mediaSrc="/Image/BG-VIDEO.mp4"
        bgImageSrc="/Image/BG-IMAGE.png"
        title="No Mid Fits"
        date="Luxury, Virtually"
        scrollToExpand="Scroll to explore"
        textBlend
      >
        <HeroContent />
      </ScrollExpandMedia>
    </main>
  );
}
