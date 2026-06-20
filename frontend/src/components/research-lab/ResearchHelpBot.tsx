"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { api } from '@/lib/api';
import PaymentModal from '@/components/PaymentModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ResearchHelpBotProps {
  decodeId: string;
  isPro: boolean;
}

export default function ResearchHelpBot({ decodeId, isPro: initialIsPro }: ResearchHelpBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPro, setIsPro] = useState(initialIsPro);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile/me');
        setIsPro(res.data.is_pro || false);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/research-lab/decodes/${decodeId}/messages`);
        setMessages(res.data.map((m: any) => ({ role: m.role, content: m.content })));
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };

    if (decodeId) fetchMessages();
  }, [decodeId]);

  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
        setShowPaymentModal(true);
        return;
    }
    if (!input.trim() || isSending) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsSending(true);

    try {
      const res = await api.post(`/research-lab/decodes/${decodeId}/chat`, { message: userMsg });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Error in peer-to-peer connection.";
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleChat = () => {
    if (!isChatOpen && !isPro) {
        setShowPaymentModal(true);
        return;
    }
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-[320px] h-[480px] bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col mb-4"
            >
              <div className="p-3 bg-sidebar border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="text-[12px] font-bold text-text-heading block">Help Bot</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-text-muted hover:text-text-heading transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar bg-header/10">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-6">
                    <p className="text-[12px] manrope-body text-left">Ask any technical question about this paper.</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div className={`max-w-[85%] p-2.5 text-[12.5px] leading-relaxed serif-content ${msg.role === 'user' ? 'bg-accent text-white rounded-lg rounded-tr-sm shadow-sm' : 'bg-sidebar text-text-primary rounded-lg rounded-tl-sm border border-border/40 shadow-sm'}`}>
                      <div className={msg.role === 'user' ? 'prose prose-sm prose-invert max-w-none text-[12.5px]' : 'prose prose-sm dark:prose-invert max-w-none text-[12.5px]'}>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-1.5 p-2 bg-sidebar rounded-full w-12 justify-center ml-2 border border-border/30">
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 bg-background border-t border-border">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isPro ? "Message..." : "Pro feature only..."}
                    className="w-full bg-sidebar border border-border px-3 py-2 pr-10 text-[12px] focus:outline-none focus:border-accent transition-all rounded-lg"
                    disabled={isSending || !isPro}
                  />
                  <button
                    type="submit"
                    disabled={isSending || !input.trim() || !isPro}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-accent disabled:opacity-20 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleChat}
          className={`w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-all ${isChatOpen ? 'bg-header border border-border text-text-heading' : 'bg-accent text-white'} relative`}
        >
          {isChatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {!isPro && !isChatOpen && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-border">
                  <ShieldCheck className="w-2.5 h-2.5 text-accent" />
              </div>
          )}
        </motion.button>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        title="Pro Feature"
        description="The Technical Help Bot is reserved for EulerFold Pro members. Upgrade to get instant AI guidance on any paper."
      />
    </>
  );
}
