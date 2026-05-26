'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImageKitUploader } from '@/components/ImageKitUploader';
import { Loader2 } from 'lucide-react';

export default function ApplicationFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  
  const [docType, setDocType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedProofs, setUploadedProofs] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    async function loadDocType() {
      try {
        const token = await getToken();
        // Assuming GET /document-types/{id} exists
        const data = await fetchAPI(`/document-types/${slug}`, { token });
        setDocType(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDocType();
  }, [slug, getToken]);

  if (loading) return <div>Loading form...</div>;
  if (!docType) return <div>Document type not found.</div>;

  const handleUploadSuccess = (reqName: string, url: string) => {
    setUploadedProofs(prev => ({ ...prev, [reqName]: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await getToken();
      
      // Map proofs to the format backend expects
      const proofs = Object.entries(uploadedProofs).map(([reqName, url]) => ({
        file_url: url,
        file_type: reqName,
        mime_type: 'unknown' // can be inferred from URL extension or uploader
      }));

      await fetchAPI('/applications', {
        method: 'POST',
        token,
        body: JSON.stringify({
          document_type_id: docType.id,
          remarks,
          proofs
        })
      });

      router.push('/citizen/applications');
    } catch (error) {
      console.error(error);
      alert('Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const requiredList = docType.required_documents || [];
  const allUploaded = requiredList.every((req: any) => uploadedProofs[req.name]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Apply for {docType.name}</h1>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Required Proofs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {requiredList.length === 0 && (
              <p className="text-muted-foreground">No documents required.</p>
            )}
            
            {requiredList.map((req: any, index: number) => (
              <div key={index} className="space-y-2 border-b pb-4 last:border-0">
                <label className="text-sm font-medium leading-none">
                  {req.name} {req.is_mandatory && <span className="text-red-500">*</span>}
                </label>
                <p className="text-sm text-muted-foreground mb-2">Please upload a clear copy of your {req.name}.</p>
                
                {uploadedProofs[req.name] ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                    ✓ Uploaded successfully
                    <Button variant="link" size="sm" onClick={() => handleUploadSuccess(req.name, '')}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <ImageKitUploader onUploadSuccess={(url) => handleUploadSuccess(req.name, url)} />
                )}
              </div>
            ))}

            <div className="space-y-2 pt-4">
              <label className="text-sm font-medium leading-none">Additional Remarks (Optional)</label>
              <Input 
                value={remarks} 
                onChange={(e) => setRemarks(e.target.value)} 
                placeholder="Any details you want to add..."
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || (!allUploaded && requiredList.length > 0)}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
