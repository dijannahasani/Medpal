import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import API_URL from "../../config/api";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    clinicCode: "",
  });

  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isInvitation, setIsInvitation] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle invitation flow
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isInvite = urlParams.get('invite') === 'true';
    
    if (isInvite) {
      setIsInvitation(true);
      const inviteEmail = localStorage.getItem('inviteEmail');
      const inviteCode = localStorage.getItem('inviteCode');
      
      if (inviteEmail && inviteCode) {
        setFormData(prev => ({
          ...prev,
          email: inviteEmail,
          password: inviteCode,
          role: "patient"
        }));
        
        // Clear the stored data
        localStorage.removeItem('inviteEmail');
        localStorage.removeItem('inviteCode');
      }
    }
  }, [location]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);
      if (formData.role === "patient" && res.data.message.includes("Verifikoni")) {
        setVerificationStep(true);
      } else {
        alert(res.data.message || "Regjistrimi u krye me sukses!");
        navigate("/login");
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.message || "Gabim gjatë regjistrimit!"));
    }
  };

  const verifyCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email: formData.email,
        code: verificationCode,
      });
      setVerificationMessage("✅ " + res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setVerificationMessage("❌ " + (err.response?.data?.message || "Gabim në verifikim."));
    }
  };

  const resendCode = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: formData.email,
      });
      setResendMessage("📧 " + res.data.message);
    } catch (err) {
      setResendMessage("❌ " + (err.response?.data?.message || "Gabim në ridërgim."));
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#FAF7F3" }}>
      <div className="card p-4 shadow-lg" style={{ 
        maxWidth: "480px", 
        width: "100%",
        background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
        border: "1px solid rgba(220, 197, 178, 0.3)",
        borderRadius: "20px",
        boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)"
      }}>
        <h2 className="text-center mb-4" style={{ color: "#D9A299" }}>
          {isInvitation ? "📧 Kompleto Regjistrimin" : "Regjistrohu në MedPal"}
        </h2>
        
        {isInvitation && (
          <div className="alert alert-info mb-4" style={{
            background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
            border: "1px solid rgba(220, 197, 178, 0.3)",
            borderRadius: "12px",
            color: "#2c3e50"
          }}>
            <strong>🎉 Ju jeni ftuar nga një klinikë!</strong><br/>
            Emaili dhe fjalëkalimi janë vendosur automatikisht. Thjesht plotësoni emrin tuaj.
          </div>
        )}

        {!verificationStep ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input name="name" className="form-control form-control-lg" placeholder="Emri i plotë" autoComplete="off"  onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <input 
                name="email" 
                type="email" 
                className="form-control form-control-lg" 
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange} 
                autoComplete="off"
                required 
                readOnly={isInvitation}
                style={isInvitation ? { backgroundColor: "#f8f9fa", color: "#6c757d" } : {}}
              />
              {isInvitation && <small className="text-muted">Emaili është vendosur nga klinika</small>}
            </div>
            <div className="mb-3">
              <input 
                name="password" 
                type="password" 
                className="form-control form-control-lg" 
                placeholder="Fjalëkalimi" 
                value={formData.password}
                onChange={handleChange} 
                required 
                readOnly={isInvitation}
                style={isInvitation ? { backgroundColor: "#f8f9fa", color: "#6c757d" } : {}}
              />
              {isInvitation && <small className="text-muted">Fjalëkalimi është vendosur nga klinika</small>}
            </div>
            {!isInvitation && (
              <div className="mb-3">
                <select name="role" className="form-select form-select-lg" value={formData.role} onChange={handleChange}>
                  <option value="patient">Pacient</option>
                  <option value="clinic">Klinikë</option>
                </select>
              </div>
            )}

            {formData.role === "clinic" && (
              <div className="mb-3">
                <input name="clinicCode" className="form-control form-control-lg" placeholder="Kodi i Klinikës" value={formData.clinicCode} onChange={handleChange} required />
              </div>
            )}

            <button type="submit" className="btn btn-lg w-100" style={{
              background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
              border: "none",
              color: "white",
              borderRadius: "10px",
              boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
            }}>Regjistrohu</button>
          </form>
        ) : (
          <div>
            <h4 className="mb-3 text-center" style={{ color: "#D9A299" }}>Verifiko Emailin</h4>
            <form onSubmit={verifyCode}>
              <div className="mb-3">
                <input type="text" className="form-control form-control-lg" placeholder="Kodi i verifikimit" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-lg w-100 mb-2" style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                border: "none",
                color: "white",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
              }}>Verifiko</button>
            </form>
            <button className="btn btn-link" onClick={resendCode}>📩 Ridërgo Kodin</button>
            <p>{verificationMessage}</p>
            <p>{resendMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
