# Attendance automation

A minimal, self-hosted system for taking attendance and automatically flagging
absenteeism, with no hardware requirement beyond a phone or laptop.

## How it works

1. **Roster** — add students once via `/admin/students` (student ID, name, email).
2. **Session** — an admin creates a session (e.g. "Monday lecture") with a start
   and end time. Each session gets a unique check-in link and QR code.
3. **Check-in** — students scan the QR code (or click the link) and enter their
   student ID. They're marked `present` if they check in before the session
   start time, `late` afterwards.
4. **Close-out** — when a session is closed (manually from the UI, or
   automatically once its end time passes), everyone on the roster who never
   checked in is marked `absent`. No manual roll call needed.
5. **Absenteeism detection** — `reports.py` scans all closed sessions and flags
   any student who is either below an attendance-rate threshold (default 75%)
   or has hit a run of consecutive absences (default 3). The `/admin/report`
   page shows live flags and can export a CSV.
6. **Scheduled job** — `absenteeism_job.py` is a standalone script meant to run
   on a schedule (cron/systemd timer). It closes overdue sessions, recomputes
   the flagged list, writes a CSV to `reports/`, and emails it to admins if
   SMTP is configured. This is the actual "automation" piece — attendance
   tracking and absenteeism alerting happen without anyone running a report
   by hand.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py            # dev server on http://localhost:5000
```

Visit `/admin/students` to add a roster, then `/admin/sessions/new` to create
a session and get its QR code.

## Scheduling the absenteeism job

Run daily (or after your last session of the day) via cron:

```cron
0 18 * * * cd /path/to/attendance && ./venv/bin/python absenteeism_job.py
```

### Optional email alerts

Set these environment variables to have flagged students emailed automatically;
without them the job still writes the CSV report but skips email:

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST`, `SMTP_PORT` | Mail server |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | Mail server auth (optional) |
| `SMTP_USE_TLS` | `true`/`false`, default `true` |
| `ALERT_FROM_ADDR` | From address |
| `ALERT_TO_ADDRS` | Comma-separated recipient list |
| `ATTENDANCE_THRESHOLD` | Rate below which a student is flagged, default `0.75` |
| `CONSECUTIVE_ABSENCES` | Streak that triggers a flag, default `3` |

## Notes / next steps

This is an MVP built around QR/link self-check-in, which needed no hardware
and no third-party integration to stand up. It intentionally has no
authentication layer (self-serve check-in by student ID) — production use
should add login/auth per your institution's requirements, and the SQLite
database should be swapped for Postgres/MySQL for multi-user concurrent
access.

Other check-in methods this same absenteeism-detection core could support
without changes to `reports.py`: importing attendance from a spreadsheet
per session, or a chat-bot (Slack/Teams) daily roll call — both just need a
different way of writing `Attendance` rows.
