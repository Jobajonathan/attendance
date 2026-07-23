import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { homePathForRole } from "@/lib/roles";
import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui/button";

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

  // Protocol Members never sign in (Section 1.5) — they reach check-in and
  // message review through activity-specific links, not this page. This
  // landing screen exists so staff sign-in isn't forced on every visitor;
  // it's one click away instead.
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <Logo size={56} />
        <p className="mt-2 text-sm text-neutral-500">Light Nation Protocol Department</p>
      </div>
      <LinkButton href="/login">Admin</LinkButton>
    </div>
  );
}
