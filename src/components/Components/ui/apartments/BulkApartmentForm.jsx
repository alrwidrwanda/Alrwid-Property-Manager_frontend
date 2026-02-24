import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function BulkApartmentForm({ onSubmit, onCancel, isLoading }) {
  const [apartments, setApartments] = useState([{
    unit_number: '',
    block: 'BLOCK A',
    floor: '1',
    direction: 'East',
    apartment_description: '1 Bedroom',
    area_sqm: 0,
    description: '',
    parking_spot: '',
    bedrooms: 1,
    bathrooms: 1,
    status: 'available',
    base_price: 0,
    currency: 'AED',
  }]);

  const addApartment = () => {
    setApartments([...apartments, {
      unit_number: '',
      block: 'BLOCK A',
      floor: '1',
      direction: 'East',
      apartment_description: '1 Bedroom',
      area_sqm: 0,
      description: '',
      parking_spot: '',
      bedrooms: 1,
      bathrooms: 1,
      status: 'available',
      base_price: 0,
      currency: 'AED',
    }]);
  };

  const removeApartment = (index) => {
    setApartments(apartments.filter((_, i) => i !== index));
  };

  const updateApartment = (index, field, value) => {
    const updated = [...apartments];
    updated[index] = { ...updated[index], [field]: value };
    setApartments(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = apartments.filter(a => a.unit_number?.trim());
    if (valid.length === 0) {
      alert('Please enter at least one unit number');
      return;
    }
    const toSubmit = apartments.filter(a => a.unit_number?.trim()).map(a => ({
      ...a,
      area_sqm: Number(a.area_sqm) || 0,
      base_price: Number(a.base_price) || 0,
      bedrooms: Number(a.bedrooms) || 1,
      bathrooms: Number(a.bathrooms) || 1,
    }));
    onSubmit(toSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {apartments.map((apt, index) => (
          <div key={index} className="p-4 border-2 border-slate-200 rounded-lg bg-white">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-900">Apartment {index + 1}</h3>
              {apartments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeApartment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Unit Number *</Label>
                <Input
                  value={apt.unit_number}
                  onChange={(e) => updateApartment(index, 'unit_number', e.target.value)}
                  placeholder="A101"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Block</Label>
                <Select value={apt.block} onValueChange={(value) => updateApartment(index, 'block', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BLOCK A">BLOCK A</SelectItem>
                    <SelectItem value="BLOCK B">BLOCK B</SelectItem>
                    <SelectItem value="BLOCK C">BLOCK C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Floor</Label>
                <Select value={apt.floor} onValueChange={(value) => updateApartment(index, 'floor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    {[...Array(30)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={apt.apartment_description} onValueChange={(value) => updateApartment(index, 'apartment_description', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Studio">Studio</SelectItem>
                    <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                    <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                    <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                    <SelectItem value="Penthouse">Penthouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Direction</Label>
                <Select value={apt.direction} onValueChange={(value) => updateApartment(index, 'direction', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East + West">East + West</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={apt.area_sqm ?? ''}
                  onChange={(e) => updateApartment(index, 'area_sqm', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Base Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={apt.base_price ?? ''}
                  onChange={(e) => updateApartment(index, 'base_price', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={apt.currency} onValueChange={(value) => updateApartment(index, 'currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="RWF">RWF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={apt.status} onValueChange={(value) => updateApartment(index, 'status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addApartment}
        className="w-full gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Another Apartment
      </Button>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !apartments.some(a => a.unit_number?.trim())}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Creating...' : `Create ${apartments.length} Apartment${apartments.length > 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  );
}