import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentForm({ payment, sales, clients, apartments, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(payment || {
    sale_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    currency: 'USD',
    payment_method: 'Cash',
    payment_type: 'scheduled_payment',
    reference_number: '',
    is_delayed: false,
    delay_days: 0,
    notes: '',
  });

  const [useCustomCurrency, setUseCustomCurrency] = useState(false);

  const selectedSale = sales.find(s => s.id === formData.sale_id);
  const selectedClient = selectedSale ? clients.find(c => c.id === selectedSale.client_id) : null;
  const selectedApartment = selectedSale ? apartments.find(a => a.id === selectedSale.apartment_id) : null;
  const [openSaleSelect, setOpenSaleSelect] = useState(false);

  // Auto-fill currency, payment method, and contract number from sale
  useEffect(() => {
    if (selectedSale && !payment) {
      setFormData(prev => ({
        ...prev,
        currency: selectedSale.currency,
        payment_method: selectedSale.payment_method || 'Cash',
        reference_number: selectedSale.contract_number || prev.reference_number
      }));
    }
  }, [selectedSale, payment]);

  // Auto-calculate delay
  useEffect(() => {
    if (formData.is_delayed && selectedSale?.payment_start_date) {
      const paymentDate = new Date(formData.payment_date);
      const expectedDate = new Date(selectedSale.payment_start_date);
      
      const monthsSinceStart = Math.floor((paymentDate - expectedDate) / (1000 * 60 * 60 * 24 * 30));
      expectedDate.setMonth(expectedDate.getMonth() + monthsSinceStart);
      
      const delayDays = Math.max(0, Math.floor((paymentDate - expectedDate) / (1000 * 60 * 60 * 24)));
      setFormData(prev => ({
        ...prev,
        delay_days: delayDays
      }));
    } else if (!formData.is_delayed) {
      setFormData(prev => ({
        ...prev,
        delay_days: 0
      }));
    }
  }, [formData.is_delayed, formData.payment_date, selectedSale]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const activeSales = sales.filter(s => s.status === 'active' || s.id === payment?.sale_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Sale Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sale Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="sale_id">Select Sale *</Label>
            <Popover open={openSaleSelect} onOpenChange={setOpenSaleSelect}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSaleSelect}
                  className="w-full justify-between"
                  disabled={!!payment}
                >
                  {formData.sale_id
                    ? (() => {
                        const sale = activeSales.find((s) => s.id === formData.sale_id);
                        if (!sale) return "Select a sale";
                        const client = clients.find(c => c.id === sale.client_id);
                        const apartment = apartments.find(a => a.id === sale.apartment_id);
                        return `${client?.full_name} - Unit ${apartment?.unit_number}`;
                      })()
                    : "Select a sale..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search client or unit..." />
                  <CommandList>
                    <CommandEmpty>No sale found.</CommandEmpty>
                    <CommandGroup>
                      {activeSales.map((sale) => {
                        const client = clients.find(c => c.id === sale.client_id);
                        const apartment = apartments.find(a => a.id === sale.apartment_id);
                        const label = `${client?.full_name} - Unit ${apartment?.unit_number}`;
                        return (
                          <CommandItem
                            key={sale.id}
                            value={label}
                            onSelect={() => {
                              setFormData({...formData, sale_id: sale.id});
                              setOpenSaleSelect(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.sale_id === sale.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                                <span>{label}</span>
                                <span className="text-xs text-muted-foreground">
                                    Balance: {((sale.total_price || 0) - (sale.total_paid || 0)).toLocaleString()} {sale.currency}
                                </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedSale && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Client</p>
                  <p className="text-blue-900">{selectedClient?.full_name}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Unit</p>
                  <p className="text-blue-900">{selectedApartment?.unit_number}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Total Price</p>
                  <p className="text-blue-900">{selectedSale.total_price?.toLocaleString()} {selectedSale.currency}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Remaining Balance</p>
                  <p className="text-blue-900 font-bold">
                    {((selectedSale.total_price || 0) - (selectedSale.total_paid || 0)).toLocaleString()} {selectedSale.currency}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount ?? ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({...formData, payment_method: value})}
                disabled={!!selectedSale && !payment}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select 
                value={formData.payment_type} 
                onValueChange={(value) => setFormData({...formData, payment_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advanced_payment">Advanced Payment</SelectItem>
                  <SelectItem value="scheduled_payment">Scheduled Payment</SelectItem>
                  <SelectItem value="additional">Additional Payment</SelectItem>
                  <SelectItem value="final">Final Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference_number">Contract Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                placeholder="Contract reference"
                disabled={!!selectedSale && !payment}
              />
            </div>
          </div>

          {/* Delay Tracking */}
          <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_delayed"
                checked={formData.is_delayed}
                onCheckedChange={(checked) => setFormData({...formData, is_delayed: checked === true})}
              />
              <Label htmlFor="is_delayed" className="cursor-pointer">
                This payment was delayed
              </Label>
            </div>
            {formData.is_delayed && (
              <div className="space-y-2">
                <Label htmlFor="delay_days">Delay Days</Label>
                <Input
                  id="delay_days"
                  type="number"
                  value={formData.delay_days}
                  onChange={(e) => setFormData({...formData, delay_days: parseInt(e.target.value) || 0})}
                  placeholder="Number of days delayed"
                />
              </div>
            )}
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
          placeholder="Additional notes about this payment..."
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
            disabled={isLoading || !formData.sale_id}
            className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            {isLoading ? 'Saving...' : payment ? 'Update Payment' : 'Record Payment'}
          </Button>
      </div>
    </form>
  );
}