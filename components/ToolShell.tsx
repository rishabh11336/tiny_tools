import ToolBar from "@/components/ToolBar";

// Wraps a tool page: back link + favorite, title, description, work area.
export default function ToolShell({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <ToolBar />
      <h1 className="text-gradient mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
      <div className="card mt-7 bg-surface/60 p-6 backdrop-blur sm:p-7">{children}</div>
    </div>
  );
}
