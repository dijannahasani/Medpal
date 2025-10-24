import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Modal from "react-modal";
import "bootstrap/dist/css/bootstrap.min.css";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

Modal.setAppElement("#root");

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState("");

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("❌ Gabim gjatë marrjes së termineve:", err);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    if (!window.confirm(`A dëshironi të ${status === "approved" ? "aprovoni" : "anuloni"} këtë termin?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/appointments/${appointmentId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      console.error(`❌ Gabim gjatë përditësimit të statusit:", err);
    }
  };

  const downloadPDF = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/appointments/${appointmentId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: `blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `raporti_${appointmentId}.pdf`;
      link.click();
    } catch (err) {
      console.error("❌ Gabim gjatë shkarkimit të PDF:", err);
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredAppointments.map((a) => ({
      Pacienti: a.patientId?.name || "",
      Email: a.patientId?.email || "",
      Data: a.date,
      Ora: a.time,
      Doktori: a.doctorId?.name || "",
      Statusi: a.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Terminet");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "Terminet_Klinikes.xlsx");
  };

  const openModal = (fileUrl) => {
    setSelectedDocUrl(`${API_URL}" + fileUrl);
    setModalIsOpen(true);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    const query = searchTerm.toLowerCase();
    return (
      a.patientId?.name?.toLowerCase().includes(query) ||
      a.patientId?.email?.toLowerCase().includes(query) ||
      a.doctorId?.name?.toLowerCase().includes(query) ||
      a.date?.includes(query)
    );
  });

  return (
    <div className="container-fluid" style={{
      backgroundColor: "#FAF7F3",
      minHeight: "100vh",
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-12">
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
                  <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color: "white" }}>
                    📅 Terminet për Klinikën
                  </h2>
                  <button className="btn btn-outline-light btn-lg" onClick={exportToExcel} style={{
                    borderRadius: "12px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "bold"
                  }}>
                    ⬇️ Eksporto Excel
                  </button>
                </div>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9", color: "white" }}>
                  Menaxhoni të gjitha terminet e klinikës suaj
                </p>
              </div>
              <div className="card-body p-5">

                <input
                  type="text"
                  className="form-control form-control-lg mb-4"
                  placeholder="🔍 Kërko sipas pacientit, doktorit, datës apo emailit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "2px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    fontSize: "1.1rem"
                  }}
                />

                {filteredAppointments.length === 0 ? (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    padding: "2rem"
                  }}>
                    📭 Nuk ka termine të regjistruara ose kërkimi nuk përputhet me asnjë rezultat.
                  </div>
                ) : (
                  <div className="table-responsive">
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
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Pacienti</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Email</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Data</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Ora</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Doktori</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Dokumente</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Statusi</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Raport</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments.map((a) => (
                          <tr key={a._id} style={{ fontSize: "1rem" }}>
                            <td style={{ padding: "1rem" }}>{a.patientId?.name}</td>
                            <td style={{ padding: "1rem" }}>{a.patientId?.email}</td>
                            <td style={{ padding: "1rem" }}>{a.date}</td>
                            <td style={{ padding: "1rem" }}>{a.time}</td>
                            <td style={{ padding: "1rem" }}>{a.doctorId?.name || "-"}</td>
                            <td style={{ padding: "1rem" }}>
                              {a.documents && a.documents.length > 0 ? (
                                <ul>
                                  {a.documents.map((doc, i) => (
                                    <li key={i}>
                                      <button
                                        className="btn btn-link p-0"
                                        onClick={() => openModal(doc.fileUrl)}
                                        style={{ color: "#D9A299" }}
                                      >
                                        📎 {doc.title}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span style={{ color: "gray" }}>Nuk ka dokumente</span>
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {a.status === "pending" ? (
                                <>
                                  <button className="btn btn-success btn-sm me-2" onClick={() => updateStatus(a._id, "approved")} style={{
                                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    ✅ Aprovo
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(a._id, "canceled")} style={{
                                    background: "linear-gradient(135deg, #DCC5B2, #D9A299)",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    ❌ Anulo
                                  </button>
                                </>
                              ) : (
                                <span className="badge" style={{
                                  background: a.status === "approved" 
                                    ? "linear-gradient(135deg, #D9A299, #DCC5B2)"
                                    : "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                                  color: a.status === "approved" ? "white" : "#2c3e50",
                                  borderRadius: "8px",
                                  padding: "0.5rem 1rem"
                                }}>
                                  {a.status}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <button
                                className="btn btn-sm"
                                onClick={() => downloadPDF(a._id)}
                                style={{
                                  background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                  border: "none",
                                  color: "white",
                                  borderRadius: "8px",
                                  boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                }}
                              >
                                📄 Shkarko
                              </button>
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

      {/* Modal për dokumentin PDF */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Dokumenti"
        style={{ content: { width: "80%", height: "80%", margin: "auto" } }}
      >
        <button className="btn btn-danger mb-2" onClick={() => setModalIsOpen(false)}>❌ Mbyll</button>
        <iframe src={selectedDocUrl} title="Dokument" width="100%" height="90%"></iframe>
      </Modal>
      <ClinicHomeButton />
    </div>
  );
}
