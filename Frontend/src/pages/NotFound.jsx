import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, RefreshCcw, Search } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full text-center z-10">
        {/* Animated Error Code */}
        <div className="relative inline-block mb-8">
          <h1 className="text-[12rem] font-black text-white opacity-5 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Search size={80} className="text-indigo-500 animate-pulse" strokeWidth={1.5} />
              <div className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 rounded-full animate-ping" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-white tracking-tight">
            Signal Lost in <span className="text-indigo-500">DeepLens</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
            The neural map you're looking for doesn't exist or has been moved to a private sector.
          </p>

          {/* Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            >
              <Home size={20} />
              Return Dashboard
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 px-6 rounded-2xl border border-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCcw size={20} />
              Retry Connection
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div 
          className="absolute bottom-0 left-0 w-full h-64 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to top, #4f46e5 1px, transparent 1px), linear-gradient(to right, #4f46e5 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to top, black, transparent)'
          }}
        />
      </div>
    </div>
  );
};

export default NotFound;