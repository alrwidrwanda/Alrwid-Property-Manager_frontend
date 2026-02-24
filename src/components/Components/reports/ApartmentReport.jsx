import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Building2 } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ApartmentReport({ apartments, sales, dateRange }) {
  // Calculate metrics
  const available = apartments.filter(a => a.status === 'available').length;
  const reserved = apartments.filter(a => a.status === 'reserved').length;
  const sold = apartments.filter(a => a.status === 'sold').length;

  const exportToCSV = () => {
    const csvData = apartments.map(apt => {
      const sale = sales.find(s => s.apartment_id === apt.id);
      return {
        'Unit Number': apt.unit_number,
        'Floor': apt.floor,
        'Area (sqm)': apt.area_sqm,
        'Bedrooms': apt.bedrooms || 0,
        'Bathrooms': apt.bathrooms || 0,
        'Status': apt.status,
        'Base Price': apt.base_price || 0,
        'Currency': apt.currency,
        'Sold': sale ? 'Yes' : 'No',
        'Sale Price': sale?.total_price || 'N/A',
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      ['APARTMENT INVENTORY REPORT'],
      ['Generated:', new Date().toLocaleString()],
      [],
      headers,
      ...csvData.map(row => headers.map(h => row[h]))
    ].map(row => row.map(cell => JSON.stringify(cell)).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `apartment_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusConfig = {
    available: { label: 'Available', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    reserved: { label: 'Reserved', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    sold: { label: 'Sold', color: 'bg-green-100 text-green-700 border-green-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Apartment Inventory Report
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 mb-1">Total Units</p>
            <p className="text-4xl font-bold text-blue-900">{apartments.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <p className="text-sm text-green-700 mb-1">Sold</p>
            <p className="text-4xl font-bold text-green-900">{sold}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-700 mb-1">Reserved</p>
            <p className="text-4xl font-bold text-amber-900">{reserved}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-700 mb-1">Available</p>
            <p className="text-4xl font-bold text-slate-900">{available}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Complete Apartment Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Area (sqm)</TableHead>
                  <TableHead>Beds/Baths</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Base Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apartments.map(apt => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-semibold">{apt.unit_number}</TableCell>
                    <TableCell>{apt.floor}</TableCell>
                    <TableCell>{apt.area_sqm}</TableCell>
                    <TableCell>{apt.bedrooms || 0} / {apt.bathrooms || 0}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[apt.status]?.color} border`}>
                        {statusConfig[apt.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {apt.base_price?.toLocaleString() || 'N/A'} {apt.currency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}