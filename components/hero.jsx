"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-36 pb-16 px-4">
      <div className="container mx-auto text-center">
        <span className="hero-kicker">Minimal finance OS</span>
        <h1 className="hero-title">
          Beautiful money tracking,
          <br className="hidden md:block" /> without the noise.
        </h1>
        <p className="hero-subtitle">
          Welth helps you manage accounts, budgets, and transactions in one
          calm dashboard with practical AI insights.
        </p>
        <div className="mt-8 flex justify-center">
          <SignedOut>
            <Link href="/sign-in">
              <Button size="lg" className="px-8 bg-teal-700 hover:bg-teal-800 text-white rounded-xl">
                Start for Free
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="px-8 bg-teal-700 hover:bg-teal-800 text-white rounded-xl">
                Open Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>
        <div className="hero-image-wrapper mt-10 md:mt-12">
          <div ref={imageRef} className="hero-image">
            <Image
              src={`/banner.jpeg?v=${process.env.NEXT_PUBLIC_ASSET_VERSION || '1'}`}
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-2xl border border-slate-300/80 shadow-[0_30px_60px_-35px_rgba(15,23,42,0.45)] mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
