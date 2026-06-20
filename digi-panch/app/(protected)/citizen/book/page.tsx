import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  let amenities = [];
  
  try {
    amenities = await fetchAPI('/amenities?active_only=true');
  } catch (e) {
    console.error('Failed to fetch amenities', e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/citizen/my-bookings">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book Amenities</h1>
          <p className="text-muted-foreground">Select an amenity to start your booking request.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {amenities.map((amenity: any) => (
          <Card key={amenity.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{amenity.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-gray-600 mb-4">{amenity.description}</p>
              <div className="text-sm font-semibold">
                Fee: ₹{amenity.fee_amount}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/citizen/book/${amenity.slug}`} className="w-full">
                <Button className="w-full">Book Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {amenities.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-8 bg-white border rounded-md">
            No amenities available for booking at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
