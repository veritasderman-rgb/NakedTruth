'use client';

export default function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="rounded-md border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5 print:hidden">
      {label}
    </button>
  );
}
