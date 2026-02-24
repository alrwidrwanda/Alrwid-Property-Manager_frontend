import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMonths, differenceInMonths, format } from 'date-fns';
import { Loader2, X } from "lucide-react";

export default function IndividualSaleDetails({ apartment, saleData, onUpdate }) {
  const [uploadingContract, setUploadingContract] = useState(false);
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [useCustomFrequency, setUseCustomFrequency] = useState(false);

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingContract(true);
      const uploadApi = base44?.integrations?.Core?.UploadFile;
      let fileUrl = '';
      if (uploadApi) {
        const { file_url } = await uploadApi({ file });
        fileUrl = file_url;
      } else {
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('File too large. Please use a file under 5MB.');
          return;
        }
        fileUrl = await fileToDataUrl(file);
      }
      onUpdate({ contract_document_url: fileUrl });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file");
    } finally {
      setUploadingContract(false);
    }
  };

  // Payment End Date
  const [endDate, setEndDate] = useState(() => {
    if (!saleData.sale_date) return '';
    try {
      const start = new Date(saleData.sale_date);
      const end = addMonths(start, saleData.payment_duration_months || 0);
      return format(end, 'MM-dd-yyyy');
    } catch (e) {
      return '';
    }
  });
  const [endDateError, setEndDateError] = useState('');

  useEffect(() => {
    if (saleData.sale_date && saleData.payment_duration_months !== undefined) {
      try {
        const start = new Date(saleData.sale_date);
        const end = addMonths(start, saleData.payment_duration_months || 0);
        setEndDate(format(end, 'MM-dd-yyyy'));
      } catch (e) {}
    }
  }, [saleData.sale_date, saleData.payment_duration_months]);

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    setEndDateError('');

    if (!newEndDate) return;
    
    // Validate MM-DD-YYYY format
    const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-(19|20)\d{2}$/;
    if (!dateRegex.test(newEndDate)) {
      setEndDateError('Please use MM-DD-YYYY format');
      return;
    }

    // Parse and validate the date
    try {
      const [month, day, year] = newEndDate.split('-').map(Number);
      const end = new Date(year, month - 1, day);
      
      // Check if the date is valid (e.g., not Feb 30)
      if (end.getMonth() !== month - 1 || end.getDate() !== day) {
        setEndDateError('Invalid date');
        return;
      }

      // If sale_date exists, calculate duration
      if (saleData.sale_date) {
        const start = new Date(saleData.sale_date);
        const months = differenceInMonths(end, start);

        if (months >= 0) {
          onUpdate({ payment_duration_months: months });
        }
      }
    } catch (e) {
      setEndDateError('Invalid date');
    }
  };

  const remainingBalance = saleData.total_price - saleData.first_installment - (saleData.total_paid || 0);

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg">
      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contract Number *</Label>
            <Input
              value={saleData.contract_number || ''}
              onChange={(e) => onUpdate({ contract_number: e.target.value })}
              placeholder="Enter contract number (e.g. C-001)"
            />
          </div>

          <div className="space-y-2">
            <Label>Signed Contract (PDF/Image)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingContract}
                />
              </div>
              {uploadingContract && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
            </div>
            {saleData.contract_document_url && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                <span className="text-sm text-green-600 truncate flex-1">Contract Uploaded</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdate({ contract_document_url: '' })}
                  className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sale Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sale Date *</Label>
              <Input
                type="date"
                value={saleData.sale_date || ''}
                onChange={(e) => onUpdate({ sale_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={saleData.status || 'active'}
                onValueChange={(value) => onUpdate({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Price *</Label>
              <Input
                type="number"
                step="0.01"
                value={saleData.total_price || 0}
                onChange={(e) => onUpdate({ total_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              {!useCustomCurrency ? (
                <Select
                  value={saleData.currency || 'AED'}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setUseCustomCurrency(true);
                      onUpdate({ currency: '' });
                    } else {
                      onUpdate({ currency: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED (Dirham)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                    <SelectItem value="RWF">RWF (Rwandan Francs)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={saleData.currency || ''}
                    onChange={(e) => onUpdate({ currency: e.target.value.toUpperCase() })}
                    placeholder="e.g., GBP"
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setUseCustomCurrency(false);
                      onUpdate({ currency: 'AED' });
                    }}
                  >
                    Select
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select
              value={saleData.payment_method || 'Cash'}
              onValueChange={(value) => onUpdate({ payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Installment">Installment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Advanced Payment</Label>
            <Input
              type="number"
              step="0.01"
              value={saleData.first_installment || 0}
              onChange={(e) => onUpdate({ first_installment: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Payment End Date</Label>
              <Input 
                type="text" 
                placeholder="MM-DD-YYYY"
                value={endDate} 
                onChange={handleEndDateChange}
                className={endDateError ? 'border-red-500' : ''}
              />
              {endDateError && <p className="text-xs text-red-500">{endDateError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Payment Frequency</Label>
              {!useCustomFrequency ? (
                <Select
                  value={String(saleData.payment_frequency_months || 1)}
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setUseCustomFrequency(true);
                    } else {
                      onUpdate({ payment_frequency_months: parseInt(value) });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monthly (Every month)</SelectItem>
                    <SelectItem value="2">Bi-Monthly (Every 2 months)</SelectItem>
                    <SelectItem value="3">Quarterly (Every 3 months)</SelectItem>
                    <SelectItem value="6">Semi-Annually (Every 6 months)</SelectItem>
                    <SelectItem value="12">Annually (Every 12 months)</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    value={saleData.payment_frequency_months || 1}
                    onChange={(e) => onUpdate({ payment_frequency_months: parseInt(e.target.value) || 1 })}
                    placeholder="Enter months"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUseCustomFrequency(false)}
                  >
                    Select
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={saleData.monthly_payment || 0}
                onChange={(e) => onUpdate({ monthly_payment: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700 mb-1">Remaining Balance</p>
            <p className="text-xl font-bold text-amber-900">
              {remainingBalance.toLocaleString()} {saleData.currency}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={saleData.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Additional notes about this sale..."
          rows={3}
        />
      </div>
    </div>
  );
}