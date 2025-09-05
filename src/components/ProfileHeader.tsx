import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

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
    <section className="mb-10 rounded-xl border bg-card text-card-foreground p-6 md:p-8 flex flex-col md:flex-row gap-6">
      <div className="flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt={name}
          className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover border"
        />
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {name}
            <span className="text-sm font-normal px-2 py-0.5 rounded bg-muted text-muted-foreground">
              {title}
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {bio}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {company && <span>🏢 {company}</span>}
          {location && <span>📍 {location}</span>}
          <Button asChild size="sm" variant="outline">
            <Link href={github} target="_blank" rel="noreferrer">
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ProfileHeader;
