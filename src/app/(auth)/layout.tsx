import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
        {children}
      </div>
    </div>
  );
}
