import { useNavigate, useLocation } from "react-router-dom";

export default function PatientHomeButton() {
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
    navigate('/patient', { state });
  };

  return (
    <div style={{ position: "fixed", top: "20px", left: "20px", zIndex: 1050 }}>
      <button
        onClick={handleClick}
        style={{
          background: "linear-gradient(135deg, #D9A299, #DCC5B2)",
          border: "none",
          borderRadius: "12px",
          padding: "12px 16px",
          color: "white",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: "0 4px 15px rgba(217, 162, 153, 0.4)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(217, 162, 153, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(217, 162, 153, 0.4)";
        }}
      >
        🏠 Home
      </button>
    </div>
  );
}
