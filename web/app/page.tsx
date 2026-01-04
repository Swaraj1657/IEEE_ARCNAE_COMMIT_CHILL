import Image from "next/image";
import { Shield, Lock, Zap, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1000ms' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl">CertVerify</span>
        </div>
        <nav className="flex gap-6">
          <a href="/login" className="text-sm text-slate-300 hover:text-emerald-400 transition-colors duration-300 font-medium">Login</a>
          <a href="/signup" className="text-sm px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-all duration-300 font-medium">Get Started</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <section className="animate-fade-in-left space-y-8">
            <div className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-xs text-emerald-300 font-semibold">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Trusted by leading institutions worldwide
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight space-y-2">
              <div>Secure</div>
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-shift">
                Certificate Verification
              </div>
              <div>System</div>
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
              Protect academic integrity with AI-powered OCR, cryptographic verification, and blockchain security. Upload certificates and get instant, trustworthy verification results.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <Zap size={20} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm">AI-Powered OCR</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Lock size={20} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm">Blockchain Verified</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Shield size={20} className="text-emerald-400 flex-shrink-0" />
                <span className="text-sm">Secure Storage</span>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <a href="/login" className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105">
                Upload Certificate
              </a>
              <a href="/recruiter" className="px-6 py-3 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/10 text-white font-semibold transition-all duration-300">
                Recruiter Portal →
              </a>
            </div>
          </section>

          {/* Right Section - Certificate Card */}
          <section className="animate-fade-in-right">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl blur-xl"></div>
              
              {/* Certificate Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-white/10 backdrop-blur-lg hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">Certificate Verified</h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-xs text-emerald-300 font-semibold">Verified</span>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold">Student Name</label>
                        <p className="text-lg font-semibold">Rahul Kumar</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold">Degree</label>
                        <p className="text-lg font-semibold">B.Tech CSE</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold">Institution</label>
                        <p className="text-sm font-medium">BIT Mesra</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-semibold">Year</label>
                        <p className="text-sm font-medium">2024</p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Badge */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                      <CheckCircle size={16} />
                      <span>0x8a7b...3F2e</span>
                      <span className="animate-pulse">✓</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Blockchain Verified & Immutable</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { number: '10K+', label: 'Certificates Verified', delay: '0s' },
            { number: '99.9%', label: 'Accuracy Rate', delay: '0.1s' },
            { number: '150+', label: 'Partner Institutions', delay: '0.2s' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors duration-300 animate-fade-in-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-3xl font-bold text-emerald-400 mb-2">{stat.number}</div>
              <p className="text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Social</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-sm">
            <p>&copy; 2024 CertVerify. All rights reserved.</p>
            <p>Built with security and integrity in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
