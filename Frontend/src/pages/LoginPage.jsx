import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ChevronRight } from 'lucide-react';
import api from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/auth/me');
        navigate('/dashboard');
      } catch (err) {
        // Not authenticated, stay on login page
        console.log(err)
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-10 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Video className="text-white" size={32} />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">
            DeepLens
          </h1>
          <p className="mt-2 text-slate-400">
            Convert video insights into visual maps.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-800/50 p-8 backdrop-blur-sm border border-slate-700">
          <h2 className="mb-6 text-lg font-medium text-slate-200">Welcome back</h2>
          
          <button
            onClick={handleLogin}
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-bold text-slate-900 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="h-5 w-5" 
            />
            Continue with Google
            <ChevronRight className="absolute right-4 h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
          </button>

          <p className="mt-6 text-xs text-slate-500">
            By continuing, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;