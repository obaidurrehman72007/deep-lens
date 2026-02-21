import React from "react";

const LoadingScreen = ({ message = "Synchronizing neural maps..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f172a] overflow-hidden">
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative flex flex-col items-center">
        {/* The Geometric Core Loader */}
        <div className="relative w-24 h-24 mb-12">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-t-2 border-r-2 border-indigo-500 rounded-full animate-spin" />
          
          {/* Middle Hexagon / Shield */}
          <div className="absolute inset-4 border-2 border-slate-700 rounded-lg rotate-45 animate-[ping_2s_ease-in-out_infinite]" />
          
          {/* Center Pulsing Dot */}
          <div className="absolute inset-[40%] bg-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-4 z-10">
          <h2 className="text-3xl font-bold text-white tracking-[0.2em] uppercase">
            Deep<span className="text-indigo-500">Lens</span>
          </h2>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-slate-400 text-sm font-light tracking-widest uppercase animate-pulse">
              {message}
            </p>
            
            {/* Minimalist Data-Track Progress */}
            <div className="relative w-64 h-[2px] bg-slate-800 overflow-hidden">
              <div className="absolute h-full w-24 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan" />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-scan {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
};

export default LoadingScreen;