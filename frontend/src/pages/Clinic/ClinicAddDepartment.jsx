// src/pages/Clinic/ClinicAddDepartment.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../../utils/auth";
import ClinicHomeButton from "../../components/ClinicHomeButton";
import API_URL from "../../config/api";

export default function ClinicAddDepartment() {
  const [name, setName] = useState("");
  const [departments, setDepartments] = useState([]);
  const token = getToken();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/clinic/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data);
      } catch (err) {
        console.error("❌ Gabim në marrjen e departamenteve:", err);
      }
    };

    fetchDepartments();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("⚠️ Ju lutemi shkruani emrin e departamentit.");

    try {
      await axios.post(
        `${API_URL}/api/clinic/departments`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      alert("✅ Departamenti u shtua me sukses!");
      // Rifresko listën
      const res = await axios.get(`${API_URL}/api/clinic/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error("❌ Gabim:", err);
      console.error("❌ Error response:", err.response?.data);
      alert("❌ Gabim gjatë shtimit të departamentit: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto" }}>
      <h2>➕ Shto Departament</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Emri i departamentit"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Shto</button>
      </form>

      {departments.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px" }}>📋 Departamentet ekzistuese:</h3>
          <ul>
            {departments.map((dep) => (
              <li key={dep._id}>• {dep.name}</li>
            ))}
          </ul>
        </>
      )}
      <ClinicHomeButton />
    </div>
  );
}
