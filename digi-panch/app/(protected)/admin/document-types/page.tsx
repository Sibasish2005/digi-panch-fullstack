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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DocumentTypesPage() {
  const { getToken } = useAuth();
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState(0);
  const [processingDays, setProcessingDays] = useState(7);
  const [requiredDocs, setRequiredDocs] = useState<{name: string, type: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDocTypes();
  }, [getToken]);

  async function loadDocTypes() {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await fetchAPI('/document-types', { token });
      setDocTypes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setFee(0);
    setProcessingDays(7);
    setRequiredDocs([]);
  };

  const handleCreateNewClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (docType: any) => {
    setEditingId(docType.id);
    setName(docType.name);
    setDescription(docType.description || '');
    setFee(docType.fee_amount);
    setProcessingDays(docType.processing_days);
    setRequiredDocs(docType.required_documents || []);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document type?")) return;
    
    try {
      const token = await getToken();
      await fetchAPI(`/admin/document-types/${id}`, {
        method: 'DELETE',
        token,
      });
      loadDocTypes();
    } catch (error) {
      console.error("Failed to delete document type:", error);
      alert("Failed to delete document type.");
    }
  };

  const handleAddRequiredDoc = () => {
    setRequiredDocs([...requiredDocs, { name: '', type: 'pdf' }]);
  };

  const handleUpdateRequiredDoc = (index: number, field: string, value: string) => {
    const updated = [...requiredDocs];
    updated[index] = { ...updated[index], [field]: value };
    setRequiredDocs(updated);
  };

  const handleRemoveRequiredDoc = (index: number) => {
    setRequiredDocs(requiredDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      
      const payload = {
        name,
        slug,
        description,
        fee_amount: fee,
        processing_days: processingDays,
        required_documents: requiredDocs
      };

      if (editingId) {
        await fetchAPI(`/admin/document-types/${editingId}`, {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload)
        });
      } else {
        await fetchAPI('/admin/document-types', {
          method: 'POST',
          token,
          body: JSON.stringify(payload)
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadDocTypes();
    } catch (error) {
      console.error("Failed to save document type:", error);
      alert("Failed to save document type. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Document Types</h1>
        <Button onClick={handleCreateNewClick}><Plus className="mr-2 h-4 w-4" /> Create New</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Update Document Type" : "Create Document Type"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update the details for this document type." : "Add a new type of document that citizens can apply for."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="e.g. Income Certificate" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="Brief description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fee Amount (₹)</label>
                <Input 
                  type="number" 
                  min="0"
                  value={fee} 
                  onChange={(e) => setFee(parseFloat(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Days</label>
                <Input 
                  type="number" 
                  min="1"
                  value={processingDays} 
                  onChange={(e) => setProcessingDays(parseInt(e.target.value))} 
                  required 
                />
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Required Proofs/Documents</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRequiredDoc}>
                  <Plus className="mr-2 h-4 w-4" /> Add Requirement
                </Button>
              </div>
              
              {requiredDocs.length === 0 && (
                <div className="text-sm text-gray-500 italic py-2">No required documents specified.</div>
              )}
              
              {requiredDocs.map((doc, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <Input 
                    placeholder="Document Name (e.g. Aadhar Card)" 
                    value={doc.name} 
                    onChange={(e) => handleUpdateRequiredDoc(idx, 'name', e.target.value)} 
                    required
                    className="flex-1"
                  />
                  <select 
                    className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={doc.type}
                    onChange={(e) => handleUpdateRequiredDoc(idx, 'type', e.target.value)}
                    aria-label="Required Document Type"
                    title="Required Document Type"
                  >
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="any">Any</option>
                  </select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRequiredDoc(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Update Document Type" : "Create Document Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Processing Time</TableHead>
              <TableHead>Required Proofs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docTypes.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No document types found.
                </TableCell>
              </TableRow>
            )}
            {docTypes.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">
                  {type.name}
                  {type.description && <p className="text-xs text-muted-foreground font-normal">{type.description}</p>}
                </TableCell>
                <TableCell>₹{type.fee_amount}</TableCell>
                <TableCell>{type.processing_days} Days</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {type.required_documents?.map((req: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {req.name}
                      </Badge>
                    ))}
                    {(!type.required_documents || type.required_documents.length === 0) && (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={type.is_active ? "default" : "destructive"}>
                    {type.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={() => handleEditClick(type)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Update
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDeleteClick(type.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
