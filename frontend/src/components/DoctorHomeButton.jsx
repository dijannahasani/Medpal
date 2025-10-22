import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function DoctorHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    const clickY = (e && typeof e.clientY === 'number') ? e.clientY : window.innerHeight * 0.15;
    let cardIndex = null;
    try {
      const cardEls = document.querySelectorAll('.clinic-dashboard-card');
      if (cardEls && cardEls.length) {
        let best = { idx: 0, dist: Infinity };
        cardEls.forEach((el, idx) => {
          const rect = el.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const dist = Math.abs(centerY - clickY);
          if (dist < best.dist) best = { idx, dist };
        });
        cardIndex = best.idx;
      }
    } catch (err) {}
    const state = { sourcePath: location.pathname, clickY };
    if (cardIndex !== null) state.cardIndex = cardIndex;
    navigate('/doctor', { state });
  };

  return (
    <div className="position-fixed" style={{
      top: "20px",
      left: "20px",
      zIndex: 1050
    }}>
      <button
        onClick={handleClick}
        className="btn btn-outline-light d-flex align-items-center gap-2"
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(217, 162, 153, 0.3)",
          borderRadius: "25px",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          fontWeight: "600",
          color: "#2c3e50",
          textDecoration: "none",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(217, 162, 153, 0.9)";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.9)";
          e.currentTarget.style.color = "#2c3e50";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        🏠 Home
      </button>
    </div>
  );
}