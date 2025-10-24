const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();

const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");
const checkRole = require("../middleware/roles");
const { sendVerificationEmail, sendDoctorWelcomeEmail } = require("../utils/sendEmail");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, clinicCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "patient") {
      const verificationCode = crypto.randomBytes(3).toString("hex");

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
        verificationCode,
        isVerified: false,
      });

      await newUser.save();
      await sendVerificationEmail(email, verificationCode);

      return res.status(201).json({ message: "U regjistruat si pacient. Verifikoni emailin!" });
    }

    if (role === "clinic") {
      const validCodes = process.env.CLINIC_CODES?.split(",") || [];
      if (!validCodes.includes(clinicCode)) {
        return res.status(400).json({ message: "Kodi i klinikës nuk është valid." });
      }

      const newClinic = new User({
        name,
        email,
        password: hashedPassword,
        role,
        isVerified: true,
      });

      await newClinic.save();
      return res.status(201).json({ message: "Klinika u regjistrua me sukses!" });
    }

    if (role === "doctor") {
      return res.status(403).json({ message: "Mjekët regjistrohen vetëm nga klinika." });
    }

    res.status(400).json({ message: "Rol i panjohur." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// VERIFY EMAIL
router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.verificationCode !== code) {
    return res.status(400).json({ message: "Kodi është i gabuar ose emaili s'është valid." });
  }

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();

  res.json({ message: "Email u verifikua me sukses!" });
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password, expectedRole, adminSecret } = req.body;

    if (!email || !password || !expectedRole) {
      return res.status(400).json({ message: "Plotëso të gjitha fushat." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Ky email nuk është i regjistruar." });

    if (user.role !== expectedRole) {
      return res.status(403).json({
        message: `Ky email nuk i përket rolit "${expectedRole}".`,
      });
    }

    if (expectedRole === "patient" && !user.isVerified) {
      return res.status(401).json({
        message: "📧 Ju lutemi verifikoni emailin përpara se të kyçeni.",
      });
    }

    if (expectedRole === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Kodi sekret i gabuar për admin." });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Fjalëkalimi është i gabuar." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("❌ Gabim në login:", err);
    res.status(500).json({ message: "Gabim në server." });
  }
});

// GET /me
router.get("/me", verifyToken, async (req, res) => {
  try {
    let user;
    
    // For doctors, populate department and services
    if (req.user.role === "doctor") {
      user = await User.findById(req.user.id)
        .select("-password")
        .populate("departmentId", "name")
        .populate("services", "name price");
    } else {
      user = await User.findById(req.user.id).select("-password");
    }
    
    console.log("🔍 /me endpoint - returning user data:", {
      id: user._id,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      services: user.services?.length || 0
    });
    
    res.json(user);
  } catch (err) {
    console.error("❌ Error in /me endpoint:", err);
    res.status(500).json({ message: err.message });
  }
});

// TEST TOKEN
router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.role}!`,
    userId: req.user.id,
  });
});

// RESEND VERIFICATION EMAIL
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.role !== "patient") {
    return res.status(404).json({ message: "Përdoruesi nuk ekziston." });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Emaili është tashmë i verifikuar." });
  }

  const code = crypto.randomBytes(3).toString("hex");
  user.verificationCode = code;
  await user.save();

  try {
    await sendVerificationEmail(user.email, code);
    res.json({ message: "Kodi i verifikimit u ridërgua!" });
  } catch (err) {
    console.error("❌ Gabim me email:", err.message);
    res.status(500).json({ message: "Nuk u dërgua emaili." });
  }
});

// REGISTER DOCTOR - only by clinic
router.post("/register-doctor", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika mund të regjistrojë mjekë." });
    }

    const { name, email, password, departmentId, services } = req.body;

    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Emaili ekziston tashmë." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctorCode = "DR" + crypto.randomBytes(3).toString("hex").toUpperCase();

    const newDoctor = new User({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      clinicId: req.user.id,
      departmentId,
      services,
      doctorCode,
      isVerified: true,
    });

    await newDoctor.save();

    // Try to send email but don't fail if it doesn't work
    try {
      await sendDoctorWelcomeEmail(email, doctorCode, password);
    } catch (emailError) {
      console.log("⚠️ Email nuk u dërgua, por mjeku u krijua:", emailError.message);
    }

    res.status(201).json({
      message: "✅ Mjeku u regjistrua me sukses!",
      doctor: {
        name: newDoctor.name,
        email: newDoctor.email,
        doctorCode: newDoctor.doctorCode,
        password: password, // Return password for manual sharing
      },
    });
  } catch (err) {
    console.error("❌ Gabim në regjistrimin e mjekut:", err);
    res.status(500).json({ message: "Gabim gjatë regjistrimit të mjekut." });
  }
});

// LOGIN DOCTOR me doctorCode
router.post("/login-doctor", async (req, res) => {
  try {
    const { doctorCode, password } = req.body;

    if (!doctorCode || !password) {
      return res.status(400).json({ message: "Shkruaj kodin e mjekut dhe fjalëkalimin." });
    }

    const doctor = await User.findOne({ doctorCode, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ message: "Kodi i mjekut nuk ekziston." });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Fjalëkalim i gabuar." });
    }

    const token = jwt.sign({ id: doctor._id, role: doctor.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "Mjeku u kyç me sukses.",
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        role: doctor.role,
        doctorCode: doctor.doctorCode,
        clinicId: doctor.clinicId,
      },
    });
  } catch (err) {
    console.error("❌ Gabim në login:", err);
    res.status(500).json({ message: "Gabim gjatë kyçjes së mjekut." });
  }
});

// INVITE PATIENT nga klinika
router.post("/invite-patient", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "clinic") {
      return res.status(403).json({ message: "Vetëm klinika mund të ftojë pacientë." });
    }

    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Emri dhe emaili janë të detyrueshëm." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Ky email është tashmë i regjistruar." });
    }

    const verificationCode = crypto.randomBytes(3).toString("hex");
    const password = crypto.randomBytes(6).toString("hex");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new User({
      name,
      email,
      role: "patient",
      clinicId: req.user.id,
      verificationCode,
      isVerified: false,
      password: hashedPassword,
    });

    await newPatient.save();

    const link = `${process.env.CLIENT_URL}/verify-invite?email=${encodeURIComponent(email)}&code=${verificationCode}`;

    // Try to send email but don't fail if it doesn't work
    try {
      await sendVerificationEmail(email, verificationCode, link, name, req.user.name);
    } catch (emailError) {
      console.log("⚠️ Email nuk u dërgua, por pacienti u krijua:", emailError.message);
    }

    res.status(201).json({ 
      message: "Pacienti u ftua me sukses.", 
      email: email,
      password: password,
      verificationCode: verificationCode,
      link: link
    });
  } catch (err) {
    console.error("❌ Gabim në ftesën e pacientit:", err);
    res.status(500).json({ message: "Gabim gjatë ftesës." });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: "Emaili dhe roli janë të nevojshëm." });
  }

  const user = await User.findOne({ email, role });
  if (!user) {
    return res.status(404).json({ message: "Ky email nuk ekziston për këtë rol." });
  }

  const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  user.verificationCode = resetCode;
  await user.save();

  try {
    await sendVerificationEmail(email, resetCode, null, null, null, true);
    res.json({ message: "Kodi për ndërrimin e fjalëkalimit u dërgua në email." });
  } catch (err) {
    console.error("❌ Gabim me dërgimin e kodit:", err.message);
    res.status(500).json({ message: "Gabim gjatë dërgimit të emailit." });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, role, code, newPassword } = req.body;

  if (!email || !role || !code || !newPassword) {
    return res.status(400).json({ message: "Të gjitha fushat janë të detyrueshme." });
  }

  const user = await User.findOne({ email, role });
  if (!user || user.verificationCode !== code) {
    return res.status(400).json({ message: "Kodi është i pasaktë ose emaili nuk ekziston." });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.verificationCode = null;
  await user.save();

  res.json({ message: "Fjalëkalimi u ndryshua me sukses!" });
});

// ADMIN ONLY ROUTE - përdor verifyToken dhe kontroll role manualisht
router.get("/admin/users", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({}, "name email role isVerified");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route për overview admini
router.get("/admin/overview", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    // Numri total i përdoruesve
    const totalUsers = await User.countDocuments();

    // Numri i përdoruesve sipas roleve
    const usersByRoleAggregation = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Konverto në objekt { patient: x, doctor: y, ... }
    const usersByRole = {};
    usersByRoleAggregation.forEach((item) => {
      usersByRole[item._id] = item.count;
    });

    // Numri i përdoruesve të verifikuar dhe jo
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // *** Për pagesa, supozojmë që ke koleksion pagesash ***
    // Nëse s'ke ende, për momentin vendos disa vlera hardcoded:
    const payments = {
      totalRevenue: 15000,     // zëvendëso me query nga DB nëse ke pagesat
      pendingPayments: 1000,
      failedPayments: 200,
    };

    res.json({
      totalUsers,
      usersByRole,
      verifiedUsers,
      unverifiedUsers,
      payments,
    });
  } catch (err) {
    console.error("Gabim në /admin/overview:", err);
    res.status(500).json({ message: "Gabim në server." });
  }
});
const Payment = require("../models/Payment");

// Vetëm admin mund të thirret
router.get("/stats", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;

    // Supozim: totalRevenue i llogaritur nga pagesat
    const revenueAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      totalRevenue,
    });
  } catch (err) {
    console.error("Gabim në marrjen e statistikave:", err);
    res.status(500).json({ message: "Gabim serveri" });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, specialization, bio } = req.body;
    
    console.log("🔄 Update profile request:", { name, email, phone, specialization, bio });
    
    // Gjej user-in nga token
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Useri nuk u gjet' });
    }

    console.log("👤 Current user before update:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      bio: user.bio
    });

    // Përditëso fushat
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (specialization) user.specialization = specialization;
    if (bio) user.bio = bio;

    await user.save();

    console.log("✅ User after save:", {
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      bio: user.bio
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      specialization: user.specialization,
      bio: user.bio,
      role: user.role,
      doctorCode: user.doctorCode,
      departmentId: user.departmentId,
      services: user.services
    });
  } catch (error) {
    console.error('Gabim në përditësimin e profilit:', error);
    res.status(500).json({ message: 'Gabim serveri', error: error.message });
  }
});

module.exports = router;
