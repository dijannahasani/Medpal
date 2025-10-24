const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const Document = require("../models/Document");
const sendAppointmentNotification = require("../utils/sendAppointmentNotification");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// 📅 POST /api/appointments → Rezervo një termin
router.post("/", verifyToken, async (req, res) => {
  try {
    const { doctorId, serviceId, date, time } = req.body;

    // Basic input validation
    if (!doctorId || !serviceId || !date || !time) {
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
    }
    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "doctorId i pavlefshëm." });
    }
    if (!mongoose.isValidObjectId(serviceId)) {
      return res.status(400).json({ message: "serviceId i pavlefshëm." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Data duhet të jetë në formatin YYYY-MM-DD." });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ message: "Ora duhet të jetë në formatin HH:mm." });
    }

    const doctor = await User.findById(doctorId);
    const service = await Service.findById(serviceId);
    const patient = await User.findById(req.user.id).select("-password");

    if (!doctor || doctor.role !== "doctor") return res.status(404).json({ message: "Mjeku nuk u gjet." });
    if (!service) return res.status(404).json({ message: "Shërbimi nuk u gjet." });

    const workingHours = doctor.workingHours;
    if (!workingHours) return res.status(400).json({ message: "Mjeku nuk ka orar të caktuar." });

    // Compute weekday in a timezone-safe way using UTC to avoid off-by-one day issues
    // and compare times numerically (minutes) instead of string comparison.
    const toMinutes = (t) => {
      if (!t || typeof t !== 'string') return null;
      const m = t.split(":");
      if (m.length !== 2) return null;
      const hh = parseInt(m[0], 10);
      const mm = parseInt(m[1], 10);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
      return hh * 60 + mm;
    };

    const utcDate = new Date(date + 'T00:00:00Z');
    const dayIdx = utcDate.getUTCDay(); // 0=Sun..6=Sat
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const dayName = days[dayIdx];
    const daySchedule = workingHours && workingHours[dayName];

    // If schedule is missing, return a clear message. (If you prefer to allow
    // bookings even when a schedule is not set, we can change this behaviour.)
    if (!daySchedule || !daySchedule.start || !daySchedule.end) {
      return res.status(400).json({ message: `Mjeku nuk punon të ${dayName}.` });
    }

    const startMin = toMinutes(daySchedule.start);
    const endMin = toMinutes(daySchedule.end);
    const requestedMin = toMinutes(time);

    if (startMin === null || endMin === null || requestedMin === null) {
      return res.status(400).json({ message: 'Format i pavlefshëm i kohës. Përdorni HH:mm.' });
    }

    // allow booking inside the half-open interval [start, end)
    if (requestedMin < startMin || requestedMin >= endMin) {
      return res.status(400).json({ message: `Orari i mjekut është nga ${daySchedule.start} deri në ${daySchedule.end}.` });
    }

    const existing = await Appointment.findOne({ doctorId, date, time, status: { $ne: "canceled" } });
    if (existing) return res.status(409).json({ message: "Ky orar është i zënë për këtë mjek." });

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId: doctor._id,
      serviceId: service._id,
      date,
      time,
      status: "pending"
    });
    await newAppointment.save();

    // Merr dokumentet
    const documents = await Document.find({ patientId: req.user.id });

    // Email për pacientin (best-effort)
    try {
      await sendAppointmentNotification(
        patient.email,
        "📅 Termini u rezervua",
        `Përshëndetje ${patient.name},<br />Keni rezervuar një takim te Dr. ${doctor.name} për shërbimin <strong>${service.name}</strong> më <strong>${date}</strong> në orën <strong>${time}</strong>.`
      );
    } catch (_) {}

    // Email për mjekun (best-effort)
    try {
      await sendAppointmentNotification(
        doctor.email,
        `📥 Termini i ri nga ${patient.name}`,
        `
        <p>Një pacient ka rezervuar një takim:</p>
        <ul>
          <li><strong>Pacient:</strong> ${patient.name}</li>
          <li><strong>Email:</strong> ${patient.email}</li>
          <li><strong>Shërbimi:</strong> ${service.name}</li>
          <li><strong>Data:</strong> ${date}</li>
          <li><strong>Ora:</strong> ${time}</li>
        </ul>
        ${
          documents.length
          ? `<p><strong>📎 Dokumente të bashkangjitura:</strong></p><ul>` +
            documents.map(d => `<li><a href="${process.env.SERVER_URL || 'http://localhost:5000'}${d.fileUrl}" target="_blank">${d.title}</a></li>`).join("") +
              `</ul>`
            : `<p>❌ Nuk ka dokumente të bashkangjitura.</p>`
        }
      `
      );
    } catch (_) {}
    const clinic = await User.findById(doctor.clinicId);
    if (clinic) {
      try {
        await sendAppointmentNotification(
          clinic.email,
          `📥 Termini i ri për Dr. ${doctor.name}`,
          `
      <p>Një pacient ka rezervuar një takim:</p>
      <ul>
        <li><strong>Pacient:</strong> ${patient.name}</li>
        <li><strong>Email:</strong> ${patient.email}</li>
        <li><strong>Shërbimi:</strong> ${service.name}</li>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Ora:</strong> ${time}</li>
      </ul>
      ${
        documents.length
          ? `<p><strong>📎 Dokumente të bashkangjitura:</strong></p><ul>` +
            documents.map(d => `<li><a href="${process.env.SERVER_URL || 'http://localhost:5000'}${d.fileUrl}" target="_blank">${d.title}</a></li>`).join("") +
            `</ul>`
          : `<p>❌ Nuk ka dokumente të bashkangjitura.</p>`
      }
    `
        );
      } catch (_) {}
    }


    res.status(201).json({ message: "Termini u ruajt me sukses!", appointment: newAppointment });
  } catch (err) {
    console.error("❌ Error në /appointments:", err);
    const extra = process.env.NODE_ENV === 'production' ? undefined : (err && err.message ? { error: err.message } : undefined);
    res.status(500).json({ message: "Gabim gjatë rezervimit.", ...(extra || {}) });
  }
});

