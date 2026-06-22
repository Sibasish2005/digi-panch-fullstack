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
import { Trash2, Plus, GripVertical, AlertCircle, Loader2, Pencil, Ban, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Badge } from '@/components/ui/badge';

export default function DocumentTypesPage() {
  const { getToken } = useAuth();
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    docType: any | null;
  }>({ isOpen: false, action: '', docType: null });

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState(0);
  const [processingDays, setProcessingDays] = useState(7);
  const [requiredDocs, setRequiredDocs] = useState<{name: string, type: string}[]>([]);
  const [formFields, setFormFields] = useState<{name: string, type: string, options?: string[]}[]>([]);
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
    setFormFields([]);
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
    setFormFields(docType.form_fields || []);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (docType: any) => {
    const action = docType.is_active ? "deactivate" : "activate";
    setConfirmDialog({ isOpen: true, action, docType });
  };

  const executeToggleStatus = async () => {
    if (!confirmDialog.docType) return;
    const { action, docType } = confirmDialog;
    
    try {
      const token = await getToken();
      await fetchAPI(`/admin/document-types/${docType.id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ is_active: !docType.is_active })
      });
      toast.success(`Document type successfully ${action}d.`);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      loadDocTypes();
    } catch (error) {
      console.error(`Failed to ${action} document type:`, error);
      toast.error(`Failed to ${action} document type.`);
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

  const handleAddFormField = () => {
    setFormFields([...formFields, { name: '', type: 'text' }]);
  };

  const handleUpdateFormField = (index: number, field: string, value: string) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [field]: value };
    // If changing away from radio, maybe clear options, but it's fine to leave them.
    setFormFields(updated);
  };

  const handleAddOption = (fieldIndex: number) => {
    const updated = [...formFields];
    if (!updated[fieldIndex].options) {
      updated[fieldIndex].options = [];
    }
    updated[fieldIndex].options!.push('');
    setFormFields(updated);
  };

  const handleUpdateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...formFields];
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options![optionIndex] = value;
    }
    setFormFields(updated);
  };

  const handleRemoveOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...formFields];
    if (updated[fieldIndex].options) {
      updated[fieldIndex].options!.splice(optionIndex, 1);
    }
    setFormFields(updated);
  };

  const handleRemoveFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
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
        required_documents: requiredDocs,
        form_fields: formFields
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
      
      toast.success(editingId ? "Document type updated successfully" : "Document type created successfully");
      setIsDialogOpen(false);
      resetForm();
      loadDocTypes();
    } catch (error) {
      console.error("Failed to save document type:", error);
      toast.error("Failed to save document type. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading document types..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 style={{ fontFamily: "var(--font-noto-serif)" }} className="text-3xl font-black text-[#0f2a5e] tracking-tight">Document Types</h1>
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
                  value={Number.isNaN(fee) ? '' : fee} 
                  onChange={(e) => setFee(parseFloat(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Processing Days</label>
                <Input 
                  type="number" 
                  min="1"
                  value={Number.isNaN(processingDays) ? '' : processingDays} 
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

            <div className="pt-4 space-y-3 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Form Fields (Data to Collect)</h3>
                <Button type="button" variant="outline" size="sm" onClick={handleAddFormField}>
                  <Plus className="mr-2 h-4 w-4" /> Add Field
                </Button>
              </div>
              
              {formFields.length === 0 && (
                <div className="text-sm text-gray-500 italic py-2">No form fields specified.</div>
              )}
              
              {formFields.map((field, idx) => (
                <div key={idx} className="space-y-2 border p-3 rounded-md bg-gray-50/50">
                  <div className="flex gap-3 items-center">
                    <Input 
                      placeholder="Field Name (e.g. Gender)" 
                      value={field.name} 
                      onChange={(e) => handleUpdateFormField(idx, 'name', e.target.value)} 
                      required
                      className="flex-1 bg-white"
                    />
                    <select 
                      className="flex h-9 w-32 rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors"
                      value={field.type}
                      onChange={(e) => handleUpdateFormField(idx, 'type', e.target.value)}
                      aria-label="Field Type"
                      title="Field Type"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="radio">Radio</option>
                    </select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveFormField(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {field.type === 'radio' && (
                    <div className="pl-1 pt-2 space-y-2 border-t mt-2 pb-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Radio Options</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddOption(idx)} className="h-7 text-xs bg-white">
                          <Plus className="h-3 w-3 mr-1" /> Add Option
                        </Button>
                      </div>
                      {(!field.options || field.options.length === 0) && (
                        <div className="text-xs text-gray-400 italic">No options added yet. Click "Add Option".</div>
                      )}
                      {field.options?.map((opt, optIdx) => (
                        <div key={optIdx} className="flex gap-2 items-center pl-2">
                          <div className="h-3.5 w-3.5 rounded-full border border-gray-300 flex-shrink-0 bg-white" />
                          <Input 
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt} 
                            onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)} 
                            required
                            className="bg-white text-sm h-8 flex-1"
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(idx, optIdx)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
      
      <div className="rounded-sm border border-slate-200 bg-white shadow-sm">
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
                  {type.description && (
                    <p 
                      className="text-xs text-muted-foreground font-normal max-w-md line-clamp-2 mt-1" 
                      title={type.description}
                    >
                      {type.description}
                    </p>
                  )}
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
                      className={`h-8 px-2.5 ${type.is_active ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200' : 'text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200'}`}
                      onClick={() => handleToggleStatus(type)}
                    >
                      {type.is_active ? <Ban className="h-3.5 w-3.5 mr-1.5" /> : <CheckCircle className="h-3.5 w-3.5 mr-1.5" />}
                      {type.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={executeToggleStatus}
        title={`Confirm ${confirmDialog.action === 'activate' ? 'Activation' : 'Deactivation'}`}
        description={`Are you sure you want to ${confirmDialog.action} the document type "${confirmDialog.docType?.name}"?`}
        confirmText="Yes, I'm sure"
        isDestructive={confirmDialog.action === 'deactivate'}
      />
    </div>
  );
}
