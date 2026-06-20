import React, { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

const FONT = "'Montserrat', sans-serif";
const CREAM = "rgba(255, 253, 250, 1)";
const CREAM_DIM = "rgba(255, 253, 250, 0.68)";
const DARK_GLASS = "rgba(10, 8, 14, 0.82)";
const BORDER = "rgba(255, 255, 255, 0.08)";
const SHADOW = "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)";

// ─── Navbar ──────────────────────────────────────────────────────────────────
export const Navbar = ({ children, className }) => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      ref={ref}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 40,
        width: "100%",
      }}
      className={className}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { visible })
          : child
      )}
    </motion.div>
  );
};

// ─── NavBody (desktop) ────────────────────────────────────────────────────────
export const NavBody = ({ children, className, visible }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(18px)" : "none",
        WebkitBackdropFilter: visible ? "blur(18px)" : "none",
        boxShadow: visible ? SHADOW : "none",
        border: visible ? `1px solid ${BORDER}` : "1px solid transparent",
        width: visible ? "52%" : "100%",
        y: visible ? 14 : 0,
        borderRadius: visible ? 9999 : 0,
        backgroundColor: visible ? DARK_GLASS : "transparent",
        paddingTop: visible ? 8 : 18,
        paddingBottom: visible ? 8 : 18,
        paddingLeft: visible ? 20 : 48,
        paddingRight: visible ? 20 : 48,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{
        position: "relative",
        zIndex: 60,
        margin: "0 auto",
        maxWidth: "1320px",
        minWidth: "800px",
        fontFamily: FONT,
        // show/hide via CSS class
      }}
      className={`rn-desktop ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
};

// ─── NavItems ─────────────────────────────────────────────────────────────────
export const NavItems = ({ items, onItemClick }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div
      onMouseLeave={() => setHovered(null)}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        fontFamily: FONT,
      }}
    >
      {items.map((item, idx) => (
        <a
          key={`link-${idx}`}
          href={item.link}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(idx)}
          style={{
            position: "relative",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: hovered === idx ? CREAM : CREAM_DIM,
            textDecoration: "none",
            borderRadius: "9999px",
            transition: "color 0.18s ease",
            whiteSpace: "nowrap",
          }}
        >
          {hovered === idx && (
            <motion.div
              layoutId="rn-hovered"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.07)",
              }}
            />
          )}
          <span style={{ position: "relative", zIndex: 20 }}>{item.name}</span>
        </a>
      ))}
    </div>
  );
};

// ─── MobileNav ────────────────────────────────────────────────────────────────
export const MobileNav = ({ children, visible }) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(18px)" : "none",
        WebkitBackdropFilter: visible ? "blur(18px)" : "none",
        boxShadow: visible ? SHADOW : "none",
        border: visible ? `1px solid ${BORDER}` : "1px solid transparent",
        width: visible ? "92%" : "100%",
        paddingLeft: visible ? 14 : 20,
        paddingRight: visible ? 14 : 20,
        borderRadius: visible ? 14 : 0,
        backgroundColor: visible ? DARK_GLASS : "transparent",
        y: visible ? 10 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{
        position: "relative",
        zIndex: 50,
        margin: "0 auto",
        maxWidth: "calc(100vw - 2rem)",
        paddingTop: "10px",
        paddingBottom: "10px",
        fontFamily: FONT,
      }}
      className="rn-mobile"
    >
      {children}
    </motion.div>
  );
};

// ─── MobileNavHeader ──────────────────────────────────────────────────────────
export const MobileNavHeader = ({ children }) => (
  <div
    style={{
      display: "flex",
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    }}
  >
    {children}
  </div>
);

// ─── MobileNavMenu ────────────────────────────────────────────────────────────
export const MobileNavMenu = ({ children, isOpen }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "58px",
          zIndex: 50,
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "6px",
          borderRadius: "14px",
          background: "rgba(10, 8, 14, 0.96)",
          border: `1px solid ${BORDER}`,
          padding: "24px 20px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          fontFamily: FONT,
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── MobileNavToggle ──────────────────────────────────────────────────────────
export const MobileNavToggle = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: CREAM,
      padding: "4px",
      display: "flex",
      alignItems: "center",
    }}
  >
    {isOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
  </button>
);

// ─── NavbarLogo ───────────────────────────────────────────────────────────────
export const NavbarLogo = ({ logo, logoAlt = "Logo", name }) => (
  <a
    href="#"
    style={{
      position: "relative",
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      textDecoration: "none",
      padding: "2px 4px",
      flexShrink: 0,
    }}
  >
    {logo && (
      <img src={logo} alt={logoAlt} style={{ width: 26, height: 26 }} />
    )}
    {name && (
      <span
        style={{
          fontFamily: FONT,
          fontSize: "14px",
          fontWeight: 200,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: CREAM,
        }}
      >
        {name}
      </span>
    )}
  </a>
);

// ─── NavbarButton ─────────────────────────────────────────────────────────────
export const NavbarButton = ({
  href,
  as: Tag,
  children,
  variant = "primary",
  onClick,
  style: extraStyle,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  const resolvedTag = href ? "a" : "button";
  const Comp = Tag ?? resolvedTag;

  const base = {
    fontFamily: FONT,
    fontSize: "13px",
    fontWeight: 500,
    letterSpacing: "0.05em",
    padding: "8px 20px",
    borderRadius: "9999px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    transition: "all 0.18s ease",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  const variants = {
    primary: {
      background: CREAM,
      color: "#0a080e",
      border: "none",
      boxShadow: hovered ? "0 4px 20px rgba(255,253,250,0.22)" : "none",
      transform: hovered ? "translateY(-1px)" : "translateY(0)",
    },
    secondary: {
      background: "transparent",
      color: CREAM_DIM,
      border: `1px solid rgba(255,255,255,0.18)`,
      transform: hovered ? "translateY(-1px)" : "translateY(0)",
    },
    dark: {
      background: "#0a080e",
      color: CREAM,
      border: "none",
      boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.4)" : "none",
      transform: hovered ? "translateY(-1px)" : "translateY(0)",
    },
  };

  return (
    <Comp
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...(variants[variant] ?? variants.primary), ...extraStyle }}
      {...props}
    >
      {children}
    </Comp>
  );
};
