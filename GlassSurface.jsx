/* GlassSurface — adapted from React Bits (TS+Tailwind) to vanilla React + inline styles.
   Mounts as a global for <x-import component-from-global-scope="GlassSurface">. */
const { useEffect, useRef, useState } = React;

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isDark;
}

const num = (v, d) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : d;
};
const sizeVal = (v) => (typeof v === 'number' ? v + 'px' : (/^-?\d+(\.\d+)?$/.test(String(v)) ? v + 'px' : v));

let __gsId = 0;

function GlassSurface(props) {
  const {
    children,
    width = 200,
    height = 80,
    xChannel = 'R',
    yChannel = 'G',
    mixBlendMode = 'difference',
    className = '',
    style = {}
  } = props;

  const borderRadius = num(props.borderRadius, 20);
  const borderWidth = num(props.borderWidth, 0.07);
  const brightness = num(props.brightness, 50);
  const opacity = num(props.opacity, 0.93);
  const blur = num(props.blur, 11);
  const displace = num(props.displace, 0);
  const backgroundOpacity = num(props.backgroundOpacity, 0);
  const saturation = num(props.saturation, 1);
  const distortionScale = num(props.distortionScale, -180);
  const redOffset = num(props.redOffset, 0);
  const greenOffset = num(props.greenOffset, 10);
  const blueOffset = num(props.blueOffset, 20);

  const uid = useRef('gs-' + (__gsId++)).current;
  const filterId = 'glass-filter-' + uid;
  const redGradId = 'red-grad-' + uid;
  const blueGradId = 'blue-grad-' + uid;

  const [svgSupported, setSvgSupported] = useState(false);
  const containerRef = useRef(null);
  const feImageRef = useRef(null);
  const redChannelRef = useRef(null);
  const greenChannelRef = useRef(null);
  const blueChannelRef = useRef(null);
  const gaussianBlurRef = useRef(null);
  const isDarkMode = useDarkMode();

  const generateDisplacementMap = () => {
    const rect = containerRef.current && containerRef.current.getBoundingClientRect();
    const w = (rect && rect.width) || 400;
    const h = (rect && rect.height) || 200;
    const edge = Math.min(w, h) * (borderWidth * 0.5);
    const svg = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
        <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  };

  const updateDisplacementMap = () => {
    if (feImageRef.current) feImageRef.current.setAttribute('href', generateDisplacementMap());
  };

  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset }
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', String(distortionScale + offset));
        ref.current.setAttribute('xChannelSelector', xChannel);
        ref.current.setAttribute('yChannelSelector', yChannel);
      }
    });
    if (gaussianBlurRef.current) gaussianBlurRef.current.setAttribute('stdDeviation', String(displace));
  });

  useEffect(() => {
    const supportsSVGFilters = () => {
      if (typeof window === 'undefined' || typeof document === 'undefined') return false;
      const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      if (isWebkit || isFirefox) return false;
      const div = document.createElement('div');
      div.style.backdropFilter = 'url(#' + filterId + ')';
      return div.style.backdropFilter !== '';
    };
    setSvgSupported(supportsSVGFilters());
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => setTimeout(updateDisplacementMap, 0));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const supportsBackdropFilter = () =>
    typeof window !== 'undefined' && CSS.supports('backdrop-filter', 'blur(10px)');

  const getContainerStyles = () => {
    const base = {
      ...style,
      width: sizeVal(width),
      height: sizeVal(height),
      borderRadius: borderRadius + 'px',
      '--glass-frost': backgroundOpacity,
      '--glass-saturation': saturation
    };
    if (svgSupported) {
      return {
        ...base,
        background: isDarkMode ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        WebkitBackdropFilter: `saturate(${saturation})`,
        boxShadow: isDarkMode
          ? '0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset, 0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset, 0px 4px 16px rgba(17,17,26,0.05), 0px 8px 24px rgba(17,17,26,0.05), 0px 16px 56px rgba(17,17,26,0.05)'
          : '0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset, 0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset, 0px 4px 16px rgba(17,17,26,0.05), 0px 8px 24px rgba(17,17,26,0.05), 0px 16px 56px rgba(17,17,26,0.08)'
      };
    }
    const bf = supportsBackdropFilter();
    if (!bf) {
      return {
        ...base,
        background: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)',
        border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
        boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(255,255,255,0.2)'
      };
    }
    return {
      ...base,
      background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
      backdropFilter: `blur(12px) saturate(1.8) brightness(${isDarkMode ? 1.2 : 1.1})`,
      WebkitBackdropFilter: `blur(12px) saturate(1.8) brightness(${isDarkMode ? 1.2 : 1.1})`,
      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.2), 0 2px 16px 0 rgba(31,38,135,0.1), inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(255,255,255,0.2)'
    };
  };

  return (
    React.createElement('div', {
      ref: containerRef,
      className: className,
      style: {
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', transition: 'opacity .26s ease-out', ...getContainerStyles()
      }
    },
      React.createElement('svg', {
        style: { width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute', inset: 0, opacity: 0, zIndex: -10 },
        xmlns: 'http://www.w3.org/2000/svg'
      },
        React.createElement('defs', null,
          React.createElement('filter', { id: filterId, colorInterpolationFilters: 'sRGB', x: '0%', y: '0%', width: '100%', height: '100%' },
            React.createElement('feImage', { ref: feImageRef, x: 0, y: 0, width: '100%', height: '100%', preserveAspectRatio: 'none', result: 'map' }),
            React.createElement('feDisplacementMap', { ref: redChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispRed' }),
            React.createElement('feColorMatrix', { in: 'dispRed', type: 'matrix', values: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'red' }),
            React.createElement('feDisplacementMap', { ref: greenChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispGreen' }),
            React.createElement('feColorMatrix', { in: 'dispGreen', type: 'matrix', values: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', result: 'green' }),
            React.createElement('feDisplacementMap', { ref: blueChannelRef, in: 'SourceGraphic', in2: 'map', result: 'dispBlue' }),
            React.createElement('feColorMatrix', { in: 'dispBlue', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', result: 'blue' }),
            React.createElement('feBlend', { in: 'red', in2: 'green', mode: 'screen', result: 'rg' }),
            React.createElement('feBlend', { in: 'rg', in2: 'blue', mode: 'screen', result: 'output' }),
            React.createElement('feGaussianBlur', { ref: gaussianBlurRef, in: 'output', stdDeviation: 0.7 })
          )
        )
      ),
      React.createElement('div', {
        style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit', position: 'relative', zIndex: 10 }
      }, children)
    )
  );
}

window.GlassSurface = GlassSurface;
