'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
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

export default function AmenityBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  
  const [amenity, setAmenity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Specific required field
  const [bookingDate, setBookingDate] = useState('');
  
  // Dynamic fields
  const [formData, setFormData] = useState<Record<string, any>>({});
  
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
      
      await fetchAPI(`/amenities/${slug}/book`, {
        method: 'POST',
        token,
        body: JSON.stringify({
          booking_date: bookingDate,
          form_data: formData
        })
      });

      alert('Booking request submitted successfully!');
      router.push('/citizen/book');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = amenity.form_fields || [];
  const allFieldsFilled = formFields.every((field: any) => formData[field.name] && formData[field.name].trim() !== '');
  const isFormValid = bookingDate && allFieldsFilled;

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
                Booking Fee: ₹{amenity.fee_amount}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2 w-full md:w-[65%]">
                <label className="text-sm font-medium leading-none">
                  Select Booking Date <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

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
            <Button type="submit" disabled={!isFormValid || submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
