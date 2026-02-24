import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Building2, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import IndividualSaleDetails from './IndividualSaleDetails';

export default function MultiApartmentSaleForm({ clients, apartments, onSubmit, onCancel, isLoading }) {
  const [selectedApartmentIds, setSelectedApartmentIds] = useState([]);
  const [clientId, setClientId] = useState('');
  const [openApartmentSelect, setOpenApartmentSelect] = useState(false);
  const [openClientSelect, setOpenClientSelect] = useState(false);
  
  // Individual sale data for each apartment
  const [apartmentSalesData, setApartmentSalesData] = useState({});

  const handleApartmentSelect = (aptId) => {
    const newSelection = selectedApartmentIds.includes(aptId)
      ? selectedApartmentIds.filter(id => id !== aptId)
      : [...selectedApartmentIds, aptId];
    
    setSelectedApartmentIds(newSelection);

    // Initialize sale data for newly selected apartments
    if (!selectedApartmentIds.includes(aptId)) {
      const apt = apartments.find(a => a.id === aptId);
      setApartmentSalesData(prev => ({
        ...prev,
        [aptId]: {
          apartment_id: aptId,
          contract_number: '',
          sale_date: new Date().toISOString().split('T')[0],
          total_price: apt?.base_price || 0,
          currency: apt?.currency || 'AED',
          first_installment: 0,
          monthly_payment: 0,
          payment_duration_months: 12,
          payment_frequency_months: 1,
          payment_start_date: '',
          payment_method: 'Cash',
          contract_document_url: '',
          status: 'active',
          notes: '',
        }
      }));
    } else {
      // Remove data for deselected apartments
      const newData = { ...apartmentSalesData };
      delete newData[aptId];
      setApartmentSalesData(newData);
    }
  };

  const handleRemoveApartment = (aptId) => {
    handleApartmentSelect(aptId); // Reuse the toggle logic
  };

  const handleIndividualSaleUpdate = (aptId, data) => {
    setApartmentSalesData(prev => ({
      ...prev,
      [aptId]: { ...prev[aptId], ...data }
    }));
  };

  const handleSubmit = () => {
    if (!clientId) {
      alert('Please select a client');
      return;
    }

    if (selectedApartmentIds.length === 0) {
      alert('Please select at least one apartment');
      return;
    }

    // Check if all apartments have contract numbers
    const missingContracts = selectedApartmentIds.filter(
      aptId => !apartmentSalesData[aptId]?.contract_number
    );

    if (missingContracts.length > 0) {
      alert('Please fill in contract numbers for all selected apartments');
      return;
    }

    // Prepare sales data
    const salesData = selectedApartmentIds.map(aptId => ({
      ...apartmentSalesData[aptId],
      client_id: clientId,
      apartment_id: aptId,
    }));

    onSubmit(salesData);
  };

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <Label>Select Client *</Label>
        <Popover open={openClientSelect} onOpenChange={setOpenClientSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openClientSelect}
              className="w-full justify-between"
            >
              {selectedClient?.full_name || "Select client..."}
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
                        setClientId(client.id);
                        setOpenClientSelect(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          clientId === client.id ? "opacity-100" : "opacity-0"
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

      {/* Apartment Selection */}
      <div className="space-y-2">
        <Label>Select Apartments *</Label>
        <Popover open={openApartmentSelect} onOpenChange={setOpenApartmentSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openApartmentSelect}
              className="w-full justify-between h-auto py-2"
            >
              {selectedApartmentIds.length > 0
                ? `${selectedApartmentIds.length} Unit(s) selected`
                : "Select apartments..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
            <Command>
              <CommandInput placeholder="Search unit..." />
              <CommandList>
                <CommandEmpty>No apartment found.</CommandEmpty>
                <CommandGroup>
                  {apartments.map((apt) => (
                    <CommandItem
                      key={apt.id}
                      value={`Unit ${apt.unit_number} - ${apt.apartment_description}`}
                      onSelect={() => handleApartmentSelect(apt.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedApartmentIds.includes(apt.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>Unit {apt.unit_number}</span>
                        <span className="text-xs text-muted-foreground">
                          {apt.apartment_description} ({apt.area_sqm} sqm)
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected apartments tags */}
        {selectedApartmentIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedApartmentIds.map(id => {
              const apt = apartments.find(a => a.id === id);
              return (
                <div key={id} className="bg-slate-100 px-3 py-1.5 rounded-md text-sm flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-slate-600" />
                  <span className="font-medium">Unit {apt?.unit_number}</span>
                  <span className="text-xs text-slate-500">
                    {apt?.base_price?.toLocaleString()} {apt?.currency}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveApartment(id)}
                    className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Individual Sale Details for Each Apartment */}
      {selectedApartmentIds.length > 0 && (
        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Sale Details & Payment Plans</h3>
            <p className="text-sm text-slate-600 mb-4">
              Configure individual sale details and payment plan for each apartment
            </p>
          </div>

          <Accordion type="multiple" className="w-full">
            {selectedApartmentIds.map((aptId) => {
              const apt = apartments.find(a => a.id === aptId);
              const saleData = apartmentSalesData[aptId] || {};
              
              return (
                <AccordionItem value={aptId} key={aptId}>
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-slate-600" />
                      <span>Unit {apt?.unit_number}</span>
                      <span className="text-sm font-normal text-slate-500">
                        - {apt?.apartment_description}
                      </span>
                      {saleData.contract_number && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          ✓ Contract: {saleData.contract_number}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <IndividualSaleDetails
                      apartment={apt}
                      saleData={saleData}
                      onUpdate={(data) => handleIndividualSaleUpdate(aptId, data)}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !clientId || selectedApartmentIds.length === 0}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Creating Sales...' : `Create ${selectedApartmentIds.length} Sale(s)`}
        </Button>
      </div>
    </div>
  );
}