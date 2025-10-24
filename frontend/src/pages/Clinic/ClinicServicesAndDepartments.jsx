import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getToken } from "../../utils/auth";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

export default function ClinicServicesAndDepartments() {
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    price: "",
    departmentId: "",
  });

  const [searchDep, setSearchDep] = useState("");
  const [searchServ, setSearchServ] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  const token = getToken();

  const fetchData = async () => {
    try {
      const [depRes, servRes] = await Promise.all([
        axios.get(`${API_URL}/api/clinic/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/clinic/services`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDepartments(depRes.data);
      setServices(servRes.data);
    } catch (err) {
      console.error("❌ Gabim në marrjen e të dhënave:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddOrUpdateDepartment = async (e) => {
    e.preventDefault();
    if (!departmentName.trim()) return alert("Shkruani emrin e departamentit.");
    try {
      if (editingDepartment) {
        await axios.put(
          `${API_URL}/api/clinic/departments/${editingDepartment}`,
          { name: departmentName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingDepartment(null);
        alert(`✅ Departamenti u përditësua me sukses!");
      } else {
        await axios.post(
          `${API_URL}/api/clinic/departments`,
          { name: departmentName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("✅ Departamenti u shtua me sukses!");
      }
      setDepartmentName("");
      fetchData();
    } catch (err) {
      alert(`❌ Gabim gjatë ${editingDepartment ? 'përditësimit' : 'shtimit'} të departamentit.`);
    }
  };

  const handleEditDepartment = (department) => {
    console.log("🔧 Edit button clicked for department:", department);
    setEditingDepartment(department._id);
    setDepartmentName(department.name);
    console.log("📝 Edit state set:", { editingDepartment: department._id, departmentName: department.name });
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë departament?")) return;
    try {
      await axios.delete(`${API_URL}/api/clinic/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      alert(`✅ Departamenti u fshi me sukses!");
    } catch (err) {
      alert("❌ Gabim gjatë fshirjes së departamentit.");
    }
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm({ ...serviceForm, [name]: value });
  };

  const handleAddOrUpdateService = async (e) => {
    e.preventDefault();
    const { name, price, departmentId } = serviceForm;
    if (!name || !price || !departmentId) {
      return alert("Të gjitha fushat për shërbim janë të detyrueshme.");
    }

    if (Number(price) <= 0) {
      return alert("Çmimi duhet të jetë numër pozitiv.");
    }

    try {
      if (editingService) {
        await axios.put(
          `${API_URL}/api/clinic/services/${editingService}`,
          { name, price, departmentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingService(null);
      } else {
        await axios.post(
          `${API_URL}/api/clinic/services`,
          { name, price, departmentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setServiceForm({ name: "", price: "", departmentId: "" });
      fetchData();
      alert("✅ Shërbimi u ruajt me sukses!");
    } catch (err) {
      alert("❌ Gabim gjatë ruajtjes së shërbimit.");
    }
  };

  const handleEditService = (s) => {
    setEditingService(s._id);
    setServiceForm({
      name: s.name,
      price: s.price,
      departmentId: s.departmentId?._id || s.departmentId,
    });
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("A jeni i sigurt që doni ta fshini këtë shërbim?")) return;
    try {
      await axios.delete(`${API_URL}/api/clinic/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      alert(`❌ Gabim gjatë fshirjes së shërbimit.");
    }
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchDep.toLowerCase())
  );

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchServ.toLowerCase());
    const matchesDepartment = filterDepartment ? s.departmentId?._id === filterDepartment : true;
    return matchesSearch && matchesDepartment;
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
                  🏥 Menaxho Departamentet & Shërbimet
                </h2>
                <p className="mt-2 mb-0" style={{ fontSize: "1.1rem", opacity: "0.9" }}>
                  Krijoni dhe menaxhoni departamentet dhe shërbimet e klinikës
                </p>
              </div>
              <div className="card-body p-5">

                {/* ➕ Shto/Përditëso Departament */}
                <form onSubmit={handleAddOrUpdateDepartment} className="mb-5" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "15px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <h5 className="mb-3" style={{ color: "#D9A299", fontSize: "1.3rem" }}>
                    {editingDepartment ? "✏️ Përditëso Departament" : "➕ Shto Departament"}
                  </h5>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Emri i departamentit"
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                    <button className="btn btn-lg" type="submit" style={{
                      background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                      border: "none",
                      color: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                    }}>
                      {editingDepartment ? "Përditëso" : "Shto"}
                    </button>
                    {editingDepartment && (
                      <button
                        type="button"
                        className="btn btn-lg ms-2"
                        onClick={() => {
                          setEditingDepartment(null);
                          setDepartmentName("");
                        }}
                        style={{
                          background: "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                          border: "none",
                          color: "#2c3e50",
                          borderRadius: "12px",
                          boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                        }}
                      >
                        Anulo
                      </button>
                    )}
                  </div>
                </form>

                {/* ➕ Shto/Përditëso Shërbim */}
                <form onSubmit={handleAddOrUpdateService} className="mb-5" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "15px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <h5 className="mb-4" style={{ color: "#D9A299", fontSize: "1.3rem" }}>{editingService ? "✏️ Përditëso Shërbim" : "➕ Shto Shërbim"}</h5>
                  <div className="mb-4">
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-lg"
                      placeholder="Emri i shërbimit"
                      autoComplete="off"
                      value={serviceForm.name}
                      onChange={handleServiceChange}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <input
                      type="number"
                      name="price"
                      className="form-control form-control-lg"
                      placeholder="Çmimi (€)"
                      value={serviceForm.price}
                      onChange={handleServiceChange}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <select
                      name="departmentId"
                      className="form-select form-select-lg"
                      value={serviceForm.departmentId}
                      onChange={handleServiceChange}
                      required
                      style={{
                        border: "2px solid rgba(220, 197, 178, 0.3)",
                        borderRadius: "12px",
                        padding: "0.75rem 1rem"
                      }}
                    >
                      <option value="">Zgjedh departamentin</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <button className="btn btn-lg w-100" type="submit" style={{
                    background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                    border: "none",
                    color: "white",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.4)",
                    padding: "1rem 2rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold"
                  }}>
                    {editingService ? "Përditëso" : "Shto"}
                  </button>
                  {editingService && (
                    <button
                      type="button"
                      className="btn btn-lg w-100 mt-3"
                      onClick={() => {
                        setEditingService(null);
                        setServiceForm({ name: "", price: "", departmentId: "" });
                      }}
                      style={{
                        background: "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                        border: "none",
                        color: "#2c3e50",
                        borderRadius: "15px",
                        boxShadow: "0 8px 25px rgba(217, 162, 153, 0.4)",
                        padding: "1rem 2rem",
                        fontSize: "1.2rem",
                        fontWeight: "bold"
                      }}
                    >
                      Anulo
                    </button>
                  )}
                </form>

                {/* 🔍 Kërkimi dhe Filtrimi */}
                <div className="mb-5" style={{
                  background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                  padding: "2rem",
                  borderRadius: "15px",
                  boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                  border: "1px solid rgba(220, 197, 178, 0.3)"
                }}>
                  <h5 className="mb-4" style={{ color: "#D9A299", fontSize: "1.3rem" }}>🔍 Kërko & Filtrim</h5>
                  <input
                    type="text"
                    className="form-control form-control-lg mb-3"
                    placeholder="Kërko në departamente..."
                    value={searchDep}
                    onChange={(e) => setSearchDep(e.target.value)}
                    style={{
                      border: "2px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "12px",
                      padding: "0.75rem 1rem"
                    }}
                  />
                  <input
                    type="text"
                    className="form-control form-control-lg mb-3"
                    placeholder="Kërko në shërbime..."
                    value={searchServ}
                    onChange={(e) => setSearchServ(e.target.value)}
                    style={{
                      border: "2px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "12px",
                      padding: "0.75rem 1rem"
                    }}
                  />
                  <select
                    className="form-select form-select-lg mb-3"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    style={{
                      border: "2px solid rgba(220, 197, 178, 0.3)",
                      borderRadius: "12px",
                      padding: "0.75rem 1rem"
                    }}
                  >
                    <option value="">Filtrimi sipas departamentit</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-lg"
                    onClick={() => {
                      setSearchDep("");
                      setSearchServ("");
                      setFilterDepartment("");
                    }}
                    style={{
                      background: "linear-gradient(135deg, #F0E4D3, #DCC5B2)",
                      border: "none",
                      color: "#2c3e50",
                      borderRadius: "12px",
                      boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
                    }}
                  >
                    ♻️ Reseto filtrat
                  </button>
                </div>

                {/* 📋 Lista */}
                <div>
                  <h5 className="mb-4" style={{ color: "#D9A299", fontSize: "1.3rem" }}>📋 Departamentet ekzistuese:</h5>
                  <ul className="list-group mb-5" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {filteredDepartments.map((dep) => (
                      <li key={dep._id} className="list-group-item d-flex justify-content-between align-items-center" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        padding: "1.5rem",
                        fontSize: "1.1rem"
                      }}>
                        <div>
                          {dep.name}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleEditDepartment(dep)}
                            style={{
                              background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                              border: "none",
                              color: "white",
                              borderRadius: "8px",
                              boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                              width: 42,
                              height: 42,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                              boxSizing: 'border-box'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteDepartment(dep._id)}
                            style={{
                              background: "linear-gradient(135deg, #DCC5B2, #D9A299)",
                              border: "none",
                              color: "white",
                              borderRadius: "8px",
                              boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                              width: 42,
                              height: 42,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                              boxSizing: 'border-box'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <h5 className="mb-4" style={{ color: "#D9A299", fontSize: "1.3rem" }}>📄 Shërbimet ekzistuese:</h5>
                  <ul className="list-group" style={{
                    background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
                    borderRadius: "15px",
                    boxShadow: "0 8px 25px rgba(217, 162, 153, 0.2)",
                    border: "1px solid rgba(220, 197, 178, 0.3)"
                  }}>
                    {filteredServices.map((s) => (
                      <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center" style={{
                        background: "transparent",
                        border: "1px solid rgba(220, 197, 178, 0.2)",
                        borderRadius: "10px",
                        marginBottom: "0.5rem",
                        padding: "1.5rem",
                        fontSize: "1.1rem"
                      }}>
                        <div>
                          {s.name} – {s.price}€ ({s.departmentId?.name || "-"})
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button onClick={() => handleEditService(s)} className="btn btn-sm" style={{
                            background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                            border: "none",
                            color: "white",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                            width: 42,
                            height: 42,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            fontSize: '1rem',
                            lineHeight: 1,
                            boxSizing: 'border-box'
                          }}>
                            ✏️
                          </button>
                          <button onClick={() => handleDeleteService(s._id)} className="btn btn-sm" style={{
                            background: "linear-gradient(135deg, #DCC5B2, #D9A299)",
                            border: "none",
                            color: "white",
                            borderRadius: "8px",
                            boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)",
                            width: 42,
                            height: 42,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            fontSize: '1rem',
                            lineHeight: 1,
                            boxSizing: 'border-box'
                          }}>
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ClinicHomeButton />
    </div>
  );
}
