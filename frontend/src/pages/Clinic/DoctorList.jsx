import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "../../utils/auth";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [clinicServices, setClinicServices] = useState([]);

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedDepartmentId, setEditedDepartmentId] = useState("");
  const [editedServices, setEditedServices] = useState([]);

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
    fetchServices();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/clinic/doctors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e mjekëve:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/clinic/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e departamenteve:", err);
    }
  };

  const fetchServices = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${API_URL}/api/clinic/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClinicServices(res.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e shërbimeve:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("A jeni të sigurt që doni ta fshini mjekun?")) return;
    try {
      const token = getToken();
      await axios.delete(`${API_URL}/api/clinic/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDoctors();
    } catch (err) {
      console.error(`❌ Gabim gjatë fshirjes:", err);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor._id);
    setEditedName(doctor.name);
    setEditedEmail(doctor.email);
    setEditedDepartmentId(doctor.departmentId?._id || "");
    setEditedServices(doctor.services?.map((s) => s._id) || []);
  };

  const handleServiceCheckboxChange = (serviceId) => {
    setEditedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async (id) => {
    try {
      const token = getToken();

      // Emri & emaili
      await axios.put(
        `${API_URL}/api/clinic/users/${id}`,
        { name: editedName, email: editedEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Departamenti & shërbimet
      await axios.put(
        `${API_URL}/api/clinic/doctors/${id}`,
        { departmentId: editedDepartmentId, services: editedServices },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingDoctor(null);
      fetchDoctors();
    } catch (err) {
      console.error(`❌ Gabim gjatë ruajtjes së mjekut:", err);
    }
  };

  const filteredServices = clinicServices.filter(
    (s) => s.departmentId?._id === editedDepartmentId
  );

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
                <h2 className="card-title mb-0" style={{ fontSize: "2.5rem", fontWeight: "bold", color:"white" }}>
                  📋 Lista e Mjekëve të Klinikës
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Menaxhoni mjekët dhe shërbimet e klinikës suaj
                </p>
              </div>
              <div className="card-body p-5">
                {doctors.length > 0 ? (
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
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Emri</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Email</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Departamenti</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Shërbimet</th>
                          <th style={{ padding: "1rem", fontSize: "1.1rem" }}>Veprime</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctors.map((doc) => (
                          <tr key={doc._id} style={{ fontSize: "1rem" }}>
                            <td style={{ padding: "1rem" }}>
                              {editingDoctor === doc._id ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  style={{
                                    border: "2px solid rgba(220, 197, 178, 0.3)",
                                    borderRadius: "8px"
                                  }}
                                />
                              ) : (
                                doc.name
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {editingDoctor === doc._id ? (
                                <input
                                  type="email"
                                  className="form-control"
                                  value={editedEmail}
                                  onChange={(e) => setEditedEmail(e.target.value)}
                                  style={{
                                    border: "2px solid rgba(220, 197, 178, 0.3)",
                                    borderRadius: "8px"
                                  }}
                                />
                              ) : (
                                doc.email
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {editingDoctor === doc._id ? (
                                <select
                                  className="form-select"
                                  value={editedDepartmentId}
                                  onChange={(e) => setEditedDepartmentId(e.target.value)}
                                  style={{
                                    border: "2px solid rgba(220, 197, 178, 0.3)",
                                    borderRadius: "8px"
                                  }}
                                >
                                  <option value="">Zgjedh Departamentin</option>
                                  {departments.map((dep) => (
                                    <option key={dep._id} value={dep._id}>
                                      {dep.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                doc.departmentId?.name || "⛔ Pa Departament"
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {editingDoctor === doc._id ? (
                                <div style={{ maxHeight: "120px", overflowY: "auto" }}>
                                  {filteredServices.map((s) => (
                                    <div className="form-check" key={s._id}>
                                      <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`edit-service-${s._id}`}
                                        checked={editedServices.includes(s._id)}
                                        onChange={() => handleServiceCheckboxChange(s._id)}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`edit-service-${s._id}`}
                                      >
                                        {s.name} – {s.price}€
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              ) : doc.services?.length > 0 ? (
                                <ul className="mb-0">
                                  {doc.services.map((s) => (
                                    <li key={s._id}>{s.name}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="text-muted">⛔ Pa shërbime</span>
                              )}
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {editingDoctor === doc._id ? (
                                <>
                                  <button className="btn btn-success btn-sm me-2" onClick={() => handleSave(doc._id)} style={{
                                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    💾 Ruaj
                                  </button>
                                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingDoctor(null)} style={{
                                    background: "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    Anulo
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEdit(doc)} style={{
                                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    ✏️ Edito
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(doc._id)} style={{
                                    background: "linear-gradient(135deg, #DCC5B2, #D9A299)",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                                  }}>
                                    🗑️ Fshij
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert text-center" style={{
                    background: "linear-gradient(145deg, #F0E4D3, #DCC5B2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)",
                    borderRadius: "15px",
                    color: "#2c3e50",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    padding: "2rem"
                  }}>
                    📭 Nuk ka mjekë të regjistruar.
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
