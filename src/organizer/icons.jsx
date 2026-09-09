// Icones de traco unico, no espirito dos SF Symbols: grade de 20, traco 1.6,
// pontas arredondadas. Herdam a cor e o tamanho de quem os usa.

const PATHS = {
  today: (
    <>
      <rect x="2.5" y="4.2" width="15" height="13.3" rx="3.2" />
      <path d="M2.5 8.4h15" />
      <path d="M6.6 2.5v3.2M13.4 2.5v3.2" />
      <circle cx="10" cy="12.8" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  week: (
    <>
      <rect x="2.5" y="4.2" width="15" height="13.3" rx="3.2" />
      <path d="M2.5 8.4h15" />
      <path d="M6.6 2.5v3.2M13.4 2.5v3.2" />
      <path d="M7.3 12.2v3.1M10 12.2v3.1M12.7 12.2v3.1" />
    </>
  ),
  upcoming: (
    <>
      <path d="M3 10h12.5" />
      <path d="M11 5.5L15.5 10 11 14.5" />
    </>
  ),
  list: (
    <>
      <path d="M7.2 5.4h9.3M7.2 10h9.3M7.2 14.6h9.3" />
      <circle cx="3.9" cy="5.4" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="3.9" cy="10" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="3.9" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
    </>
  ),
  done: (
    <>
      <circle cx="10" cy="10" r="7.4" />
      <path d="M6.6 10.3l2.3 2.3 4.5-4.9" />
    </>
  ),
  overdue: (
    <>
      <circle cx="10" cy="10" r="7.4" />
      <path d="M10 6.1v4.6" />
      <circle cx="10" cy="13.6" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  plus: <path d="M10 4.4v11.2M4.4 10h11.2" />,
  left: <path d="M12.4 4.6L7 10l5.4 5.4" />,
  right: <path d="M7.6 4.6L13 10l-5.4 5.4" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3.7" />
      <path d="M10 1.9v1.9M10 16.2v1.9M18.1 10h-1.9M3.8 10H1.9M15.7 4.3l-1.3 1.3M5.6 14.4l-1.3 1.3M15.7 15.7l-1.3-1.3M5.6 5.6L4.3 4.3" />
    </>
  ),
  moon: <path d="M16.4 12.3A6.9 6.9 0 0 1 7.7 3.6 7.1 7.1 0 1 0 16.4 12.3z" />,
  export: (
    <>
      <path d="M10 2.8v9.4M6.4 8.8L10 12.4l3.6-3.6" />
      <path d="M3.6 13.6v1.6a2.2 2.2 0 0 0 2.2 2.2h8.4a2.2 2.2 0 0 0 2.2-2.2v-1.6" />
    </>
  ),
  import: (
    <>
      <path d="M10 12.4V3M6.4 6.6L10 3l3.6 3.6" />
      <path d="M3.6 13.6v1.6a2.2 2.2 0 0 0 2.2 2.2h8.4a2.2 2.2 0 0 0 2.2-2.2v-1.6" />
    </>
  ),
  bell: (
    <>
      <path d="M10 2.6a4.9 4.9 0 0 0-4.9 4.9v3.2l-1.2 2.2a.6.6 0 0 0 .5.9h11.2a.6.6 0 0 0 .5-.9l-1.2-2.2V7.5A4.9 4.9 0 0 0 10 2.6z" />
      <path d="M8.2 16.4a1.9 1.9 0 0 0 3.6 0" />
    </>
  ),
  timer: (
    <>
      <circle cx="10" cy="11.2" r="6.3" />
      <path d="M10 8.3v3.1l2 1.3" />
      <path d="M7.9 2.6h4.2" />
    </>
  ),
  search: (
    <>
      <circle cx="8.9" cy="8.9" r="5.4" />
      <path d="M12.9 12.9l3.6 3.6" />
    </>
  ),
  close: <path d="M5.8 5.8l8.4 8.4M14.2 5.8l-8.4 8.4" />,
  check: <path d="M4.4 10.4l3.7 3.7 7.5-8.2" strokeWidth="2.2" />,
  repeat: (
    <>
      <path d="M4 8.4A4.2 4.2 0 0 1 8.2 4.2h7.4" />
      <path d="M13.2 1.9l2.6 2.3-2.6 2.3" />
      <path d="M16 11.6a4.2 4.2 0 0 1-4.2 4.2H4.4" />
      <path d="M6.8 18.1l-2.6-2.3 2.6-2.3" />
    </>
  ),
};

export function Icon({ name, size = 17, className, style }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true" focusable="false"
    >
      {d}
    </svg>
  );
}
