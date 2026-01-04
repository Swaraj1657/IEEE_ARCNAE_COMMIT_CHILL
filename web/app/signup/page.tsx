"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    // Try immediate sign-in to create session (needed for RLS)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // If email confirmation is enabled, sign-in may fail. Send to login.
      setLoading(false);
      router.push("/login");
      return;
    }

    const uid = signInData.session?.user?.id;
    if (uid) {
      // Upsert profile: save email and password in user_profiles per request
      await supabase
        .from("user_profiles")
        .upsert({ id: uid, username: email, password: password });
    }

    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white/5 p-6 border border-white/10 shadow">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-md bg-emerald-500" />
          <span className="font-semibold">CertVerify</span>
        </div>
        <h2 className="text-xl font-semibold">Create Account</h2>
        <p className="text-sm text-slate-300 mb-6">Sign up with email and password</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-1 w-full rounded-md bg-slate-900/60 border border-white/10 px-3 py-2 text-sm" placeholder="user@example.com" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required className="mt-1 w-full rounded-md bg-slate-900/60 border border-white/10 px-3 py-2 text-sm" placeholder="••••••••" />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button disabled={loading} className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium">
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4">Already have an account? <a className="text-emerald-300" href="/login">Login</a></p>
      </div>
    </div>
  );
}