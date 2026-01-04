"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FileText, Download, Eye, Home, Share2, CheckCircle } from "lucide-react";

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

export default function ShareCertificatePage() {
  const params = useParams();
  const certId = params.id as string;
  
  const [cert, setCert] = useState<PublicCert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("certificates")
          .select(
            "id,document_type,verification_status,forgery_risk_score,extracted_student_name,extracted_institution_name,certificate_link,uploaded_at"
          )
          .eq("id", certId)
          .eq("verification_status", "VERIFIED")
          .single();

        if (fetchError) {
          setError("Certificate not found or not verified");
          return;
        }

        setCert(data as PublicCert);
      } catch (err) {
        setError("Failed to load certificate");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (certId) {
      fetchCertificate();
    }
  }, [certId]);

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
    const url = `${window.location.origin}/share/${certId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-xl">CertVerify</span>
            <p className="text-xs text-slate-400">Public Share</p>
          </div>
        </a>
        <a href="/" className="flex items-center gap-2 text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300">
          <Home size={18} />
          Home
        </a>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto mb-4"></div>
              <p className="text-slate-300">Loading certificate...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center backdrop-blur-lg animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
              <FileText size={24} className="text-red-400" />
            </div>
            <p className="text-lg text-red-300 mb-2">Unable to Load Certificate</p>
            <p className="text-sm text-red-400 mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200"
            >
              <Home size={16} />
              Back to Home
            </a>
          </div>
        ) : cert ? (
          <div className="space-y-6 animate-fade-in-up">
            {/* Certificate Card */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-8 backdrop-blur-lg shadow-2xl shadow-emerald-500/20">
              {/* Header with verification badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{cert.extracted_student_name || "Certificate"}</h1>
                    <p className="text-sm text-slate-400 mt-1">{cert.extracted_institution_name || "Unknown Institution"}</p>
                  </div>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Document Type</label>
                  <p className="text-sm text-white mt-1 bg-slate-700/50 px-3 py-2 rounded-lg inline-block">
                    {cert.document_type}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Verification Status</label>
                  <p className="text-sm text-white mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${getRiskColor(cert.forgery_risk_score)}`}>
                      <CheckCircle size={14} />
                      {cert.verification_status}
                    </span>
                  </p>
                </div>
                {cert.forgery_risk_score !== null && (
                  <div>
                    <label className="text-xs text-slate-400 font-semibold">Trust Score</label>
                    <p className="text-sm text-white mt-1">
                      <span className={`inline-block px-3 py-1.5 rounded-lg font-semibold ${getRiskColor(cert.forgery_risk_score)}`}>
                        {Math.round(cert.forgery_risk_score)}%
                      </span>
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-slate-400 font-semibold">Risk Assessment</label>
                  <p className="text-sm text-white mt-1">
                    <span className={`inline-block px-3 py-1.5 rounded-lg font-semibold ${getRiskColor(cert.forgery_risk_score)}`}>
                      {getRiskLabel(cert.forgery_risk_score)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {cert.certificate_link ? (
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={getPublicUrl(cert.certificate_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors duration-200 font-semibold"
                    >
                      <Eye size={18} />
                      View Document
                    </a>
                    <a
                      href={getPublicUrl(cert.certificate_link, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 transition-colors duration-200 font-semibold"
                    >
                      <Download size={18} />
                      Download
                    </a>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-sm">
                    Certificate document not available
                  </div>
                )}

                {/* Share Link Section */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <label className="text-xs text-slate-400 font-semibold block mb-3">Share This Certificate</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${certId}`}
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
                    Share this link with anyone to let them view and download this verified certificate.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Information */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 backdrop-blur-lg">
              <div className="flex gap-3">
                <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-emerald-400 mb-1">Verified Certificate</h3>
                  <p className="text-sm text-emerald-300/80">
                    This certificate has been verified through CertVerify's comprehensive validation process including institution registry checks and document authenticity verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
