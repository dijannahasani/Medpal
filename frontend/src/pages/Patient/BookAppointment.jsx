import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import MobileNavbar from "../../components/MobileNavbar";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function BookAppointment() {
  const [form, setForm] = useState({
    doctorId: "",
    serviceId: "",
    date: "",
    time: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef(null);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef(null);
  const [services, setServices] = useState([]);
  const [workingHours, setWorkingHours] = useState(null);
  const [takenTimes, setTakenTimes] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingServices, setLoadingServices] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/doctors/public`);
        setDoctors(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e mjekëve:", err);
      }
    };
    fetchDoctors();
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleOutside = (e) => {
      if (doctorDropdownRef.current && !doctorDropdownRef.current.contains(e.target)) {
        setDoctorDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target)) {
        setTimeDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setDoctorDropdownOpen(false);
        setTimeDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const fetchServicesAndHours = async (doctorId) => {
    setLoadingServices(true);
    try {
      const [servicesRes, hoursRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctors/${doctorId}/services`), // Vetëm shërbimet e doktorit
        axios.get(`${API_URL}/api/working-hours/${doctorId}`),
      ]);
      setServices(servicesRes.data);
      setWorkingHours(hoursRes.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e shërbimeve ose orarit:", err);
      setServices([]);
      setWorkingHours(null);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchTakenTimes = async (doctorId, date) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/appointments/taken?doctorId=${doctorId}&date=${date}`
      );
      setTakenTimes(res.data);
    } catch (err) {
      console.error("❌ Gabim në kontrollin e orëve të zëna:", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "doctorId") {
      await fetchServicesAndHours(value);
      setForm((prev) => ({ ...prev, serviceId: "", date: "", time: "" }));
    }

    if (name === "date" && form.doctorId) {
      await fetchTakenTimes(form.doctorId, value);
      setForm((prev) => ({ ...prev, time: "" }));
    }
  };

  const currentDaySchedule = () => {
    if (!form.date || !workingHours) return null;
    // Compute weekday using UTC to avoid off-by-one issues caused by timezone shifts
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const utcDate = new Date(form.date + "T00:00:00Z");
    const weekday = days[utcDate.getUTCDay()];
    const schedule = workingHours?.[weekday] || null;
    // Only return a schedule if both start and end are present and non-empty
    if (!schedule || !schedule.start || !schedule.end) return null;
    return schedule;
  };

  const isSelectedDateToday = () => {
    if (!form.date) return false;
    try {
      // Compare in local time to match the user's calendar expectations
      const todayLocalYMD = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      return form.date === todayLocalYMD;
    } catch (err) {
      return false;
    }
  };

  const isTimeAvailable = (time) => !takenTimes.includes(time);

  const timeOptions = () => {
    const schedule = currentDaySchedule();
    if (!schedule || !schedule.start || !schedule.end) return [];

    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);

    const times = [];
    let current = new Date(0, 0, 0, startH, startM);
    const end = new Date(0, 0, 0, endH, endM);

    while (current < end) {
      const hh = current.getHours().toString().padStart(2, "0");
      const mm = current.getMinutes().toString().padStart(2, "0");
      const time = `${hh}:${mm}`;
      if (isTimeAvailable(time)) times.push(time);
      current.setMinutes(current.getMinutes() + 30);
    }

    // If the selected date is today, filter out times that are earlier than now
    try {
      const selectedDate = new Date(form.date);
      const today = new Date();
      const selectedYMD = selectedDate.toISOString().split('T')[0];
      const todayYMD = today.toISOString().split('T')[0];
      if (selectedYMD === todayYMD) {
        const nowH = today.getHours();
        const nowM = today.getMinutes();
        const nowTotal = nowH * 60 + nowM;
        const filtered = times.filter(t => {
          const [h, m] = t.split(":" ).map(Number);
          return (h * 60 + m) > nowTotal; // only future times
        });
        return filtered;
      }
    } catch (err) {
      // if parsing fails, just return the computed times
      console.error(err);
    }

    return times;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setSuccessMessage("");

    // ⛔ Kontroll nëse mjeku nuk punon atë ditë
    if (!currentDaySchedule()) {
      setSuccessMessage("❌ Mjeku nuk punon këtë ditë. Ju lutemi zgjidhni një ditë tjetër.");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/appointments`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("✅ Termini u regjistrua me sukses!");
      setTimeout(() => {
        navigate("/patient");
      }, 1500);
    } catch (err) {
      console.error("❌ Gabim në rezervimin e termin:", err);
      console.error("❌ Response data:", err.response?.data);
      console.error("❌ Status:", err.response?.status);
      
      if (err.response?.status === 409) {
        setSuccessMessage("❌ Ky orar është i zënë për këtë mjek.");
      } else if (err.response?.data?.message) {
        setSuccessMessage("❌ " + err.response.data.message);
      } else {
        setSuccessMessage("❌ Gabim gjatë rezervimit.");
      }
    }
  };

  return (
    <div className="container-fluid" style={{
      backgroundColor: "#FAF7F3",
      minHeight: "100vh",
      padding: "1rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <div className="card shadow-lg" style={{
              background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
              border: "1px solid rgba(220, 197, 178, 0.3)",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(217, 162, 153, 0.3)",
              overflow: "hidden"
            }}>
              <div className="card-header text-center py-3" style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                color: "white",
                border: "none"
              }}>
                <h2 className="card-title mb-0" style={{ fontSize: "1.75rem", fontWeight: "bold", color: "white" }}>
                  📅 Rezervo Terminin
                </h2>
                <p className="mt-2 mb-0 small d-none d-md-block" style={{ opacity: "0.9", color: "white" }}>
                  Zgjidhni mjekun dhe orarin që ju përshtatet
                </p>
              </div>
              <div className="card-body p-3 p-md-4">

                {successMessage && (
                  <div
                    className="alert mb-3"
                    role="alert"
                    style={{
                      background: successMessage.startsWith("✅") 
                        ? "linear-gradient(145deg, #F0E4D3, #DCC5B2)" 
                        : "linear-gradient(145deg, #DCC5B2, #D9A299)",
                      border: "1px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "8px",
                      color: "#2c3e50",
                      fontSize: "0.95rem",
                      fontWeight: "500"
                    }}
                  >
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="d-grid gap-3">
                  <div className="form-group" style={{ position: 'relative' }} ref={doctorDropdownRef}>
                    <label className="form-label fw-bold mb-2" style={{ color: "#D9A299", fontSize: "1rem" }}>
                      👨‍⚕️ Zgjedh Mjekun
                    </label>
                    <div
                      role="button"
                      tabIndex={0}
                      aria-haspopup="listbox"
                      aria-expanded={doctorDropdownOpen}
                      onClick={() => setDoctorDropdownOpen((s) => !s)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDoctorDropdownOpen((s) => !s); }}
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontSize: "16px",
                        minHeight: "48px",
                        background: 'white',
                        width: '100%',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {form.doctorId ? (doctors.find(d => d._id === form.doctorId)?.name || 'Zgjedh Mjekun') : 'Zgjedh Mjekun'}
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
                          marginTop: '6px',
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
                          aria-selected={!form.doctorId}
                          onClick={() => { setForm((p) => ({ ...p, doctorId: '' })); setDoctorDropdownOpen(false); }}
                          style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                        >
                          Zgjedh Mjekun
                        </li>
                        {doctors.map((d) => (
                          <li
                            key={d._id}
                            role="option"
                            aria-selected={form.doctorId === d._id}
                            onClick={async () => { setForm((p) => ({ ...p, doctorId: d._id })); setDoctorDropdownOpen(false); await fetchServicesAndHours(d._id); }}
                            style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                          >
                            {d.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label fw-bold mb-2" style={{ color: "#D9A299", fontSize: "1rem" }}>
                      🏥 Zgjedh Shërbimin
                    </label>
                    <select
                      name="serviceId"
                      value={form.serviceId}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={!services.length}
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontSize: "16px",
                        minHeight: "48px"
                      }}
                    >
                      <option value="">Zgjedh Shërbimin</option>
                      {services.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} – {s.price}€
                        </option>
                      ))}
                    </select>
                  </div>

                  {!loadingServices && services.length === 0 && form.doctorId && (
                    <div className="alert alert-warning" style={{
                      background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                      border: "1px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "8px",
                      color: "#2c3e50",
                      fontSize: "0.9rem"
                    }}>
                      ⚠️ Ky mjek nuk ka shërbime të disponueshme.
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label fw-bold mb-2" style={{ color: "#D9A299", fontSize: "1rem" }}>
                      📅 Zgjedh Datën
                    </label>
                    <input
                      name="date"
                      type="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleChange}
                      required
                      disabled={!form.doctorId}
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "8px",
                        padding: "0.75rem",
                        fontSize: "16px",
                        minHeight: "48px"
                      }}
                    />
                  </div>

                  {form.date && (
                    currentDaySchedule() ? (
                      <div className="alert alert-info" style={{
                        background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                        border: "1px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        color: "#2c3e50"
                      }}>
                        🕒 Orari për këtë ditë: {currentDaySchedule().start} - {currentDaySchedule().end}
                      </div>
                    ) : (
                      <div className="alert alert-danger" style={{
                        background: "linear-gradient(145deg, #DCC5B2, #D9A299)",
                        border: "1px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        color: "white"
                      }}>
                        ❌ Mjeku nuk punon këtë ditë.
                      </div>
                    )
                  )}

                  <div className="form-group">
                    <label className="form-label fw-bold mb-2" style={{ color: "#D9A299", fontSize: "1.1rem" }}>
                      🕒 Zgjedh Orën
                    </label>
                    {/* If selected date is today and no times remain, show message */}
                    {form.date && currentDaySchedule() && isSelectedDateToday() && timeOptions().length === 0 ? (
                      <div className="alert alert-warning" style={{
                        background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                        border: "1px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "8px",
                        color: "#2c3e50",
                        fontSize: "0.95rem"
                      }}>
                        ⚠️ Oraret për sot kanë përfunduar. Ju lutemi zgjidhni një datë tjetër.
                      </div>
                    ) : (
                      <div ref={timeDropdownRef} style={{ position: 'relative' }}>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-haspopup="listbox"
                          aria-expanded={timeDropdownOpen}
                          onClick={() => setTimeDropdownOpen(s => !s)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setTimeDropdownOpen(s => !s); }}
                          style={{
                            border: "2px solid rgba(220, 197, 178, 0.3)",
                            borderRadius: "12px",
                            padding: "0.75rem 1rem",
                            fontSize: "1.1rem",
                            minHeight: '48px',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          {form.time || 'Zgjedh Orën'}
                        </div>

                        {timeDropdownOpen && (
                          <ul
                            role="listbox"
                            tabIndex={-1}
                            style={{
                              position: 'absolute',
                              zIndex: 2000,
                              left: 0,
                              right: 0,
                              marginTop: '6px',
                              maxHeight: '240px',
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
                              aria-selected={!form.time}
                              onClick={() => { setForm(p => ({ ...p, time: '' })); setTimeDropdownOpen(false); }}
                              style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                            >
                              Zgjedh Orën
                            </li>
                            {timeOptions().map((t) => (
                              <li
                                key={t}
                                role="option"
                                aria-selected={form.time === t}
                                onClick={() => { setForm(p => ({ ...p, time: t })); setTimeDropdownOpen(false); }}
                                style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                              >
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 mt-4"
                    disabled={!form.time}
                    style={{
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
                      e.target.style.boxShadow = "0 8px 20px rgba(217, 162, 153, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 4px 15px rgba(217, 162, 153, 0.3)";
                    }}
                  >
                    ✅ Rezervo Terminin
                  </button>
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
