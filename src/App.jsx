import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AppointmentBooking from "./AppointmentBooking.jsx";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "./components/ui/ResizableNavbar.jsx";
import sourceHtml from "../Hero.dc.html?raw";
import heroBackgroundUrl from "../assets/hero-bg.png";
import mobileHeroBackgroundUrl from "../assets/mobile-hero-bg.png";
import starLogoUrl from "./star-logo.svg";


function getResultsSection() {
  const results = [
    {
      title: "Full-face refresh",
      meta: "Soft volume and rested definition",
      image: mobileHeroBackgroundUrl,
      position: "58% center"
    },
    {
      title: "Skin luminosity",
      meta: "Brighter tone and smoother texture",
      image: heroBackgroundUrl,
      position: "72% center"
    },
    {
      title: "Contour balance",
      meta: "Natural structure without heaviness",
      image: mobileHeroBackgroundUrl,
      position: "62% center"
    }
  ];

  const cards = results
    .map(
      (item, index) => `
        <article class="result-card reveal" data-reveal style="transition-delay:${index * 0.08}s;">
          <figure class="result-frame result-photo" style="--result-image:url(${item.image}); --result-position:${item.position};">
            <span>Result</span>
          </figure>
          <div class="result-copy">
            <h3>${item.title}</h3>
            <p>${item.meta}</p>
          </div>
        </article>`
    )
    .join("");

  return `
    <section id="results" class="results-section">
      <div class="results-inner">
        <div class="results-header">
          <div class="reveal" data-reveal>
            <div class="results-kicker">
              <span></span>
            <p>Results</p>
            </div>
          </div>
          <div class="results-heading-row">
            <h2 class="reveal" data-reveal>Visible refinement, photographed with restraint.</h2>
            <p class="reveal" data-reveal>Representative outcomes showing the soft, natural finish our patients ask for.</p>
          </div>
        </div>
        <div class="results-grid">
          ${cards}
        </div>
      </div>
    </section>`;
}

function getPageMarkup() {
  const match = sourceHtml.match(
    /<div style="position:relative; width:100%;[\s\S]*?<\/footer>/
  );

  if (!match) {
    return "<main><p>Unable to load page content.</p></main>";
  }

  return match[0]
    .replace(/<nav[\s\S]*?<\/nav>/, "")
    .replace(
      '<div style="position:absolute; inset:0; background-image:url(\'assets/hero-bg.png\');',
      '<div class="hero-bg-image" style="position:absolute; inset:0; background-image:url(\'assets/hero-bg.png\');'
    )
    .replace("<!-- PHILOSOPHY -->\n<section", '<!-- PHILOSOPHY -->\n<section id="clinic"')
    .replace("<!-- TREATMENTS -->\n<section", '<!-- TREATMENTS -->\n<section id="treatments"')
    .replace("<!-- JOURNAL -->\n<section", '<!-- JOURNAL -->\n<section id="journal"')
    .replace("<!-- NUMBERS -->", `${getResultsSection()}\n\n<!-- NUMBERS -->`)
    .replace("<!-- CONTACT -->", '<div id="appointment-system-root"></div>\n\n<!-- CONTACT -->')
    .replaceAll("assets/hero-bg.png", heroBackgroundUrl);
}

function AppointmentPortal() {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    setContainer(document.getElementById("appointment-system-root"));
  }, []);

  if (!container) return null;
  return createPortal(<AppointmentBooking />, container);
}

