import React from "react";
import Link from "next/link";
import { PixelButton } from "./PixelButton";
import { PixelMascot } from "./PixelMascot";
import { PixelAvatar } from "./PixelAvatar";

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
    <section className="pixel-panel-lg mb-2 flex flex-col gap-6 p-6 font-mono md:flex-row md:p-8">
      <div className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div className="relative h-28 w-28 overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--surface)] shadow-[4px_4px_0_0_var(--ink)] md:h-32 md:w-32">
          <PixelAvatar
            src={avatarSrc}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-fg">
              {name}
            </h1>
            <span className="pixel-chip bg-[var(--hi)] text-[var(--hi-ink)] font-bold uppercase tracking-wide">
              {title}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {bio}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {company && (
            <span className="pixel-chip bg-[var(--surface-2)] text-fg-muted">
              <span className="text-fg-muted/70">CO</span> {company}
            </span>
          )}
          {location && (
            <span className="pixel-chip bg-[var(--surface-2)] text-fg-muted">
              <span className="text-fg-muted/70">LOC</span> {location}
            </span>
          )}
          <Link
            href={github}
            target="_blank"
            rel="noreferrer"
            className="inline-block"
          >
            <PixelButton variant="secondary" size="sm">
              GitHub →
            </PixelButton>
          </Link>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center flex-shrink-0 mr-8">
        <PixelMascot />
      </div>
    </section>
  );
}

export default ProfileHeader;
