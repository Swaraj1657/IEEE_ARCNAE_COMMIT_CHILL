"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("DEGREE");

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

    // 1) Upload file to Supabase storage
    const path = `${sessionUserId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("Certificates").upload(path, file, { upsert: false });
    if (uploadErr) {
      alert("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    // 2) Send to OCR API
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
      return;
    }

    if (!res.ok) {
      const msg = await res.text();
      alert("OCR API error: " + msg);
      setUploading(false);
      return;
    }
    const json = await res.json();
    const mapped = json.mapped_data;

    // 3) Insert into certificates table
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
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("owner_id", sessionUserId)
        .order("uploaded_at", { ascending: false });
      setCerts(data || []);
    }

    setUploading(false);
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-emerald-500" />
          <span className="font-semibold text-slate-800">CertVerify</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-slate-600">Home</a>
          <button className="text-sm" onClick={async()=>{await supabase.auth.signOut(); location.href="/login";}}>Logout</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold text-slate-800">My Certificates</h1>
        <p className="text-sm text-slate-600">Manage and track your academic credentials</p>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <StatCard title="Total" value={stats.total} />
          <StatCard title="Verified" value={stats.verified} />
          <StatCard title="Pending" value={stats.pending} />
          <StatCard title="Flagged" value={stats.flagged} />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-800">Upload Certificate</h2>
            <div className="flex items-center gap-2">
              <select value={docType} onChange={e=>setDocType(e.target.value)} className="rounded-md border px-2 py-1 text-sm text-slate-700 bg-white">
                <option>DEGREE</option>
                <option>MARKSHEET</option>
                <option>INTERNSHIP</option>
                <option>COURSE</option>
                <option>OTHER</option>
              </select>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e=>setFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-700" />
              <button disabled={uploading} onClick={onUpload} className="rounded-md bg-emerald-500 px-3 py-2 text-white text-sm">{uploading?"Uploading...":"Add Certificate"}</button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {certs.length === 0 && (
              <div className="rounded-lg border bg-white p-8 text-center text-slate-600">No Certificates Yet</div>
            )}
            {certs.map(c => {
              const b = badge(c);
              return (
                <div key={c.id} className="rounded-lg border bg-white p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.extracted_student_name || "Unknown"}</div>
                    <div className="text-sm text-slate-600">{c.extracted_institution_name || "Institution"} • {c.document_type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full text-white ${b.color}`}>{b.label}</span>
                    {c.certificate_link && (
                      <a className="text-sm text-emerald-600" href={getPublicUrl(c.certificate_link)} target="_blank">View</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }: {title: string; value: number}){
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function getPublicUrl(path: string){
  const { data } = supabase.storage.from("Certificates").getPublicUrl(path);
  return data.publicUrl;
}
