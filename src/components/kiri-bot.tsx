'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare, HelpCircle, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const PRESET_RESPONSES: Record<string, string> = {
  default: "I'm Kiri, your MLSC SVEC virtual assistant. Ask me about our Study Trackers, Striver's SDE sheets, domains, or our custom 500-person WebRTC Meetings Backend!",
  
  study: "Our Study Hub features interactive tracking sheets (DSA, System Design, Web Dev) and Striver's 30-Day SDE Sheet. Check off completed topics to climb our global Trophy Leaderboard! Don't forget to Sign In to sync progress.",
  
  sheet: "Striver's SDE Sheet is a curated set of 180+ problems covering all essential DSA patterns and CS Theory concepts (DBMS, OS, Networks). Every question here includes difficulty indicators, direct links to coding portals, and embedded video solutions.",
  
  leaderboard: "The Study Leaderboard dynamically ranks users on the right side of the dashboard based on how many problems they've completed. Every checkmark triggers an atomic update in Firestore to advance your rank in real-time!",
  
  meeting: "We built a scalable custom meeting backend under `meetings-backend/` capable of supporting up to 500 concurrent participants! It utilizes an SFU (Selective Forwarding Unit) media server pattern combined with a Node.js + Socket.io + Redis signaling cluster to deliver sub-100ms video feeds.",
  
  join: "You can participate in Microsoft Learn Student Club events by registering on our /events tab! Also, join the community forum (/community) to ask questions, share projects, and collaborate with student innovators.",
  
  domain: "MLSC SVEC features specialized learning domains: Generative AI, Data Science, Cloud & DevOps, Web & App Development. Click through our Domains Carousel on the homepage to read details!",
};

const SUGGESTIONS = [
  { text: "📚 Tell me about Study Hub", key: "study" },
  { text: "🏆 How does the Leaderboard work?", key: "leaderboard" },
  { text: "📹 500-person Meetings Backend", key: "meeting" },
  { text: "🤝 How do I join the community?", key: "join" },
];

export function KiriBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Hi there! 👋 I'm Kiri, your MLSC SVEC virtual assistant. How can I help you today? Feel free to ask about our roadmaps, community, or our scale-out meeting backend!",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Determine bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let responseText = PRESET_RESPONSES.default;

      if (lowerText.includes('study') || lowerText.includes('roadmap') || lowerText.includes('track')) {
        responseText = PRESET_RESPONSES.study;
      } else if (lowerText.includes('sheet') || lowerText.includes('striver') || lowerText.includes('sde')) {
        responseText = PRESET_RESPONSES.sheet;
      } else if (lowerText.includes('leader') || lowerText.includes('board') || lowerText.includes('rank') || lowerText.includes('score')) {
        responseText = PRESET_RESPONSES.leaderboard;
      } else if (lowerText.includes('meet') || lowerText.includes('video') || lowerText.includes('webrtc') || lowerText.includes('sfu') || lowerText.includes('500')) {
        responseText = PRESET_RESPONSES.meeting;
      } else if (lowerText.includes('join') || lowerText.includes('event') || lowerText.includes('club') || lowerText.includes('register')) {
        responseText = PRESET_RESPONSES.join;
      } else if (lowerText.includes('domain') || lowerText.includes('carousel') || lowerText.includes('ai') || lowerText.includes('cloud')) {
        responseText = PRESET_RESPONSES.domain;
      } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        responseText = "Hello! Nice to meet you. Ask me anything about MLSC SVEC, our learning paths, or our WebRTC tools!";
      } else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
        responseText = "You're very welcome! Let me know if you need help with anything else. Good luck with your studies! 🚀";
      }

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[360px] md:w-[400px] h-[520px] rounded-3xl border border-white/10 bg-black/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(124,58,237,0.15)] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-gradient-to-r from-violet-600/10 via-black to-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/30 flex items-center justify-center relative">
                  <Bot className="h-5 w-5 text-[#7C3AED]" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-black uppercase tracking-wider text-white">Kiri</h4>
                    <span className="px-1.5 py-0.5 rounded bg-[#7C3AED]/10 text-[#7C3AED] text-[8px] font-black uppercase tracking-widest">AI Agent</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">MLSC Club Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full border border-white/5 hover:bg-white/5 text-white/50 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0 border",
                      msg.sender === 'user'
                        ? "bg-white/5 border-white/10"
                        : "bg-[#7C3AED]/10 border-[#7C3AED]/20"
                    )}
                  >
                    {msg.sender === 'user' ? (
                      <User className="h-3.5 w-3.5 text-white/60" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-[#7C3AED]" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-md",
                      msg.sender === 'user'
                        ? "bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] text-white rounded-tr-none"
                        : "bg-white/[0.02] border border-white/5 text-white/90 rounded-tl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="h-7 w-7 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-[#7C3AED]" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 text-white/40 p-3 rounded-2xl rounded-tl-none text-xs flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-col gap-1.5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 px-1">Suggested Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.key}
                      onClick={() => handleSend(sug.text)}
                      className="px-3 py-1.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 text-[10px] text-white/60 hover:text-white font-bold transition-all text-left flex items-center gap-1 cursor-pointer"
                    >
                      {sug.text} <ArrowRight className="h-2.5 w-2.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-white/5 bg-black">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  placeholder="Ask Kiri..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 focus:border-[#7C3AED]/30 focus:bg-white/[0.04] outline-none text-xs font-semibold rounded-2xl py-3 pl-4 pr-12 text-white placeholder-white/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 rounded-xl text-white/40 hover:text-white bg-transparent hover:bg-white/5 transition-all disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl relative cursor-pointer border transition-colors",
          isOpen
            ? "bg-white border-white text-black hover:bg-white/90"
            : "bg-[#7C3AED] border-[#7C3AED]/20 text-white hover:bg-[#7C3AED]/90"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
