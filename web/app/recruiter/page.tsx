"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function RecruiterPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  useEffect(()=>{
    const fn = async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id,extracted_student_name,extracted_institution_name,document_type,verification_status,forgery_risk_score,certificate_link,uploaded_at")
        .eq("verification_status","VERIFIED")
        .order("uploaded_at", { ascending: false });
      if (!error) setRows(data||[]);
    };
    fn();
  },[]);

  const filtered = rows.filter(r=>{
    const s = `${r.extracted_student_name||""} ${r.extracted_institution_name||""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-emerald-500" />
          <span className="font-semibold">CertVerify</span>
        </div>
        <a href="/" className="text-sm text-slate-600">Home</a>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Recruiter Portal</h1>
        <p className="text-sm text-slate-600">Browse verified certificates</p>
        <div className="mt-4">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name or institution" className="w-full rounded-md border px-3 py-2" />
        </div>
        <div className="mt-6 bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Institution</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Score</th>
                <th className="p-3 text-left">Link</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r=> (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.extracted_student_name || "Unknown"}</td>
                  <td className="p-3">{r.extracted_institution_name || "Institution"}</td>
                  <td className="p-3">{r.document_type}</td>
                  <td className="p-3">{r.forgery_risk_score ?? "-"}</td>
                  <td className="p-3">
                    {r.certificate_link ? (
                      <a className="text-emerald-600" href={getPublicUrl(r.certificate_link)} target="_blank">Open</a>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function getPublicUrl(path: string){
  const { data } = supabase.storage.from("Certificates").getPublicUrl(path);
  return data.publicUrl;
}