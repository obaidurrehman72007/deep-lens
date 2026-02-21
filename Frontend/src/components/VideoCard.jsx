import React, { useState } from "react";
import { Trash2, ExternalLink, Share2, Check, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Ensure this path is correct for your axios instance

const VideoCard = ({ video, onDelete }) => {
  const navigate = useNavigate();
  
  const [copySuccess, setCopySuccess] = useState(false);

  // Helper to ensure we have a valid thumbnail URL
  const thumbnailUrl = video.videoId
    ? `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`
    : "https://via.placeholder.com/320x180?text=No+Thumbnail";

 const handleShare = async () => {
  try {
    const response = await api.post(`/shared/${video._id}`);
    const token = response.data.token;
    
    // THIS MUST MATCH THE ROUTE IN APP.JSX
    const publicUrl = `${window.location.origin}/public/share/${token}`;
    
    await navigator.clipboard.writeText(publicUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  } catch (err) {
    alert("Share failed",err);
  }
};

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="aspect-video w-full bg-slate-100 overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/320x180?text=Video+Not+Found";
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        
        <h3 className="mb-1 line-clamp-1 font-bold text-slate-900">
          {video.createdAt
            ? new Date(video.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Untitled Video"}
        </h3>
        <p className="mb-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Video ID: {video.videoId || "N/A"}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/canvas/${video._id}`)}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Open Canvas <ExternalLink size={14} />
            </button>

            {/* SHARE BUTTON */}
            <button
              onClick={handleShare}
              
              className={`flex items-center gap-2 text-sm font-bold transition-all ${
                copySuccess 
                ? "text-green-600" 
                : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              {copySuccess ? (
                <>Copied! <Check size={14} /></>
              ) : (
                <>Share <Share2 size={14} /></>
              )}
            </button>
          </div>

          <button
            onClick={() => onDelete(video._id)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
            title="Delete video"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;