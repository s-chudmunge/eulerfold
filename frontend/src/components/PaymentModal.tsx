import React, { useState, useEffect } from 'react';
import { X, Loader, CheckCircle2, Tag, Trash2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase/client';
import { getDiscountStatus, NORMAL_PRICE, DISCOUNTED_PRICE } from '@/lib/utils/pricing';
import Celebration from './Celebration';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountStatus, setDiscountStatus] = useState(getDiscountStatus());
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, newPrice: number} | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setDiscountStatus(getDiscountStatus());
        // Reset coupon state when modal opens
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponError(null);
    }
  }, [isOpen]);

  const currentPrice = appliedCoupon ? appliedCoupon.newPrice : (discountStatus.hasDiscount ? DISCOUNTED_PRICE : NORMAL_PRICE);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
        const res = await api.post('/payments/validate-coupon', { code: couponCode });
        setAppliedCoupon({
            code: couponCode.toUpperCase(),
            discount: res.data.discount,
            newPrice: res.data.new_price
        });
        setCouponCode('');
    } catch (err: any) {
        setCouponError(err.response?.data?.detail || 'Invalid coupon');
    } finally {
        setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

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

      const res = await api.post('/payments/checkout', { 
        currency: 'INR',
        coupon_code: appliedCoupon?.code || null
      });
      
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
                razorpay_signature: response.razorpay_signature,
                coupon_code: appliedCoupon?.code || null
              });
              setShowCelebration(true);
              setTimeout(() => {
                setShowCelebration(false);
                onSuccess();
              }, 4000);
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-100">
      <div className="bg-background border border-border rounded-none w-full max-w-[340px] shadow-2xl relative p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-callout-bg">
          <h2 className="inconsolata-ui text-[12px] font-bold text-text-heading uppercase tracking-widest">
            Complete Purchase
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-heading">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <span className="inconsolata-ui text-[11px] font-bold uppercase text-text-muted tracking-wider">Add 20 Credits</span>
            </div>
            <div className="flex flex-col items-end">
                {(discountStatus.hasDiscount || appliedCoupon) && (
                    <span className="inconsolata-ui text-[10px] text-text-muted line-through opacity-50">₹{NORMAL_PRICE}</span>
                )}
                <span className="inconsolata-ui text-[20px] font-black text-accent">₹{currentPrice}</span>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="mb-6 space-y-2">
            {!appliedCoupon ? (
                <>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted opacity-40" />
                            <input 
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="COUPON CODE"
                                className="w-full pl-8 pr-3 py-2 bg-sidebar/50 border border-border text-[10px] font-bold inconsolata-ui uppercase tracking-widest focus:outline-none focus:border-accent transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                            />
                        </div>
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponCode.trim()}
                            className="px-3 py-2 bg-sidebar border border-border text-[9px] font-black uppercase tracking-widest hover:bg-background transition-all disabled:opacity-50"
                        >
                            {isValidatingCoupon ? <Loader className="w-3 h-3 animate-spin" /> : 'Apply'}
                        </button>
                    </div>
                    {couponError && (
                        <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter inconsolata-ui ml-1">{couponError}</p>
                    )}
                </>
            ) : (
                <div className="flex items-center justify-between p-2 bg-accent/5 border border-accent/20 rounded-none">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest inconsolata-ui">
                            {appliedCoupon.code} (-{appliedCoupon.discount * 100}%)
                        </span>
                    </div>
                    <button onClick={removeCoupon} className="text-text-muted hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
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
            className={`w-full py-3 ${ (discountStatus.hasDiscount || appliedCoupon) ? 'bg-orange-600' : 'bg-[#111] dark:bg-[#14b8a6]'} !text-white rounded-none font-bold text-[11px] uppercase tracking-widest flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg`}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Purchase Now'}
          </button>
          
          <p className="inconsolata-ui text-[8px] text-text-muted mt-4 text-center uppercase tracking-widest opacity-40">
            Powered by Razorpay
          </p>
        </div>
      </div>
      
      <Celebration 
        show={showCelebration} 
        title="Payment Successful!" 
        subtitle="Credits have been added to your account."
        icon={<CreditCard className="w-10 h-10" />}
      />
    </div>
  );
}
