"use client";

import Feed from "./feed";

export default function FeedPage() {
  return (
    <div className="h-full w-full max-w-(--breakpoint-lg) mx-auto">
      <div className="absolute inset-0 bg-primary/3"></div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6">
            <Feed />
          </div>
        </div>
      </div>
    </div>
  );
}
