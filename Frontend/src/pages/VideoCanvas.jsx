import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Swal from "sweetalert2";
import VideoPlayer from "../components/VideoPlayer";
import MindMapCanvas from "../components/MindMapCanvas";
import VideoNotebook from "../components/VideoNotebook";
import LoadingScreen from "../components/LoadingScreen";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Lock,
  History,
  X,
  User,
  Activity,
} from "lucide-react";
const VideoCanvas = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [player, setPlayer] = useState(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const goToDashboard = useCallback(() => navigate("/dashboard"), [navigate]);
  const goToDefault = useCallback(() => navigate("/"), [navigate]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        try {
          const userRes = await api.get("/auth/me");
          setCurrentUser(userRes.data);
        } catch (err) {
          console.log("Session: Guest Mode");
        }
        let res;
        if (token) {
          res = await api.get(`/shared-canvas/${token}`);
          setIsPublicView(true);
          setVideo({
            _id: res.data.videoId,
            userId: res.data.ownerId || res.data.userId,
            title: res.data.videoTitle || "Shared Workspace",
            videoId: res.data.youtubeId,
          });
        } else if (id && id !== "undefined") {
          res = await api.get(`/video/${id}`);
          setVideo(res.data);
          setIsPublicView(false);
        } else {
          goToDashboard();
          return;
        }
      } catch (err) {
        console.error("Initialization Error:", err);
        if (token) {
          Swal.fire({
            title: "Access Denied",
            text: "This shared link is invalid or has expired.",
            icon: "error",
            background: "#0f172a",
            color: "#f8fafc",
            iconColor: "#6366f1",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Return to Home",
            customClass: {
              popup: "rounded-3xl border border-slate-700 shadow-2xl",
              confirmButton:
                "px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest",
            },
          }).then(() => goToDefault());
        } else {
          goToDefault();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token, goToDashboard]);
  const toggleLogs = async () => {
    const nextState = !showLogs;
    setShowLogs(nextState);
    if (nextState && video?._id) {
      try {
        const res = await api.get(`/video/${video._id}/logs`);
        setLogs(res.data);
      
      } catch (err) {
        console.error("Log Fetch Error", err);
      }
    }
  };
  const handleSeek = useCallback(
    (timestamp) => {
      if (player) {
        const seconds =
          typeof timestamp === "string"
            ? timestamp.split(":").reduce((acc, time) => 60 * acc + +time)
            : timestamp;
        player.seekTo(seconds, true);
        player.playVideo();
      }
    },
    [player],
  );
  if (loading) return <LoadingScreen message="Initializing workspace..." />;
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden font-sans">
      {}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          {!isPublicView && (
            <button
              onClick={goToDashboard}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-lg ${isPublicView ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}
            >
              {isPublicView ? <Globe size={16} /> : <Lock size={16} />}
            </div>
            <h1 className="font-bold text-slate-800 line-clamp-1 max-w-[250px]">
              {video?.title || "Video Analysis"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </div>
          <p className="text-slate-300 text-xs font-medium tracking-wide">
            Unsaved changes:{" "}
            <span className="text-red-400 font-bold uppercase ml-1">
              Sync Required
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLogs}
            className={`p-2 rounded-lg transition-all ${showLogs ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200 shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            title="Activity Logs"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${showChat ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-100 text-slate-600 border border-transparent"}`}
          >
            {showChat ? (
              <PanelLeftClose size={18} />
            ) : (
              <PanelLeftOpen size={18} />
            )}
            <span className="hidden sm:inline">
              {showChat ? "Hide Sidebar" : "Show Sidebar"}
            </span>
          </button>
        </div>
      </header>
      {}
      <div className="flex-1 flex overflow-hidden relative">
        {}
        <div
          className={`absolute top-0 right-0 h-full w-80 bg-white border-l shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${showLogs ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="p-4 border-b flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Activity size={16} className="text-amber-500" />
              Canvas Activity
            </div>
            <button
              onClick={() => setShowLogs(false)}
              className="p-1 hover:bg-slate-200 rounded text-slate-500"
            >
              <X size={18} />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs italic">
                No activity logs found.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log._id}
                  className="border-l-2 border-indigo-100 pl-3 py-1"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      <User size={10} />{" "}
                      {log.userEmail?.split("@")[0] || "User"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug">
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        <div
          className={`flex flex-col border-r bg-slate-50 transition-all duration-300 shadow-inner ${showChat ? "w-[450px]" : "w-0 -translate-x-full"}`}
        >
          <div className="w-full bg-black aspect-video shadow-lg z-10">
            <VideoPlayer
              youtubeId={video?.videoId}
              onReady={(p) => setPlayer(p)}
              onProgress={(state) => setCurrentTime(state.playedSeconds)}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <VideoNotebook
              videoId={video?._id}
              videoUrl={video?.videoId}
              onTimestampClick={handleSeek}
              readOnly={isPublicView}
              currentTime={currentTime}
            />
          </div>
        </div>
        
        <main className="flex-1 relative bg-slate-100/50">
          <MindMapCanvas
            videoId={video?._id}
            token={token}
            currentUser={currentUser}
            ownerId={video?.userId}
            onNodeClick={(data) => data.timestamp && handleSeek(data.timestamp)}
          />
        </main>
      </div>
    </div>
  );
};
export default VideoCanvas;
