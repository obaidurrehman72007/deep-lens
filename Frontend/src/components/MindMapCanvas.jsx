import React, { useState, useEffect, useRef } from "react";
import { 
  Pencil, Square, Circle, Type, Trash2, Diamond, ArrowRight, 
  MousePointer2, Maximize, Save, PaintBucket, Move, Eraser,
  Lock
} from "lucide-react";
import api from '../services/api'; 
import LoadingScreen from "./LoadingScreen";

const MindMapCanvas = ({ videoId, currentTime, token }) => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]); 
  const [tool, setTool] = useState("pencil");
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const [color, setColor] = useState("#4f46e5");
  const [isFilled, setIsFilled] = useState(false);
  const [brushSize, setBrushSize] = useState(2); 
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [status, setStatus] = useState({ show: false, msg: "", type: "info" });
  const [textModal, setTextModal] = useState({ show: false, x: 0, y: 0, value: "" });
  
  const canEdit = true;
  const colors = ["#000000", "#4f46e5", "#ef4444", "#22c55e", "#f59e0b", "#ec4899"];

  const showAlert = (msg, type = "info") => {
    setStatus({ show: true, msg, type });
    setTimeout(() => setStatus({ show: false, msg: "", type: "info" }), 3000);
  };

  useEffect(() => {
    const loadCanvas = async () => {
      try {
        setLoading(true);
        let res;
        if (token) {
          res = await api.get(`/shared-canvas/${token}`);
          setElements(res.data.canvasData?.elements || []);
          setCamera(res.data.canvasData?.camera || { x: 0, y: 0, zoom: 1 });
          setOwnerId(res.data.userId);
        } else if (videoId) {
          res = await api.get(`/canvas/${videoId}`);
          const canvasData = res.data;
          setElements(canvasData.elements || []);
          setCamera(canvasData.camera || { x: 0, y: 0, zoom: 1 });
          setOwnerId(canvasData.userId); 
        }
      } catch (err) { console.error("Canvas Load Error:", err); } 
      finally { setLoading(false); }
    };
    if (videoId || token) loadCanvas();
  }, [videoId, token]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !elements) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    
    elements.forEach(el => {
      if (!el) return;
      ctx.beginPath();
      ctx.strokeStyle = el.type === "eraser" ? "#ffffff" : el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = (el.size || 2) / camera.zoom;
      ctx.lineJoin = "round";
      ctx.lineCap = "round"; 
      const { x, y, w, h, isFilled: elFilled } = el;
      
      switch (el.type) {
        case "pencil":
        case "eraser":
          if (!el.points || el.points.length < 2) return;
          ctx.moveTo(el.points[0].x, el.points[0].y);
          el.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
          break;
        case "rect":
          elFilled ? ctx.fillRect(x, y, w, h) : ctx.strokeRect(x, y, w, h);
          break;
        case "diamond":
          ctx.moveTo(x + w / 2, y);
          ctx.lineTo(x + w, y + h / 2);
          ctx.lineTo(x + w / 2, y + h);
          ctx.lineTo(x, y + h / 2);
          ctx.closePath();
          elFilled ? ctx.fill() : ctx.stroke();
          break;
        case "circle":
          ctx.beginPath();
          ctx.arc(x + w/2, y + h/2, Math.abs(w/2), 0, Math.PI * 2);
          elFilled ? ctx.fill() : ctx.stroke();
          break;
        case "text":
          ctx.font = `bold ${16 / camera.zoom}px Inter`;
          ctx.fillText(el.text || "", x, y);
          break;
        case "arrow":
          const headlen = 10 / camera.zoom;
          const angle = Math.atan2(h, w);
          ctx.moveTo(x, y);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + w - headlen * Math.cos(angle - Math.PI/6), y + h - headlen * Math.sin(angle - Math.PI/6));
          ctx.moveTo(x + w, y + h);
          ctx.lineTo(x + w - headlen * Math.cos(angle + Math.PI/6), y + h - headlen * Math.sin(angle + Math.PI/6));
          ctx.stroke();
          break;
      }
    });
    ctx.restore();
  }, [elements, camera]);

  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - camera.x) / camera.zoom,
      y: (e.clientY - rect.top - camera.y) / camera.zoom
    };
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    if (tool === "hand") { setIsPanning(true); return; }
    if (!canEdit) return showAlert("Read-only mode", "error");
    
    const pos = getPointerPos(e);
    if (tool === "select") {
      const idx = elements.findLastIndex(el => Math.abs(el.x - pos.x) < 30 && Math.abs(el.y - pos.y) < 30);
      if (idx > -1) { setElements(elements.filter((_, i) => i !== idx)); showAlert("Deleted", "error"); }
      return;
    }
    if (tool === "text") { setTextModal({ show: true, x: pos.x, y: pos.y, value: "" }); return; }
    
    setIsDrawing(true);
    setElements([...elements, { id: Date.now(), type: tool, x: pos.x, y: pos.y, w: 0, h: 0, color, isFilled, size: brushSize, points: [pos] }]);
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      setCamera(prev => ({ ...prev, x: prev.x + e.movementX, y: prev.y + e.movementY }));
      return;
    }
    if (!isDrawing) return;
    
    const pos = getPointerPos(e);
    const updated = [...elements];
    const el = updated[updated.length - 1];
    if (tool === "pencil" || tool === "eraser") el.points.push(pos);
    else { el.w = pos.x - el.x; el.h = pos.y - el.y; }
    setElements(updated);
  };

  const finalizeText = () => {
    if (textModal.value.trim()) setElements([...elements, { id: Date.now(), type: "text", x: textModal.x, y: textModal.y, text: textModal.value, color }]);
    setTextModal({ show: false, x: 0, y: 0, value: "" });
  };

  if (loading) return <div className="h-full flex items-center justify-center bg-slate-50"><LoadingScreen/></div>;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden font-sans border-t border-slate-200">
      {status.show && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 rounded-full shadow-lg text-white text-sm font-bold bg-indigo-600">{status.msg}</div>}
      
      {/* Text Modal */}
      {textModal.show && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
            <h3 className="text-lg font-bold mb-4">Add Text</h3>
            <input autoFocus className="w-full p-3 border rounded-xl mb-4 outline-none ring-2 ring-indigo-500" value={textModal.value} onChange={e => setTextModal({...textModal, value: e.target.value})} onKeyDown={e => e.key === 'Enter' && finalizeText()} />
            <div className="flex gap-2">
               <button onClick={finalizeText} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold">Apply</button>
               <button onClick={() => setTextModal({show:false, x:0, y:0, value:""})} className="flex-1 bg-slate-100 py-2 rounded-lg text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="p-3 bg-white border-b flex flex-col lg:flex-row flex-wrap   gap-2 items-center justify-between shadow-sm z-10">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border">
          <ToolBtn active={tool==="select"} onClick={()=>setTool("select")} icon={<MousePointer2 size={18}/>} />
          <ToolBtn active={tool==="hand"} onClick={()=>setTool("hand")} icon={<Move size={18}/>} />
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <ToolBtn active={tool==="pencil"} onClick={()=>setTool("pencil")} icon={<Pencil size={18}/>} />
          <ToolBtn active={tool==="eraser"} onClick={()=>setTool("eraser")} icon={<Eraser size={18}/>} />
          <ToolBtn active={tool==="rect"} onClick={()=>setTool("rect")} icon={<Square size={18}/>} />
          <ToolBtn active={tool==="diamond"} onClick={()=>setTool("diamond")} icon={<Diamond size={18}/>} />
          <ToolBtn active={tool==="circle"} onClick={()=>setTool("circle")} icon={<Circle size={18}/>} />
          <ToolBtn active={tool==="arrow"} onClick={()=>setTool("arrow")} icon={<ArrowRight size={18}/>} />
          <ToolBtn active={tool==="text"} onClick={()=>setTool("text")} icon={<Type size={18}/>} />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border">
            {colors.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-indigo-400' : ''}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-20" />
          <button onClick={() => setIsFilled(!isFilled)} className={`p-2 rounded-xl border ${isFilled ? 'bg-indigo-600 text-white' : ''}`}><PaintBucket size={18}/></button>
          <button onClick={() => setCamera({x:0, y:0, zoom:1})}><Maximize size={18}/></button>
          <button onClick={() => setElements([])} className="text-red-500"><Trash2 size={18}/></button> 
          <button onClick={async () => { await api.post(`/canvas/${videoId}/save`, { elements, camera, currentTime }); showAlert("Synced", "success"); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">SYNC</button>
        </div>
      </div>

      {/* Canvas Layer */}
      <div className="flex-1 w-full h-full relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
        <canvas 
          ref={canvasRef}
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => {setIsDrawing(false); setIsPanning(false);}}
          onWheel={(e) => setCamera(prev => ({ ...prev, zoom: Math.min(Math.max(prev.zoom - e.deltaY * 0.001, 0.5), 3) }))}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

const ToolBtn = ({ active, onClick, icon }) => (
  <button onClick={onClick} className={`p-2.5 rounded-lg transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{icon}</button>
);

export default MindMapCanvas;