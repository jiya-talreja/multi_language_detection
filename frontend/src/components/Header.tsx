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
        </div>
      </div>
    </header>
  );
};

export default Header;
