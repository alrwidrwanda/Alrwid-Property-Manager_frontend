import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReceiptUpload({ payment, existingReceipt, onClose }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(existingReceipt?.status || 'available');
  const [notes, setNotes] = useState(existingReceipt?.notes || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const queryClient = useQueryClient();

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      setUploadProgress(10);

      let fileUrl = '';
      let fileType = file?.type?.includes('pdf') ? 'pdf' : 'image';
      if (!file && existingReceipt) {
        fileType = existingReceipt.file_type || 'image';
      }

      if (file) {
        const uploadApi = base44?.integrations?.Core?.UploadFile;
        if (uploadApi) {
          const result = await uploadApi({ file });
          fileUrl = result?.file_url || '';
        } else {
          // No upload API - convert to base64 data URL for storage (works for files under ~10MB)
          const maxSize = 10 * 1024 * 1024;
          if (file.size > maxSize) {
            throw new Error('File too large. Please use a file under 10MB, or configure file upload.');
          }
          fileUrl = await fileToDataUrl(file);
        }
        setUploadProgress(50);
      } else if (existingReceipt?.file_url || existingReceipt?.receipt_url) {
        fileUrl = existingReceipt.file_url || existingReceipt.receipt_url;
      }

      const receiptData = {
        payment_id: payment.id,
        file_url: fileUrl,
        receipt_url: fileUrl,
        file_type: fileType,
        status,
        upload_date: new Date().toISOString().split('T')[0],
        notes: notes?.trim() || '',
      };

      setUploadProgress(75);

      if (existingReceipt) {
        await base44.entities.Receipt.update(existingReceipt.id, receiptData);
      } else {
        await base44.entities.Receipt.create(receiptData);
      }

      setUploadProgress(100);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);
      if (window.addNotification) {
        window.addNotification(error?.message || 'Failed to upload receipt', 'error');
      } else {
        alert(error?.message || 'Failed to upload receipt');
      }
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isValid = selectedFile.type.includes('pdf') || selectedFile.type.includes('image');
      if (!isValid) {
        alert('Please select a PDF or image file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file && !existingReceipt) {
      alert('Please select a file to upload');
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* File Upload */}
      <div className="space-y-2">
        <Label>Receipt File {!existingReceipt && '*'}</Label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
            onChange={handleFileChange}
            className="hidden"
            id="receipt-upload"
            disabled={uploading}
          />
          <label htmlFor="receipt-upload" className="cursor-pointer block">
            <div className="flex flex-col items-center gap-3">
              {file ? (
                <>
                  {file.type.includes('pdf') ? (
                    <FileText className="w-12 h-12 text-red-500" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-blue-500" />
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!uploading && (
                    <Button type="button" variant="outline" size="sm">
                      Change File
                    </Button>
                  )}
                </>
              ) : existingReceipt ? (
                <>
                  <Upload className="w-12 h-12 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900">Upload New Receipt</p>
                    <p className="text-sm text-slate-500">PDF or Image (Max 10MB)</p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900">Click to upload receipt</p>
                    <p className="text-sm text-slate-500">PDF or Image (Max 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Receipt Status</Label>
        <Select value={status} onValueChange={setStatus} disabled={uploading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-slate-500">
          Mark as "Available" if receipt is ready, or "Pending" if waiting for verification
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes about this receipt..."
          rows={3}
          disabled={uploading}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Uploading...</span>
            <span className="font-semibold">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Success Message */}
      {uploadProgress === 100 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Receipt uploaded successfully!</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={uploading || (!file && !existingReceipt)}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {existingReceipt ? 'Update Receipt' : 'Upload Receipt'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}