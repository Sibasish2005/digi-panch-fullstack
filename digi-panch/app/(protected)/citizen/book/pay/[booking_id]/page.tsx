'use client';

import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { RazorpayCheckout } from '@/components/RazorpayCheckout';
import { toast } from 'sonner';

export default function AmenityBookingPaymentPage({ params }: { params: Promise<{ booking_id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.booking_id;
  
  const feeParam = searchParams.get('fee');
  const amount = feeParam ? parseFloat(feeParam) : 0;

  const handlePaymentSuccess = () => {
    toast.success('Payment completed successfully! Your booking is now pending officer approval.');
    router.push('/citizen/my-bookings');
  };

  if (!amount || amount <= 0) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Payment Request</CardTitle>
          </CardHeader>
          <CardContent>
            No valid fee amount found for this booking.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Booking Payment</CardTitle>
          <CardDescription>
            Pay the required fee to finalize your amenity booking request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-4 border-b">
            <span className="font-medium text-gray-600">Booking ID</span>
            <span className="font-semibold">{bookingId.split('-')[0]}...</span>
          </div>
          
          <div className="flex justify-between items-center py-4 border-b">
            <span className="font-medium text-gray-600">Total Fee</span>
            <span className="font-bold text-xl text-emerald-600">₹{amount}</span>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-end p-4 border-t">
          <RazorpayCheckout 
            referenceId={bookingId} 
            referenceType="AMENITY_BOOKING"
            amount={amount} 
            onSuccess={handlePaymentSuccess} 
          />
        </CardFooter>
      </Card>
    </div>
  );
}
