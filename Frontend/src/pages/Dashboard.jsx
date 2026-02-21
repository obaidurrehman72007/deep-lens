import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Swal from 'sweetalert2';
import {
  Plus,
  Video,
  Loader2,
  LogOut,
  LayoutDashboard,
  Link as LinkIcon,
  ExternalLink,
  BadgeHelp,
  User,
  X,
  Sparkles,
  Search,
  SortAsc,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import VideoCard from "../components/VideoCard";
import LoadingScreen from "../components/LoadingScreen";

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ show: false, msg: "", type: "info" });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();
  const location = useLocation();

  const showAlert = (msg, type = "info") => {
    setStatus({ show: true, msg, type });
    setTimeout(() => setStatus({ show: false, msg: "", type: "info" }), 4000);
  };

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const [videoRes, userRes] = await Promise.all([
          api.get("/cards"),
          api.get("/auth/me")
        ]);
        setVideos(videoRes.data || []);
        setUser(userRes.data);
      } catch (err) {
        if (err.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, [navigate]);

  const filteredAndSortedVideos = useMemo(() => {
    let result = [...videos];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((v) =>
        (v.title || "").toLowerCase().includes(query) || 
        (v._id || "").toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "alpha") {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB);
      }
      if (sortBy === "id") return (a._id || "").localeCompare(b._id || "");
      return 0;
    });

    return result;
  }, [videos, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedVideos.length / itemsPerPage);
  const paginatedVideos = filteredAndSortedVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!url) return;
    setSubmitting(true);
    try {
      const res = await api.post('/video/add', { url });
      if (res.data?._id) {
        setVideos((prev) => [res.data, ...prev]);
        setUrl('');
        showAlert("Neural map initialized", "success");
      }
    } catch (err) {
      showAlert(err.response?.data?.error || "Analysis failed", "warning");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisitShareLink = (e) => {
    e.preventDefault();
    if (!shareLink) return;
    try {
      const urlObj = new URL(shareLink.includes('http') ? shareLink : `https://${shareLink}`);
      const shareId = urlObj.pathname.split('/').pop();
      if (shareId && shareId.length > 5) {
        navigate(`/public/share/${shareId}`);
      } else {
        showAlert("Format unrecognized", "warning");
      }
    } catch (err) {
      showAlert("Parse error", "warning");
    }
  };

  const deleteVideo = async (id) => {
    Swal.fire({
      title: 'Decommission Canvas?',
      text: "Data extraction and associated nodes will be purged.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#f8fafc',
      iconColor: '#ef4444',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Purge',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-3xl border border-slate-700 shadow-2xl',
        confirmButton: 'px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest',
        cancelButton: 'px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/cards/${id}`);
          setVideos(videos.filter((v) => v._id !== id));
          showAlert("Record deleted", "info");
        } catch (err) {
          showAlert("Deletion failed", "warning");
        }
      }
    });
  };

  const handleLogout = async () => {
    await api.get("/auth/logout");
    localStorage.removeItem('isLoggedIn');
    navigate("/");
  };

  if (loading) return <LoadingScreen message="Syncing Neural Interface..." />;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans selection:bg-indigo-100">
      {status.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${status.type === 'warning' ? 'bg-red-500/10 border-red-500/20 shadow-red-500/10' : 'bg-slate-900/95 border-slate-700 shadow-indigo-500/20'}`}>
            <div className={`p-1.5 rounded-lg ${status.type === 'warning' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
              {status.type === 'warning' ? <X size={18} /> : <Sparkles size={18} />}
            </div>
            <p className="text-slate-100 text-sm font-semibold pr-6 tracking-tight">{status.msg}</p>
            <button onClick={() => setStatus({ ...status, show: false })} className="text-slate-500 hover:text-white transition-colors">
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur-xl px-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between h-18">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 font-black text-2xl text-slate-900 tracking-tighter cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Video size={22} fill="currentColor" />
              </div>
              <span className="hidden sm:inline tracking-tighter">DeepLens</span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {[
                { label: 'Library', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
                { label: 'Links', path: '/links', icon: <LinkIcon size={18} /> },
                { label: 'Guide', path: '/howtouse', icon: <BadgeHelp size={18} /> },
                { label: 'Developer', path: '/developer', icon: <User size={18} /> }
              ].map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${location.pathname === link.path ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:bg-slate-100"}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                {user?.name?.charAt(0) || <User size={12}/>}
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{user?.name || "Explorer"}</span>
            </div>
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Terminal Active
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">
            {user?.displayName?.split(' ')[0]}'s <span className="text-indigo-600">Workspace</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
            Analyze, deconstruct, and archive your intelligence maps.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Plus size={24} strokeWidth={3} />
              </div>
              <div>
                <h2 className="font-black uppercase text-[11px] tracking-widest text-slate-400">Initialize</h2>
                <p className="font-bold text-slate-900">Analyze New Video</p>
              </div>
            </div>
            <form onSubmit={handleAddVideo} className="flex gap-3">
              <input
                type="url"
                placeholder="Paste YouTube source URL..."
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
              />
              <button disabled={submitting} className="bg-slate-900 px-8 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-200">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : "Inject"}
              </button>
            </form>
          </div>

          <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                <ExternalLink size={24} strokeWidth={3} />
              </div>
              <div>
                <h2 className="font-black uppercase text-[11px] tracking-widest text-slate-400">Collaborate</h2>
                <p className="font-bold text-slate-900">Enter Shared Space</p>
              </div>
            </div>
            <form onSubmit={handleVisitShareLink} className="flex gap-3">
              <input
                type="text"
                placeholder="Paste transmission link..."
                required
                value={shareLink}
                onChange={(e) => setShareLink(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button type="submit" className="bg-emerald-600 px-8 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-200">
                Sync
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white rounded-[3rem] border border-slate-200 p-8 md:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Library
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                {filteredAndSortedVideos.length} Artifacts
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search videos by id ....."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold transition-all"
                />
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                <SortAsc size={18} className="text-slate-400 ml-2" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer pr-4"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="alpha">A-Z</option>
                  <option value="id">By ID</option>
                </select>
              </div>
            </div>
          </div>

          {paginatedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 animate-pulse">
                {searchQuery ? <Filter size={32} /> : <Video size={32} />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {searchQuery ? "No Matches Found" : "Archive Empty"}
              </h3>
            </div>
          ) : (
            <>
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedVideos.map((video) => (
                  <div key={video._id} className="transform transition-all duration-500 hover:-translate-y-2">
                    <VideoCard video={video} onDelete={deleteVideo} />
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-16 border-t border-slate-100 pt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;