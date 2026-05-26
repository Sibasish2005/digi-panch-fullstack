'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAPI } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';

export function ImageKitUploader({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const { getToken } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = await getToken();
      // Get auth parameters from backend
      const authData = await fetchAPI('/uploads/auth', { token });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_test_key_here'); // Fallback to avoid crash if env missing during demo
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      
      // Upload directly to ImageKit
      const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload to ImageKit failed');
      
      const data = await res.json();
      onUploadSuccess(data.url);
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please ensure IMAGEKIT details are in env.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept="image/*,application/pdf"
          aria-label="Upload proof document"
          title="Upload proof document"
        />
        <Button type="button" variant="outline" disabled={uploading} className="gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Upload Proof'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Max size: 5MB. Formats: JPG, PNG, PDF.</p>
    </div>
  );
}
