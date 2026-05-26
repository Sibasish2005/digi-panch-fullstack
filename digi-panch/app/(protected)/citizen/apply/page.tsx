import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function ApplyPage() {
  let docTypes = [];
  
  try {
    docTypes = await fetchAPI('/document-types');
  } catch (e) {
    console.error('Failed to fetch document types', e);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Apply for Documents</h1>
      <p className="text-muted-foreground">Select a document to start your application.</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docTypes.map((doc: any) => (
          <Card key={doc.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{doc.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
              <div className="text-sm font-semibold">
                Fee: ₹{doc.fee_amount}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/citizen/apply/${doc.slug}`} className="w-full">
                <Button className="w-full">Apply Now</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {docTypes.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-8 bg-white border rounded-md">
            No document types available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
