import React from "react";
import Link from "next/link";
import { PixelButton } from "./PixelButton";

interface ProfileHeaderProps {
  name?: string;
  title?: string;
  github?: string;
  avatarSrc?: string;
  bio?: string;
  location?: string;
  company?: string;
}

export function ProfileHeader({
  name = "Your Name",
  title = "Software Engineer",
  github = "https://github.com/yourname",
  avatarSrc = "/avatar.jpg",
  bio = "专注 Web 全栈开发，关注性能、可维护性与开发者体验。",
  location = "Remote",
  company = "Your Company",
}: ProfileHeaderProps) {
  return (
    <section className="mb-10 bg-white border-4 border-gray-800 shadow-[6px_6px_0_0_#1f2937] p-6 md:p-8 flex flex-col md:flex-row gap-6 font-mono">
      <div className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="relative h-28 w-28 md:h-32 md:w-32 border-4 border-gray-800 bg-white shadow-[4px_4px_0_0_#1f2937] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarSrc}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {name}
            <span className="text-xs font-normal px-2 py-1 bg-yellow-200 border-2 border-yellow-600 shadow-[2px_2px_0_0_#ca8a04] text-yellow-900 uppercase tracking-wide">
              {title}
            </span>
          </h1>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-3">
            {bio}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
          {company && (
            <span className="inline-flex items-center gap-1 bg-blue-200 border-2 border-blue-600 px-2 py-1 shadow-[2px_2px_0_0_#1d4ed8] text-blue-900">
              🏢 {company}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 bg-green-200 border-2 border-green-600 px-2 py-1 shadow-[2px_2px_0_0_#15803d] text-green-900">
              📍 {location}
            </span>
          )}
          <Link
            href={github}
            target="_blank"
            rel="noreferrer"
            className="inline-block"
          >
            <PixelButton variant="secondary" size="sm">
              GitHub
            </PixelButton>
          </Link>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center flex-shrink-0 mr-8">
        <div className="h-16 w-16 md:h-20 md:w-20">
          <div className="pixel-cube">
            <div className="face front" />
            <div className="face back" />
            <div className="face right" />
            <div className="face left" />
            <div className="face top" />
            <div className="face bottom" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;