function useHeroInteractions(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const q = (selector) => Array.from(root.querySelectorAll(selector));

    const revealEls = q(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
    const revealFallback = window.setTimeout(() => {
      revealEls.forEach((el) => el.classList.add("in"));
    }, 4500);

    const rows = q("[data-treat-row]");
    const imgs = q("[data-treat-img]");
    const setActiveTreatment = (index) => {
      const activeIndex = String(index);
      imgs.forEach((img) => {
        img.style.opacity =
          img.getAttribute("data-treat-img") === activeIndex ? "1" : "0";
      });

      rows.forEach((row) => {
        const isActive = row.getAttribute("data-treat-index") === activeIndex;
        row.style.paddingLeft = isActive ? "20px" : "0px";

        const name = row.querySelector("[data-treat-name]");
        if (name) name.style.color = isActive ? "#8d8475" : "#1a1714";

        const arrow = row.querySelector("[data-treat-arrow]");
        if (arrow) {
          arrow.style.opacity = isActive ? "1" : "0";
          arrow.style.transform = isActive
            ? "translate(0,0)"
            : "translate(-6px,6px)";
        }
      });
    };

    const rowListeners = rows.map((row) => {
      const onMouseEnter = () => setActiveTreatment(row.dataset.treatIndex);
      row.addEventListener("mouseenter", onMouseEnter);
      return () => row.removeEventListener("mouseenter", onMouseEnter);
    });

    if (rows.length) setActiveTreatment(0);

    const magneticEls = q("[data-magnetic]");
    const magneticListeners = magneticEls.map((button) => {
      button.style.transition = "transform .35s cubic-bezier(.16,1,.3,1)";

      const onMouseMove = (event) => {
        const rect = button.getBoundingClientRect();
        const mx = event.clientX - (rect.left + rect.width / 2);
        const my = event.clientY - (rect.top + rect.height / 2);
        button.style.transform = `translate(${(mx * 0.3).toFixed(1)}px,${(
          my * 0.45
        ).toFixed(1)}px)`;
      };
      const onMouseLeave = () => {
        button.style.transform = "translate(0,0)";
      };

      button.addEventListener("mousemove", onMouseMove);
      button.addEventListener("mouseleave", onMouseLeave);

      return () => {
        button.removeEventListener("mousemove", onMouseMove);
        button.removeEventListener("mouseleave", onMouseLeave);
      };
    });

    const parallaxEls = q("[data-parallax]");
    parallaxEls.forEach((el) => {
      el.style.willChange = "transform";
    });

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight;
        parallaxEls.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const progress = (viewportHeight / 2 - center) / viewportHeight;
          const speed = Number.parseFloat(el.dataset.parallaxSpeed || "0.15");
          const translateY = Math.max(
            -80,
            Math.min(80, progress * speed * 340)
          );
          el.style.transform = `translate3d(0,${translateY.toFixed(1)}px,0)`;
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    return () => {
      window.clearTimeout(revealFallback);
      observer.disconnect();
      rowListeners.forEach((remove) => remove());
      magneticListeners.forEach((remove) => remove());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [rootRef]);
}

export default function App() {
  const rootRef = useRef(null);
  const pageMarkup = useMemo(getPageMarkup, []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(
    () => [
      { name: "Treatments", link: "#treatments" },
      { name: "The Clinic", link: "#clinic" },
      { name: "Results", link: "#results" },
      { name: "Appointments", link: "#appointments" },
      { name: "Journal", link: "#journal" },
      { name: "Contact", link: "#contact" },
    ],
    []
  );

  useHeroInteractions(rootRef);

  return (
    <>
      <Navbar>
        {/* Desktop */}
        <NavBody>
          <NavbarLogo logo={starLogoUrl} logoAlt="Star Aesthetics" name="Star Aesthetics" />
          <NavItems items={navItems} />
          <NavbarButton href="#appointments" variant="primary">
            Book Now
          </NavbarButton>
        </NavBody>

        {/* Mobile */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo logo={starLogoUrl} logoAlt="Star Aesthetics" name="Star Aesthetics" />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((o) => !o)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "15px",
                  fontWeight: 300,
                  letterSpacing: "0.04em",
                  color: "rgba(255, 253, 250, 0.78)",
                  textDecoration: "none",
                  padding: "8px 0",
                  width: "100%",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {item.name}
              </a>
            ))}
            <NavbarButton
              href="#appointments"
              variant="primary"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ width: "100%", marginTop: "8px" }}
            >
              Book Now
            </NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <main
        ref={rootRef}
        className="react-page"
        style={{ "--mobile-hero-bg": `url(${mobileHeroBackgroundUrl})` }}
        dangerouslySetInnerHTML={{ __html: pageMarkup }}
      />
      <AppointmentPortal />
    </>
  );
}
