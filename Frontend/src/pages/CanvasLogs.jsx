import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, User } from 'lucide-react';

const CanvasLogs = ({ videoId }) => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get(`/video/${videoId}/logs`);
      setLogs(res.data);
    };
    fetchLogs();
    // Optional: Set an interval to refresh logs every 10 seconds
  }, [videoId]);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm h-64 overflow-y-auto">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 border-b pb-2">
        <History size={16} className="text-indigo-600" />
        Activity Stream
      </h3>
      <div className="space-y-3">
        {logs.map(log => (
          <div key={log._id} className="text-[11px] leading-tight border-l-2 border-indigo-100 pl-2">
            <div className="flex justify-between font-bold text-slate-700">
              <span className="flex items-center gap-1"><User size={10}/> {log.userEmail}</span>
              <span className="text-slate-400 font-normal">
                {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-slate-500 mt-1">{log.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasLogs;