import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

export default function ClinicSetDoctorHours() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef(null);
  const [openTimeDropdown, setOpenTimeDropdown] = useState(null); // key: `${day}-start` or `${day}-end`
  const [workingHours, setWorkingHours] = useState({
    monday: { start: "", end: "" },
    tuesday: { start: "", end: "" },
    wednesday: { start: "", end: "" },
    thursday: { start: "", end: "" },
    friday: { start: "", end: "" },
    saturday: { start: "", end: "" },
    sunday: { start: "", end: "" },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/clinic/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("❌ Gabim në marrjen e mjekëve:", err));
  }, []);

  // Close dropdown on outside click / Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target)) {
        setDoctorDropdownOpen(false);
      }
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setDoctorDropdownOpen(false); };
    document.addEventListener('click', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Close time dropdowns on outside click / Escape
  useEffect(() => {
    const handleOutsideTimes = (e) => {
      // if click is outside any element with data-time-dropdown, close
      const inside = e.target.closest && e.target.closest('[data-time-dropdown]');
      if (!inside) setOpenTimeDropdown(null);
    };
    const handleEscTimes = (e) => { if (e.key === 'Escape') setOpenTimeDropdown(null); };
    document.addEventListener('click', handleOutsideTimes);
    document.addEventListener('keydown', handleEscTimes);
    return () => {
      document.removeEventListener('click', handleOutsideTimes);
      document.removeEventListener('keydown', handleEscTimes);
    };
  }, []);

  // generate 30-minute interval time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        slots.push(`${hh}:${mm}`);
      }
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  const handleChange = (day, field, value) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_URL}/api/working-hours/${selectedDoctor}`,
        { workingHours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Orari u ruajt me sukses!");
    } catch (err) {
      console.error("❌ Gabim në ruajtje:", err);
      alert("❌ Dështoi ruajtja e orarit.");
    }
  };

  const dayLabels = {
    monday: "E Hënë",
    tuesday: "E Martë",
    wednesday: "E Mërkurë",
    thursday: "E Enjte",
    friday: "E Premte",
    saturday: "E Shtunë",
    sunday: "E Diel",
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
                  🕐 Vendos Orarin për Mjekun
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Përcaktoni orarin e punës për mjekët e klinikës
                </p>
              </div>
              <div className="card-body p-5">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4" style={{ position: 'relative' }} ref={doctorDropdownRef}>
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Zgjedh Mjekun</label>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      aria-expanded={doctorDropdownOpen}
                      onClick={() => setDoctorDropdownOpen((s) => !s)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDoctorDropdownOpen((s) => !s); }}
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        background: 'white',
                        color: '#2c3e50',
                        fontSize: '1rem',
                        minHeight: '48px',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedDoctor ? (doctors.find(d => d._id === selectedDoctor)?.name || 'Zgjedh Mjekun') : 'Zgjedh Mjekun'}
                    </div>

                    {doctorDropdownOpen && (
                      <ul
                        role="listbox"
                        tabIndex={-1}
                        style={{
                          position: 'absolute',
                          zIndex: 2000,
                          left: 0,
                          right: 0,
                          marginTop: '8px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          background: 'white',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '8px',
                          boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                          padding: 0,
                          listStyle: 'none'
                        }}
                      >
                        <li
                          role="option"
                          aria-selected={!selectedDoctor}
                          onClick={() => { setSelectedDoctor(''); setDoctorDropdownOpen(false); }}
                          style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                        >
                          Zgjedh Mjekun
                        </li>
                        {doctors.map((doc) => (
                          <li
                            key={doc._id}
                            role="option"
                            aria-selected={selectedDoctor === doc._id}
                            onClick={() => { setSelectedDoctor(doc._id); setDoctorDropdownOpen(false); }}
                            style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                          >
                            {doc.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="mb-4" style={{
                      background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                      padding: "1rem",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(217, 162, 153, 0.08)",
                      border: "1px solid rgba(220, 197, 178, 0.25)"
                    }}>
                      <label className="form-label fw-bold mb-2" style={{ color: "#D9A299", fontSize: "1.05rem" }}>{dayLabels[day]}:</label>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <div style={{ position: 'relative' }} data-time-dropdown>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setOpenTimeDropdown(`${day}-start`)}
                            style={{
                              border: "2px solid rgba(220, 197, 178, 0.3)",
                              borderRadius: "10px",
                              padding: "0.4rem 0.6rem",
                              minWidth: '120px',
                              background: 'white',
                              color: '#2c3e50',
                              cursor: 'pointer'
                            }}
                          >
                            {hours.start || '--:--'}
                          </div>
                          {openTimeDropdown === `${day}-start` && (
                            <ul style={{ position: 'absolute', left: 0, right: 0, marginTop: 6, maxHeight: 200, overflowY: 'auto', background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: 0, zIndex: 3000 }}>
                              {timeSlots.map(ts => (
                                <li key={ts} onClick={() => { handleChange(day, 'start', ts); setOpenTimeDropdown(null); }} style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{ts}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <span className="fw-bold" style={{ color: "#D9A299", fontSize: "1rem" }}>deri</span>
                        <div style={{ position: 'relative' }} data-time-dropdown>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setOpenTimeDropdown(`${day}-end`)}
                            style={{
                              border: "2px solid rgba(220, 197, 178, 0.3)",
                              borderRadius: "10px",
                              padding: "0.4rem 0.6rem",
                              minWidth: '120px',
                              background: 'white',
                              color: '#2c3e50',
                              cursor: 'pointer'
                            }}
                          >
                            {hours.end || '--:--'}
                          </div>
                          {openTimeDropdown === `${day}-end` && (
                            <ul style={{ position: 'absolute', left: 0, right: 0, marginTop: 6, maxHeight: 200, overflowY: 'auto', background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: 0, zIndex: 3000 }}>
                              {timeSlots.map(ts => (
                                <li key={ts} onClick={() => { handleChange(day, 'end', ts); setOpenTimeDropdown(null); }} style={{ padding: '8px 10px', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>{ts}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button className="btn btn-lg w-100" type="submit" disabled={!selectedDoctor} style={{
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
                    if (!e.target.disabled) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 12px 35px rgba(217, 162, 153, 0.5)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 8px 25px rgba(217, 162, 153, 0.4)";
                    }
                  }}>
                    💾 Ruaj Orarin
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
