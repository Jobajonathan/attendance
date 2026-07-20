import io
import os
from datetime import datetime

import qrcode
from flask import Flask, flash, redirect, render_template, request, send_file, url_for

from models import Attendance, Session, Student, db
from reports import close_overdue_sessions, compute_absenteeism, write_report_csv


def create_app(db_path="sqlite:///attendance.db"):
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", db_path)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def index():
        return redirect(url_for("admin_dashboard"))

    # --- Admin: sessions -------------------------------------------------

    @app.get("/admin")
    def admin_dashboard():
        close_overdue_sessions()
        sessions = Session.query.order_by(Session.starts_at.desc()).all()
        return render_template("admin_dashboard.html", sessions=sessions)

    @app.route("/admin/sessions/new", methods=["GET", "POST"])
    def new_session():
        if request.method == "POST":
            name = request.form["name"].strip()
            starts_at = datetime.fromisoformat(request.form["starts_at"])
            ends_at = datetime.fromisoformat(request.form["ends_at"])
            if not name or ends_at <= starts_at:
                flash("Provide a name and an end time after the start time.")
                return render_template("new_session.html"), 400
            session = Session(name=name, starts_at=starts_at, ends_at=ends_at)
            db.session.add(session)
            db.session.commit()
            return redirect(url_for("session_detail", session_id=session.id))
        return render_template("new_session.html")

    @app.get("/admin/sessions/<int:session_id>")
    def session_detail(session_id):
        session = Session.query.get_or_404(session_id)
        roster = Student.query.order_by(Student.name).all()
        checked_in = {a.student_id: a for a in session.attendances}
        checkin_url = url_for("checkin", token=session.token, _external=True)
        return render_template(
            "session_detail.html", session=session, roster=roster,
            checked_in=checked_in, checkin_url=checkin_url,
        )

    @app.post("/admin/sessions/<int:session_id>/close")
    def close_session(session_id):
        session = Session.query.get_or_404(session_id)
        if not session.is_closed:
            checked_in_ids = {a.student_id for a in session.attendances}
            for student in Student.query.all():
                if student.id not in checked_in_ids:
                    db.session.add(Attendance(student_id=student.id, session_id=session.id, status="absent"))
            session.is_closed = True
            db.session.commit()
        return redirect(url_for("session_detail", session_id=session.id))

    @app.get("/admin/sessions/<int:session_id>/qr.png")
    def session_qr(session_id):
        session = Session.query.get_or_404(session_id)
        checkin_url = url_for("checkin", token=session.token, _external=True)
        img = qrcode.make(checkin_url)
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        return send_file(buf, mimetype="image/png")

    # --- Student check-in --------------------------------------------------

    @app.route("/checkin/<token>", methods=["GET", "POST"])
    def checkin(token):
        session = Session.query.filter_by(token=token).first_or_404()
        if request.method == "POST":
            if session.is_closed:
                flash("This session is closed and no longer accepting check-ins.")
                return render_template("checkin.html", session=session), 400
            student_id = request.form["student_id"].strip()
            student = Student.query.filter_by(student_id=student_id).first()
            if not student:
                flash("Student ID not recognized. Check with your administrator.")
                return render_template("checkin.html", session=session), 400
            existing = Attendance.query.filter_by(student_id=student.id, session_id=session.id).first()
            if existing:
                flash(f"{student.name} is already checked in for this session.")
            else:
                status = "late" if datetime.utcnow() > session.starts_at else "present"
                db.session.add(Attendance(student_id=student.id, session_id=session.id, status=status))
                db.session.commit()
                flash(f"Checked in: {student.name} ({status}).")
            return render_template("checkin.html", session=session)
        return render_template("checkin.html", session=session)

    # --- Roster --------------------------------------------------------------

    @app.route("/admin/students", methods=["GET", "POST"])
    def students():
        if request.method == "POST":
            student_id = request.form["student_id"].strip()
            name = request.form["name"].strip()
            email = request.form.get("email", "").strip()
            if not student_id or not name:
                flash("Student ID and name are required.")
            elif Student.query.filter_by(student_id=student_id).first():
                flash(f"Student ID {student_id} already exists.")
            else:
                db.session.add(Student(student_id=student_id, name=name, email=email))
                db.session.commit()
                flash(f"Added {name}.")
        roster = Student.query.order_by(Student.name).all()
        return render_template("students.html", roster=roster)

    # --- Absenteeism report ---------------------------------------------------

    @app.get("/admin/report")
    def report():
        close_overdue_sessions()
        threshold = float(request.args.get("threshold", 0.75))
        consecutive = int(request.args.get("consecutive", 3))
        flags = compute_absenteeism(threshold=threshold, consecutive_absences=consecutive)
        return render_template("report.html", flags=flags, threshold=threshold, consecutive=consecutive)

    @app.get("/admin/report/export")
    def export_report():
        threshold = float(request.args.get("threshold", 0.75))
        consecutive = int(request.args.get("consecutive", 3))
        flags = compute_absenteeism(threshold=threshold, consecutive_absences=consecutive)
        path = write_report_csv(flags)
        return send_file(path, as_attachment=True, download_name=path.name)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
