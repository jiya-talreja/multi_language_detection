import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] pointer-events-auto">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
              J
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-semibold tracking-tight text-[#1a1a2e]">
              JN<span className="text-violet-600">.ai</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#1a1a2e]/50 font-medium">
              Multilingual
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Languages', 'Pricing', 'API'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-sm font-medium text-[#1a1a2e]/70 hover:text-violet-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        <button className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-xl text-sm font-medium hover:bg-[#2a2a4e] hover:shadow-xl hover:shadow-violet-500/10 transition-all active:scale-95">
          Launch App
        </button>
      </div>
    </header>
  );
};

export default Header;