// 🔄 PUT /api/appointments/:id/status
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    console.log("📝 Status change request:", { appointmentId: req.params.id, newStatus: status, userRole: req.user.role, userId: req.user.id });

    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "email name")
      .populate("doctorId", "name workingHours clinicId");

    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    if (!["pending", "approved", "canceled", "completed"].includes(status)) {
      console.error("❌ Invalid status:", status);
      return res.status(400).json({ message: "Status i pavlefshëm." });
    }

    // Authorization: clinic may manage appointments for its own doctors; doctors may manage their own appointments
    if (req.user.role === "clinic") {
      const apptClinicId = appointment.doctorId?.clinicId?.toString();
      if (!apptClinicId || apptClinicId !== req.user.id.toString()) {
        return res.status(403).json({ message: "Nuk keni leje të menaxhoni këtë takim (jo i klinikës suaj)." });
      }
    } else if (req.user.role === "doctor") {
      const apptDoctorId = (appointment.doctorId && appointment.doctorId._id && appointment.doctorId._id.toString())
        || (appointment.doctorId && appointment.doctorId.toString && appointment.doctorId.toString())
        || null;
      const currentDoctorId = req.user.id.toString();
      if (!apptDoctorId || apptDoctorId !== currentDoctorId) {
        console.warn("⚠️ Doctor approval forbidden:", { apptDoctorId, currentDoctorId, apptId: appointment._id.toString() });
        return res.status(403).json({ message: "Nuk keni leje të menaxhoni këtë takim." });
      }
    } else {
      return res.status(403).json({ message: "Roli juaj nuk lejohet të ndryshojë statusin." });
    }

    if (status === "approved") {
        const workingHours = appointment.doctorId.workingHours;
        // Use the same robust time/day calculations as when booking.
        const toMinutes = (t) => {
          if (!t || typeof t !== 'string') return null;
          const m = t.split(":");
          if (m.length !== 2) return null;
          const hh = parseInt(m[0], 10);
          const mm = parseInt(m[1], 10);
          if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
          return hh * 60 + mm;
        };

        const utcDate = new Date(appointment.date + 'T00:00:00Z');
        const dayIdx = utcDate.getUTCDay();
        const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const dayName = days[dayIdx];
        const schedule = workingHours?.[dayName];

        const startMin = toMinutes(schedule?.start);
        const endMin = toMinutes(schedule?.end);
        const apptMin = toMinutes(appointment.time);

        const outOfHours = (!schedule || startMin === null || endMin === null || apptMin === null || apptMin < startMin || apptMin >= endMin);
      if (outOfHours) {
        if (req.user.role === "clinic") {
          return res.status(400).json({
            message: `Ora është jashtë orarit të punës së mjekut (${schedule?.start || "?"} - ${schedule?.end || "?"}). Përditësoni orarin ose zgjidhni një orë tjetër.`
          });
        }
        // If doctor is approving, allow but include a warning header
        res.set("X-Warning", "Approved outside working hours; consider updating working hours.");
      }
    }

    appointment.status = status;
    await appointment.save();

    if (["approved", "canceled"].includes(status)) {
      await sendAppointmentNotification(
        appointment.patientId.email,
        status === "approved" ? "✅ Termini u aprovua" : "❌ Termini u anullua",
        `Termini juaj te Dr. ${appointment.doctorId.name} më ${appointment.date} në orën ${appointment.time} është ${status === "approved" ? "aprovuar" : "anulluar"}.`
      );
    }

    res.json({ message: "Statusi u përditësua me sukses.", appointment });
  } catch (err) {
    console.error("❌ Gabim gjatë përditësimit të statusit:", err?.message || err);
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// 📥 GET /api/appointments/mine
router.get("/mine", verifyToken, async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === "patient") {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate("doctorId", "name")
        .populate("serviceId", "name")
        .sort({ date: -1 });
    } else if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctorId: req.user.id })
        .populate("patientId", "name email")
        .populate("serviceId", "name")
        .sort({ date: -1 });
    } else {
      return res.status(403).json({ message: "Qasje e ndaluar për këtë rol." });
    }
    
    res.json(appointments);
  } catch (err) {
    console.error("Gabim në /mine:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// 👨‍⚕️ GET /api/appointments/doctor
router.get("/doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ message: "Vetëm mjekët kanë qasje." });
    const appointments = await Appointment.find({ doctorId: req.user.id })
  .populate("patientId", "name email dateOfBirth")
  .populate("serviceId", "name")
  .sort({ date: -1 })
  .lean(); // për manipulim me objektin

// 👉 Shto dokumentet për çdo takim
for (let appt of appointments) {
  appt.documents = await Document.find({ patientId: appt.patientId._id }).lean();
}

res.json(appointments);

  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});

// ⛔ GET /api/appointments/taken
router.get("/taken", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ message: "doctorId dhe date janë të detyrueshme." });

    const appointments = await Appointment.find({ doctorId, date, status: { $ne: "canceled" } });
    const times = appointments.map((a) => a.time);
    res.json(times);
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë kontrollit të orëve të zëna." });
  }
});

