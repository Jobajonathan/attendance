"""Scheduled job: close any overdue sessions (auto-marking no-shows absent),
compute the absenteeism report, write it to disk, and email it if SMTP is configured.

Intended to run on a schedule (cron, systemd timer, etc.), e.g. once daily:
    0 18 * * * cd /path/to/attendance && ./venv/bin/python absenteeism_job.py
"""
import os
import sys

from app import create_app
from reports import close_overdue_sessions, compute_absenteeism, send_alert_email, write_report_csv


def smtp_config_from_env():
    to_addrs = os.environ.get("ALERT_TO_ADDRS", "")
    return {
        "host": os.environ.get("SMTP_HOST", ""),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "username": os.environ.get("SMTP_USERNAME", ""),
        "password": os.environ.get("SMTP_PASSWORD", ""),
        "from_addr": os.environ.get("ALERT_FROM_ADDR", ""),
        "to_addrs": [a.strip() for a in to_addrs.split(",") if a.strip()],
        "use_tls": os.environ.get("SMTP_USE_TLS", "true").lower() != "false",
    }


def main():
    threshold = float(os.environ.get("ATTENDANCE_THRESHOLD", "0.75"))
    consecutive = int(os.environ.get("CONSECUTIVE_ABSENCES", "3"))

    app = create_app()
    with app.app_context():
        closed = close_overdue_sessions()
        print(f"Closed {len(closed)} overdue session(s).")

        flags = compute_absenteeism(threshold=threshold, consecutive_absences=consecutive)
        if not flags:
            print("No students flagged for absenteeism.")
            return

        path = write_report_csv(flags)
        print(f"Wrote report for {len(flags)} flagged student(s) to {path}")

        sent = send_alert_email(flags, smtp_config_from_env())
        print("Alert email sent." if sent else "SMTP not configured; skipped email alert.")


if __name__ == "__main__":
    sys.exit(main())
