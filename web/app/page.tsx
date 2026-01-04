import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-emerald-500" />
          <span className="font-semibold">CertVerify</span>
        </div>
        <nav className="flex gap-3">
          <a href="/login" className="text-sm hover:underline">Login</a>
          <a href="/signup" className="text-sm hover:underline">Get Started</a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <section>
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-300">Trusted by institutions</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
            Secure Certificate <span className="text-emerald-400">Verification</span> System
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            Protect academic integrity with AI-powered OCR and cryptographic checks. Upload documents and get instant verification scores.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="/login" className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium">Upload Certificate</a>
            <a href="/recruiter" className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium">Recruiter Portal</a>
          </div>
          <div className="mt-6 flex items-center gap-6 text-xs text-slate-400">
            <span>Blockchain Secured</span>
            <span>AI-Powered OCR</span>
            <span>End-to-End Encrypted</span>
          </div>
        </section>
        <section className="rounded-xl bg-white/5 p-6 border border-white/10">
          <div className="text-sm text-slate-300">Certificate Verified</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="text-slate-400">Student Name</div>
            <div>Rahul Kumar</div>
            <div className="text-slate-400">Degree</div>
            <div>B.Tech CSE</div>
            <div className="text-slate-400">Institution</div>
            <div>BIT Mesra</div>
            <div className="text-slate-400">Year</div>
            <div>2024</div>
          </div>
          <div className="mt-4 text-xs text-emerald-300">0x8a7b...3F2e ✓ Blockchain Verified</div>
        </section>
      </main>
    </div>
  );
}
