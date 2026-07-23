import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    redirect(profile ? homePathForRole(profile.role) : "/login");
  }

  // Opportunistic status sync — see the matching comment in /activities/page.tsx.
  // A visitor landing on "/" while a scheduled session's window has just
  // opened is what wakes the status up, independent of the coarse daily cron.
  await supabase.rpc("sync_activity_statuses");

  // Section 1.5: Protocol Members never sign in — this page is their only
  // entry point, so it has to tell them, without opening any link, whether
  // there's actually something open to submit right now.
  const { data: openRows } = await supabase.rpc("get_open_checkin_link");
  const openCheckin = openRows?.[0];

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm text-neutral-500">Light Nation Protocol Department</span>
          </div>
          <LinkButton href="/login" variant="secondary" size="sm">
            Admin
          </LinkButton>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-3">
          {openCheckin ? (
            <Card className="p-4">
              <a href={`/checkin/${openCheckin.link_token}`} className="block">
                <h2 className="font-heading text-base font-semibold text-neutral-900">
                  Attendance Check-In
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {openCheckin.title} is open now. Tap to check in.
                </p>
              </a>
            </Card>
          ) : (
            <Card className="cursor-not-allowed p-4 opacity-60">
              <h2 className="font-heading text-base font-semibold text-neutral-900">
                Attendance Check-In
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                No session is open right now. Check back once your Administrative Officer starts
                one.
              </p>
            </Card>
          )}

          <Card className="cursor-not-allowed p-4 opacity-60">
            <h2 className="font-heading text-base font-semibold text-neutral-900">
              Message Review
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              No session is open right now. Check back once your Administrative Officer starts
              one.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
