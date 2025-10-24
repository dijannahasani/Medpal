const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/User");
const mongoose = require("mongoose");

/* 
=============================
 🕒 POST /api/working-hours
 -> Mjeku vendos ose përditëson orarin e tij
=============================
*/
router.post("/", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Vetëm mjekët mund të vendosin orarin." });
  }

  const { workingHours } = req.body;

  try {
    const doctor = await User.findById(req.user.id);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Mjeku nuk u gjet." });
    }

    doctor.workingHours = workingHours;
    await doctor.save();

    res.json({
      message: "✅ Orari u ruajt me sukses.",
      workingHours: doctor.workingHours,
    });
  } catch (err) {
    console.error("❌ Gabim në ruajtjen e orarit:", err.message);
    res.status(500).json({ message: "Gabim në server." });
  }
});

/* 
=============================
 🩺 GET /api/working-hours/me
 -> Merr orarin e mjekut të kyçur
=============================
*/
router.get("/me", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Vetëm mjekët kanë qasje." });
  }

  try {
    const doctor = await User.findById(req.user.id);
    if (!doctor) return res.status(404).json({ message: "Mjeku nuk u gjet." });

    res.json({ workingHours: doctor.workingHours || {} });
  } catch (err) {
    console.error("❌ Gabim:", err.message);
    res.status(500).json({ message: "Gabim në server." });
  }
});

/* 
=============================
 👨‍⚕️ GET /api/working-hours/:doctorId
 -> Merr orarin e mjekut në formatin që frontend e kupton
=============================
*/
router.get("/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "doctorId i pavlefshëm." });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Mjeku nuk u gjet." });
    }

    let workingHours = doctor.workingHours || {};

    // ✅ Convert array [{day, start, end}] → object { monday: {start, end}, ... }
    if (Array.isArray(workingHours)) {
      const converted = {};
      for (const wh of workingHours) {
        if (wh.day && wh.start && wh.end) {
          converted[wh.day.toLowerCase()] = {
            start: wh.start,
            end: wh.end,
          };
        }
      }
      workingHours = converted;
    }

    res.json(workingHours);
  } catch (err) {
    console.error("❌ Gabim në marrjen e orarit:", err.message);
    res.status(500).json({ message: "Gabim në server." });
  }
});

/* 
=============================
 🏥 POST /api/working-hours/:doctorId
 -> Klinika vendos ose përditëson orarin e mjekut
=============================
*/
router.post("/:doctorId", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika mund të vendosë orarin e mjekut." });
    }

    const { doctorId } = req.params;
    const { workingHours } = req.body;

    if (!mongoose.isValidObjectId(doctorId)) {
      return res.status(400).json({ message: "doctorId i pavlefshëm." });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Mjeku nuk u gjet." });
    }

    doctor.workingHours = workingHours;
    await doctor.save();

    res.json({ message: "✅ Orari i mjekut u vendos me sukses!" });
  } catch (err) {
    console.error("❌ Gabim:", err.message);
    res.status(500).json({ message: "Gabim në server." });
  }
});

module.exports = router;
