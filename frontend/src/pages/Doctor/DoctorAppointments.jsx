import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorHomeButton from "../../components/DoctorHomeButton";
import API_URL from "../../config/api";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_URL}/api/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_URL}/api/appointments/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAppointments();
  };

  const downloadPDF = async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/appointments/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const blob = new Blob([res.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `raporti_${id}.pdf`;
    link.click();
  };


  return (
    <div className="container-fluid" style={{ 
      backgroundColor: "#FAF7F3", 
      minHeight: "100vh", 
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <DoctorHomeButton />
      <div className="container-fluid px-4">
        <div className="row justify-content-center">
          <div className="col-12">
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
                  📅 Terminet e Pacientëve
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Menaxhoni të gjitha terminet e pacientëve tuaj
                </p>
              </div>
              <div className="card-body p-5">
                <div className="table-responsive" style={{
                  overflow: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none"
                }}>
                  <style>
                    {`
                      .table-responsive::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <table className="table table-striped align-middle" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)"
                  }}>
                    <thead style={{
                      background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                      color: "white"
                    }}>
                      <tr>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white" }}>Pacienti</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white"  }}>Email</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white"  }}>Data</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white"  }}>Ora</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white"  }}>Statusi</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem", color:"white"  }}>Ndrysho</th>
                        <th style={{ padding: "1rem", fontSize: "1.1rem" , color:"white" }}>Raport</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
                        <tr key={a._id} style={{ fontSize: "1rem" }}>
                          <td style={{ padding: "1rem" }}>{a.patientId?.name}</td>
                          <td style={{ padding: "1rem" }}>{a.patientId?.email}</td>
                          <td style={{ padding: "1rem" }}>{a.date}</td>
                          <td style={{ padding: "1rem" }}>{a.time}</td>
                          <td style={{ padding: "1rem" }}>
                            <span className="badge" style={{
                              background: a.status === "approved" 
                                ? "linear-gradient(135deg, #D9A299, #DCC5B2)"
                                : a.status === "pending"
                                ? "linear-gradient(135deg, #F0E4D3, #DCC5B2)"
                                : "linear-gradient(135deg, #DCC5B2, #D9A299)",
                              color: "white",
                              borderRadius: "8px",
                              padding: "0.5rem 1rem"
                            }}>
                              {a.status}
                            </span>
              </td>
                          <td style={{ padding: "1rem" }}>
                <select
                  className="form-select"
                  value={a.status}
                  onChange={e => updateStatus(a._id, e.target.value)}
                              style={{
                                border: "2px solid rgba(220, 197, 178, 0.3)",
                                borderRadius: "8px"
                              }}
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✅ Approved</option>
                  <option value="canceled">❌ Canceled</option>
                </select>
              </td>
                          <td style={{ padding: "1rem" }}>
                            <button className="btn btn-sm" onClick={() => downloadPDF(a._id)} style={{
                              background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                              border: "none",
                              color: "white",
                              borderRadius: "8px",
                              boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                            }}>
                  📄
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
                </div>
              </div>
            </div>
          </div>
          </div>
          </div>
    </div>
  );
}
