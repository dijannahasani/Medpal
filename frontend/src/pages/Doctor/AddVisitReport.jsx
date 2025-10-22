// src/pages/Doctor/AddVisitReport.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button, Alert, Card, Spinner } from "react-bootstrap";
import DoctorHomeButton from "../../components/DoctorHomeButton";

export default function AddVisitReport() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    appointmentId: "",
    diagnosis: "",
    recommendation: "",
    temperature: "",
    bloodPressure: "",
    symptoms: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/appointments/doctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data.filter(a => a.status === "approved"));
      } catch (err) {
        console.error("❌ Gabim në marrjen e termineve:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/reports", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ text: "✅ Raporti u ruajt me sukses!", type: "success" });
      setForm({
        appointmentId: "",
        diagnosis: "",
        recommendation: "",
        temperature: "",
        bloodPressure: "",
        symptoms: "",
      });
    } catch (err) {
      console.error("❌ Gabim gjatë ruajtjes së raportit:", err);
      setMessage({ text: "❌ Dështoi ruajtja e raportit.", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

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
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
                  🧾 Krijo Raport Vizite
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Krijoni raporte të detajuara për vizitat e pacientëve
                </p>
              </div>
              <div className="card-body p-5">

                {message.text && (
                  <div className="alert mb-4" style={{
                    background: message.type === "success" 
                      ? "linear-gradient(145deg, #F0E4D3, #DCC5B2)" 
                      : "linear-gradient(145deg, #DCC5B2, #D9A299)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem"
                  }}>
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{fontSize: "1.1rem" }}>📋 Zgjedh Terminin</label>
                    <select
                      name="appointmentId"
                      className="form-select form-select-lg"
                      value={form.appointmentId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Zgjidh</option>
                      {appointments.map(a => {
                        // Prefer showing the raw stored values so frontend matches backend exactly.
                        const rawDate = a.date || "";
                        const rawTime = a.time || "";
                        let display = `${a.patientId?.name || 'Pacient'}`;
                        if (rawDate) display += ` – ${rawDate}`;
                        if (rawTime) display += ` ${rawTime}`;

                        // Fallback: if both date and time are missing, try parsing an ISO date
                        if (!rawDate && a.date) {
                          try {
                            const dt = new Date(a.date);
                            if (!isNaN(dt.getTime())) {
                              display += ` – ${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                            }
                          } catch (_) {}
                        }

                        return (
                          <option key={a._id} value={a._id}>{display}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Diagnoza</label>
                    <textarea
                      name="diagnosis"
                      className="form-control"
                      value={form.diagnosis}
                      onChange={handleChange}
                      placeholder="Përshkruaj diagnozën"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Rekomandime</label>
                    <textarea
                      name="recommendation"
                      className="form-control"
                      value={form.recommendation}
                      onChange={handleChange}
                      placeholder="Rekomandimet për pacientin"
                      rows={2}
                    />
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Temperatura (°C)</label>
                      <input
                        type="number"
                        name="temperature"
                        className="form-control form-control-lg"
                        value={form.temperature}
                        onChange={handleChange}
                        placeholder="p.sh. 37.5"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Tensioni</label>
                      <input
                        type="text"
                        name="bloodPressure"
                        className="form-control form-control-lg"
                        value={form.bloodPressure}
                        onChange={handleChange}
                        placeholder="p.sh. 120/80"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>Simptomat</label>
                    <input
                      type="text"
                      name="symptoms"
                      className="form-control form-control-lg"
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="Listo simptomat"
                      autoComplete="off"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn btn-lg w-100" style={{
                    borderRadius: "15px",
                    padding: "1rem 2rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    transition: "all 0.3s ease"
                  }}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Po ruhet...
                      </>
                    ) : (
                      "💾 Ruaj Raportin"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
