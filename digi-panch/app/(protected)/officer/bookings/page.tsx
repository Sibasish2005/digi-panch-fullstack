'use client'; 

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
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
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function OfficerBookingsPage() {
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'COMPLETE' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState<any>(null);

  useEffect(() => {
    loadBookings();
  }, [getToken]);

  async function loadBookings() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await fetchAPI('/amenities/bookings/all', { token });
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch(status.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleActionClick = (booking: any, action: 'APPROVE' | 'REJECT' | 'COMPLETE') => {
    setSelectedBooking(booking);
    setActionType(action);
    setRemarks('');
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !actionType) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      await fetchAPI(`/amenities/bookings/${selectedBooking.id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          status: actionType === 'APPROVE' ? 'APPROVED' : actionType === 'REJECT' ? 'REJECTED' : 'COMPLETED',
          remarks
        })
      });
      
      setIsDialogOpen(false);
      toast.success(`Booking ${actionType === 'APPROVE' ? 'approved' : actionType === 'REJECT' ? 'rejected' : 'completed'} successfully.`);
      loadBookings();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update booking status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  return (
    <div className="space-y-6">
      <h1 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-3xl font-black text-[#0f2a5e] tracking-tight">Amenity Bookings</h1>
      
      <div className="rounded-sm border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Booking ID</TableHead>
              <TableHead>Amenity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No booking requests found.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-sm">{booking.booking_number}</TableCell>
                <TableCell>{booking.amenity?.name}</TableCell>
                <TableCell className="font-medium">
                  {new Date(booking.booking_date).toLocaleDateString()}
                  {booking.end_date && ` - ${new Date(booking.end_date).toLocaleDateString()}`}
                </TableCell>
                <TableCell>
                  <div className="text-xs text-gray-600 max-w-xs truncate">
                    {booking.applicant_name ? `${booking.applicant_name} (${booking.contact_number})` : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(booking.status)} variant="outline">
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setDetailsBooking(booking)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleActionClick(booking, 'APPROVE')}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleActionClick(booking, 'REJECT')}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  ) : booking.status === 'APPROVED' ? (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => setDetailsBooking(booking)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        onClick={() => handleActionClick(booking, 'COMPLETE')}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Mark Completed
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Processed</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'APPROVE' ? 'Approve Booking' : actionType === 'REJECT' ? 'Reject Booking' : 'Complete Booking'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to {actionType?.toLowerCase()} booking <strong>{selectedBooking?.booking_number}</strong>?
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Input 
                placeholder="Enter any remarks for the citizen..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'APPROVE' ? 'default' : actionType === 'REJECT' ? 'destructive' : 'default'} 
              onClick={handleConfirmAction} 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {actionType === 'APPROVE' ? 'Approval' : actionType === 'REJECT' ? 'Rejection' : 'Completion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!detailsBooking} onOpenChange={(open) => !open && setDetailsBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {detailsBooking && (
              <>
                <div className="space-y-1 pb-3 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Applicant Info</h4>
                  <p className="text-sm"><span className="font-medium">Name:</span> {detailsBooking.applicant_name || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">Contact:</span> {detailsBooking.contact_number || 'N/A'}</p>
                  <p className="text-sm"><span className="font-medium">ID Proof:</span> {detailsBooking.identity_proof || 'N/A'}</p>
                </div>
                
                <div className="space-y-1 pb-3 border-b border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Booking Info</h4>
                  <p className="text-sm"><span className="font-medium">Amenity:</span> {detailsBooking.amenity?.name}</p>
                  <p className="text-sm"><span className="font-medium">Booking ID:</span> {detailsBooking.booking_number}</p>
                  <p className="text-sm"><span className="font-medium">Dates:</span> {new Date(detailsBooking.booking_date).toLocaleDateString()} {detailsBooking.end_date && `- ${new Date(detailsBooking.end_date).toLocaleDateString()}`}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase">Form Responses</h4>
                  {Object.entries(detailsBooking.form_data || {}).length > 0 ? (
                    <ul className="text-sm space-y-1 mt-1 bg-gray-50 p-2 rounded-md border border-gray-100">
                      {Object.entries(detailsBooking.form_data).map(([key, value]) => (
                        <li key={key} className="flex flex-col mb-1">
                          <span className="font-medium text-gray-700">{key}:</span>
                          <span className="text-gray-600 pl-2">{String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No additional form data provided.</p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsBooking(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
