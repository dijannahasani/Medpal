import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";
import MobileNavbar from "../../components/MobileNavbar";
import { clearAuth, getToken } from "../../utils/auth";
import API_URL from "../../config/api";

export default function PatientDashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/login");
          return;
        }
        const res = await axios.get(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };
    getUserData();
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const cards = [
    {
      to: "/patient/book-appointment",
      icon: "📅",
      title: "Rezervo Terminin",
      desc: "Shiko mjekët dhe cakto vizitën",
    },
    {
      to: "/patient/profile",
      icon: "👤",
      title: "Profili Im",
      desc: "Shiko dhe edito të dhënat",
    },
    {
      to: "/patient/history",
      icon: "📖",
      title: "Historiku",
      desc: "Terminet dhe vizitat e kaluara",
    },
    {
      to: "/patient/notifications",
      icon: "🔔",
      title: "Njoftime",
      desc: "Kujtesa dhe rekomandime",
    },
    {
      to: "/patient/reports",
      icon: "📋",
      title: "Raportet e Mia",
      desc: "Shiko dhe shkarko raportet",
    },
    {
      to: "/patient/documents",
      icon: "📁",
      title: "Dokumentet",
      desc: "Recetat, analizat etj.",
    },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavbar
        userRole="patient"
        userName={user?.name || "Pacient"}
        dashboardLinks={cards}
      />

      {/* Main Content */}
      <div className="container-fluid" style={{ 
        backgroundColor: "#FAF7F3", 
        minHeight: "calc(100vh - 64px)", 
        padding: "1rem 0",
        background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
      }}>
        <div className="container">
          {/* Desktop Header - Hidden on mobile */}
          <div
            className="d-none d-md-flex justify-content-between align-items-center p-4 rounded shadow mb-5"
            style={{
              background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
              color: "white",
              borderRadius: "15px",
              boxShadow: "0 8px 25px rgba(217, 162, 153, 0.3)"
            }}
          >
            <h2 className="m-0">
              Mirësevini në MedPal, {user?.name || "Pacient"} 👋
            </h2>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Dil
            </button>
          </div>

          {/* Mobile Welcome Card - Visible only on mobile */}
          <div className="d-md-none mb-4">
            <div
              className="card text-center"
              style={{
                background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(217, 162, 153, 0.3)"
              }}
            >
              <div className="card-body p-3">
                <h5 className="card-title mb-2">👋 Mirësevini në MedPal!</h5>
                <p className="card-text mb-0 small">
                  Zgjidhni një nga opsionet më poshtë për të vazhduar
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="dashboard-cards">
            {cards.map((card, i) => (
              <Link to={card.to} className="text-decoration-none" key={i}>
                <div className="card h-100">
                  <div className="card-body">
                    <h4 className="card-title">
                      {card.icon} {card.title}
                    </h4>
                    <p className="card-text">
                      {card.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
