import React, { useState, useEffect, useRef } from "react";
import { Clock, Plus, List, Edit2, Check, X, User, Calendar, History, Trash2 } from "lucide-react";
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext'; 

const VideoNotebook = ({ videoId, videoUrl, onTimestampClick, currentTime }) => {
  const { user, loading: authLoading } = useAuth(); 
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [manualTime, setManualTime] = useState(""); 
  const [videoTitle, setVideoTitle] = useState("Study Session");
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!videoId) return;
      try {
        const res = await api.get(`/video/${videoId}/notes`);
        setNotes(res.data);
      } catch (err) { console.error(err); }
    };
    fetchNotes();
  }, [videoId]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!currentNote.trim() || !user) return;
    const timeToSave = manualTime !== "" ? Number(manualTime) : (currentTime || 0);

    try {
      const res = await api.post(`/video/${videoId}/notes`, {
        text: currentNote,
        time: formatTime(timeToSave),
        rawTime: timeToSave
      });
      setNotes([...notes, res.data].sort((a,b) => a.rawTime - b.rawTime));
      setCurrentNote("");
      setManualTime("");
    } catch (err) { alert("Error saving note"); }
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/notes/${id}`, { text: editBuffer });
      setNotes(notes.map(n => n._id === id ? res.data : n));
      setEditingId(null);
    } catch (err) { alert("Update failed"); }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200">
      <div className="p-4 bg-white border-b flex justify-between items-center">
        <h2 className="font-bold text-xs uppercase tracking-tight text-slate-800">Notebook</h2>
        <span className="text-[10px] text-indigo-600 font-bold">{user?.email}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.map((note) => (
          <div key={note._id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                   <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                     <User size={10} className="inline mr-1" />
                     {note.creatorEmail || "Anonymous"} 
                   </span>
                </div>
                {note.lastEditedBy && (
                  <span className="text-[9px] text-amber-600 italic mt-1">
                    <History size={10} className="inline mr-1" />
                    Edited by: {note.lastEditedBy}
                  </span>
                )}
              </div>
              
              {/* Only show edit/delete if it's the user's note */}
              {user?.email === note.creatorEmail && (
                <div className="flex gap-1">
                  <button onClick={() => { setEditingId(note._id); setEditBuffer(note.text); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 size={12}/></button>
                  <button onClick={() => deleteNote(note._id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <button onClick={() => onTimestampClick(note.rawTime)} className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded">
                {note.time}
              </button>
              <div className="flex-1">
                {editingId === note._id ? (
                  <div className="flex flex-col gap-2">
                    <textarea className="w-full text-sm p-2 border rounded" value={editBuffer} onChange={e => setEditBuffer(e.target.value)} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)}><X size={16}/></button>
                      <button onClick={() => saveEdit(note._id)} className="text-green-600"><Check size={16}/></button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700">{note.text}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={addNote} className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-1">
          <input 
            type="text" 
            value={currentNote} 
            onChange={e => setCurrentNote(e.target.value)}
            placeholder="Write a note..." 
            className="flex-1 py-3 bg-transparent outline-none text-sm"
          />
          <button type="submit" className="p-2 bg-indigo-600 text-white rounded-xl"><Plus size={20}/></button>
        </div>
      </form>
    </div>
  );
};

export default VideoNotebook;