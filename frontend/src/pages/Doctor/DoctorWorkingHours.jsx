import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorHomeButton from "../../components/DoctorHomeButton";
import API_URL from "../../config/api";

export default function DoctorWorkingHours() {
  const [workingHours, setWorkingHours] = useState({
    monday: { start: '', end: '' },
    tuesday: { start: '', end: '' },
    wednesday: { start: '', end: '' },
    thursday: { start: '', end: '' },
    friday: { start: '', end: '' },
    saturday: { start: '', end: '' },
    sunday: { start: '' , end: '' }
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/working-hours/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.workingHours) {
          setWorkingHours(response.data.workingHours);
        }
      } catch (error) {
        console.warn("No existing working hours found");
      }
    };

    fetchWorkingHours();
  }, [token]);

  const handleTimeChange = (day, type, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const toggleDay = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: prev[day].start || prev[day].end ? { start: '', end: '' } : { start: '09:00', end: '17:00' }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/working-hours`,
        { workingHours },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Orari u ruajt me sukses!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Gabim gjatë ruajtjes së orarit.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const weekdays = {
    monday: "E Hënë",
    tuesday: "E Martë", 
    wednesday: "E Mërkurë",
    thursday: "E Enjte",
    friday: "E Premte",
    saturday: "E Shtunë",
    sunday: "E Diel"
  };

  return (
    <div className="min-vh-100" style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem 0"
    }}>
      <DoctorHomeButton />
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-white mb-2" style={{ fontWeight: "600" }}>
            🕐 Menaxho Orarin e Punës
          </h2>
          <p className="text-white-50 mb-4">
            Vendosni orarin tuaj të punës për secilin ditë të javës
          </p>
        </div>

        {/* Main Card */}
        <div className="card shadow-lg" style={{
          background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
          border: "1px solid rgba(220, 197, 178, 0.3)",
          borderRadius: "20px"
        }}>
          <div className="card-body p-4">
            
            {message && (
              <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`} style={{
                background: message.includes('✅') ? 
                  "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))" :
                  "linear-gradient(145deg, #FFF3CD, #FFEAA7)",
                border: `1px solid ${message.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.3)'}`,
                borderRadius: "10px"
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {Object.entries(weekdays).map(([dayKey, dayName]) => {
                  const isActive = workingHours[dayKey].start && workingHours[dayKey].end;
                  
                  return (
                    <div key={dayKey} className="col-12">
                      <div className="card" style={{
                        background: isActive ? 
                          "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))" :
                          "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.8))",
                        border: `1px solid ${isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(220, 197, 178, 0.3)'}`,
                        borderRadius: "12px",
                        transition: "all 0.3s ease"
                      }}>
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`day-${dayKey}`}
                                  checked={isActive}
                                  onChange={() => toggleDay(dayKey)}
                                  style={{
                                    backgroundColor: isActive ? "#D9A299" : "",
                                    borderColor: isActive ? "#D9A299" : ""
                                  }}
                                />
                                <label className="form-check-label fw-bold" htmlFor={`day-${dayKey}`} style={{
                                  color: "#2c3e50",
                                  fontSize: "0.95rem"
                                }}>
                                  📅 {dayName}
                                </label>
                              </div>
                            </div>
                            
                            {isActive && (
                              <div className="d-flex align-items-center gap-2">
                                <div>
                                  <label className="form-label mb-1" style={{ fontSize: "0.75rem", color: "#666" }}>
                                    Fillimi
                                  </label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    value={workingHours[dayKey].start}
                                    onChange={(e) => handleTimeChange(dayKey, 'start', e.target.value)}
                                    style={{
                                      width: "110px",
                                      fontSize: "0.8rem",
                                      border: "1px solid rgba(220, 197, 178, 0.5)"
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="form-label mb-1" style={{ fontSize: "0.75rem", color: "#666" }}>
                                    Mbarimi
                                  </label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    value={workingHours[dayKey].end}
                                    onChange={(e) => handleTimeChange(dayKey, 'end', e.target.value)}
                                    style={{
                                      width: "110px",
                                      fontSize: "0.8rem",
                                      border: "1px solid rgba(220, 197, 178, 0.5)"
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 d-flex gap-3 justify-content-center">
                <button 
                  type="button" 
                  onClick={() => window.history.back()}
                  className="btn btn-outline-secondary"
                  style={{
                    borderRadius: "10px",
                    padding: "0.75rem 2rem",
                    fontSize: "0.9rem"
                  }}
                >
                  ← Kthehu
                </button>
                <button 
                  type="submit" 
                  className="btn btn-lg"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                    border: "none",
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                    padding: "0.75rem 2rem",
                    fontSize: "0.9rem"
                  }}
                >
                  {loading ? "🔄 Duke ruajtur..." : "💾 Ruaj Orarin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
