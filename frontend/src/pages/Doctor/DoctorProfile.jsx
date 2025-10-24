import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorHomeButton from "../../components/DoctorHomeButton";
import API_URL from "../../config/api";

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [workingHours, setWorkingHours] = useState(null);
  const [showScheduleDetails, setShowScheduleDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Nuk jeni i loguar! Ju lutem identifikohuni përsëri.");
          setLoading(false);
          return;
        }

        // Merr të dhënat e mjekut
        const doctorResponse = await axios.get(
          `${API_URL}/api/auth/me`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
          }
        );
        
        setDoctor(doctorResponse.data);

        // Merr orarin e punës
        try {
          const hoursResponse = await axios.get(
            `${API_URL}/api/working-hours/me`,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              },
              timeout: 10000
            }
          );
          console.log("🔍 Working hours data received:", hoursResponse.data);
          setWorkingHours(hoursResponse.data.workingHours);
        } catch (hoursError) {
          console.warn("⚠️ Nuk u mor orari i punës", hoursError);
          setWorkingHours(null);
        }
      } catch (err) {
        console.error("❌ Gabim kryesor:", err);
        handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleError = (err) => {
    if (err.response?.status === 401) {
      setError("Session ka skaduar. Ju lutem identifikohuni përsëri.");
      localStorage.removeItem("token");
    } else if (err.response?.status === 404) {
      setError("Endpoint nuk u gjet. Kontaktoni administratorin.");
    } else if (err.code === 'NETWORK_ERROR' || err.code === 'ECONNREFUSED') {
      setError("Serveri nuk është i arritshëm. Kontrolloni nëse serveri është duke punuar.");
    } else {
      setError(err.response?.data?.message || "Gabim në marrjen e të dhënave nga serveri");
    }
  };

  // Funksionet për butonat
  const handleEditProfile = () => {
    console.log("✏️ Edit Profile button clicked");
    setEditForm({
      name: doctor?.name || '',
      email: doctor?.email || '',
      phone: doctor?.phone || '',
      specialization: doctor?.specialization || '',
      bio: doctor?.bio || ''
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.put(
        `${API_URL}/api/auth/update-profile`,
        editForm,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Përditëso të dhënat lokale me përgjigjen nga serveri
      setDoctor(prev => ({
        ...prev,
        ...response.data
      }));

      // Update localStorage with new user data
      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      console.log("✅ Profili u përditësua me sukses!", response.data);
      alert("✅ Profili u përditësua me sukses!");
      setShowEditModal(false);
      
    } catch (error) {
      console.error("❌ Gabim në ruajtjen e profilit:", error);
      alert("❌ Gabim në ruajtjen e të dhënave: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleManageSchedule = () => {
    // Navigimi tek faqja e menaxhimit të orarit
    window.location.href = '/doctor/working-hours';
  };

  const handleViewAppointments = () => {
    // Navigimi tek faqja e takimeve
    window.location.href = '/doctor/appointments-manager';
  };

  // Funksion për të formatuar kohën
  const formatTime = (timeString) => {
    if (!timeString) return "—";
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  // Funksion për të formatuar ditët
  const formatDays = (workingHours) => {
    if (!workingHours) return [];
    
    const dayNames = {
      'monday': 'E Hënë',
      'tuesday': 'E Martë', 
      'wednesday': 'E Mërkurë',
      'thursday': 'E Enjte',
      'friday': 'E Premte',
      'saturday': 'E Shtunë',
      'sunday': 'E Dielë'
    };

    const activeDays = [];
    Object.keys(workingHours).forEach(day => {
      if (workingHours[day] && workingHours[day].start && workingHours[day].end) {
        activeDays.push({
          day: dayNames[day] || day,
          start: workingHours[day].start,
          end: workingHours[day].end
        });
      }
    });
    
    return activeDays;
  };

  // Funksion për të kontrolluar nëse ka orar aktiv
  const hasActiveSchedule = (workingHours) => {
    if (!workingHours) return false;
    return Object.values(workingHours).some(day => day && day.start && day.end);
  };  if (loading) {
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
                <div className="card-body text-center p-5">
                  <div className="spinner-border mb-3" role="status" style={{ color: "#D9A299", width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Duke u ngarkuar...</span>
                  </div>
                  <p style={{ color: "#D9A299", fontSize: "1.2rem" }}>⏳ Duke ngarkuar profilin...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
                <div className="card-body p-5">
                  <div className="alert" role="alert" style={{
                    background: "linear-gradient(145deg, #DCC5B2, #D9A299)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "white",
                    fontSize: "1.1rem"
                  }}>
          <h4 className="alert-heading">❌ Gabim</h4>
          <p>{error}</p>
                    <hr style={{ borderColor: "rgba(255, 255, 255, 0.3)" }} />
          <div className="d-flex gap-2 flex-wrap">
                      <button className="btn btn-lg" onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
                      }} style={{
                        background: "rgba(255, 255, 255, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        color: "white",
                        borderRadius: "8px"
            }}>
              🔐 Rilogo
            </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
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
                <div className="card-body p-5">
                  <div className="alert" role="alert" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem"
                  }}>
          <h4 className="alert-heading">⚠️ Nuk u gjetën të dhëna</h4>
          <p>Nuk u gjetën të dhëna për mjekun. Ju lutem kontaktoni administratorin.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ 
      backgroundColor: "#FAF7F3", 
      minHeight: "100vh", 
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <DoctorHomeButton />
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
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold" }}>👨‍⚕️ Profili i Mjekut</h3>
                  <span className="badge" style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    fontSize: "1rem"
                  }}>{doctor.role || "Mjek"}</span>
                </div>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Menaxhoni profilin dhe informacionet tuaja profesionale
                </p>
        </div>
              <div className="card-body p-5">
          {/* Informacioni Bazë */}
                <div className="mb-4" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <h5 className="mb-3" style={{ color: "#D9A299", fontSize: "1.5rem" }}>📋 Informacione Personale</h5>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted">Emri i Plotë</label>
                  <p className="form-control-plaintext border-bottom pb-2">{doctor.name || "—"}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted">Email</label>
                  <p className="form-control-plaintext border-bottom pb-2">{doctor.email || "—"}</p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted">Telefoni</label>
                  <p className="form-control-plaintext border-bottom pb-2">{doctor.phone || "—"}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted">Specializimi</label>
                  <p className="form-control-plaintext border-bottom pb-2">{doctor.specialization || "—"}</p>
                </div>
              </div>
            </div>
            {doctor.bio && (
              <div className="row">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-muted">Bio</label>
                    <p className="form-control-plaintext border-bottom pb-2" style={{ whiteSpace: 'pre-wrap' }}>
                      {doctor.bio}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Orari i Punës */}
                <div className="mt-4" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{ color: "#D9A299", fontSize: "1.5rem" }}>🕐 Orari i Punës</h5>
              
              {hasActiveSchedule(workingHours) && (
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setShowScheduleDetails(!showScheduleDetails)}
                  style={{
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    padding: "0.4rem 0.8rem"
                  }}
                >
                  {showScheduleDetails ? '🔼 Fshih Detajet' : '🔽 Shiko Detajet'}
                </button>
              )}
            </div>
            
            {hasActiveSchedule(workingHours) ? (
              <div>
                {/* Overview Card */}
                <div className="mb-3 rounded" style={{
                  background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(139, 195, 74, 0.1))",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                  padding: '0.6rem 0.9rem',
                  boxSizing: 'border-box',
                  width: '100%',
                  overflow: 'visible'
                }}>
                  <div className="d-flex align-items-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Badge moved to the left inside the box */}
                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                      <span className="badge bg-success" style={{ fontSize: "0.78rem", padding: "0.35rem 0.6rem", display: 'inline-block', marginLeft: 0 }}>
                        🏥 Në Shërbim
                      </span>
                    </div>

                    <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                      <h6 className="mb-1 text-success" style={{ fontSize: "0.95rem", marginBottom: '0.25rem' }}>
                        ✅ Orari Aktiv
                      </h6>
                      <small className="text-muted" style={{ fontSize: "0.8rem", display: 'block', overflowWrap: 'break-word', whiteSpace: 'normal' }}>
                        {formatDays(workingHours).length} ditë pune të konfiguruara
                      </small>
                    </div>
                  </div>
                </div>

                {/* Detailed Schedule - Collapsible */}
                {showScheduleDetails && (
                  <div className="mt-3">
                    <div className="row g-2">
                      {formatDays(workingHours).map((schedule, index) => (
                        <div key={index} className="col-12">
                          <div className="card" style={{
                            background: "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.8))",
                            border: "1px solid rgba(220, 197, 178, 0.3)",
                            borderRadius: "8px"
                          }}>
                            <div className="card-body py-2 px-3">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 fw-bold" style={{ 
                                  color: "#2c3e50", 
                                  fontSize: "0.9rem",
                                  flex: "0 0 auto"
                                }}>
                                  📅 {schedule.day}
                                </h6>
                                <div className="text-end">
                                  <span style={{ 
                                    color: "#D9A299", 
                                    fontSize: "0.85rem",
                                    fontWeight: "bold"
                                  }}>
                                    {schedule.start} - {schedule.end}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Summary at bottom */}
                    <div className="mt-3 p-2 rounded" style={{
                      background: "rgba(76, 175, 80, 0.1)",
                      border: "1px solid rgba(76, 175, 80, 0.2)"
                    }}>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small className="text-success fw-bold" style={{ fontSize: "0.8rem" }}>
                          📊 Total: {formatDays(workingHours).length} ditë aktive
                        </small>
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Orari i vendosur nga {workingHours.setBy === 'clinic' ? 'klinika' : 'ju'}
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
                    <div className="alert" style={{
                      background: "linear-gradient(145deg, #FFF3CD, #FFEAA7)",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      borderRadius: "15px",
                      color: "#856404",
                      fontSize: "1rem"
                    }}>
                <div className="d-flex align-items-start gap-3">
                  <div style={{ fontSize: "2rem" }}>⚠️</div>
                  <div>
                    <strong>Nuk ka orar të punës të definuar</strong>
                    <p className="mb-2 mt-1" style={{ fontSize: "0.9rem" }}>
                      Ju lutem kontaktoni administratorin e klinikës për të vendosur orarin tuaj të punës ose vendoseni vetë nëpërmjet butonit "🗓️ Orari".
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <button 
                        onClick={handleManageSchedule}
                        className="btn btn-sm btn-warning"
                        style={{ fontSize: "0.8rem" }}
                      >
                        🗓️ Vendos Orarin
                      </button>
                      <span className="text-muted" style={{ fontSize: "0.8rem", alignSelf: "center" }}>
                        ose kontaktoni administratorin
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Butona të Veprimit */}
                <div className="mt-4 pt-3" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
            <div className="d-flex gap-2 justify-content-end flex-wrap">
                    <button className="btn btn-lg" onClick={handleViewAppointments} style={{
                      background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                      border: "none",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      fontWeight: "bold"
                    }}>
                📋 Takimet
              </button>
                    <button className="btn btn-lg" onClick={handleManageSchedule} style={{
                      background: "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                      border: "none",
                      color: "#2c3e50",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      fontWeight: "bold"
                    }}>
                🗓️ Orari
              </button>
                    <button className="btn btn-lg" onClick={handleEditProfile} style={{
                      background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                      border: "none",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                      padding: "0.75rem 1.5rem",
                      fontSize: "1rem",
                      fontWeight: "bold"
                    }}>
                ✏️ Edit Profile
              </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✏️ Editoni Profilin</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Emri i Plotë *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      placeholder="Shkruani emrin e plotë"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      placeholder="shkruani email-in"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Telefoni</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      placeholder="+355 00 000 0000"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Specializimi</label>
                    <input
                      type="text"
                      className="form-control"
                      name="specialization"
                      value={editForm.specialization}
                      onChange={handleInputChange}
                      placeholder="Specializimi juaj"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      placeholder="Përshkrimi i shkurtër për veten..."
                      rows="3"
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  ❌ Anulo
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile}
                  disabled={!editForm.name || !editForm.email || saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Duke ruajtur...
                    </>
                  ) : (
                    '💾 Ruaj Ndryshimet'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
