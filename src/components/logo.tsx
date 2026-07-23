import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

// Server Component only (reads the filesystem) — renders the real Light Nation
// logo once public/logo.png exists, falling back to a styled text wordmark
// until it does. Swap is automatic; no code change needed when the file lands.
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  if (fs.existsSync(LOGO_PATH)) {
    return (
      <Image
        src="/logo.png"
        alt="Light Nation"
        width={size}
        height={size}
        className={className}
        priority
      />
    );
  }

  return (
    <span className={`font-heading font-semibold text-neutral-900 ${className}`} style={{ fontSize: size * 0.5 }}>
      Protocol<span className="text-brand">OS</span>
    </span>
  );
}
