import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Network, 
  MessageSquare, 
  Share2, 
  ArrowRight, 
  MousePointer2, 
  Zap,
  ChevronLeft
} from 'lucide-react';

const HowToPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "1. Import Video",
      desc: "Paste any YouTube URL into your dashboard. DeepLens pulls the metadata and prepares your workspace.",
      icon: <Video className="text-indigo-400" size={24} />,
      color: "from-indigo-500/20 to-transparent"
    },
    {
      title: "2. Visual Note Taking",
      desc: "Watch the video and add notes. Every note is automatically timestamped, letting you jump back to that exact moment.",
      icon: <MessageSquare className="text-blue-400" size={24} />,
      color: "from-blue-500/20 to-transparent"
    },
    {
      title: "3. Build the Mind Map",
      desc: "Drag and drop nodes onto the infinite canvas. Connect ideas visually to build a mental model of the content.",
      icon: <Network className="text-purple-400" size={24} />,
      color: "from-purple-500/20 to-transparent"
    },
    {
      title: "4. Collaborative Sync",
      desc: "Generate a share link to invite others. See real-time activity logs as your team contributes to the map.",
      icon: <Share2 className="text-emerald-400" size={24} />,
      color: "from-emerald-500/20 to-transparent"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Video size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl">DeepLens</span>
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Master your <span className="text-indigo-500">Workspace.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            DeepLens isn't just a video player—it's a spatial thinking engine. 
            Follow this guide to turn passive watching into active learning.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`relative p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden group hover:border-slate-700 transition-all`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className="mb-4 inline-block p-3 bg-slate-800 rounded-2xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tips Section */}
        <div className="bg-indigo-600 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <Zap className="absolute right-[-20px] bottom-[-20px] text-white/10 size-64 rotate-12" />
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black text-white mb-6">Pro Tips for Power Users</h2>
            <ul className="space-y-4">
              {[
                "Click edit icon to edit its content directly.",
                "Click a timestamp in your notebook to seek the video instantly.",
                "Use the 'Activity' panel to track changes made by collaborators.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-indigo-100">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  <span className="text-sm font-medium">{tip}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-8 flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Start Creating
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          © 2026 DeepLens Intelligence. Build your second brain.
        </footer>
      </div>
    </div>
  );
};

export default HowToPage;