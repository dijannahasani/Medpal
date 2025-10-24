import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import API_URL from "../../config/api";

export default function Login() {
  const [step, setStep] = useState("select"); // select, login, forgot, reset
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    doctorCode: "",
    code: "",
    newPassword: "",
    adminSecret: "", // shtuar për admin
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep("login");
    setError("");
    setMessage("");
    setFormData({
      email: "",
      password: "",
      doctorCode: "",
      code: "",
      newPassword: "",
      adminSecret: "",
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let res;
      if (role === "doctor") {
        res = await axios.post(`${API_URL}/api/auth/login-doctor`, {
          doctorCode: formData.doctorCode,
          password: formData.password,
        });
      } else {
        res = await axios.post(`${API_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
          expectedRole: role,
        });
      }

      const { token, user } = res.data;
      if (role === "patient" && !user.isVerified) {
        return setError("📧 Ju lutemi verifikoni emailin përpara se të qaseni.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Also store in sessionStorage for tab-specific sessions
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë qasjes.");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: formData.email,
        role,
      });
      setMessage("✅ Një kod është dërguar në email. Kontrollo inbox-in.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë dërgimit të kodit.");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: formData.email,
        role,
        code: formData.code,
        newPassword: formData.newPassword,
      });
      setMessage("🔒 Fjalëkalimi u ndryshua me sukses. Mund të qaseni tani.");
      setStep("login");
    } catch (err) {
      setError(err.response?.data?.message || "Gabim gjatë ndryshimit të fjalëkalimit.");
    }
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center justify-content-center"
      style={{ 
        minHeight: "100vh", 
        backgroundColor: "#FAF7F3",
        background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
      }}
    >
      <div className="card p-4 shadow-lg" style={{ 
        maxWidth: "480px", 
        width: "100%",
        background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
        border: "1px solid rgba(220, 197, 178, 0.3)",
        borderRadius: "20px",
        boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)"
      }}>
        {step === "select" && (
          <>
            <h2 className="mb-4 text-center" style={{ color: "#D9A299" }}>Zgjedh mënyrën e qasjes</h2>
            <div className="d-grid gap-3">
              <button className="btn btn-lg" onClick={() => handleRoleSelect("patient")} style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                border: "none",
                color: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
              }}>
                🧑‍⚕️ Vazhdo si Pacient
              </button>
              <button className="btn btn-lg" onClick={() => handleRoleSelect("doctor")} style={{
                background: "linear-gradient(135deg, #DCC5B2, #F0E4D3)",
                border: "none",
                color: "#2c3e50",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
              }}>
                👨‍⚕️ Vazhdo si Mjek
              </button>
              <button className="btn btn-lg" onClick={() => handleRoleSelect("clinic")} style={{
                background: "linear-gradient(135deg, #F0E4D3, #FAF7F3)",
                border: "1px solid rgba(220, 197, 178, 0.3)",
                color: "#2c3e50",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
              }}>
                🏥 Vazhdo si Klinikë
              </button>

              

             
              
            </div>
          </>
        )}

        {step === "login" && (
          <>
            <h2 className="mb-4 text-center">
              Qasja si{" "}
              {role === "doctor"
                ? "Mjek"
                : role === "clinic"
                ? "Klinikë"
                : role === "admin"
                ? "Admin"
                : "Pacient"}
            </h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin} autoComplete="off">
              {role === "doctor" ? (
                <div className="mb-3">
                  <input
                    name="doctorCode"
                    className="form-control form-control-lg"
                    placeholder="Kodi i Mjekut"
                    value={formData.doctorCode}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
              ) : (
                <div className="mb-3">
                  <input
                    name="email"
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="Emaili"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                    required
                  />
                </div>
              )}
              <div className="mb-3">
                <input
                  name="password"
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Fjalëkalimi"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>

              {role !== "doctor" && (
                <div className="mb-3 text-end">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => setStep("forgot")}
                  >
                    🔐 Keni harruar fjalëkalimin?
                  </button>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg w-100">
                Kycu
              </button>
            </form>

            <button className="btn btn-link mt-4" onClick={() => setStep("select")}>
              🔙 Kthehu prapa
            </button>
          </>
        )}

        {step === "forgot" && (
          <>
            <h2 className="mb-4 text-center">🔐 Keni harruar fjalëkalimin?</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <form onSubmit={handleForgot} autoComplete="off">
              <input
                name="email"
                type="email"
                className="form-control form-control-lg mb-3"
                placeholder="Shkruani emailin tuaj"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <button type="submit" className="btn btn-warning w-100">
                Dërgo kodin
              </button>
            </form>
            <button className="btn btn-link mt-3" onClick={() => setStep("login")}>
              🔙 Kthehu te qasja
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <h2 className="mb-4 text-center">🔑 Ndrysho fjalëkalimin</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <form onSubmit={handleReset} autoComplete="off">
              <input
                name="code"
                className="form-control form-control-lg mb-3"
                placeholder="Kodi i pranuar"
                value={formData.code}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <input
                name="newPassword"
                type="password"
                className="form-control form-control-lg mb-3"
                placeholder="Fjalëkalimi i ri"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <button type="submit" className="btn btn-success w-100">
                Ndrysho fjalëkalimin
              </button>
            </form>
            <button className="btn btn-link mt-3" onClick={() => setStep("login")}>
              🔙 Kthehu te qasja
            </button>
          </>
        )}
      </div>
    </div>
  );
}
