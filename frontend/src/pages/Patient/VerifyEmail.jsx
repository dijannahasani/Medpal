import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailParam = queryParams.get("email");
    const codeParam = queryParams.get("code");
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
    
    // If both email and code are present, redirect to register page
    if (emailParam && codeParam) {
      // Store the data in localStorage for the register page to use
      localStorage.setItem('inviteEmail', emailParam);
      localStorage.setItem('inviteCode', codeParam);
      // Redirect to register page
      navigate('/register?invite=true');
    }
  }, [navigate]);

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, { email, code });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Gabim gjatë verifikimit.");
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
          <div className="col-lg-6 col-md-8">
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
                <h2 className="card-title mb-0" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  📧 Verifikimi i Emailit
                </h2>
              </div>
              <div className="card-body p-5">
                <p className="text-center mb-4" style={{ fontSize: "1.1rem", color: "#2c3e50" }}>
                  Email: <strong style={{ color: "#D9A299" }}>{email}</strong>
                </p>
                <div className="mb-4">
                  <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                    Kodi i Verifikimit
                  </label>
                  <input
                    className="form-control form-control-lg"
                    placeholder="Shkruani kodin e verifikimit"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    style={{
                      border: "2px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                      fontSize: "1.2rem",
                      letterSpacing: "2px"
                    }}
                  />
                </div>
                <button 
                  className="btn btn-lg w-100" 
                  onClick={handleVerify}
                  style={{
                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                    border: "none",
                    color: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                    padding: "0.75rem 1rem",
                    fontSize: "1.1rem",
                    fontWeight: "bold"
                  }}
                >
                  ✅ Verifiko Llogarinë
                </button>
                {message && (
                  <div className={`alert mt-4 ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`} style={{
                    borderRadius: "12px",
                    fontSize: "1rem"
                  }}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientHomeButton />
    </div>
  );
};

export default VerifyEmail;
