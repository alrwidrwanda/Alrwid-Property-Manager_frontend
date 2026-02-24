import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApartmentReservationForm({ reservation, apartments, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(reservation || {
    non_client_name: '',
    apartment_id: '',
    reservation_date: new Date().toISOString().split('T')[0],
    status: 'active',
    notes: '',
  });

  const [openApartment, setOpenApartment] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedApartment = apartments.find(a => a.id === formData.apartment_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="grid gap-4">
        {/* Non-Client Name */}
        <div className="space-y-2">
          <Label htmlFor="non_client_name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="non_client_name"
            required
            value={formData.non_client_name}
            onChange={(e) => setFormData({...formData, non_client_name: e.target.value})}
            placeholder="Enter full name"
          />
        </div>

        {/* Apartment Selection */}
        <div className="space-y-2">
          <Label>Apartment <span className="text-red-500">*</span></Label>
          <Popover open={openApartment} onOpenChange={setOpenApartment}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openApartment}
                className="w-full justify-between"
              >
                {selectedApartment ? (
                  <span>
                    Unit {selectedApartment.unit_number} - {selectedApartment.block} - {selectedApartment.apartment_description}
                  </span>
                ) : (
                  <span className="text-slate-400">Select apartment...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search apartments..." />
                <CommandEmpty>No apartment found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {apartments.map((apartment) => (
                      <CommandItem
                        key={apartment.id}
                        value={`${apartment.unit_number} ${apartment.block}`}
                        onSelect={() => {
                          setFormData({...formData, apartment_id: apartment.id});
                          setOpenApartment(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.apartment_id === apartment.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Unit {apartment.unit_number} - {apartment.block} - {apartment.apartment_description}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reservation Date */}
        <div className="space-y-2">
          <Label htmlFor="reservation_date">Reservation Date</Label>
          <Input
            id="reservation_date"
            type="date"
            value={formData.reservation_date}
            onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes about this reservation..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !formData.non_client_name || !formData.apartment_id}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Saving...' : reservation ? 'Update Reservation' : 'Reserve Apartment'}
        </Button>
      </div>
    </form>
  );
}