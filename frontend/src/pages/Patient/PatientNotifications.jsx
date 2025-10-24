import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import PatientHomeButton from "../../components/PatientHomeButton";
import API_URL from "../../config/api";

export default function PatientNotifications() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/appointments/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);

        // Marko njoftimet si të lexuara
        await axios.put(`${API_URL}/api/appointments/mark-seen`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("❌ Gabim në marrjen e njoftimeve:", err.message);
      }
    };

    fetchAppointments();
  }, []);

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
                  🔔 Njoftimet e mia
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Shikoni të gjitha njoftimet për terminet tuaja
                </p>
              </div>
              <div className="card-body p-5">
                {appointments.length === 0 ? (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    padding: "2rem"
                  }}>S'keni ende ndonjë njoftim për termine.</div>
                ) : (
                  <ul className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {appointments.map((a, index) => (
                      <li key={index} className="list-group-item" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        color: "#2c3e50",
                        padding: "1.5rem",
                        fontSize: "1.1rem"
                      }}>
                        <strong style={{ color: "#D9A299" }}>{a.status.toUpperCase()}</strong> – Termini te <b>{a.doctorId?.name}</b>, më <u>{a.date}</u> ora {a.time}
                      </li>
                    ))}
                  </ul>
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
