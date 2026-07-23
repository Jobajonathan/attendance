import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { generateActivityKeyword } from "@/lib/activity-keyword";
import { datetimeLocalToUtcIso, todayInWat, dateToWatDateString, addDaysWat } from "@/lib/timezone";

// FR-ATT-03: activities transition Scheduled -> Open -> Closed automatically on
// their configured times. Vercel Cron hits this on a schedule (see vercel.json);
// Vercel signs cron requests with a Bearer token equal to CRON_SECRET when that
// env var is set, so we verify it here rather than trusting any caller.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await supabase.rpc("sync_activity_statuses");
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const created = await createDueServiceActivities(supabase);

  return NextResponse.json({ ok: true, created });
}

// Item 10/13: weekly recurring services (service_templates) auto-create their
// week's activity on the day their window opens — this cron already runs
// daily (Vercel Hobby's cron granularity), so extending it here avoids a
// second cron entry. Each template is only attempted on its own
// open_day_of_week, and the service_template_id + scheduled_date pair makes
// re-running this same day a no-op rather than a duplicate.
async function createDueServiceActivities(
  supabase: ReturnType<typeof createClient<Database>>,
): Promise<string[]> {
  const today = todayInWat();
  const todayDow = today.getUTCDay();

  const { data: templates } = await supabase
    .from("service_templates")
    .select("*")
    .eq("is_active", true)
    .eq("open_day_of_week", todayDow);

  const createdTitles: string[] = [];

  for (const template of templates ?? []) {
    const scheduledDate = dateToWatDateString(today);
    const daysSpan = (template.close_day_of_week - template.open_day_of_week + 7) % 7;
    const closeDate = dateToWatDateString(addDaysWat(today, daysSpan));

    const { data: existing } = await supabase
      .from("activities")
      .select("id")
      .eq("service_template_id", template.id)
      .eq("scheduled_date", scheduledDate)
      .maybeSingle();
    if (existing) continue;

    const opensAt = datetimeLocalToUtcIso(`${scheduledDate}T${template.open_time.slice(0, 5)}`);
    const closesAt = datetimeLocalToUtcIso(`${closeDate}T${template.close_time.slice(0, 5)}`);

    for (let attempt = 0; attempt < 5; attempt++) {
      const { error: insertError } = await supabase.from("activities").insert({
        type: template.activity_type,
        title: template.name,
        scheduled_date: scheduledDate,
        opens_at: opensAt,
        closes_at: closesAt,
        keyword: generateActivityKeyword(),
        service_template_id: template.id,
        created_by: template.created_by,
      });
      if (!insertError) {
        createdTitles.push(template.name);
        break;
      }
      if (insertError.code !== "23505") break;
    }
  }

  return createdTitles;
}
