import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";

export const FloatingNav = ({ navItems, className }) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious();

      if (scrollYProgress.get() < 0.04) {
        setVisible(true);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ y: visible ? 0 : -120, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: "32px",
          left: 0,
          right: 0,
          margin: "0 auto",
          zIndex: 5000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "fit-content",
          pointerEvents: visible ? "auto" : "none",
        }}
        className={className}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(10, 8, 14, 0.72)",
            padding: "6px 8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {navItems.map((navItem, idx) => (
              <NavLink key={`link-${idx}`} href={navItem.link} icon={navItem.icon}>
                {navItem.name}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(255, 255, 255, 0.1)",
              flexShrink: 0,
            }}
          />

          {/* CTA */}
          <CTAButton />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

function NavLink({ href, icon, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        borderRadius: "9999px",
        padding: "7px 14px",
        fontSize: "13px",
        fontWeight: 500,
        letterSpacing: "0.01em",
        color: hovered ? "rgba(255, 253, 250, 1)" : "rgba(255, 253, 250, 0.58)",
        textDecoration: "none",
        background: hovered ? "rgba(255, 255, 255, 0.06)" : "transparent",
        transition: "color 0.18s ease, background 0.18s ease",
        whiteSpace: "nowrap",
      }}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center", opacity: hovered ? 1 : 0.6, transition: "opacity 0.18s" }}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </a>
  );
}

function CTAButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: "9999px",
        background: hovered ? "rgba(255, 253, 250, 0.95)" : "rgba(255, 253, 250, 1)",
        color: "#0a080e",
        padding: "7px 18px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        border: "none",
        cursor: "pointer",
        boxShadow: hovered ? "0 4px 16px rgba(255,253,250,0.18)" : "none",
        transform: hovered ? "scale(1.03)" : "scale(1)",
        transition: "box-shadow 0.18s ease, transform 0.18s ease",
        whiteSpace: "nowrap",
      }}
    >
      Book Now
    </button>
  );
}
