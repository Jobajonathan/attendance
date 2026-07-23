import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

// Server Component only (reads the filesystem) — renders the real Light Nation
// logo once public/logo.png exists, falling back to a brand-colored icon mark
// (no wordmark text) until it does. Swap is automatic; no code change needed
// once the file lands.
export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  if (fs.existsSync(LOGO_PATH)) {
    return (
      <Image
        src="/logo.png"
        alt="Light Nation"
        width={size}
        height={size}
        className={`rounded-lg object-contain ${className}`}
        priority
      />
    );
  }

  return (
    <span
      className="font-heading flex shrink-0 items-center justify-center rounded-lg bg-brand font-semibold text-brand-foreground"
      style={{ width: size, height: size, fontSize: size * 0.46 }}
      aria-label="Light Nation"
      role="img"
    >
      P
    </span>
  );
}
