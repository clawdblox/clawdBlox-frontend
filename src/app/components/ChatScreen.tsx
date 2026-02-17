import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, ChevronDown, Wifi, WifiOff, MoreHorizontal, Zap } from 'lucide-react';
import { NavigationHeader } from './NavigationHeader';
import { useUIStore, type ChatMessage } from './app-store';
import { useNpcStore } from '../../stores/npc.store';
import { useAuthStore } from '../../stores/auth.store';
import { getNpcAvatar } from '../../lib/utils';
import { wsService } from '../../lib/ws';

// Chat Selection Screen
export function ChatSelectScreen() {
  const { pushScreen, setChatNpcId, setShowTabBar, clearChat } = useUIStore();
  const npcStore = useNpcStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    npcStore.fetchNpcs();
  }, []);

  const filtered = npcStore.npcs.filter(
    (npc) =>
      npc.name.toLowerCase().includes(search.toLowerCase()) &&
      npc.is_active
  );

  const handleSelectNpc = (npcId: string, npcName: string) => {
    setChatNpcId(npcId);
    clearChat();
    setShowTabBar(false);
    pushScreen('chat-live', npcName);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: '#24272F' }}>
      <NavigationHeader title="Chat" largeTitle />

      {/* Search */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 px-3.5 rounded-2xl"
          style={{
            height: '38px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={16} style={{ color: '#CFD2D5' }} />
          <input
            type="text"
            placeholder="Search NPCs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: '15px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      <div
        className="flex-1 min-h-0 pb-6"
        style={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        <p
          className="px-5 mb-2"
          style={{
            fontSize: '13px',
            color: '#CFD2D5',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          Available NPCs
        </p>
        <div className="px-4 space-y-2.5">
          {filtered.map((npc, i) => (
            <motion.button
              key={npc.id}
              className="w-full flex items-center gap-3.5 px-4 text-left active:scale-[0.98] transition-transform rounded-2xl"
              style={{
                minHeight: '72px',
                backgroundColor: '#2E3138',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.04)',
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelectNpc(npc.id, npc.name)}
            >
              <div className="relative">
                <div
                  className="rounded-2xl flex items-center justify-center"
                  style={{
                    width: '52px',
                    height: '52px',
                    background: 'linear-gradient(135deg, #1A0A2E, #2A1548)',
                    fontSize: '26px',
                  }}
                >
                  {getNpcAvatar(npc.name)}
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#2E3138', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: '#34C759',
                      boxShadow: '0 0 6px rgba(52,199,89,0.4)',
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
                  {npc.name}
                </p>
                <p
                  className="truncate"
                  style={{ fontSize: '14px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}
                >
                  {npc.backstory.slice(0, 60)}{npc.backstory.length > 60 ? '...' : ''}
                </p>
              </div>
              <Zap size={16} style={{ color: '#05b6f8', flexShrink: 0 }} />
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
              No active NPCs available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Full Screen Chat (iMessage style) with real WebSocket
export function ChatLiveScreen() {
  const {
    chatNpcId,
    chatMessages,
    addChatMessage,
    isStreaming,
    setIsStreaming,
    popScreen,
    setShowTabBar,
  } = useUIStore();
  const npcStore = useNpcStore();
  const npc = npcStore.npcs.find((n) => n.id === chatNpcId);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [typingDots, setTypingDots] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentStreamRef = useRef<string>('');
  const streamMsgIdRef = useRef<string>('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Set up WebSocket callbacks
    wsService.onConnected = () => {
      setIsConnected(true);
      setIsReconnecting(false);
    };

    wsService.onDisconnected = (_reason, _code) => {
      setIsConnected(false);
    };

    wsService.onReconnecting = (_attempt, _maxAttempts) => {
      setIsReconnecting(true);
    };

    wsService.onChatToken = (data) => {
      setTypingDots(false);
      currentStreamRef.current += data.token;
      const msgId = streamMsgIdRef.current;

      useUIStore.setState((state) => {
        const msgs = [...state.chatMessages];
        const existingIdx = msgs.findIndex((m) => m.id === msgId);
        const npcMsg: ChatMessage = {
          id: msgId,
          role: 'npc',
          content: currentStreamRef.current,
          timestamp: new Date().toISOString(),
        };
        if (existingIdx >= 0) {
          msgs[existingIdx] = npcMsg;
        } else {
          msgs.push(npcMsg);
        }
        return { chatMessages: msgs };
      });
    };

    wsService.onChatEnd = (_data) => {
      setIsStreaming(false);
      currentStreamRef.current = '';
      streamMsgIdRef.current = '';
    };

    wsService.onChatError = (data) => {
      setIsStreaming(false);
      setTypingDots(false);
      currentStreamRef.current = '';
      streamMsgIdRef.current = '';
      addChatMessage({
        id: `msg_err_${Date.now()}`,
        role: 'npc',
        content: `⚠️ ${data.message}`,
        timestamp: new Date().toISOString(),
      });
    };

    // Connect
    wsService.connect();

    return () => {
      wsService.onConnected = undefined;
      wsService.onDisconnected = undefined;
      wsService.onReconnecting = undefined;
      wsService.onChatToken = undefined;
      wsService.onChatEnd = undefined;
      wsService.onChatError = undefined;
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming || !npc || !isConnected) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'player',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);

    // Prepare for streaming response
    streamMsgIdRef.current = `msg_npc_${Date.now()}`;
    currentStreamRef.current = '';
    setIsStreaming(true);
    setTypingDots(true);

    // Send via WebSocket
    const user = useAuthStore.getState().user;
    wsService.sendChatMessage(npc.id, input.trim(), user?.id ?? 'anonymous');
    setInput('');
  };

  const handleBack = () => {
    setShowTabBar(true);
    popScreen();
  };

  const npcAvatar = npc ? getNpcAvatar(npc.name) : '🧠';

  function ConnectionStatus() {
    if (isConnected) {
      return (
        <>
          <Wifi size={10} style={{ color: '#34C759' }} />
          <span style={{ fontSize: '11px', color: '#34C759', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Connected
          </span>
        </>
      );
    }
    if (isReconnecting) {
      return (
        <>
          <WifiOff size={10} style={{ color: '#FF9500' }} />
          <span style={{ fontSize: '11px', color: '#FF9500', fontFamily: 'Inter, sans-serif' }}>
            Reconnecting...
          </span>
        </>
      );
    }
    return (
      <>
        <WifiOff size={10} style={{ color: '#FF6B6B' }} />
        <span style={{ fontSize: '11px', color: '#FF6B6B', fontFamily: 'Inter, sans-serif' }}>
          Disconnected
        </span>
      </>
    );
  }

  if (!npc) return null;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: '#1A0A2E' }}>
      {/* Chat Header */}
      <div
        className="flex items-center gap-3 px-3"
        style={{
          height: '58px',
          background: 'linear-gradient(180deg, rgba(36,39,47,0.98) 0%, rgba(36,39,47,0.92) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        }}
      >
        <button
          onClick={handleBack}
          style={{ color: '#05b6f8', fontSize: '15px', fontFamily: 'Inter, sans-serif' }}
          className="flex items-center gap-0.5 active:opacity-60 transition-opacity"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M10 2L2 10L10 18" stroke="#05b6f8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2A1548, #3D1F6D)',
            fontSize: '20px',
          }}
        >
          {npcAvatar}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            {npc.name}
          </p>
          <div className="flex items-center gap-1">
            <ConnectionStatus />
          </div>
        </div>
        <button className="p-2 rounded-full active:bg-white/5 transition-colors">
          <MoreHorizontal size={20} style={{ color: '#CFD2D5' }} />
        </button>
      </div>

      {/* Reconnection banner */}
      <AnimatePresence>
        {isReconnecting && (
          <motion.div
            className="flex items-center justify-center gap-2 py-2"
            style={{ background: 'linear-gradient(90deg, #FF9500, #FFB340)' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <WifiOff size={14} color="white" />
            <span style={{ fontSize: '13px', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Reconnecting...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 px-4 py-4"
        style={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
        onScroll={handleScroll}
      >
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div
              className="rounded-3xl flex items-center justify-center mb-4"
              style={{
                width: '72px',
                height: '72px',
                background: 'linear-gradient(135deg, #2A1548, #3D1F6D)',
                fontSize: '36px',
              }}
            >
              {npcAvatar}
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
              {npc.name}
            </p>
            <p style={{ fontSize: '14px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '6px', maxWidth: '260px', lineHeight: 1.4 }}>
              {isConnected ? 'Send a message to test this NPC in real conditions' : 'Connecting to server...'}
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {chatMessages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {msg.role === 'npc' && (
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-auto"
                  style={{ background: 'linear-gradient(135deg, #2A1548, #3D1F6D)', fontSize: '14px' }}
                >
                  {npcAvatar}
                </div>
              )}
              <div
                className="px-4 py-2.5 rounded-2xl"
                style={{
                  maxWidth: '75%',
                  background: msg.role === 'player'
                    ? 'linear-gradient(135deg, #05b6f8, #0498d0)'
                    : '#2E3138',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.4,
                  borderBottomRightRadius: msg.role === 'player' ? '6px' : '18px',
                  borderBottomLeftRadius: msg.role === 'npc' ? '6px' : '18px',
                  boxShadow: msg.role === 'player'
                    ? '0 2px 12px rgba(5,182,248,0.25)'
                    : '0 1px 4px rgba(0,0,0,0.2)',
                }}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {typingDots && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mr-2 mt-auto"
                style={{ background: 'linear-gradient(135deg, #2A1548, #3D1F6D)', fontSize: '14px' }}
              >
                {npcAvatar}
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex gap-1.5"
                style={{ backgroundColor: '#2E3138', borderBottomLeftRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#CFD2D5' }}
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll down button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.button
            className="absolute right-4 rounded-full shadow-lg flex items-center justify-center"
            style={{
              bottom: '80px',
              width: '36px',
              height: '36px',
              backgroundColor: 'rgba(46,49,56,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
          >
            <ChevronDown size={20} style={{ color: '#CFD2D5' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div
        className="px-4 py-2.5 flex items-end gap-2.5"
        style={{
          background: 'linear-gradient(180deg, rgba(36,39,47,0.95) 0%, rgba(36,39,47,0.98) 100%)',
          backdropFilter: 'blur(24px)',
          borderTop: '0.5px solid rgba(255,255,255,0.06)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={isConnected ? 'Message...' : 'Waiting for connection...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!isConnected}
          className="flex-1 px-4 py-2.5 rounded-full outline-none disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#FFFFFF',
          }}
        />
        <motion.button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || !isConnected}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: input.trim() && !isStreaming && isConnected
              ? 'linear-gradient(135deg, #05b6f8, #0498d0)'
              : '#383B44',
            boxShadow: input.trim() && !isStreaming && isConnected
              ? '0 2px 10px rgba(5,182,248,0.3)'
              : 'none',
            transition: 'all 0.2s ease',
          }}
          whileTap={{ scale: 0.9 }}
        >
          <Send size={17} color="white" strokeWidth={2.5} style={{ marginLeft: '1px' }} />
        </motion.button>
      </div>
    </div>
  );
}
