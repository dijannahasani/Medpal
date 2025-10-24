import React, { useState } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

const InvitePatient = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const token = getToken(); // JWT i klinikës
      const response = await axios.post(
        `${API_URL}/api/auth/invite-patient`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setFormData({ name: "", email: "" });
    } catch (err) {
      setError(
        err.response?.data?.message || "Gabim gjatë dërgimit të ftesës."
      );
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
                  📩 Fto Pacient të Ri
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Dërgoni ftesë për regjistrim në klinikën tuaj
                </p>
              </div>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Emri i pacientit</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="name"
                      autoComplete="off"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>
                  <div className="mb-5">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Email i pacientit</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      name="email"
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>
                  <button className="btn btn-lg w-100" type="submit" style={{
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
                    📧 Dërgo Ftesën
                  </button>
                </form>

                {message && (
                  <div className="alert mt-4" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "500"
                  }}>
                    {message}
                  </div>
                )}
                {error && (
                  <div className="alert mt-4" style={{
                    background: "linear-gradient(145deg, #DCC5B2, #D9A299)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "white",
                    fontSize: "1.1rem",
                    fontWeight: "500"
                  }}>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClinicHomeButton />
    </div>
  );
};

export default InvitePatient;
