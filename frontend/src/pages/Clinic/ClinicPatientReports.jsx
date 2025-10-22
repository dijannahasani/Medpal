import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ClinicHomeButton from "../../components/ClinicHomeButton";

export default function ClinicPatientReports() {
  const [raportet, setRaportet] = useState([]);
  const [mjeket, setMjeket] = useState([]);
  const [filtrat, setFiltrat] = useState({
    from: "",
    to: "",
    doctorId: "",
  });
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const doctorDropdownRef = useRef(null);

  const merrRaportet = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = new URLSearchParams();
      if (filtrat.from) query.append("from", filtrat.from);
      if (filtrat.to) query.append("to", filtrat.to);
      if (filtrat.doctorId) query.append("doctorId", filtrat.doctorId);

      const res = await axios.get(`http://localhost:5000/api/reports/clinic?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRaportet(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e raporteve të klinikës:", err);
    }
  };

  const merrMjeket = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/users/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMjeket(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e mjekëve:", err);
    }
  };

  useEffect(() => {
    merrMjeket();
    merrRaportet();
    // close dropdown on outside click
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

  const ndryshoFiltrin = (e) => {
    setFiltrat({ ...filtrat, [e.target.name]: e.target.value });
  };

  const filtroRaportet = (e) => {
    e.preventDefault();
    merrRaportet();
  };

  const shkarkoPDF = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/reports/${reportId}/pdf`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `raporti-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Gabim gjatë shkarkimit të raportit të klinikës:", err);
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
          <div className="col-lg-11 col-xl-10">
            <div className="card shadow-lg" style={{
              background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
              border: "1px solid rgba(220, 197, 178, 0.3)",
              borderRadius: "25px",
              boxShadow: "0 20px 40px rgba(217, 162, 153, 0.3)",
              overflow: "visible" // allow dropdowns/popovers to overflow the card
            }}>
              <div className="card-header text-center py-4" style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                color: "white",
                border: "none"
              }}>
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color:"white" }}>
                  📑 Raportet e Vizitave të Pacientëve
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Shikoni dhe menaxhoni raportet e vizitave të pacientëve
                </p>
              </div>
              <div className="card-body p-5">

                {/* Formë për filtrat */}
                <form className="row g-4 mb-5" onSubmit={filtroRaportet} style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2.5rem",
                  borderRadius: "15px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <div className="col-md-3">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>📅 Nga data</label>
                    <input
                      type="date"
                      name="from"
                      className="form-control form-control-lg"
                      value={filtrat.from}
                      onChange={ndryshoFiltrin}
                      placeholder=""
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.6rem 0.8rem",
                        background: 'white',
                        color: '#2c3e50',
                        textAlign: "center"
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>📅 Deri më</label>
                    <input
                      type="date"
                      name="to"
                      className="form-control form-control-lg"
                      value={filtrat.to}
                      onChange={ndryshoFiltrin}
                      placeholder=""
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.6rem 0.8rem",
                        background: 'white',
                        color: '#2c3e50',
                        textAlign: "center"
                      }}
                    />
                  </div>
                  <div className="col-md-3" ref={doctorDropdownRef} style={{ position: 'relative' }}>
                    <label className="form-label fw-bold" style={{ color: "#D9A299", fontSize: "1.1rem" }}>👨‍⚕️ Mjeku</label>
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
                        padding: "0.6rem 0.8rem",
                        color: "#2c3e50",
                        background: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {filtrat.doctorId ? (mjeket.find(m => m._id === filtrat.doctorId)?.name || 'Zgjidh') : 'Të gjithë mjekët'}
                    </div>

                    {doctorDropdownOpen && (
                      <ul role="listbox" tabIndex={-1} style={{ position: 'absolute', left: 0, right: 0, marginTop: 8, maxHeight: 240, overflowY: 'auto', background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: 0, zIndex: 3000 }}>
                        <li role="option" aria-selected={!filtrat.doctorId} onClick={() => { setFiltrat({ ...filtrat, doctorId: '' }); setDoctorDropdownOpen(false); }} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>Të gjithë mjekët</li>
                        {mjeket.map(mjek => (
                          <li key={mjek._id} role="option" aria-selected={filtrat.doctorId === mjek._id} onClick={() => { setFiltrat({ ...filtrat, doctorId: mjek._id }); setDoctorDropdownOpen(false); }} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}>{mjek.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button type="submit" className="btn btn-lg w-100" style={{
                      background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                      border: "none",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                    }}>
                      🔍 Kërko
                    </button>
                  </div>
                </form>

                {/* Lista e raporteve */}
                {raportet.length === 0 ? (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    padding: "2rem"
                  }}>
                    📭 Nuk u gjetën raporte për këto kritere.
                  </div>
                ) : (
                  <div className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {raportet.map((r) => (
                      <div key={r._id} className="list-group-item list-group-item-action mb-3" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        padding: "1.5rem",
                        fontSize: "1.1rem"
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="mb-1"><strong style={{ color: "#D9A299" }}>👨‍⚕️ Mjeku:</strong> {r.doctorId?.name}</p>
                            <p className="mb-1"><strong style={{ color: "#D9A299" }}>🧑‍💼 Pacienti:</strong> {r.patientId?.name}</p>
                            <p className="mb-1"><strong style={{ color: "#D9A299" }}>📅 Data:</strong> {r.appointmentId?.date} &nbsp;&nbsp;
                              <strong style={{ color: "#D9A299" }}>🕒 Ora:</strong> {r.appointmentId?.time}
                            </p>
                          </div>
                          <button
                            onClick={() => shkarkoPDF(r._id)}
                            className="btn btn-lg"
                            style={{
                              background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                              border: "none",
                              color: "white",
                              borderRadius: "12px",
                              boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                            }}
                          >
                            ⬇️ Shkarko PDF
                          </button>
                        </div>
                      </div>
                    ))}
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
}