// 📄 GET /api/appointments/:id/pdf
router.get("/:id/pdf", verifyToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("patientId", "name email")
      .populate("serviceId", "name price");

    if (!appointment) return res.status(404).json({ message: "Termini nuk u gjet." });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="raport-${appointment._id}.pdf"`);

    doc.pipe(res);
    doc.fontSize(18).text("📄 Raporti i Terminit", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`🧑‍⚕️ Doktor: ${appointment.doctorId.name}`);
    doc.text(`🧑‍💼 Pacient: ${appointment.patientId.name}`);
    doc.text(`📧 Email: ${appointment.patientId.email}`);
    doc.text(`💉 Shërbimi: ${appointment.serviceId.name}`);
    doc.text(`💰 Çmimi: ${appointment.serviceId.price} €`);
    doc.text(`📅 Data: ${appointment.date}`);
    doc.text(`⏰ Ora: ${appointment.time}`);
    doc.text(`📌 Statusi: ${appointment.status}`);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë gjenerimit të raportit." });
  }
});

// 📅 GET /api/appointments/all (për klinikë)
router.get("/all", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika ka qasje." });
    }

    // Gjej të gjithë mjekët që i përkasin kësaj klinike
    const doctors = await User.find({ role: "doctor", clinicId: req.user.id });
    const doctorIds = doctors.map((d) => d._id);

    // Gjej të gjithë terminet që i përkasin këtyre mjekëve
    const appointments = await Appointment.find({ doctorId: { $in: doctorIds } })
      .populate("patientId", "name email dateOfBirth")
      .populate("doctorId", "name")
      .lean();

    // Merr dokumentet për çdo pacient në këto termine
    for (const a of appointments) {
      if (a.patientId && a.patientId._id) {
        a.documents = await Document.find({ patientId: a.patientId._id });
      } else {
        a.documents = [];
      }
    }

    res.json(appointments);
  } catch (err) {
    console.error("❌ Gabim në /appointments/all:", err);
    res.status(500).json({ message: "Gabim gjatë marrjes së termineve." });
  }
});


// PUT /api/appointments/mark-seen
router.put("/mark-seen", verifyToken, async (req, res) => {
  try {
    await Appointment.updateMany(
      { patientId: req.user.id, seenByPatient: false },
      { $set: { seenByPatient: true } }
    );
    res.json({ message: "Të gjitha njoftimet u shënuan si të lexuara." });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë përditësimit." });
  }
});

// GET /api/appointments/unseen-count
router.get("/unseen-count", verifyToken, async (req, res) => {
  try {
    const count = await Appointment.countDocuments({
      patientId: req.user.id,
      seenByPatient: false,
      status: { $in: ["approved", "canceled"] },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Gabim gjatë marrjes së njoftimeve." });
  }
});

module.exports = router;
