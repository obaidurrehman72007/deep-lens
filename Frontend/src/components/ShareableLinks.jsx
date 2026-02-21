import React, { useState, useEffect } from "react";
import { Link2, Copy, Check, ExternalLink, Share2, Loader2 } from "lucide-react";
import api from "../services/api";

const ShareableLinks = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copyStatus, setCopyStatus] = useState({}); // Track copy per ID

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        // Fetch videos to see which ones we can share
        const res = await api.get("/cards"); 
        setVideos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleShare = async (videoId) => {
    try {
      const res = await api.post(`/share/${videoId}`);
      const shareUrl = `${window.location.origin}/public/view/${res.data.token}`;
      
      navigator.clipboard.writeText(shareUrl);
      
      // Update local state to show "Copied"
      setCopyStatus({ ...copyStatus, [videoId]: true });
      setTimeout(() => setCopyStatus({ ...copyStatus, [videoId]: false }), 2000);
      
      // Optional: Refresh list if you want to store the token in the UI
    } catch (err) {
      alert("Failed to generate link");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Link2 className="text-indigo-600" size={32} />
          Shared Workspaces
        </h1>
        <p className="text-slate-500 mt-2">Generate public links for your mind maps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <Share2 size={24} />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1 truncate">
              {video.title || "Untitled Video"}
            </h3>
            <p className="text-sm text-slate-400 mb-6">ID: {video.videoId}</p>

            <button
              onClick={() => handleShare(video._id)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${
                copyStatus[video._id] 
                ? "bg-green-500 text-white" 
                : "bg-slate-900 text-white hover:bg-indigo-600"
              }`}
            >
              {copyStatus[video._id] ? <Check size={18} /> : <Copy size={18} />}
              {copyStatus[video._id] ? "LINK COPIED" : "GENERATE & COPY"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShareableLinks;