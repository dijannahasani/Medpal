import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getUser, clearAuth } from "../../utils/auth";
import MobileNavbar from "../../components/MobileNavbar";

export default function ClinicDashboard() {
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  const cards = [
    { to: "/clinic/doctors", icon: "📋", title: "Lista e Mjekëve", desc: "Shiko të gjithë mjekët e klinikës" },
    { to: "/clinic/add-doctor", icon: "➕", title: "Shto Mjek", desc: "Regjistro një mjek të ri" },
    { to: "/clinic/calendar", icon: "📅", title: "Kalendar", desc: "Shiko terminet e klinikës" },
    { to: "/clinic/appointments", icon: "📆", title: "Terminet", desc: "Shiko dhe shkarko raportet e termineve" },
    { to: "/clinic/services", icon: "🏥", title: "Departamente & Shërbime", desc: "Menaxho departamentet" },
    { to: "/clinic/set-working-hours", icon: "🕒", title: "Orari i Mjekëve", desc: "Cakto orarin për mjekët" },
    { to: "/clinic/reports", icon: "📑", title: "Raportet", desc: "Shiko dhe shkarko raportet" },
    { to: "/clinic/invite-patient", icon: "📧", title: "Fto Pacient", desc: "Dërgo ftesë për verifikim pacientit" },
    { to: "/clinic/profile", icon: "⚙️", title: "Profili i Klinikës", desc: "Përditëso emrin, emailin ose fjalëkalimin" },
  ];
  const location = useLocation();
  const containerRef = useRef(null);

  useEffect(() => {
    // Diagnostic: log any descendants that are sticky/fixed (helps find pinning element)
    try {
      setTimeout(() => {
        const container = containerRef.current || document;
        const elems = container.querySelectorAll('.clinic-dashboard-grid *');
        const stuck = [];
        elems.forEach(el => {
          try {
            const style = window.getComputedStyle(el);
            if (style.position === 'sticky' || style.position === '-webkit-sticky' || style.position === 'fixed') {
              stuck.push({ tag: el.tagName, cls: el.className, id: el.id, pos: style.position });
            }
          } catch (e) {}
        });
        if (stuck.length) console.warn('ClinicDashboard: found potentially sticky/fixed elements:', stuck);
      }, 200);
    } catch (e) {}
    // 1) Restore saved scroll position if user previously left the dashboard.
    const saved = sessionStorage.getItem('clinic_dashboard_scroll');
    if (saved !== null) {
      const top = parseFloat(saved);
      if (!Number.isNaN(top)) {
        // restore and remove saved value
        window.scrollTo({ top, left: 0, behavior: 'auto' });
        sessionStorage.removeItem('clinic_dashboard_scroll');
        return; // done
      }
    }

    // 2) If navigation provided a cardIndex, prefer that for deterministic scrolling
    const state = location && location.state;
    if (state && typeof state.cardIndex === 'number') {
      try {
        const container = containerRef.current || document;
        const el = container.querySelector(`[data-index="${state.cardIndex}"]`);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset - 72; // small offset
          window.scrollTo({ top, left: 0, behavior: 'auto' });
          return;
        }
      } catch (e) { /* ignore */ }
    }

    // 3) If navigation provided a sourcePath, try to scroll to the matching card deterministically
    if (state && state.sourcePath) {
      try {
        const matchIndex = cards.findIndex(c => {
          // exact match or prefix match
          return state.sourcePath === c.to || state.sourcePath.startsWith(c.to) || c.to.startsWith(state.sourcePath);
        });
        if (matchIndex >= 0) {
          const container = containerRef.current || document;
          const el = container.querySelector(`[data-index="${matchIndex}"]`);
          if (el) {
            const top = el.getBoundingClientRect().top + window.pageYOffset - 72; // small offset
            window.scrollTo({ top, left: 0, behavior: 'auto' });
            return; // done
          }
        }
      } catch (e) {
        // ignore and fall back to clickY
      }
    }

  // 4) Fallback: if navigation provided a clickY, try to scroll to the row card nearest that Y
  if (state && typeof state.clickY === 'number') {
      // small timeout to allow layout to stabilize after navigation
      setTimeout(() => {
        const container = containerRef.current || document;
        // find all card wrappers
        const cardWrappers = container.querySelectorAll('.clinic-dashboard-card');
        if (!cardWrappers || cardWrappers.length === 0) return;

        // compute distances from top of viewport to each card and choose nearest to clickY
        let bestEl = null;
        let bestDist = Infinity;
        cardWrappers.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // center Y of the element relative to viewport
          const centerY = rect.top + rect.height / 2;
          const dist = Math.abs(centerY - state.clickY);
          if (dist < bestDist) {
            bestDist = dist;
            bestEl = el;
          }
        });

        if (bestEl) {
          // scroll so the chosen element is roughly where the user clicked
          const rect = bestEl.getBoundingClientRect();
          const offset = rect.top - (state.clickY - rect.height / 2);
          window.scrollBy({ top: offset, left: 0, behavior: 'auto' });
        }
      }, 120);
    }
    // no dependency on location to only run on mount after navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save scroll position when leaving the dashboard so returning preserves it
  useEffect(() => {
    return () => {
      try {
        sessionStorage.setItem('clinic_dashboard_scroll', String(window.scrollY || window.pageYOffset || 0));
      } catch (e) {
        // ignore storage errors
      }
    };
  }, []);

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavbar
        userRole="clinic"
        userName={user?.name || "Klinika"}
        dashboardLinks={cards}
      />

      {/* Main Content */}
      <div
        className="container-fluid"
        style={{
          backgroundColor: "#FAF7F3", 
          minHeight: "calc(100vh - 64px)", 
          paddingTop: "64px", // reserve space for sticky mobile navbar
          paddingBottom: "1rem",
          background: "linear-gradient(135deg, #FAF7F3 0%, #F0E4D3 50%, #DCC5B2 100%)"
        }}
      >
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
              Mirësevini në Klinikën {user?.name || "Klinika e Re"} 👋
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
                <h5 className="card-title mb-2 text-white">👋 Mirësevini në Klinikën {user?.name || "Klinika e Re"}!</h5>
                <p className="card-text mb-0 small">
                  Zgjidhni një nga opsionet më poshtë për të vazhduar
                </p>
              </div>
            </div>
          </div>

        {/* Cards Grid */}
        <div
          className="d-grid gap-4 clinic-dashboard-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {cards.map((card, index) => (
            <Link to={card.to} key={index} className="text-decoration-none">
              <div
                className="card text-start shadow-sm clinic-dashboard-card"
                data-index={index}
                style={{
                  background: "linear-gradient(145deg, #FFFDFC, #F0E4D3)",
                  border: "1px solid rgba(220, 197, 178, 0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(217, 162, 153, 0.2)",
                  position: 'static', // ensure card does not become sticky
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(217, 162, 153, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(217, 162, 153, 0.2)";
                }}
              >
                <div className="card-body py-4 px-3 d-flex flex-column align-items-start justify-content-center" style={{ width: "100%" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      backgroundColor: "#FFF3EE",
                      borderRadius: "10px",
                      padding: "0.3rem 0.6rem",
                    }}
                  >
                    {card.icon}
                  </div>
                  <h5
                    className="card-title fw-bold mb-1"
                    style={{ color: "#D99991", fontSize: "1.15rem" }}
                  >
                    {card.title}
                  </h5>
                  <p
                    className="card-text text-muted"
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.4",
                      color: "#6b5b53",
                      width: "100%",
                      textAlign: "left",
                      margin: 0
                    }}
                  >
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
