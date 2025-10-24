import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken, getUser, setAuth } from "../../utils/auth";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function PatientProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    bloodType: "",
    medicalHistory: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ ...form, ...res.data });
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    try {
      console.log("🔍 Updating patient profile:", form);
      const response = await axios.put(`${API_URL}/api/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update both storage types with new user data
      const currentUser = getUser();
      const updatedUser = { ...currentUser, ...response.data };
      setAuth(token, updatedUser);
      
      console.log("✅ Profile updated successfully:", response.data);
      alert("✅ Profili u përditësua me sukses!");
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Gabim në përditësim: " + (err.response?.data?.message || err.message));
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
          <div className="col-lg-10 col-xl-8">
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
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
                  👤 Profili i Pacientit
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Përditësoni të dhënat tuaja personale
                </p>
              </div>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                <div className="row">
                  {[
                    { label: "Emri", name: "name" },
                    { label: "Email", name: "email", type: "email" },
                    { label: "Data e Lindjes", name: "dateOfBirth", type: "date" },
                    { label: "Telefoni", name: "phone" },
                    { label: "Adresa", name: "address" },
                    { label: "Grupi i gjakut", name: "bloodType", placeholder: "p.sh. A+" },
                  ].map(({ label, name, type = "text", placeholder }) => (
                    <div className="col-md-6 mb-4" key={name}>
                      <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                        {label}
                      </label>
                      <input
                        type={type}
                        name={name}
                        className="form-control form-control-lg"
                        value={form[name] || ""}
                        placeholder={placeholder}
                        onChange={handleChange}
                        style={{
                          border: "2px solid rgba(220, 197, 178, 0.3)",
                          borderRadius: "12px",
                          padding: "0.75rem 1rem"
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                      Gjinia
                    </label>
                    <select
                      name="gender"
                      className="form-select form-select-lg"
                      value={form.gender || ""}
                      onChange={handleChange}
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    >
                      <option value="">Zgjedh Gjinine</option>
                      <option value="male">Mashkull</option>
                      <option value="female">Femër</option>
                      <option value="other">Tjetër</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                    Historia mjekësore
                  </label>
                  <textarea
                    name="medicalHistory"
                    className="form-control"
                    rows="4"
                    value={form.medicalHistory || ""}
                    onChange={handleChange}
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
                }}>💾 Ruaj Ndryshimet</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientHomeButton />
    </div>
  );
}
