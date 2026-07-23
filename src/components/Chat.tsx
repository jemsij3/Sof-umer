import React, { useState, useEffect } from 'react';
import { useApp } from '../lib/AppContext';
import { MessageSquare, Send, X } from 'lucide-react';

interface ChatProps {
  propertyId: string;
  sellerId: string;
  onClose: () => void;
}

export default function Chat({ propertyId, sellerId, onClose }: ChatProps) {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Simple polling
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({
          propertyId,
          receiverId: sellerId,
          content
        })
      });
      if (res.ok) {
        setContent('');
        fetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50">
      <div className="p-4 bg-zinc-800 border-b border-white/10 rounded-t-2xl flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-500" /> Chat with Seller
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 h-64 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-center text-white/50 text-xs">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-white/50 text-xs mt-10">No messages yet. Say hi!</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.senderId === currentUser?.id ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${m.senderId === currentUser?.id ? 'bg-amber-500 text-black rounded-tr-none' : 'bg-zinc-800 text-white border border-white/5 rounded-tl-none'}`}>
                {m.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
        />
        <button type="submit" disabled={!content.trim()} className="bg-amber-500 text-black p-2 rounded-xl disabled:opacity-50 hover:bg-amber-400">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
