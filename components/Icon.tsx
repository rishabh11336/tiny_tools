// Tiny inline icon set — stroke = currentColor, no icon dependency.
const paths: Record<string, React.ReactNode> = {
  Image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  PDF: (
    <>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  SVG: (
    <>
      <path d="M12 3v18M3 12h18" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
  Audio: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  Video: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m22 8-6 4 6 4V8Z" />
    </>
  ),
  Utility: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.6 5.6l-6.4 6.4a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l6.4-6.4a4 4 0 0 0 5.6-5.6l-2.7 2.7-2.1-.6-.6-2.1 2.4-2.4Z" />
    </>
  ),
};

export default function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name] ?? paths.Utility}
    </svg>
  );
}
