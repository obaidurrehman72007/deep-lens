import React, { useEffect, useState } from "react";
import { 
  Copy, 
  ExternalLink, 
  Loader2, 
  Link as LinkIcon, 
  Check, 
  ArrowLeft, 
  LayoutDashboard,
  Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingScreen from "../components/LoadingScreen";

const Links = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        // Fetches all videos owned by the user
        const res = await api.get('/cards'); 
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch videos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleCopyLink = async (videoId) => {
    try {
      // Matches the backend route: router.post('/shared/:videoId')
      const res = await api.post(`/shared/${videoId}`);
      const token = res.data.token;

      // Construct the shareable public URL
      const shareUrl = `${window.location.origin}/public/share/${token}`;

      await navigator.clipboard.writeText(shareUrl);

      setCopiedId(videoId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      alert("Failed to generate link. Make sure you are the owner.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LoadingScreen/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* --- HEADER / NAVIGATION SECTION --- */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 uppercase tracking-wider">
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">Share Center</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <LinkIcon className="text-indigo-600" size={28} />
                Shareable Links
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Manage public access tokens for your video mind maps.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Video Workspace</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">YT ID</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map((video) => (
                  <tr key={video._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                            className="w-20 h-12 rounded-lg object-cover shadow-sm border border-slate-200"
                            alt="thumbnail"
                          />
                          <div className="absolute inset-0 bg-black/10 rounded-lg group-hover:bg-transparent transition-colors" />
                        </div>
                        <span className="font-bold text-slate-800 line-clamp-1 max-w-xs">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono font-bold">
                        {video.videoId}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-500">
                      {new Date(video.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          onClick={() => handleCopyLink(video._id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${
                            copiedId === video._id
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-white border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-indigo-100"
                          }`}
                        >
                          {copiedId === video._id ? (
                            <><Check size={16} /> Copied</>
                          ) : (
                            <><Copy size={16} /> Copy Link</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => navigate(`/canvas/${video._id}`)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Open Private Workspace"
                        >
                          <ExternalLink size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {videos.length === 0 && (
            <div className="p-20 text-center">
              <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                <Video size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No videos found</h3>
              <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                Go back to your library and add a video to generate shareable links.
              </p>
              <button 
                onClick={() => navigate('/dashboard')}
                className="mt-6 text-indigo-600 font-bold hover:underline"
              >
                Go to Library
              </button>
            </div>
          )}
        </div>
        
        <p className="mt-6 text-center text-slate-400 text-xs font-medium">
          Note: Anyone with the link can view the mind map and video.
        </p>
      </div>
    </div>
  );
};

export default Links;