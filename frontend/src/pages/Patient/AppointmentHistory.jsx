import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import MobileNavbar from "../../components/MobileNavbar";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`${API_URL}/api/appointments/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Gabim:", err);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavbar
        userRole="patient"
        userName="Pacient"
        dashboardLinks={[
          { to: "/patient/book-appointment", icon: "📅", title: "Rezervo Terminin" },
          { to: "/patient/history", icon: "📖", title: "Historiku" },
          { to: "/patient/profile", icon: "👤", title: "Profili Im" }
        ]}
      />

      {/* Main Content */}
      <div className="container-fluid" style={{ 
        backgroundColor: "#FAF7F3", 
        minHeight: "calc(100vh - 64px)", 
        padding: "1rem 0",
        background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
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
                    📖 Historiku i Termineve
                  </h2>
                  <p className="mt-2 mb-0 small d-none d-md-block" style={{ opacity: "0.9", color: "white" }}>
                    Shikoni të gjitha terminet tuaja të kaluara
                  </p>
                </div>
                <div className="card-body p-3 p-md-4">
                  {appointments.length === 0 ? (
                    <div className="alert text-center" style={{
                      background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                      border: "1px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "8px",
                      color: "#2c3e50",
                      fontSize: "1rem",
                      padding: "2rem"
                    }}>
                      Nuk keni termine të regjistruara.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0" style={{
                        background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 15px rgba(217, 162, 153, 0.2)",
                        fontSize: "0.9rem"
                      }}>
                        <thead style={{
                          background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                          color: "white"
                        }}>
                          <tr>
                            <th scope="col" style={{ padding: "0.75rem 0.5rem", fontSize: "0.95rem" }}>Mjeku</th>
                            <th scope="col" style={{ padding: "0.75rem 0.5rem", fontSize: "0.95rem" }} className="d-none d-md-table-cell">Shërbimi</th>
                            <th scope="col" style={{ padding: "0.75rem 0.5rem", fontSize: "0.95rem" }}>Data</th>
                            <th scope="col" style={{ padding: "0.75rem 0.5rem", fontSize: "0.95rem" }} className="d-none d-sm-table-cell">Ora</th>
                            <th scope="col" style={{ padding: "0.75rem 0.5rem", fontSize: "0.95rem" }}>Statusi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((a) => (
                            <tr key={a._id} style={{ fontSize: "0.85rem" }}>
                              <td style={{ padding: "0.75rem 0.5rem" }}>
                                <div>
                                  <strong>{a.doctorId?.name || "-"}</strong>
                                  <div className="d-md-none small text-muted">
                                    {a.serviceId?.name || "-"}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem" }} className="d-none d-md-table-cell">
                                {a.serviceId?.name || "-"}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem" }}>
                                <div>
                                  {a.date}
                                  <div className="d-sm-none small text-muted">
                                    {a.time}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem" }} className="d-none d-sm-table-cell">
                                {a.time}
                              </td>
                              <td style={{ padding: "0.75rem 0.5rem" }}>
                                <span
                                  className="badge"
                                  style={{
                                    background: a.status === "approved"
                                      ? "linear-gradient(135deg, #D9A299, #DCC5B2)"
                                      : a.status === "pending"
                                      ? "linear-gradient(135deg, #F0E4D3, #DCC5B2)"
                                      : "linear-gradient(135deg, #DCC5B2, #D9A299)",
                                    color: "white",
                                    borderRadius: "6px",
                                    padding: "0.3rem 0.6rem",
                                    fontSize: "0.75rem"
                                  }}
                                >
                                  {a.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PatientHomeButton />
    </>
  );
}
