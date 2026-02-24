import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addMonths, differenceInMonths, format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SaleForm({ sale, clients, apartments, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(sale || {
    apartment_id: '', // Used for single sale editing
    selected_apartment_ids: [], // Used for new multi-sale creation
    client_id: '',
    contract_number: '',
    sale_date: new Date().toISOString().split('T')[0],
    total_price: 0,
    currency: 'USD',
    first_installment: 0,
    monthly_payment: 0,
    payment_duration_months: 12,
    payment_frequency_months: 1,
    custom_frequency_input: '',
    total_paid: 0,
    payment_method: 'Cash',
    contract_document_url: '',
    status: 'active',
    notes: '',
  });

  const [useCustomFrequency, setUseCustomFrequency] = useState(false);
  const [useCustomCurrency, setUseCustomCurrency] = useState(false);
  const [openApartmentSelect, setOpenApartmentSelect] = useState(false);
  const [openClientSelect, setOpenClientSelect] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

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
      setFormData(prev => ({ ...prev, contract_document_url: fileUrl }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file");
    } finally {
      setUploadingContract(false);
    }
  };

  const selectedApartment = apartments.find(a => a.id === formData.apartment_id);

  // Auto-fill apartment price and currency
  useEffect(() => {
    if (sale) return;

    // Logic for new sales
    if (formData.selected_apartment_ids?.length > 0) {
        // Calculate total price of all selected apartments
        const total = formData.selected_apartment_ids.reduce((sum, id) => {
            const apt = apartments.find(a => a.id === id);
            return sum + (apt?.base_price || 0);
        }, 0);
        
        // Use currency of the first apartment
        const firstApt = apartments.find(a => a.id === formData.selected_apartment_ids[0]);
        
        setFormData(prev => ({
            ...prev,
            total_price: total,
            currency: firstApt?.currency || 'USD'
        }));
    } else if (selectedApartment) {
        setFormData(prev => ({
            ...prev,
            total_price: selectedApartment.base_price || 0,
            currency: selectedApartment.currency || 'USD',
        }));
    }
  }, [selectedApartment, formData.selected_apartment_ids, sale]);

  // Payment End Date State
  const [endDate, setEndDate] = useState(() => {
    if (!formData.sale_date) return '';
    try {
        const start = new Date(formData.sale_date);
        const end = addMonths(start, formData.payment_duration_months || 0);
        return format(end, 'MM-dd-yyyy');
    } catch (e) { return ''; }
  });
  const [endDateError, setEndDateError] = useState('');

  // Sync End Date when duration or start date changes from outside (or initial)
  useEffect(() => {
    if (formData.sale_date && formData.payment_duration_months !== undefined) {
      try {
        const start = new Date(formData.sale_date);
        const end = addMonths(start, formData.payment_duration_months || 0);
        setEndDate(format(end, 'MM-dd-yyyy'));
      } catch (e) { }
    }
  }, [formData.sale_date, formData.payment_duration_months]);

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
      if (formData.sale_date) {
        const start = new Date(formData.sale_date);
        const months = differenceInMonths(end, start);
        
        if (months >= 0) {
          setFormData(prev => ({ ...prev, payment_duration_months: months }));
        }
      }
    } catch(e) {
      setEndDateError('Invalid date');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const remainingBalance = formData.total_price - formData.first_installment - (formData.total_paid || 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Property & Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Property & Client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="apartment_id">Select Apartment(s) *</Label>
            <Popover open={openApartmentSelect} onOpenChange={setOpenApartmentSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openApartmentSelect}
                  className="w-full justify-between h-auto py-2"
                  disabled={!!sale}
                >
                  {sale ? (
                    // Editing single sale
                    apartments.find((a) => a.id === formData.apartment_id)?.unit_number 
                      ? `Unit ${apartments.find((a) => a.id === formData.apartment_id).unit_number}`
                      : "Select apartment"
                  ) : (
                    // Creating new sale (possibly multiple)
                    formData.selected_apartment_ids?.length > 0
                      ? `${formData.selected_apartment_ids.length} Unit(s) selected`
                      : "Select apartment(s)..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search unit..." />
                  <CommandList>
                    <CommandEmpty>No apartment found.</CommandEmpty>
                    <CommandGroup>
                      {apartments.map((apt) => {
                        const isSelected = sale 
                            ? formData.apartment_id === apt.id 
                            : formData.selected_apartment_ids?.includes(apt.id);
                            
                        return (
                        <CommandItem
                          key={apt.id}
                          value={`Unit ${apt.unit_number} - ${apt.apartment_description}`}
                          onSelect={() => {
                            if (sale) {
                                // Single edit mode
                                setFormData({...formData, apartment_id: apt.id});
                                setOpenApartmentSelect(false);
                            } else {
                                // Multi-select mode
                                const current = formData.selected_apartment_ids || [];
                                const newSelection = current.includes(apt.id)
                                    ? current.filter(id => id !== apt.id)
                                    : [...current, apt.id];
                                setFormData({...formData, selected_apartment_ids: newSelection});
                                // Keep open for multiple selection
                            }
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>Unit {apt.unit_number}</span>
                            <span className="text-xs text-muted-foreground">{apt.apartment_description} ({apt.area_sqm} sqm)</span>
                          </div>
                        </CommandItem>
                      )})}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Show selected units tags */}
            {!sale && formData.selected_apartment_ids?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {formData.selected_apartment_ids.map(id => {
                        const apt = apartments.find(a => a.id === id);
                        return (
                            <div key={id} className="bg-slate-100 px-2 py-1 rounded-md text-sm flex items-center gap-2">
                                <span>Unit {apt?.unit_number}</span>
                                <span className="text-xs text-slate-500">{apt?.base_price?.toLocaleString()} {apt?.currency}</span>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>

          <div className="space-y-2">
              <Label htmlFor="contract_number">Contract Number *</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                placeholder="Enter contract number (e.g. C-001)"
                required
              />
              <p className="text-xs text-slate-500">
                {formData.selected_apartment_ids?.length > 1 
                    ? "This contract number will be applied to all selected units." 
                    : "Unique contract number for this sale."}
              </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_document">Signed Contract (PDF/Image)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="contract_document"
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingContract}
                />
              </div>
              {uploadingContract && <Loader2 className="w-5 h-5 animate-spin text-slate-500" />}
            </div>
            {formData.contract_document_url && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="text-sm text-green-600 truncate flex-1">Contract Uploaded</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({...formData, contract_document_url: ''})}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
              </div>
            )}
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="client_id">Select Client *</Label>
            <Popover open={openClientSelect} onOpenChange={setOpenClientSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openClientSelect}
                  className="w-full justify-between"
                >
                  {formData.client_id
                    ? clients.find((c) => c.id === formData.client_id)?.full_name
                    : "Select client..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search client..." />
                  <CommandList>
                    <CommandEmpty>No client found.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.full_name}
                          onSelect={() => {
                            setFormData({...formData, client_id: client.id});
                            setOpenClientSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.client_id === client.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.full_name}</span>
                            <span className="text-xs text-muted-foreground">{client.phone}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Sale Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_date">Sale Date *</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_price">Total Price *</Label>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                value={formData.total_price}
                onChange={(e) => setFormData({...formData, total_price: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
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
          <CardTitle className="text-lg">Payment Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_installment">Advanced Payment</Label>
            <Input
              id="first_installment"
              type="number"
              step="0.01"
              value={formData.first_installment}
              onChange={(e) => setFormData({...formData, first_installment: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_end_date">Payment End Date</Label>
              <Input
                id="payment_end_date"
                type="text"
                placeholder="MM-DD-YYYY"
                value={endDate}
                onChange={handleEndDateChange}
                className={endDateError ? 'border-red-500' : ''}
              />
              {endDateError && <p className="text-xs text-red-500">{endDateError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_frequency_months">Payment Frequency</Label>
              {!useCustomFrequency ? (
                <Select 
                  value={String(formData.payment_frequency_months)} 
                  onValueChange={(value) => {
                    if (value === 'custom') {
                      setUseCustomFrequency(true);
                    } else {
                      setFormData({...formData, payment_frequency_months: parseInt(value)});
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
                    value={formData.payment_frequency_months}
                    onChange={(e) => setFormData({...formData, payment_frequency_months: parseInt(e.target.value) || 1})}
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
              <Label htmlFor="monthly_payment">Payment Amount</Label>
              <Input
                id="monthly_payment"
                type="number"
                step="0.01"
                value={formData.monthly_payment}
                onChange={(e) => setFormData({...formData, monthly_payment: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-700 mb-1">Remaining Balance</p>
            <p className="text-xl font-bold text-amber-900">
              {remainingBalance.toLocaleString()} {formData.currency}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about this sale..."
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
          disabled={
            isLoading || 
            (!sale && (!formData.selected_apartment_ids || formData.selected_apartment_ids.length === 0)) || 
            (sale && !formData.apartment_id) || 
            !formData.client_id ||
            !formData.contract_number
          }
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Saving...' : sale ? 'Update Sale' : 'Create Sale'}
        </Button>
      </div>
    </form>
  );
}