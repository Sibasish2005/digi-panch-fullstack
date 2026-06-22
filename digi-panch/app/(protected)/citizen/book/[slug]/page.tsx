'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function AmenityBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const { user } = useUser();
  
  const [amenity, setAmenity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Specific required field
  const [bookingDate, setBookingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Applicant details
  const [applicantName, setApplicantName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [identityProof, setIdentityProof] = useState('');
  
  // Dynamic fields
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (user) {
      if (!applicantName && user.fullName) {
        setApplicantName(user.fullName);
      }
      if (!contactNumber && user.primaryPhoneNumber?.phoneNumber) {
        setContactNumber(user.primaryPhoneNumber.phoneNumber);
      }
    }
  }, [user]);

  useEffect(() => {
    async function loadAmenity() {
      try {
        const token = await getToken();
        const data = await fetchAPI(`/amenities/${slug}`, { token });
        setAmenity(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAmenity();
  }, [slug, getToken]);

  if (loading) return <LoadingSpinner message="Loading amenity details..." />;
  if (!amenity) return <div>Amenity not found.</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      
      const booking = await fetchAPI(`/amenities/${slug}/book`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          booking_date: bookingDate,
          end_date: amenity.allow_multi_day && endDate ? endDate : undefined,
          applicant_name: applicantName,
          contact_number: contactNumber,
          identity_proof: identityProof,
          form_data: formData
        })
      });

      if (booking.status === 'PENDING_PAYMENT') {
        toast.success('Booking created! Please complete payment.');
        router.push(`/citizen/book/pay/${booking.id}?fee=${totalFee}`);
      } else {
        toast.success('Booking request submitted successfully!');
        router.push('/citizen/my-bookings');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = amenity.form_fields || [];
  const allFieldsFilled = formFields.every((field: any) => formData[field.name] && formData[field.name].trim() !== '');
  const basicDetailsFilled = applicantName.trim() && contactNumber.trim() && identityProof.trim();
  const dateValid = bookingDate && (!amenity.allow_multi_day || endDate);
  const isFormValid = dateValid && basicDetailsFilled && allFieldsFilled;

  // Calculate fee
  let totalFee = amenity.fee_amount;
  if (amenity.allow_multi_day && bookingDate && endDate) {
    const start = new Date(bookingDate);
    const end = new Date(endDate);
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start day
      totalFee = amenity.fee_amount * diffDays;
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Book {amenity.name}</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-md mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Amenity Information</h4>
              <p className="text-sm text-blue-800">{amenity.description}</p>
              <div className="mt-2 text-sm font-semibold text-blue-900">
                Base Fee: ₹{amenity.fee_amount} {amenity.allow_multi_day && '/ day'}
              </div>
              {amenity.allow_multi_day && bookingDate && endDate && new Date(endDate) >= new Date(bookingDate) && (
                <div className="mt-1 text-sm font-bold text-emerald-700">
                  Total Calculated Fee: ₹{totalFee}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Applicant Details</h3>
              
              <div className="flex flex-col gap-2 w-full md:w-[65%]">
                <label className="text-sm font-medium leading-none">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-white"
                />
              </div>

              <div className="flex flex-col gap-2 w-full md:w-[65%]">
                <label className="text-sm font-medium leading-none">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <Input 
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-white"
                  pattern="[0-9]{10}"
                  title="Please enter exactly 10 digits"
                  maxLength={10}
                />
              </div>

              <div className="flex flex-col gap-2 w-full md:w-[65%]">
                <label className="text-sm font-medium leading-none">
                  Identity Proof Number (Aadhaar/Voter ID) <span className="text-red-500">*</span>
                </label>
                <Input 
                  required
                  value={identityProof}
                  onChange={(e) => setIdentityProof(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                  placeholder="Enter 12-digit Aadhaar or 10-char Voter ID"
                  className="w-full bg-white"
                  pattern="^(\d{12}|[A-Z]{3}\d{7})$"
                  title="Please enter a valid 12-digit Aadhaar number or 10-character Voter ID (e.g., ABC1234567)"
                  maxLength={12}
                />
              </div>

              <h3 className="font-semibold text-lg border-b pb-2 pt-4">Booking Timeline</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-[80%]">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium leading-none">
                    {amenity.allow_multi_day ? 'Start Date' : 'Select Booking Date'} <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      if (endDate && new Date(e.target.value) > new Date(endDate)) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full bg-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {amenity.allow_multi_day && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium leading-none">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-white"
                      min={bookingDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              {formFields.length > 0 && (
                <h3 className="font-semibold text-lg border-b pb-2 pt-4">Additional Details</h3>
              )}

              {formFields.map((field: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 w-full md:w-[65%]">
                  <label className="text-sm font-medium leading-none">
                    {field.name} <span className="text-red-500">*</span>
                  </label>
                  {field.type === 'radio' ? (
                    <Select 
                      value={formData[field.name] || ''} 
                      onValueChange={(val) => setFormData({...formData, [field.name]: val})}
                      required
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder={`Select ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt: string) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      type={field.type === 'file' ? 'text' : field.type} // Default to text if file unsupported here directly
                      required
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      placeholder={`Enter ${field.name}`}
                      className="w-full bg-white"
                    />
                  )}
                </div>
              ))}
            </div>

          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end p-4 border-t">
            <Button 
              type="submit" 
              disabled={!isFormValid || submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
