import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import { 
  Maximize, 
  Loader2, 
  Info, 
  MousePointer2, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Layout,
  Eye,
  UserCircle
} from "lucide-react";
import api from "../services/api";

// --- IMPORTANT: IMPORT YOUR PRIVATE COMPONENTS ---
import MindMapCanvas from "../components/MindMapCanvas"; 
import VideoNotebook from "../components/VideoNotebook";

const PublicCanvasView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const isOwner = data?.userId === currentUser?._id;
  const [currentUser, setCurrentUser] = useState(null);

  // 1. INITIALIZATION: Verify Token and Check Session
  useEffect(() => {
    const initializeSharedView = async () => {
      try {
        setLoading(true);
        
        // Fetch public data via token (Backend allows this unprotected)
        const res = await api.get(`/shared/${token}`);
        setData(res.data);
        if (res.data.camera) setCamera(res.data.camera);

        // Check if user has an active session
        try {
          const authCheck = await api.get("/auth/me");
          if (authCheck.data) setIsLoggedIn(true);
        } catch (e) {
          setIsLoggedIn(false); 
        }

      } catch (err) {
        setError("This shared link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };
    initializeSharedView();
  }, [token]);
  useEffect(() => {
  const checkUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setCurrentUser(res.data);
      // Optional: Store it so you don't have to fetch again
      localStorage.setItem('userId', res.data._id);
    } catch (err) {
      setCurrentUser(null);
    }
  };
  checkUser();
}, []);

  // 2. READ-ONLY RENDERING ENGINE (For Unlogged Guests Only)
  useEffect(() => {
    if (loading || isLoggedIn || !data) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      data.elements?.forEach(el => {
        ctx.beginPath();
        ctx.strokeStyle = el.type === "eraser" ? "#ffffff" : el.color || "#4f46e5";
        ctx.fillStyle = el.color || "#4f46e5";
        ctx.lineWidth = (el.size || 2) / camera.zoom;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const { x, y, w, h, isFilled, text, points } = el;
        switch (el.type) {
          case "pencil":
          case "eraser":
            if (!points || points.length < 2) return;
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            break;
          case "rect":
            isFilled ? ctx.fillRect(x, y, w, h) : ctx.strokeRect(x, y, w, h);
            break;
          case "circle":
            ctx.beginPath();
            ctx.arc(x + w/2, y + h/2, Math.abs(w/2), 0, Math.PI * 2);
            isFilled ? ctx.fill() : ctx.stroke();
            break;
          case "text":
            ctx.font = `bold ${16 / camera.zoom}px Inter, sans-serif`;
            ctx.fillText(text || "", x, y);
            break;
          default: break;
        }
      });
      ctx.restore();
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [data, camera, loading, isLoggedIn]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Verifying Workspace</p>
    </div>
  );

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <Info className="text-red-500 mb-4" size={48} />
      <h1 className="text-2xl font-black text-slate-900 mb-2">Link Expired</h1>
      <p className="text-slate-500 mb-8">{error}</p>
      <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">Back to Home</button>
    </div>
  );

  // --- RENDER CHOICE A: LOGGED IN (Full Editor) ---
  if (isLoggedIn) {
    return (
      <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans">
        <header className="h-14 bg-indigo-700 text-white flex items-center justify-between px-6 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <UserCircle size={20} className="text-indigo-200" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-indigo-300">Logged-In Workspace</span>
              <h1 className="font-bold text-sm leading-none truncate max-w-[300px]">{data?.videoTitle}</h1>
            </div>
          </div>
          <div className="text-[10px] font-bold bg-indigo-800 px-3 py-1 rounded-full border border-indigo-500/50">EDITOR MODE</div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 bg-black border-r border-slate-200">
            <ReactPlayer url={data?.videoUrl} width="100%" height="100%" controls />
          </div>
          
          <div className="w-1/2 flex flex-col">
            <div className="flex-[2] relative border-b border-slate-100">
              {/* Pass initialElements to prevent the 403 API call inside MindMapCanvas */}
              <MindMapCanvas 
                videoId={data?.videoId} 
                initialElements={data?.elements || []} 
                readOnly={false} 
                token={token}
                onNodeClick={(data) => data.timestamp && handleSeek(data.timestamp)}
              />
            </div>
            <div className="flex-1 bg-slate-50 overflow-hidden">
              <VideoNotebook 
                videoId={data?.videoId} 
                initialNotes={data?.notes} 
                onTimestampClick={handleSeek}
                readOnly={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER CHOICE B: GUEST (Read-Only Reader) ---
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden font-sans">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-100 rounded-xl">
            <Eye className="text-slate-600" size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-slate-900 leading-none mb-1 text-lg">{data?.videoTitle}</h1>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded w-fit">Public Preview</span>
          </div>
        </div>
        
        <button 
          onClick={() => navigate("/login", { state: { from: location.pathname } })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xl shadow-indigo-100"
        >
          Join Workspace to Edit <ArrowRight size={14} />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 bg-black flex items-center justify-center border-r border-slate-800">
          <ReactPlayer url={data?.videoUrl} width="100%" height="100%" controls />
        </div>

        <div className="w-1/2 relative bg-white overflow-hidden" ref={containerRef}>
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:32px_32px]"
               style={{ backgroundPosition: `${camera.x}px ${camera.y}px` }} />
          
          <canvas
            ref={canvasRef}
            onMouseDown={() => setIsPanning(true)}
            onMouseMove={(e) => isPanning && setCamera(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }))}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
            onWheel={(e) => setCamera(prev => ({ ...prev, zoom: Math.min(Math.max(prev.zoom - e.deltaY * 0.001, 0.4), 4) }))}
            className={`w-full h-full relative z-10 touch-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          />
          
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20 pointer-events-none">
            <div className="bg-slate-900/95 backdrop-blur-xl text-white px-6 py-4 rounded-[2rem] text-[10px] font-bold flex items-center gap-4 shadow-2xl border border-white/10 pointer-events-auto">
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <MousePointer2 size={14} className="text-indigo-400" /> DRAG PAN
              </div>
              <div className="flex items-center gap-2">
                <Maximize size={14} className="text-indigo-400" /> SCROLL ZOOM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCanvasView;