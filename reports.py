"""Absenteeism detection logic, shared by the web app and the scheduled job."""
import csv
import smtplib
from dataclasses import dataclass, field
from datetime import datetime
from email.mime.text import MIMEText
from pathlib import Path

from models import Attendance, Session, Student, db

DEFAULT_ATTENDANCE_THRESHOLD = 0.75
DEFAULT_CONSECUTIVE_ABSENCES = 3


@dataclass
class StudentFlag:
    student_id: str
    name: str
    email: str
    sessions_counted: int
    present_count: int
    attendance_rate: float
    consecutive_absences: int
    reasons: list = field(default_factory=list)


def close_overdue_sessions(now=None):
    """Mark any student without a check-in as absent for sessions whose end time has passed."""
    now = now or datetime.utcnow()
    closed = []
    overdue = Session.query.filter(Session.is_closed.is_(False), Session.ends_at <= now).all()
    for session in overdue:
        checked_in_ids = {a.student_id for a in session.attendances}
        for student in Student.query.all():
            if student.id not in checked_in_ids:
                db.session.add(Attendance(student_id=student.id, session_id=session.id, status="absent"))
        session.is_closed = True
        closed.append(session)
    db.session.commit()
    return closed


def compute_absenteeism(threshold=DEFAULT_ATTENDANCE_THRESHOLD, consecutive_absences=DEFAULT_CONSECUTIVE_ABSENCES):
    """Return a StudentFlag for every student who is below the attendance rate threshold
    or has too many consecutive absences, based on all closed sessions."""
    closed_sessions = Session.query.filter_by(is_closed=True).order_by(Session.starts_at.asc()).all()
    if not closed_sessions:
        return []

    flags = []
    for student in Student.query.all():
        records_by_session = {a.session_id: a.status for a in student.attendances}
        statuses = [records_by_session.get(s.id, "absent") for s in closed_sessions]

        present_count = sum(1 for s in statuses if s in ("present", "late"))
        rate = present_count / len(statuses)

        streak = 0
        for status in reversed(statuses):
            if status == "absent":
                streak += 1
            else:
                break

        reasons = []
        if rate < threshold:
            reasons.append(f"attendance rate {rate:.0%} below {threshold:.0%} threshold")
        if streak >= consecutive_absences:
            reasons.append(f"{streak} consecutive absences")

        if reasons:
            flags.append(
                StudentFlag(
                    student_id=student.student_id,
                    name=student.name,
                    email=student.email or "",
                    sessions_counted=len(statuses),
                    present_count=present_count,
                    attendance_rate=rate,
                    consecutive_absences=streak,
                    reasons=reasons,
                )
            )
    return flags


def write_report_csv(flags, out_dir="reports"):
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    path = Path(out_dir) / f"absenteeism_{datetime.utcnow():%Y%m%d_%H%M%S}.csv"
    with open(path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["student_id", "name", "email", "sessions_counted", "present_count",
                          "attendance_rate", "consecutive_absences", "reasons"])
        for flag in flags:
            writer.writerow([
                flag.student_id, flag.name, flag.email, flag.sessions_counted, flag.present_count,
                f"{flag.attendance_rate:.2%}", flag.consecutive_absences, "; ".join(flag.reasons),
            ])
    return path


def send_alert_email(flags, smtp_config):
    """smtp_config: dict with host, port, username, password, from_addr, to_addrs (list), use_tls.
    No-ops (returns False) if config is incomplete, so this is safe to call without SMTP set up."""
    required = ("host", "port", "from_addr", "to_addrs")
    if not flags or not smtp_config or not all(smtp_config.get(k) for k in required):
        return False

    lines = [f"{f.name} ({f.student_id}): {'; '.join(f.reasons)}" for f in flags]
    body = "Students flagged for absenteeism:\n\n" + "\n".join(lines)
    msg = MIMEText(body)
    msg["Subject"] = f"Absenteeism alert: {len(flags)} student(s) flagged"
    msg["From"] = smtp_config["from_addr"]
    msg["To"] = ", ".join(smtp_config["to_addrs"])

    with smtplib.SMTP(smtp_config["host"], smtp_config["port"]) as server:
        if smtp_config.get("use_tls", True):
            server.starttls()
        if smtp_config.get("username"):
            server.login(smtp_config["username"], smtp_config["password"])
        server.sendmail(smtp_config["from_addr"], smtp_config["to_addrs"], msg.as_string())
    return True
