import secrets
from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(32), unique=True, nullable=False)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128))

    attendances = db.relationship("Attendance", back_populates="student")


class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    starts_at = db.Column(db.DateTime, nullable=False)
    ends_at = db.Column(db.DateTime, nullable=False)
    token = db.Column(db.String(32), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(12))
    is_closed = db.Column(db.Boolean, default=False, nullable=False)

    attendances = db.relationship("Attendance", back_populates="session")

    @property
    def is_open_for_checkin(self):
        return not self.is_closed


class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey("session.id"), nullable=False)
    status = db.Column(db.String(16), nullable=False, default="present")  # present | late | absent
    checked_in_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("Student", back_populates="attendances")
    session = db.relationship("Session", back_populates="attendances")

    __table_args__ = (db.UniqueConstraint("student_id", "session_id", name="uq_attendance_student_session"),)
