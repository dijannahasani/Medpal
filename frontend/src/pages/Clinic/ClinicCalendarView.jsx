import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import ClinicHomeButton from "../../components/ClinicHomeButton";

export default function ClinicCalendarView() {
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/appointments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e termineve:", err);
      }
    };
    fetchAppointments();
  }, []);

  const selectedDateStr = date.toISOString().split("T")[0];
  const filteredAppointments = appointments.filter(app => app.date === selectedDateStr);

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const formatted = date.toISOString().split("T")[0];
      const found = appointments.find(a => a.date === formatted);
      const dayNumber = date.getDate();
      // Render our own tile content (day number + optional dot) so we control wrapping
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <div style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', lineHeight: 1 }}>{dayNumber}</div>
          {found && (
            <div
              style={{
                backgroundColor: "#28a745",
                borderRadius: "50%",
                width: "8px",
                height: "8px",
                marginTop: "4px",
              }}
            />
          )}
        </div>
      );
    }
    return null;
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
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color:"white" }}>
                  📅 Kalendar për Klinikën
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Shikoni terminin e klinikës në kalendar
                </p>
              </div>
              <div className="card-body p-5">

                <div className="mb-4" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "1rem",
                  borderRadius: "20px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  {/* Inline overrides placed here so they load immediately before the Calendar element and win over other CSS */}
                  <style>{`
                    /* hide react-calendar's default abbreviations/time elements so our tileContent is used */
                    .clinic-react-calendar .react-calendar__tile abbr,
                    .clinic-react-calendar .react-calendar__tile time,
                    .clinic-react-calendar .react-calendar__month-view__weekdays__weekday abbr {
                      display: none !important;
                      visibility: hidden !important;
                      height: 0 !important;
                      line-height: 0 !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }
                    /* force a strict 7-column grid */
                    .clinic-react-calendar .react-calendar__month-view__weeks {
                      display: grid !important;
                      grid-template-columns: repeat(7, 1fr) !important;
                      gap: 4px !important;
                    }
                    .clinic-react-calendar .react-calendar__month-view__weekdays {
                      display: grid !important;
                      grid-template-columns: repeat(7, 1fr) !important;
                      gap: 4px !important;
                    }
                    .clinic-react-calendar .react-calendar__tile {
                      display: flex !important;
                      align-items: center !important;
                      justify-content: center !important;
                      white-space: nowrap !important;
                      writing-mode: horizontal-tb !important;
                      box-sizing: border-box !important;
                      padding: 6px !important;
                    }
                  `}</style>
                  {/* responsive wrapper for calendar */}
                  <div className="clinic-calendar-wrapper" style={{ width: '100%', display: 'block' }}>
                    <Calendar
                      value={date}
                      onChange={setDate}
                      tileContent={tileContent}
                      className="clinic-react-calendar w-100 border rounded shadow-sm"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        margin: '0',
                        fontSize: '1.05rem'
                      }}
                    />
                  </div>
                </div>

                <h5 className="mt-3 text-center mb-4" style={{ color: "#D9A299", fontSize: "1.3rem" }}>
                  Terminet për: <strong>{date.toDateString()}</strong>
                </h5>
                {filteredAppointments.length > 0 ? (
                  <ul className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {filteredAppointments.map((a, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between align-items-center" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        padding: "1.5rem",
                        fontSize: "1.1rem"
                      }}>
                        <span>⏰ {a.time}</span>
                        <span>👨‍⚕️ Dr. <strong style={{ color: "#D9A299" }}>{a.doctorName}</strong></span>
                        <span>🧑‍🤝‍🧑 Pacient: <strong style={{ color: "#D9A299" }}>{a.patientId?.name}</strong></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    padding: "2rem"
                  }}>
                    📭 S'ka termine për këtë datë.
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
