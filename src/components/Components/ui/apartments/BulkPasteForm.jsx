import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, FileSpreadsheet } from "lucide-react";

export default function BulkPasteForm({ onSubmit, onCancel, isLoading }) {
  const [pastedData, setPastedData] = useState('');
  const [commonFields, setCommonFields] = useState({
    block: 'BLOCK A',
    floor: '1',
    direction: 'East',
    apartment_description: '1 Bedroom',
    status: 'available',
    base_price: 0,
    currency: 'AED',
    area_sqm: 0,
    parking_spot: '',
    bedrooms: 1,
    bathrooms: 1,
    description: '',
  });
  const [parsedApartments, setParsedApartments] = useState([]);
  const [parseError, setParseError] = useState('');
  const [useCustomCurrency, setUseCustomCurrency] = useState(false); // New state for custom currency

  const parseData = () => {
    try {
      setParseError('');
      const lines = pastedData.trim().split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setParseError('Please paste some data');
        return [];
      }

      const apartments = lines.map(line => {
        // Support different formats: comma, tab, or space separated
        const parts = line.split(/[,\t\s]+/).filter(p => p.trim());
        
        if (parts.length === 0) return null;

        // First part is always unit number
        return {
          unit_number: parts[0].trim(),
          block: commonFields.block,
          floor: commonFields.floor,
          direction: commonFields.direction,
          apartment_description: commonFields.apartment_description,
          area_sqm: Number(commonFields.area_sqm) || 0,
          parking_spot: commonFields.parking_spot || '',
          status: commonFields.status,
          base_price: Number(commonFields.base_price) || 0,
          currency: commonFields.currency,
          bedrooms: Number(commonFields.bedrooms) || 1,
          bathrooms: Number(commonFields.bathrooms) || 1,
          description: commonFields.description || '',
        };
      }).filter(apt => apt !== null);

      if (apartments.length === 0) {
        setParseError('No valid data found');
        return [];
      }

      setParsedApartments(apartments);
      return apartments;
    } catch (error) {
      setParseError('Error parsing data: ' + error.message);
      return [];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setParseError('');
    let toSubmit = parsedApartments;
    if (toSubmit.length === 0 && pastedData.trim()) {
      toSubmit = parseData();
    }
    if (toSubmit.length > 0) {
      onSubmit(toSubmit);
    } else {
      setParseError(parsedApartments.length === 0 
        ? 'Please paste unit numbers (one per line) and set common fields'
        : 'Please paste unit numbers first');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">How to use Bulk Paste:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Set common fields below (these will apply to all apartments)</li>
              <li>Paste unit numbers in the text area (one per line)</li>
              <li>Click "Parse Data" to preview</li>
              <li>Click "Create Apartments" to add them all</li>
            </ol>
            <p className="mt-2 text-xs">Example format: A101, A102, A103 (one per line)</p>
          </div>
        </div>
      </div>

      {/* Common Fields */}
      <div className="space-y-4 p-4 border-2 border-slate-200 rounded-lg bg-white">
        <h3 className="font-semibold text-slate-900">Common Fields (apply to all)</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label>Block</Label>
            <Select value={commonFields.block} onValueChange={(value) => setCommonFields({...commonFields, block: value})}>
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
            <Select value={commonFields.floor} onValueChange={(value) => setCommonFields({...commonFields, floor: value})}>
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
            <Label>Apartment Type</Label>
            <Select value={commonFields.apartment_description} onValueChange={(value) => setCommonFields({...commonFields, apartment_description: value})}>
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
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Select value={commonFields.direction} onValueChange={(value) => setCommonFields({...commonFields, direction: value})}>
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
              </SelectContent>
            </Select>
          </div>

          {/* New Parking Spot field */}
          <div className="space-y-2">
            <Label>Parking Spot</Label>
            <Input
              value={commonFields.parking_spot}
              onChange={(e) => setCommonFields({...commonFields, parking_spot: e.target.value})}
              placeholder="e.g., P-01"
            />
          </div>

          <div className="space-y-2">
            <Label>Area (sqm)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={commonFields.area_sqm ?? ''}
              onChange={(e) => setCommonFields({...commonFields, area_sqm: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input
              type="number"
              min="0"
              value={commonFields.bedrooms ?? ''}
              onChange={(e) => setCommonFields({...commonFields, bedrooms: parseInt(e.target.value) || 1})}
            />
          </div>

          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              value={commonFields.bathrooms ?? ''}
              onChange={(e) => setCommonFields({...commonFields, bathrooms: parseFloat(e.target.value) || 1})}
            />
          </div>

          <div className="space-y-2">
            <Label>Base Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={commonFields.base_price ?? ''}
              onChange={(e) => setCommonFields({...commonFields, base_price: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            {!useCustomCurrency ? (
              <Select value={commonFields.currency} onValueChange={(value) => {
                if (value === 'custom') {
                  setUseCustomCurrency(true);
                  setCommonFields({...commonFields, currency: ''}); // Clear currency for custom input
                } else {
                  setCommonFields({...commonFields, currency: value});
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem> {/* Added SAR */}
                  <SelectItem value="RWF">RWF</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="custom">Custom...</SelectItem> {/* Option to switch to custom input */}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={commonFields.currency}
                  onChange={(e) => setCommonFields({...commonFields, currency: e.target.value.toUpperCase()})}
                  placeholder="e.g., GBP"
                  maxLength={10}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setUseCustomCurrency(false);
                    setCommonFields({...commonFields, currency: 'AED'}); // Reset to default when switching back
                  }}
                >
                  Select
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={commonFields.status} onValueChange={(value) => setCommonFields({...commonFields, status: value})}>
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

          <div className="space-y-2 col-span-2 md:col-span-4">
          <Label>Description</Label>
          <Textarea
            value={commonFields.description}
            onChange={(e) => setCommonFields({...commonFields, description: e.target.value})}
            placeholder="Optional description for all apartments"
            rows={3}
          />
          </div>
          </div>

      {/* Paste Area */}
      <div className="space-y-2">
        <Label htmlFor="pastedData">Paste Unit Numbers (one per line)</Label>
        <Textarea
          id="pastedData"
          value={pastedData}
          onChange={(e) => setPastedData(e.target.value)}
          placeholder="A101&#10;A102&#10;A103&#10;A104"
          rows={10}
          className="font-mono text-sm"
          autoComplete="off"
          data-lpignore="true"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={parseData}
        className="w-full"
        disabled={!pastedData.trim()}
      >
        Parse Data ({pastedData.trim().split('\n').filter(l => l.trim()).length} lines)
      </Button>

      {/* Parse Error */}
      {parseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">{parseError}</p>
        </div>
      )}

      {/* Preview */}
      {parsedApartments.length > 0 && (
        <div className="space-y-2">
          <Label>Preview ({parsedApartments.length} apartments)</Label>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-white">
            <div className="space-y-2 text-sm">
              {parsedApartments.slice(0, 10).map((apt, idx) => (
                <div key={idx} className="text-slate-700">
                  <div className="font-mono font-semibold">
                    {apt.unit_number} - {apt.block} - Floor {apt.floor}
                  </div>
                  {apt.description && (
                    <div className="text-xs text-slate-600 mt-1 ml-2">
                      {apt.description}
                    </div>
                  )}
                </div>
              ))}
              {parsedApartments.length > 10 && (
                <div className="text-slate-500 italic">
                  ... and {parsedApartments.length - 10} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || (parsedApartments.length === 0 && !pastedData.trim())}
          className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
        >
          {isLoading ? 'Creating...' : parsedApartments.length > 0 
            ? `Create ${parsedApartments.length} Apartment${parsedApartments.length > 1 ? 's' : ''}` 
            : pastedData.trim() ? 'Parse & Create Apartments' : 'Create Apartments'}
        </Button>
      </div>
    </form>
  );
}