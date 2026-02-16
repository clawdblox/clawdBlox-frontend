import { useEffect, useRef } from 'react';
import { ArrowLeft, User, Bot, Loader2, Clock } from 'lucide-react';
import { useConversationStore } from '../../../stores/conversation.store';
import type { ConversationResponse } from '../../../lib/api';

interface DesktopConversationDetailProps {
  conversation: ConversationResponse;
  npcName: string;
  onBack: () => void;
}

export function DesktopConversationDetail({ conversation, npcName, onBack }: DesktopConversationDetailProps) {
  const convStore = useConversationStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    convStore.fetchMessages(conversation.id);
    return () => convStore.clearMessages();
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convStore.messages]);

  return (
    <div className="p-8 space-y-6 max-w-[1000px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-[#38383A] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-[16px] font-bold text-[#8E8E93] border border-[#38383A]">
            {npcName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-white leading-tight">
              {npcName}
              <span className="text-[#8E8E93] text-[14px] font-normal ml-2">
                with {conversation.player_id}
              </span>
            </h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[#8E8E93] text-[12px] flex items-center gap-1">
                <Clock size={11} />
                {new Date(conversation.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] capitalize ${
                conversation.status === 'active' ? 'bg-[#34C759]/10 text-[#34C759]' :
                conversation.status === 'ended' ? 'bg-[#8E8E93]/10 text-[#8E8E93]' :
                'bg-[#FF9500]/10 text-[#FF9500]'
              }`}>
                {conversation.status}
              </span>
            </div>
          </div>
        </div>

        <span className="text-[#8E8E93] text-[13px]">
          {conversation.message_count} messages
        </span>
      </div>

      {/* Messages */}
      {convStore.isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-[#05b6f8] animate-spin" />
        </div>
      ) : convStore.error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-[14px]">{convStore.error}</p>
        </div>
      ) : convStore.messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#8E8E93] text-[14px]">
          No messages in this conversation
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-8">
          {convStore.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[70%] ${msg.role === 'player' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'player'
                    ? 'bg-[#0A84FF]/20 text-[#0A84FF]'
                    : 'bg-[#2C2C2E] text-[#8E8E93] border border-[#38383A]'
                }`}>
                  {msg.role === 'player' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-2.5 ${
                  msg.role === 'player'
                    ? 'bg-[#0A84FF] text-white rounded-br-sm'
                    : 'bg-[#2C2C2E] text-[#E5E5EA] border border-[#38383A] rounded-bl-sm'
                }`}>
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${
                    msg.role === 'player' ? 'text-white/50' : 'text-[#636366]'
                  }`}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
