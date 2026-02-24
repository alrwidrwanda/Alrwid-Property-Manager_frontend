import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ApartmentForm({ apartment, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState(apartment || {
    unit_number: '',
    block: 'BLOCK A',
    floor: '1',
    direction: 'East',
    apartment_description: '1 Bedroom',
    area_sqm: 0,
    description: '',
    parking_spot: '',
    status: 'available',
    base_price: 0,
    currency: 'USD',
    bedrooms: 1,
    bathrooms: 1,
  });

  const [useCustomCurrency, setUseCustomCurrency] = useState(
    apartment?.currency && !['USD', 'SAR', 'RWF', 'EUR'].includes(apartment.currency)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit_number">Unit Number *</Label>
            <Input
              id="unit_number"
              value={formData.unit_number}
              onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
              placeholder="e.g., A101"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="block">Block</Label>
            <Select value={formData.block} onValueChange={(value) => setFormData({...formData, block: value})}>
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="floor">Floor *</Label>
            <Select value={formData.floor} onValueChange={(value) => setFormData({...formData, floor: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B">B (Basement)</SelectItem>
                <SelectItem value="G">G (Ground)</SelectItem>
                {[...Array(30)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={formData.direction} onValueChange={(value) => setFormData({...formData, direction: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East + West">East + West</SelectItem>
                <SelectItem value="North + South">North + South</SelectItem>
                <SelectItem value="East + North">East + North</SelectItem>
                <SelectItem value="West + South">West + South</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking_spot">Parking Spot</Label>
            <Input
              id="parking_spot"
              value={formData.parking_spot}
              onChange={(e) => setFormData({...formData, parking_spot: e.target.value})}
              placeholder="e.g., P-15"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apartment_description">Apartment Type</Label>
            <Select value={formData.apartment_description || '1 Bedroom'} onValueChange={(value) => setFormData({...formData, apartment_description: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="1 Bedroom">1 Bedroom</SelectItem>
                <SelectItem value="2 Bedroom">2 Bedroom</SelectItem>
                <SelectItem value="3 Bedroom">3 Bedroom</SelectItem>
                <SelectItem value="4 Bedroom">4 Bedroom</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="1 Bedroom (Terrace)">1 Bedroom (Terrace)</SelectItem>
                <SelectItem value="2 Bedroom (Terrace)">2 Bedroom (Terrace)</SelectItem>
                <SelectItem value="3 Bedroom (Terrace)">3 Bedroom (Terrace)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area_sqm">Area (sqm) *</Label>
            <Input
              id="area_sqm"
              type="number"
              step="0.01"
              min="0"
              value={formData.area_sqm ?? ''}
              onChange={(e) => setFormData({...formData, area_sqm: parseFloat(e.target.value) || 0})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min="0"
              value={formData.bedrooms ?? ''}
              onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              step="0.5"
              min="0"
              value={formData.bathrooms ?? ''}
              onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder="Detailed description of the apartment..."
            rows={3}
          />
        </div>
      </div>

      {/* Pricing & Status */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-slate-900">Pricing & Status</h3>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base_price">Base Price</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price ?? ''}
              onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            {!useCustomCurrency ? (
              <div className="flex gap-2">
                <Select value={formData.currency} onValueChange={(value) => {
                  if (value === 'custom') {
                    setUseCustomCurrency(true);
                    setFormData({...formData, currency: ''});
                  } else {
                    setFormData({...formData, currency: value});
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                    <SelectItem value="RWF">RWF (Rwandan Francs)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({...formData, currency: e.target.value.toUpperCase()})}
                  placeholder="e.g., GBP"
                  maxLength={10}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setUseCustomCurrency(false);
                    setFormData({...formData, currency: 'USD'});
                  }}
                >
                  Select
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Saving...' : apartment ? 'Update Apartment' : 'Create Apartment'}
        </Button>
      </div>
    </form>
  );
}