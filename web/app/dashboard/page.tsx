"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, FileText, CheckCircle, AlertCircle, Clock, LogOut, Home, Share2, Copy, Award } from "lucide-react";

type Certificate = {
  id: string;
  document_type: string;
  verification_status: string;
  forgery_risk_score: number | null;
  uploaded_at: string;
  extracted_student_name: string | null;
  extracted_institution_name: string | null;
  certificate_link: string | null;
};

export default function DashboardPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("DEGREE");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [portfolioCopied, setPortfolioCopied] = useState(false);

  // Messages that cycle during upload
  const cyclingMessages = [
    "Hang on...",
    "Processing your document...",
    "This may take a while...",
    "Analyzing certificate...",
    "Extracting information...",
    "Verifying details...",
    "Almost there...",
    "Finalizing...",
  ];

  // Cycle through messages while uploading
  useEffect(() => {
    if (!uploading) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % cyclingMessages.length);
    }, 4000); // Change message every 2.5 seconds
    return () => clearInterval(interval);
  }, [uploading]);

  useEffect(() => {
    const fn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      if (!uid) { window.location.href = "/login"; return; }
      setSessionUserId(uid);

      // Ensure profile exists; set username to email and avoid separate userid input
      const email = session?.user?.email || "";
      if (email) {
        // upsert ensures row exists without prompting for userid
        await supabase.from("user_profiles").upsert({ id: uid, username: email });
      }

      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("owner_id", uid)
        .order("uploaded_at", { ascending: false });
      setCerts(data || []);
    };
    fn();
  }, []);

  const onUpload = async () => {
    if (!sessionUserId) { alert("Not authenticated. Please log in."); return; }
    if (!file) { alert("Please choose a file before uploading."); return; }
    setUploading(true);
    setProcessingStep("Uploading certificate to storage...");

    // 1) Upload file to Supabase storage
    const path = `${sessionUserId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("Certificates").upload(path, file, { upsert: false });
    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      setUploading(false);
      setProcessingStep("");
      return;
    }

    // 2) Send to OCR API
    setProcessingStep("Processing document with AI...");
    const form = new FormData();
    form.append("file", file);
    const apiUrl = process.env.NEXT_PUBLIC_OCR_API_URL ?? "http://localhost:8000/api/verify-certificate";
    let res: Response;

    try {
      res = await fetch(apiUrl, {
        method: "POST",
        body: form,
      });
    } catch (err) {
      alert("OCR service is not reachable");
      setUploading(false);
      setProcessingStep("");
      return;
    }

    if (!res.ok) {
      const msg = await res.text();
      alert("OCR API error: " + msg);
      setUploading(false);
      setProcessingStep("");
      return;
    }
    
    setProcessingStep("Verifying information...");
    const json = await res.json();
    const mapped = json.mapped_data;

    // 3) Insert into certificates table
    setProcessingStep("Saving to database...");
    const insertPayload = {
      owner_id: sessionUserId,
      document_type: docType,
      certificate_link: path,
      ...mapped,
    };

    const { error: dbErr } = await supabase.from("certificates").insert(insertPayload);
    if (dbErr) {
      alert("DB insert failed: " + dbErr.message);
    } else {
      setProcessingStep("Refreshing your certificates...");
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("owner_id", sessionUserId)
        .order("uploaded_at", { ascending: false });
      setCerts(data || []);
    }

    setUploading(false);
    setProcessingStep("");
    setFile(null);
  };

  const stats = {
    total: certs.length,
    verified: certs.filter(c=>c.verification_status === "VERIFIED").length,
    pending: certs.filter(c=>c.verification_status === "PENDING").length,
    flagged: certs.filter(c=>c.verification_status === "FAILED").length,
  };

  const badge = (c: Certificate) => {
    const score = c.forgery_risk_score ?? 0;
    if (c.verification_status === "VERIFIED" || score >= 80) return { label: "Verified", color: "bg-emerald-500" };
    if (c.verification_status === "PARTIALLY_VERIFIED" || (score >= 50 && score < 80)) return { label: "Partial", color: "bg-yellow-500" };
    return { label: "Flagged", color: "bg-red-500" };
  };

  const copyShareLink = (certId: string) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Loading Modal */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-400 animate-spin" style={{ animation: 'spin 3s linear infinite' }}></div>
            
            {/* Inner rotating ring (opposite direction) */}
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-emerald-500 border-l-emerald-400 animate-spin" style={{ animation: 'spin 4s linear reverse' }}></div>
            
            {/* Content card */}
            <div className="relative w-80 h-96 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-8 flex flex-col items-center justify-center backdrop-blur-lg shadow-2xl shadow-emerald-500/20">
              {/* Center pulsing circle */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-emerald-400/30 animate-pulse" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
              </div>
              
              {/* Cycling messages */}
              <h3 className="text-2xl font-bold text-center text-emerald-400 h-10 flex items-center justify-center transition-all duration-500">
                {cyclingMessages[messageIndex]}
              </h3>
              
              {/* Processing step text */}
              <p className="text-sm text-slate-300 text-center mt-4 mb-6 min-h-[2.5rem] flex items-center justify-center">
                {processingStep}
              </p>
              
              {/* Animated dots */}
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              
              {/* Progress text */}
              <p className="text-xs text-slate-500 mt-6 text-center">This may take a few moments...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl">CertVerify</span>
            <p className="text-xs text-slate-400">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300">
            <Home size={18} />
            Home
          </a>
          <button 
            onClick={async()=>{await supabase.auth.signOut(); location.href="/login";}}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-red-400 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-red-500/10 border border-red-500/0 hover:border-red-500/30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Page Title with Portfolio Share */}
        <div className="mb-8 animate-fade-in-down flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
            <p className="text-slate-400">Manage and track your academic credentials</p>
          </div>
          {stats.verified > 0 && (
            <button
              onClick={() => {
                const portfolioUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${sessionUserId}`;
                navigator.clipboard.writeText(portfolioUrl);
                setPortfolioCopied(true);
                setTimeout(() => setPortfolioCopied(false), 2000);
              }}
              className={`relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 font-semibold ${
                portfolioCopied
                  ? "bg-emerald-500/30 border border-emerald-500/30 text-emerald-400"
                  : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30"
              }`}
              title="Share all your verified certificates"
            >
              {portfolioCopied ? (
                <>
                  <CheckCircle size={18} className="animate-bounce" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Award size={18} />
                  <span>Share Portfolio</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard icon={<FileText size={24} />} title="Total" value={stats.total} color="from-blue-500 to-blue-600" delay="0s" />
          <StatCard icon={<CheckCircle size={24} />} title="Verified" value={stats.verified} color="from-emerald-500 to-emerald-600" delay="0.1s" />
          <StatCard icon={<Clock size={24} />} title="Pending" value={stats.pending} color="from-yellow-500 to-yellow-600" delay="0.2s" />
          <StatCard icon={<AlertCircle size={24} />} title="Flagged" value={stats.flagged} color="from-red-500 to-red-600" delay="0.3s" />
        </div>

        {/* Upload Section */}
        <div className="mb-12 animate-fade-in-up">
          <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-8 backdrop-blur-lg">
            <div className="flex items-center gap-3 mb-6">
              <Upload size={24} className="text-emerald-400" />
              <h2 className="text-2xl font-bold">Upload Certificate</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Document Type</label>
                <select 
                  value={docType} 
                  onChange={e=>setDocType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                >
                  <option>DEGREE</option>
                  <option>MARKSHEET</option>
                  <option>INTERNSHIP</option>
                  <option>COURSE</option>
                  <option>OTHER</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Choose File</label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={e=>setFile(e.target.files?.[0] ?? null)}
                  className="w-full h-12 rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-sm text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Filename</label>
                <div className="px-4 py-3 rounded-lg border border-white/10 bg-slate-900/30 text-sm text-slate-400">
                  {file ? file.name : "No file selected"}
                </div>
              </div>

              <button 
                disabled={uploading || !file} 
                onClick={onUpload}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Add Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
          <div className="space-y-4">
            {certs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center backdrop-blur-lg">
                <FileText size={48} className="mx-auto mb-4 text-slate-500" />
                <p className="text-lg text-slate-300 mb-2">No Certificates Yet</p>
                <p className="text-sm text-slate-400">Upload your first certificate to get started</p>
              </div>
            ) : (
              certs.map((c, idx) => {
                const b = badge(c);
                return (
                  <div 
                    key={c.id} 
                    className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-6 backdrop-blur-lg hover:border-emerald-500/30 transition-all duration-300 transform hover:scale-105 group"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                          <FileText size={24} className="text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{c.extracted_student_name || "Unknown Student"}</div>
                          <div className="text-sm text-slate-400">{c.extracted_institution_name || "Institution"} • {c.document_type}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            Uploaded {new Date(c.uploaded_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-full text-white text-sm font-semibold ${
                          b.color === 'bg-emerald-500' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
                          b.color === 'bg-yellow-500' ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' :
                          'bg-red-500/20 border border-red-500/30 text-red-300'
                        }`}>
                          {b.label}
                        </div>
                        {c.certificate_link && (
                          <a 
                            className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-colors duration-300 text-sm font-semibold" 
                            href={getPublicUrl(c.certificate_link)} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View →
                          </a>
                        )}
                        {c.verification_status === "VERIFIED" && (
                          <button
                            onClick={() => copyShareLink(c.id)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                              copiedId === c.id
                                ? "bg-emerald-500/30 border-emerald-500/30 text-emerald-300"
                                : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                            }`}
                            title="Copy shareable link"
                          >
                            {copiedId === c.id ? (
                              <>
                                <CheckCircle size={16} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Share2 size={16} />
                                Share
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color, delay }: {icon: React.ReactNode; title: string; value: number; color: string; delay: string}){
  return (
    <div 
      className={`relative rounded-xl bg-gradient-to-br ${color} p-6 border border-white/10 backdrop-blur-lg overflow-hidden group hover:scale-105 transition-transform duration-300 animate-fade-in-up`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white/80">{title}</span>
          <div className="text-white/60">{icon}</div>
        </div>
        <div className="text-4xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function getPublicUrl(path: string){
  const { data } = supabase.storage.from("Certificates").getPublicUrl(path);
  return data.publicUrl;
}
