import Link from "next/link";
import { requireProfile } from "@/lib/current-profile";
import { ROLE_LABELS, isLeadershipRole, homePathForRole } from "@/lib/roles";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const leadership = isLeadershipRole(profile.role);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white dark:bg-neutral-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href={homePathForRole(profile.role)}>
              <Logo />
            </Link>
            <nav className="flex gap-4 text-sm">
              {leadership && (
                <Link href="/dashboard" className="text-neutral-600 hover:text-brand">
                  Dashboard
                </Link>
              )}
              <Link href="/activities" className="text-neutral-600 hover:text-brand">
                Activities
              </Link>
              <Link href="/members" className="text-neutral-600 hover:text-brand">
                Member Directory
              </Link>
              {leadership && (
                <Link href="/staff" className="text-neutral-600 hover:text-brand">
                  Staff
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu fullName={profile.full_name} roleLabel={ROLE_LABELS[profile.role]} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
