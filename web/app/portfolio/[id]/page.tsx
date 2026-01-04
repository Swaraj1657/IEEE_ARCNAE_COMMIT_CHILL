"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Download, Eye, Home, Share2, CheckCircle, Award, Building2 } from "lucide-react";

type PublicCert = {
  id: string;
  document_type: string;
  verification_status: string;
  forgery_risk_score: number | null;
  extracted_student_name: string | null;
  extracted_institution_name: string | null;
  certificate_link: string | null;
  uploaded_at: string;
};

export default function PortfolioPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [certs, setCerts] = useState<PublicCert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCert, setSelectedCert] = useState<PublicCert | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("certificates")
          .select(
            "id,document_type,verification_status,forgery_risk_score,extracted_student_name,extracted_institution_name,certificate_link,uploaded_at"
          )
          .eq("owner_id", userId)
          .eq("verification_status", "VERIFIED")
          .order("uploaded_at", { ascending: false });

        if (fetchError) {
          setError("Unable to load certificates");
          return;
        }

        setCerts(data as PublicCert[]);
      } catch (err) {
        setError("Failed to load certificates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCertificates();
    }
  }, [userId]);

  const getPublicUrl = (path: string, download?: boolean) => {
    const { data } = supabase.storage.from("Certificates").getPublicUrl(path, download ? { download: true } : undefined);
    return data.publicUrl;
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return "bg-slate-500/20 text-slate-400";
    if (score >= 80) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 50) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  const getRiskLabel = (score: number | null) => {
    if (score === null) return "Unknown";
    if (score >= 80) return "Verified ✓";
    if (score >= 50) return "Caution";
    return "Risk";
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/portfolio/${userId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStudentName = () => {
    if (certs.length > 0 && certs[0].extracted_student_name) {
      return certs[0].extracted_student_name;
    }
    return "Certificate Portfolio";
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
        <a href="/" className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <Award size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl">CertVerify</span>
            <p className="text-xs text-slate-400">Certificate Portfolio</p>
          </div>
        </a>
        <a href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300">
          <Home size={18} />
          Home
        </a>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Loading certificates...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-lg animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
              <FileText size={24} className="text-red-400" />
            </div>
            <p className="text-lg text-red-300 mb-2">Unable to Load Portfolio</p>
            <p className="text-sm text-red-400 mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200"
            >
              <Home size={16} />
              Back to Home
            </a>
          </div>
        ) : certs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900 p-12 text-center backdrop-blur-lg animate-fade-in-up">
            <Award size={48} className="mx-auto mb-4 text-slate-500" />
            <p className="text-lg text-slate-300 mb-2">No Verified Certificates</p>
            <p className="text-sm text-slate-400">This portfolio has no verified certificates yet</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {/* Portfolio Header */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-8 backdrop-blur-lg shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{getStudentName()}</h1>
                  <p className="text-slate-400">Verified Certificate Portfolio</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-400">{certs.length}</div>
                  <p className="text-sm text-slate-400">Verified Certificate{certs.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Share Link Section */}
              <div className="pt-6 border-t border-white/5">
                <label className="text-xs text-slate-400 font-semibold block mb-3">Share This Portfolio</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portfolio/${userId}`}
                    readOnly
                    className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-slate-800/50 text-slate-300 text-sm"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                      copied
                        ? "bg-emerald-500/30 text-emerald-400"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                  >
                    <Share2 size={16} />
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Share this link to showcase all your verified certificates to employers and recruiters.
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 p-4 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-emerald-400" />
                  <span className="text-xs text-slate-400 font-semibold">All Verified</span>
                </div>
                <div className="text-2xl font-bold text-emerald-400">{certs.length}</div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-4 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-xs text-slate-400 font-semibold">Types</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{new Set(certs.map(c => c.document_type)).size}</div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-4 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} className="text-purple-400" />
                  <span className="text-xs text-slate-400 font-semibold">Institutions</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{new Set(certs.map(c => c.extracted_institution_name)).size}</div>
              </div>
            </div>

            {/* Certificates Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certs.map((c, idx) => (
                  <div
                    key={c.id}
                    className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-5 backdrop-blur-lg hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => setSelectedCert(c)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle size={18} className="text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{c.extracted_student_name || "Student"}</p>
                          <p className="text-xs text-slate-400 truncate">{c.extracted_institution_name || "Institution"}</p>
                          <p className="text-xs text-slate-500 mt-1">{c.document_type}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0 ${getRiskColor(c.forgery_risk_score)}`}>
                        {c.forgery_risk_score !== null && <span>{Math.round(c.forgery_risk_score)}%</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-3 border-b border-white/5">
                      <span>{new Date(c.uploaded_at).toLocaleDateString()}</span>
                      <span>{getRiskLabel(c.forgery_risk_score)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.certificate_link && (
                        <>
                          <a
                            href={getPublicUrl(c.certificate_link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200 text-xs font-semibold"
                          >
                            <Eye size={14} />
                            View
                          </a>
                          <a
                            href={getPublicUrl(c.certificate_link, true)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors duration-200 text-xs font-semibold"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Information */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 backdrop-blur-lg">
              <div className="flex gap-3">
                <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-emerald-400 mb-1">All Certificates Verified</h3>
                  <p className="text-sm text-emerald-300/80">
                    Every certificate in this portfolio has been verified through CertVerify's comprehensive validation process including institution registry checks and document authenticity verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Certificate Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedCert(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full backdrop-blur-lg" onClick={e => e.stopPropagation()}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-2">{selectedCert.extracted_student_name}</h2>
              <p className="text-sm text-slate-400">{selectedCert.extracted_institution_name}</p>
            </div>

            <div className="space-y-3 mb-6 pb-6 border-b border-white/5">
              <div>
                <label className="text-xs text-slate-400 font-semibold">Document Type</label>
                <p className="text-sm text-white mt-1">{selectedCert.document_type}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-semibold">Status</label>
                <p className="text-sm text-white mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs ${getRiskColor(selectedCert.forgery_risk_score)}`}>
                    <CheckCircle size={14} />
                    {selectedCert.verification_status}
                  </span>
                </p>
              </div>
              {selectedCert.forgery_risk_score !== null && (
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Trust Score</label>
                  <p className="text-sm text-white mt-1">{Math.round(selectedCert.forgery_risk_score)}%</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {selectedCert.certificate_link && (
                <>
                  <a
                    href={getPublicUrl(selectedCert.certificate_link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200 font-semibold"
                  >
                    <Eye size={16} />
                    View
                  </a>
                  <a
                    href={getPublicUrl(selectedCert.certificate_link, true)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors duration-200 font-semibold"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </>
              )}
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors duration-200 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
