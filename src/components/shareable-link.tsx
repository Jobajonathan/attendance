"use client";

import { useState } from "react";
import { useMounted } from "@/lib/use-mounted";

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M7 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h1V5Zm2 1h5a1 1 0 0 1 1 1v5h1a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1Z" />
      <path d="M5 8a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M13 4a2 2 0 1 1 .5 1.32l-5.32 3a2.02 2.02 0 0 1 0 1.36l5.32 3a2 2 0 1 1-.72 1.28l-5.32-3a2 2 0 1 1 0-3.92l5.32-3A2 2 0 0 1 13 4Z" />
    </svg>
  );
}

const ICON_BUTTON_CLASS =
  "inline-flex h-6 w-6 flex-none items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-brand";

export function ShareableLink({ url, label, className }: { url: string; label?: string; className?: string }) {
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);
  const canShare = mounted && typeof navigator !== "undefined" && "share" in navigator;

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleShare() {
    try {
      await navigator.share({ url, title: label });
    } catch {
      // User cancelled the share sheet — nothing to do.
    }
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <a href={url} className="truncate text-brand underline">
        {url}
      </a>
      <button type="button" onClick={handleCopy} title="Copy link" className={ICON_BUTTON_CLASS}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      {canShare && (
        <button type="button" onClick={handleShare} title="Share link" className={ICON_BUTTON_CLASS}>
          <ShareIcon />
        </button>
      )}
    </div>
  );
}
