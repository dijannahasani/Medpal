import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DoctorHomeButton from "../../components/DoctorHomeButton";
import API_URL from "../../config/api";

export default function DoctorWorkingHoursManager() {
  const [workingHours, setWorkingHours] = useState({
    monday: { start: "09:00", end: "17:00", active: true },
    tuesday: { start: "09:00", end: "17:00", active: true },
    wednesday: { start: "09:00", end: "17:00", active: true },
    thursday: { start: "09:00", end: "17:00", active: true },
    friday: { start: "09:00", end: "17:00", active: true },
    saturday: { start: "09:00", end: "13:00", active: false },
    sunday: { start: "09:00", end: "13:00", active: false }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dayNames = {
    monday: "E Hënë",
    tuesday: "E Martë", 
    wednesday: "E Mërkurë",
    thursday: "E Enjte",
    friday: "E Premte",
    saturday: "E Shtunë",
    sunday: "E Dielë"
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.get(
        `${API_URL}/api/working-hours/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.workingHours) {
        setWorkingHours(response.data.workingHours);
      }
    } catch (err) {
      console.error("Gabim në marrjen e orarit:", err);
      setError("Nuk u mor orari i punës. Do të përdoren vlerat default.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSaveWorkingHours = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/api/working-hours`,
        { workingHours },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert("✅ Orari i punës u ruajt me sukses!");
      setError(null);
    } catch (err) {
      console.error("Gabim në ruajtjen e orarit:", err);
      alert("❌ Gabim në ruajtjen e orarit: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Duke u ngarkuar...</span>
          </div>
          <p className="mt-3">Duke ngarkuar orarin e punës...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ 
      backgroundColor: "#FAF7F3", 
      minHeight: "100vh", 
      padding: "2rem 0",
      background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
    }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>🗓️ Menaxhimi i Orarit të Punës</h2>
          <button 
            className="btn"
            onClick={() => window.location.href = '/doctor/profile'}
            style={{
              borderRadius: 10,
              padding: '0.45rem 0.9rem',
              fontWeight: 600,
              background: 'white',
              color: '#2c3e50',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = 'linear-gradient(135deg, #D9A299, #DCC5B2)';
              el.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = 'white';
              el.style.color = '#2c3e50';
            }}
          >
            ← Kthehu në Profil
          </button>
        </div>

      {error && (
        <div className="alert alert-warning mb-4">
          <strong>⚠️ Paralajmërim:</strong> {error}
        </div>
      )}

        <div className="card shadow-lg" style={{
          background: "linear-gradient(145deg, #FAF7F3, #F0E4D3)",
          border: "1px solid rgba(220, 197, 178, 0.3)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(217, 162, 153, 0.3)",
          overflow: 'hidden'
        }}>
          <div className="card-header text-white" style={{ background: 'linear-gradient(135deg, #D9A299, #DCC5B2)', border: 'none' }}>
            <h5 className="mb-0" style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cakto Orarin Tuaj të Punës</h5>
          </div>
          <div className="card-body p-4">
          <div className="row">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="col-md-6 mb-4">
                <div className="card border">
                  <div className="card-body">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`active-${day}`}
                        checked={hours.active}
                        onChange={(e) => handleDayChange(day, 'active', e.target.checked)}
                      />
                      <label className="form-check-label fw-bold" htmlFor={`active-${day}`}>
                        {dayNames[day]}
                      </label>
                    </div>
                    
                    {hours.active && (
                      <div className="row">
                        <div className="col-6">
                          <label className="form-label small text-muted">Fillim</label>
                          <select
                            className="form-select form-select-sm"
                            value={hours.start}
                            onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label small text-muted">Mbarim</label>
                          <select
                            className="form-select form-select-sm"
                            value={hours.end}
                            onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {!hours.active && (
                      <p className="text-muted small mb-0">🚫 Jo aktiv</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-top" style={{ borderColor: 'rgba(220, 197, 178, 0.25)' }}>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setWorkingHours({
                    monday: { start: "09:00", end: "17:00", active: true },
                    tuesday: { start: "09:00", end: "17:00", active: true },
                    wednesday: { start: "09:00", end: "17:00", active: true },
                    thursday: { start: "09:00", end: "17:00", active: true },
                    friday: { start: "09:00", end: "17:00", active: true },
                    saturday: { start: "09:00", end: "13:00", active: false },
                    sunday: { start: "09:00", end: "13:00", active: false }
                  });
                }}
              >
                🔄 Reset në Default
              </button>
              <button
                className="btn btn-success"
                onClick={handleSaveWorkingHours}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Duke ruajtur...
                  </>
                ) : (
                  '💾 Ruaj Orarin'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

        <div className="card mt-4" style={{ background: 'linear-gradient(145deg, #FAF7F3, #F0E4D3)', border: '1px solid rgba(220, 197, 178, 0.3)', borderRadius: 15 }}>
          <div className="card-body">
            <h6 className="text-primary">💡 Shënime:</h6>
            <ul className="mb-0 small text-muted">
            <li>Aktivizo/çaktivizo ditët sipas nevojës</li>
            <li>Cakto kohën e fillimit dhe mbarimit për çdo ditë</li>
            <li>Pacientët do të mund të rezervojnë takime vetëm në oraret aktive</li>
            <li>Ndryshimet do të zbatohen menjëherë pas ruajtjes</li>
          </ul>
        </div>
        </div>
        <DoctorHomeButton />
      </div>
    </div>
  );
}
