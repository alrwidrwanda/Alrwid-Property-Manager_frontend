import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";

export default function ClientForm({ client, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(client || {
    full_name: '',
    contract_number: '',
    email: '',
    phone: '',
    address: '',
    nationality: '',
    identification_number: '',
    id_picture_url: '',
    contract_document_url: '',
    preferred_payment_method: 'Cash',
    notes: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (field === 'id_picture_url') setUploading(true);
      if (field === 'contract_document_url') setUploadingContract(true);
      
      const uploadApi = base44?.integrations?.Core?.UploadFile;
      let fileUrl = '';
      if (uploadApi) {
        const { file_url } = await uploadApi({ file });
        fileUrl = file_url;
      } else {
        // No upload API - convert to base64 data URL (works for images under 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('Image too large. Please use an image under 5MB.');
          return;
        }
        fileUrl = await fileToDataUrl(file);
      }
      setFormData(prev => ({ ...prev, [field]: fileUrl }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file");
    } finally {
      if (field === 'id_picture_url') setUploading(false);
      if (field === 'contract_document_url') setUploadingContract(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare payload - only send fields the backend expects, use empty string for optional
    const payload = {
      full_name: formData.full_name?.trim() || '',
      contract_number: formData.contract_number?.trim() || '',
      email: formData.email?.trim() || '',
      phone: formData.phone?.trim() || '',
      address: formData.address?.trim() || '',
      nationality: formData.nationality?.trim() || '',
      identification_number: formData.identification_number?.trim() || '',
      id_picture_url: formData.id_picture_url || '',
      contract_document_url: formData.contract_document_url || '',
      preferred_payment_method: formData.preferred_payment_method || 'Cash',
      notes: formData.notes?.trim() || '',
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>
          {/* Contract Number removed - generated at Sale */}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="+971 50 123 4567"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            placeholder="Street address, City, Country"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({...formData, nationality: e.target.value})}
              placeholder="e.g., UAE"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="identification_number">ID/Passport Number</Label>
            <Input
              id="identification_number"
              value={formData.identification_number}
              onChange={(e) => setFormData({...formData, identification_number: e.target.value})}
              placeholder="ID or Passport"
            />
          </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="id_picture">ID/Passport Picture</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="id_picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'id_picture_url')}
                  disabled={uploading}
                />
              </div>
              {uploading && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
            </div>
            {formData.id_picture_url && (
              <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                  <img 
                    src={formData.id_picture_url} 
                    alt="ID/Passport" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => setFormData({...formData, id_picture_url: ''})}
                  >
                    <Upload className="w-3 h-3 rotate-45" />
                  </Button>
              </div>
            )}
        </div>

        {/* Contract Document Upload removed - uploaded at Sale */}
      </div>

      {/* Payment Preferences removed */}

      {/* Notes */}
      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about the client..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
}