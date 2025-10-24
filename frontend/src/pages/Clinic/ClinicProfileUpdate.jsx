import { useState, useEffect } from "react";
import axios from "axios";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

export default function ClinicProfileUpdate() {
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setForm((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    console.log("🔍 Frontend - Sending clinic update request:", {
      form,
      token: token ? "Token present" : "No token"
    });

    try {
      const res = await axios.put(`${API_URL}/api/clinic/update`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Frontend - Clinic update successful:", res.data);
      alert("✅ Profili u përditësua me sukses!");
      localStorage.setItem("user", JSON.stringify(res.data.clinic));
    } catch (err) {
      console.error("❌ Frontend - Clinic update failed:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Dështoi përditësimi. Kontrollo të dhënat.");
    }
  };

  return (
    <div className="container-fluid" style={{
      backgroundColor: "#FAF7F3",
      minHeight: "100vh",
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <div className="card shadow-lg" style={{
              background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
              border: "1px solid rgba(220, 197, 178, 0.3)",
              borderRadius: "25px",
              boxShadow: "0 20px 40px rgba(217, 162, 153, 0.3)",
              overflow: "hidden"
            }}>
              <div className="card-header text-center py-4" style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                color: "white",
                border: "none"
              }}>
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color:"white" }}>
                  ⚙️ Përditëso Profilin e Klinikës
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Menaxhoni të dhënat e klinikës suaj
                </p>
              </div>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Emri i Klinikës</label>
                    <input 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      className="form-control form-control-lg"
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      className="form-control form-control-lg"
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>


                  <button type="submit" className="btn btn-lg w-100" style={{
                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                    border: "none",
                    color: "white",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.4)",
                    padding: "1rem 2rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 35px rgba(217, 162, 153, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 25px rgba(217, 162, 153, 0.4)";
                  }}>
                    💾 Ruaj Ndryshimet
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClinicHomeButton />
    </div>
  );
}
