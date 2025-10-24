import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function PatientReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/reports/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e raporteve:", err);
      }
    };

    fetchReports();
  }, []);

  const handleDownload = async (reportId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/reports/${reportId}/pdf`, {
        responseType: `blob",
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
      console.error("❌ Gabim gjatë shkarkimit:", err);
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
                  📋 Raportet e Mia
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Shikoni dhe shkarkoni raportet mjekësore
                </p>
              </div>
              <div className="card-body p-5">

                {reports.length === 0 ? (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    padding: "2rem"
                  }}>📭 Nuk ka raporte ende.</div>
                ) : (
                  <div className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {reports.map((r) => (
                      <div key={r._id} className="list-group-item mb-3" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        color: "#2c3e50",
                        padding: "1.5rem"
                      }}>
                        <div className="d-flex flex-column">
                          <div className="mb-3">
                            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                              👨‍⚕️ <strong style={{ color: "#D9A299" }}>{r.doctorId?.name}</strong>
                            </p>
                            <p style={{ fontSize: "1rem", marginBottom: "0" }}>
                              📅 {r.appointmentId?.date} ora {r.appointmentId?.time}
                            </p>
                          </div>
                          <div className="text-center">
                            <button
                              className="btn btn-lg"
                              onClick={() => handleDownload(r._id)}
                              style={{
                                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                border: "none",
                                color: "white",
                                borderRadius: "12px",
                                boxShadow: "0 6px 20px rgba(217, 162, 153, 0.4)",
                                padding: "0.75rem 2rem",
                                fontSize: "1rem",
                                fontWeight: "bold",
                                transition: "all 0.3s ease",
                                width: "100%",
                                maxWidth: "250px"
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 8px 25px rgba(217, 162, 153, 0.5)";
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 6px 20px rgba(217, 162, 153, 0.4)";
                              }}
                            >
                              ⬇️ Shkarko PDF
                            </button>
                          </div>
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
      <PatientHomeButton />
    </div>
  );
}
