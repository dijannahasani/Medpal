import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Dashboard.css";
import MobileNavbar from "../../components/MobileNavbar";
import DoctorHomeButton from "../../components/DoctorHomeButton";
import { getUser, clearAllAuth } from "../../utils/auth";

export default function DoctorDashboard() {
  const user = getUser();

  const cards = [
    { to: "/doctor/appointments", icon: "📋", title: "Terminet", desc: "Shiko pacientët që kanë rezervuar" },
    { to: "/doctor/calendar", icon: "📅", title: "Kalendar", desc: "Shiko terminet me kalendar" },
    { to: "/doctor/add-report", icon: "🧾", title: "Krijo Raport", desc: "Shto raportin për termin" },
    { to: "/doctor/reports", icon: "📑", title: "Raportet", desc: "Shiko të gjitha raportet që ke krijuar" },
    { to: "/doctor/profile", icon: "👤", title: "Profili Im", desc: "Shiko dhe edito të dhënat personale" },
  ];

  const handleLogout = () => {
    clearAllAuth();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavbar
        userRole="doctor"
        userName={user?.name || "Mjek"}
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
            <h2 className="m-0">Mirësevini Dr. {user?.name || "Mjek"} 👨‍⚕️</h2>
            <button
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
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
                <h5 className="card-title mb-2 text-white">👨‍⚕️ Mirësevini Dr. {user?.name || "Mjek"}!</h5>
                <p className="card-text mb-0 small">
                  Zgjidhni një nga opsionet më poshtë për të vazhduar
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="doctor-dashboard-cards">
            {cards.map((card, index) => (
              <Link to={card.to} className="text-decoration-none" key={index}>
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
