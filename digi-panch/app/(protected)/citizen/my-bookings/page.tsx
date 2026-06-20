'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CitizenBookingsPage() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const role = (user?.publicMetadata?.role as string) || "CITIZEN";
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const token = await getToken();
      const data = await fetchAPI(`/amenities/bookings/my?t=${Date.now()}`, { token });
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [getToken]);

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoaded && user && role !== "CITIZEN" && role !== "USER") {
    return (
      <div className="flex-grow flex items-center justify-center p-6 h-[80vh]">
        <Card className="max-w-md w-full shadow-lg border-red-100 bg-red-50/30">
          <CardContent className="flex flex-col items-center text-center pt-10 pb-10">
            <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Access Denied</h2>
            <p className="text-slate-600 mb-8">
              This page is strictly reserved for Citizens. As an {role.toLowerCase()}, please use your dedicated dashboard.
            </p>
            <Link href="/">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">Track your amenity booking requests.</p>
        </div>
        <Link href="/citizen/book">
          <Button>Book New Amenity</Button>
        </Link>
      </div>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Amenity</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No bookings found. You haven't booked any amenities yet.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-sm">{booking.booking_number}</TableCell>
                <TableCell>{booking.amenity?.name}</TableCell>
                <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)} variant="outline">
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                  {booking.remarks || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
