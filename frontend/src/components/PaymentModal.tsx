"use client";

import React, { useState, useEffect } from 'react';
import { X, Loader, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase/client';
import { getDiscountStatus, NORMAL_PRICE, DISCOUNTED_PRICE } from '@/lib/utils/pricing';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());

  useEffect(() => {
    if (isOpen) {
        setDiscountStatus(getDiscountStatus());
    }
  }, [isOpen]);

  const currentPrice = discountStatus.hasDiscount ? DISCOUNTED_PRICE : NORMAL_PRICE;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as Record<string, unknown>).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Please login first.');
        setLoading(false);
        return;
      }

      const res = await api.post('/payments/checkout', { currency: 'INR' });
      
      if (res.data.provider === 'razorpay') {
        const resLoaded = await loadRazorpayScript();
        if (!resLoaded) {
          setError('SDK Error');
          setLoading(false);
          return;
        }

        const options = {
          key: res.data.key,
          amount: res.data.amount,
          currency: res.data.currency,
          name: 'EulerFold',
          description: 'Roadmap Generation',
          order_id: res.data.order_id,
          handler: async function (response: Record<string, string>) {
            try {
              await api.post('/payments/verify-razorpay', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              onSuccess();
            } catch (err) {
              setError('Verification failed.');
            }
          },
          theme: { color: '#0f766e' }
        };

        const rzp = new (window as Record<string, any>).Razorpay(options);
        rzp.on('payment.failed', (response: any) => setError('Payment failed.'));
        rzp.open();
        setLoading(false); 
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please login first.');
      } else {
        setError('Checkout failed.');
      }
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[1px] animate-in fade-in duration-100">
      <div className="bg-background border border-border rounded-none w-full max-w-[320px] shadow-2xl relative p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-callout-bg">
          <h2 className="inconsolata-ui text-[12px] font-bold text-text-heading uppercase tracking-widest">
            New Roadmap
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-heading">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="inconsolata-ui text-[11px] font-bold uppercase text-text-muted tracking-wider">Add 5 Credits</span>
              <span className="inconsolata-ui text-[9px] text-text-muted opacity-60">Generate 5 Premium Roadmaps</span>
            </div>
            <div className="flex flex-col items-end">
                {discountStatus.hasDiscount && (
                    <span className="inconsolata-ui text-[10px] text-text-muted line-through opacity-50">₹{NORMAL_PRICE}</span>
                )}
                <span className="inconsolata-ui text-[18px] font-bold text-accent">₹{currentPrice}</span>
            </div>
          </div>

          {error && (
            <div className="p-2 mb-4 bg-red-500/5 border-l-2 border-red-500 text-red-500 text-[10px] font-bold inconsolata-ui uppercase tracking-tighter flex flex-col gap-1">
              <span>{error}</span>
              {error === 'Please login first.' && (
                <Link href="/login" className="underline hover:text-red-600 transition-colors">
                  Login here →
                </Link>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className={`w-full py-3 ${discountStatus.hasDiscount ? 'bg-orange-600' : 'bg-[#111] dark:bg-[#14b8a6]'} !text-white rounded-none font-bold text-[11px] uppercase tracking-widest flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg`}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Purchase Now'}
          </button>
          
          <p className="inconsolata-ui text-[8px] text-text-muted mt-4 text-center uppercase tracking-widest opacity-40">
            Powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}
