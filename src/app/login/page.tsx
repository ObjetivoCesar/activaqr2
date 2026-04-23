import { login } from './actions';
import { Zap, ShieldCheck, Mail, Lock } from 'lucide-react';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#050505] text-white/90 font-sans selection:bg-brand/30">
      
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full animate-pulse"></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" 
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-1000">
        <div className="vision-window p-8 md:p-12 shadow-[0_40px_120px_rgba(0,0,0,0.8)] border-white/10 !bg-zinc-900/80 backdrop-blur-3xl relative overflow-hidden group">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="text-center mb-12 relative z-10">
            <div className="w-16 h-16 vision-pill bg-white flex items-center justify-center p-3.5 mx-auto mb-8 shadow-2xl shadow-brand/20 border-white/20">
               <Zap className="text-brand fill-current w-full h-full" />
            </div>
            <h1 className="text-3xl font-black mb-3 tracking-tighter uppercase text-white">ActivaQR Pro</h1>
            <p className="text-white/60 text-[10px] uppercase font-black tracking-[0.3em] italic">Enterprise Intelligence Hub</p>
          </div>

          <form action={login} className="space-y-8 relative z-10">
            {error && (
              <div className="p-4 vision-pill bg-red-500/10 border-red-500/20 text-red-400 text-[11px] font-black uppercase tracking-widest mb-8 text-center animate-in shake duration-500">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label 
                className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2" 
                htmlFor="email"
              >
                <Mail className="w-3 h-3" /> Digital Identifier
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@enterprise.com"
                  className="w-full bg-white/5 border border-white/20 text-white rounded-2xl px-5 py-4 outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/60 transition-all placeholder:text-white/30 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label 
                className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2" 
                htmlFor="password"
              >
                <Lock className="w-3 h-3" /> Security Protocol
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/20 text-white rounded-2xl px-5 py-4 outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/60 transition-all placeholder:text-white/30 text-sm font-medium"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-white text-black rounded-2xl py-4 font-black uppercase tracking-widest text-[11px] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-2xl flex items-center justify-center gap-2"
              >
                Establish Connection <ShieldCheck className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">
                Secure Layer 2.0 • Advanced Encryption Active
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
