"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, CheckCircle, FileText, Home, LogOut, Shield } from "lucide-react";

type Certificate = {
  id: string;
  extracted_student_name: string | null;
  extracted_institution_name: string | null;
  document_type: string;
  verification_status: string;
  forgery_risk_score: number | null;
  certificate_link: string | null;
  uploaded_at: string;
};

export default function RecruiterPage() {
  const [rows, setRows] = useState<Certificate[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("certificates")
        .select("id,extracted_student_name,extracted_institution_name,document_type,verification_status,forgery_risk_score,certificate_link,uploaded_at")
        .eq("verification_status", "VERIFIED")
        .order("uploaded_at", { ascending: false });
      if (!error) setRows(data || []);
      setLoading(false);
    };
    fn();
  }, []);

  const filtered = rows.filter(r => {
    const s = `${r.extracted_student_name || ""} ${r.extracted_institution_name || ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const getRiskColor = (score: number | null) => {
    if (score === null) return "bg-slate-500/20 text-slate-400";
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 50) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  const getRiskLabel = (score: number | null) => {
    if (score === null) return "Unknown";
    if (score >= 80) return "Safe";
    if (score >= 50) return "Caution";
    return "Risk";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl">CertVerify</span>
            <p className="text-xs text-slate-400">Recruiter Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300">
            <Home size={18} />
            Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Page Title */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Verified Certificates</h1>
          <p className="text-slate-400">Browse all verified and authenticated certificates from candidates</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by student name or institution..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-white/10 bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-400">
          {loading ? "Loading certificates..." : `${filtered.length} verified certificate${filtered.length !== 1 ? "s" : ""} found`}
        </div>

        {/* Table/Cards View */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Loading certificates...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center backdrop-blur-lg animate-fade-in-up">
            <FileText size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-lg text-slate-300 mb-2">No Certificates Found</p>
            <p className="text-sm text-slate-400">{q ? "Try adjusting your search filters" : "No verified certificates available yet"}</p>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 overflow-hidden backdrop-blur-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900/50 border-b border-white/5 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Student</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Institution</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Document Type</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Trust Score</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Date</th>
                      <th className="px-6 py-4 text-left font-semibold text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-slate-800/50 transition-colors duration-200 group" style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.05}s forwards`, opacity: 0 }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-emerald-400">
                                {(r.extracted_student_name || "?")[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{r.extracted_student_name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{r.extracted_institution_name || "Unknown Institution"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-200">
                            {r.document_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(r.forgery_risk_score)}`}>
                            {getRiskLabel(r.forgery_risk_score)}
                            {r.forgery_risk_score !== null && <span className="ml-1">{Math.round(r.forgery_risk_score)}%</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {new Date(r.uploaded_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {r.certificate_link ? (
                            <a
                              href={getPublicUrl(r.certificate_link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200 text-xs font-semibold"
                            >
                              <FileText size={14} />
                              View
                            </a>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filtered.map((r, idx) => (
                <div
                  key={r.id}
                  className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-4 backdrop-blur-lg hover:border-emerald-500/50 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold text-emerald-400">
                          {(r.extracted_student_name || "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{r.extracted_student_name || "Unknown"}</p>
                        <p className="text-sm text-slate-400 truncate">{r.extracted_institution_name || "Unknown Institution"}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${getRiskColor(r.forgery_risk_score)}`}>
                      <CheckCircle size={14} />
                      {getRiskLabel(r.forgery_risk_score)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 pb-3 border-b border-white/5">
                    <span className="bg-slate-700/50 px-2 py-1 rounded">
                      {r.document_type}
                    </span>
                    <span>{new Date(r.uploaded_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {r.forgery_risk_score !== null ? `Trust: ${Math.round(r.forgery_risk_score)}%` : "Trust: Unknown"}
                    </span>
                    {r.certificate_link ? (
                      <a
                        href={getPublicUrl(r.certificate_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200 text-xs font-semibold"
                      >
                        <FileText size={14} />
                        View
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getPublicUrl(path: string) {
  const { data } = supabase.storage.from("Certificates").getPublicUrl(path);
  return data.publicUrl;
}