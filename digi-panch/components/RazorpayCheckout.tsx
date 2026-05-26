'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

export function RazorpayCheckout({ 
  applicationId, 
  amount, 
  onSuccess 
}: { 
  applicationId: string; 
  amount: number; 
  onSuccess: () => void; 
}) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) return;
    
    setLoading(true);
    try {
      const token = await getToken();
      const order = await fetchAPI('/payments/create-order', {
        method: 'POST',
        token,
        body: JSON.stringify({ application_id: applicationId, amount, payment_type: 'APPLICATION_FEE' })
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key_here',
        amount: order.amount * 100, // amount must be in paise for Razorpay
        currency: order.currency,
        name: 'DigiPanch E-Governance',
        description: 'Application Processing Fee',
        order_id: order.provider_order_id,
        handler: async function (response: any) {
          try {
            const freshToken = await getToken();
            await fetchAPI('/payments/verify', {
              method: 'POST',
              token: freshToken,
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            onSuccess();
          } catch (e) {
            console.error("Payment verification error:", e);
            alert('Payment verification failed.');
          }
        },
        theme: {
          color: '#2563eb' // blue-600
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
         alert(response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert('Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading || !scriptLoaded} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {loading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
}
