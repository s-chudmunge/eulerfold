"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Trophy, Terminal, Sun, Wifi, Battery, Signal, ShieldCheck } from 'lucide-react';
import { DISCOUNTED_PRICE, NORMAL_PRICE, getDiscountStatus } from '@/lib/utils/pricing';

export default function SummerSaleHero() {
  const discountStatus = getDiscountStatus();
  const discountPercentage = Math.round((1 - DISCOUNTED_PRICE / NORMAL_PRICE) * 100);
  
  const [step, setStep] = useState(0); // 0: Roadmap(Basic), 1: Checkout, 2: Success, 3: Roadmap(Pro)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 6000); // 6 seconds per step
    return () => clearInterval(timer);
  }, []);

  const RoadmapContent = ({ isPro }: { isPro: boolean }) => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="pt-4 px-5 pb-3 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="EulerFold" className="w-6 h-6 rounded-md shadow-sm" />
            <span className="text-[13px] font-black tracking-tight text-slate-900">EulerFold</span>
          </div>
          <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-black text-white uppercase tracking-wider ${isPro ? 'bg-orange-500' : 'bg-slate-300'}`}>
            {isPro ? 'PRO' : 'FREE'}
          </div>
        </div>
        <div className="flex flex-col">
            <h4 className="text-[16px] font-black text-slate-900 leading-none">Distributed Systems</h4>
            <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[65%]" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">65%</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-5 bg-[#f8fafc] relative">
        <motion.div 
          animate={{ y: [0, -380] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="space-y-3"
        >
          {[1, 2].map((loop) => (
            <React.Fragment key={loop}>
              <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/5 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Module 01</p>
                  <p className="text-[12px] font-bold text-slate-800 leading-tight">Vertical Scaling & Latency</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border-2 border-accent shadow-md shadow-accent/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[8px] font-black text-accent uppercase tracking-widest leading-none mb-1">Active</p>
                  <p className="text-[12px] font-bold text-slate-900 leading-tight">Load Balancing Logic</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Next</p>
                  <p className="text-[12px] font-bold text-slate-800 leading-tight">Consistent Hashing</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-orange-950 shadow-sm relative overflow-hidden my-4">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-orange-200/50 rounded-full blur-2xl" />
                <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    <span className="text-[8px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Ranked #14</span>
                </div>
                <p className="text-[18px] font-black leading-none mb-0.5">Legendary</p>
                <p className="text-[9px] font-bold text-orange-800/60 uppercase tracking-widest">Skill Level Reached</p>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#f8fafc] to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#f8fafc] to-transparent z-10" />
      </div>
    </div>
  );

  return (
    <div className="relative w-full min-h-[950px] lg:min-h-[850px] flex items-center overflow-hidden bg-teal-950">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950" />
        <div className="absolute inset-0 opacity-20 prism-striped-gradient" />
        <div className="absolute top-[-10%] right-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-orange-500/10 blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-teal-400/10 blur-[80px] sm:blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center py-12 sm:py-20">
        
        {/* Left Side: EulerFold App UI Mockup (Combined Journey) */}
        <div className="flex justify-center relative order-1 lg:order-none scale-[0.85] sm:scale-100">
          <div className="absolute inset-0 bg-teal-400/20 blur-[60px] sm:blur-[100px] rounded-full scale-75" />
          
          <div className="relative w-[280px] sm:w-[320px] h-[580px] sm:h-[650px] bg-zinc-950 rounded-[3rem] sm:rounded-[3.5rem] border-[8px] sm:border-[12px] border-zinc-900 shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.6)] sm:shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute inset-0 bg-[#f0f7f6] flex flex-col font-sans">
              
              {/* iOS Status Bar */}
              <div className="pt-4 px-8 pb-2 flex justify-between items-center z-30">
                <span className="text-[12px] font-bold text-slate-900">9:41</span>
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3 text-slate-900" />
                  <Wifi className="w-3 h-3 text-slate-900" />
                  <Battery className="w-4 h-4 text-slate-900" />
                </div>
              </div>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-zinc-900 rounded-b-3xl z-20" />
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="roadmap-basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                    <RoadmapContent isPro={false} />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="pricing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col p-6">
                    <div className="mb-4 pt-2">
                        <h4 className="text-[20px] font-black text-slate-900 leading-tight">Pro Plan</h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Summer Sale Exclusive</p>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="p-4 rounded-[2rem] bg-white border-2 border-orange-500 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-orange-500 text-white px-6 py-1 rotate-45 translate-x-5 translate-y-3 text-[8px] font-black">-{discountPercentage}%</div>
                            <p className="text-[10px] font-black text-orange-500 uppercase mb-1">One-time payment</p>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-[28px] font-black text-slate-900">₹{DISCOUNTED_PRICE}</span>
                                <span className="text-[12px] text-slate-400 line-through font-bold">₹{NORMAL_PRICE}</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {["50 Roadmap Credits", "Homework Review", "GPT-4o Reasoning"].map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                                        <CheckCircle2 className="w-3 h-3 text-accent" /> {feat}
                                    </li>
                                ))}
                            </ul>
                            <div className="w-full py-3 bg-slate-900 text-white text-[11px] font-black uppercase text-center rounded-xl shadow-xl">Buy Pro Credits</div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Secure Checkout</span>
                        </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 border-4 border-accent flex items-center justify-center mb-5">
                        <CheckCircle2 className="w-8 h-8 text-accent" />
                    </div>
                    <h4 className="text-[20px] font-black text-slate-900 leading-tight mb-2">Payment Successful</h4>
                    <p className="text-[12px] font-medium text-slate-500 mb-6">Your account has been upgraded.</p>
                    <div className="w-full p-4 rounded-3xl bg-white border border-teal-100 shadow-sm flex items-center justify-between mb-6 text-left">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase">Credits Added</p>
                            <p className="text-[16px] font-black text-slate-900">+50 Generations</p>
                        </div>
                        <Trophy className="w-7 h-7 text-orange-400" />
                    </div>
                    <div className="w-full py-3 bg-slate-100 text-slate-900 text-[11px] font-black uppercase text-center rounded-xl">Start Learning</div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="roadmap-pro" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                    <RoadmapContent isPro={true} />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Right Side: Sale Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-none">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-6 sm:mb-8">
          <h1 className="relative flex flex-col items-center lg:items-start">
            <span className="block text-[60px] sm:text-[100px] md:text-[120px] leading-[0.85] font-black text-white drop-shadow-[4px_4px_0px_rgba(15,118,110,0.4)] uppercase italic tracking-tighter">SUMMER</span>
            <span className="block text-[80px] sm:text-[130px] md:text-[150px] leading-[0.7] font-normal text-teal-300 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] -mt-4 italic tracking-tight" style={{ fontFamily: '"Great Vibes", cursive' }}>Sale</span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }} className="mb-8 sm:mb-10 w-full">
          <div className="inline-flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 fill-teal-400/20" />
              </motion.div>
              <h2 className="text-[18px] sm:text-[24px] md:text-[32px] font-black text-white tracking-tight uppercase">
                {discountPercentage}% <span className="text-teal-400">OFF PRO</span>
              </h2>
              <motion.div
                animate={{ rotate: [0, -90, -180, -270, -360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 fill-teal-400/20" />
              </motion.div>
          </div>
        </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
            <Link href="/pricing" className="bg-white text-teal-900 px-8 sm:px-10 py-4 sm:py-5 rounded-full text-[12px] sm:text-[14px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 hover:bg-teal-50 active:scale-95 shadow-2xl flex items-center gap-3">
              Shop Now <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
