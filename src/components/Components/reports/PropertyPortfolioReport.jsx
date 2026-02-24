import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Building2 } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportMenu } from "../shared/ExportMenu";
import { Badge } from "@/components/ui/badge";

export default function PropertyPortfolioReport({ apartments, filteredApartments, sales, reservations = [], dateRange }) {
  const isAllTime = !dateRange || dateRange.type === 'all_time';
  const soldApartmentIds = new Set(sales.map(s => s.apartment_id));
  const reservedApartmentIds = new Set(reservations.map(r => r.apartment_id).filter(Boolean));
  const filteredApartmentIds = new Set((filteredApartments || apartments).map(a => a.id));

  const soldApartments = apartments.filter(a =>
    a.status === 'sold' && (isAllTime || soldApartmentIds.has(a.id))
  );
  const reservedApartments = apartments.filter(a =>
    a.status === 'reserved' && (isAllTime || reservedApartmentIds.has(a.id))
  );
  const availableApartments = apartments.filter(a =>
    a.status === 'available' && (isAllTime || filteredApartmentIds.has(a.id))
  );

  // Helper to get value for an apartment
  // For sold, use sale price. For others, use base_price.
  const getApartmentValue = (apt) => {
    if (apt.status === 'sold') {
      const sale = sales.find(s => s.apartment_id === apt.id);
      return sale ? (sale.total_price || 0) : (apt.base_price || 0);
    }
    return apt.base_price || 0;
  };

  const totalSoldValue = soldApartments.reduce((sum, a) => sum + getApartmentValue(a), 0);
  const totalReservedValue = reservedApartments.reduce((sum, a) => sum + getApartmentValue(a), 0);
  const totalAvailableValue = availableApartments.reduce((sum, a) => sum + getApartmentValue(a), 0);

  const totalSoldArea = soldApartments.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
  const totalReservedArea = reservedApartments.reduce((sum, a) => sum + (a.area_sqm || 0), 0);
  const totalAvailableArea = availableApartments.reduce((sum, a) => sum + (a.area_sqm || 0), 0);

  const getExportData = () => {
    const data = [];

    // Sold Section
    data.push({ unit_number: '--- SOLD UNITS ---', status: '', area_sqm: '', value: '', currency: '' });
    soldApartments.forEach(apt => data.push({
      unit_number: apt.unit_number,
      status: apt.status,
      area_sqm: apt.area_sqm,
      value: getApartmentValue(apt),
      currency: apt.currency
    }));
    data.push({ 
        unit_number: `TOTAL SOLD (${soldApartments.length})`, 
        status: '', 
        area_sqm: totalSoldArea.toFixed(2), 
        value: totalSoldValue, 
        currency: 'USD'
    });

    // Reserved Section
    data.push({ unit_number: '--- RESERVED UNITS ---', status: '', area_sqm: '', value: '', currency: '' });
    reservedApartments.forEach(apt => data.push({
      unit_number: apt.unit_number,
      status: apt.status,
      area_sqm: apt.area_sqm,
      value: getApartmentValue(apt),
      currency: apt.currency
    }));
    data.push({ 
        unit_number: `TOTAL RESERVED (${reservedApartments.length})`, 
        status: '', 
        area_sqm: totalReservedArea.toFixed(2), 
        value: totalReservedValue, 
        currency: 'USD'
    });

    // Available Section
    data.push({ unit_number: '--- AVAILABLE UNITS ---', status: '', area_sqm: '', value: '', currency: '' });
    availableApartments.forEach(apt => data.push({
      unit_number: apt.unit_number,
      status: apt.status,
      area_sqm: apt.area_sqm,
      value: getApartmentValue(apt),
      currency: apt.currency
    }));
    data.push({ 
        unit_number: `TOTAL AVAILABLE (${availableApartments.length})`, 
        status: '', 
        area_sqm: totalAvailableArea.toFixed(2), 
        value: totalAvailableValue, 
        currency: 'USD'
    });

    return data;
  };

  const exportData = getExportData();

  const exportColumns = [
    { header: 'Unit Number', key: 'unit_number' },
    { header: 'Status', key: 'status' },
    { header: 'Area (sqm)', key: 'area_sqm' },
    { header: 'Value', key: 'value' },
    { header: 'Currency', key: 'currency' },
  ];

  const StatusSection = ({ title, apartments, totalValue, color }) => (
    <div className="space-y-4 mb-8">
      <Card className={`border-l-4 ${color} shadow-md`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">{title} Units</p>
              <p className="text-2xl font-bold text-slate-900">{apartments.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Area</p>
              <p className="text-2xl font-bold text-slate-900">
                {apartments.reduce((sum, a) => sum + (a.area_sqm || 0), 0).toFixed(2)} sqm
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-0">
        <CardHeader className="py-4">
          <CardTitle className="text-base font-medium">{title} Apartments List</CardTitle>
        </CardHeader>
        <CardContent className="py-0 pb-4">
            <div className="max-h-[300px] overflow-y-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Unit Number</TableHead>
                        <TableHead>Area (sqm)</TableHead>
                        <TableHead>Value</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {apartments.map(apt => (
                        <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.unit_number}</TableCell>
                        <TableCell>{apt.area_sqm} sqm</TableCell>
                        <TableCell>{getApartmentValue(apt).toLocaleString()} USD</TableCell>
                        </TableRow>
                    ))}
                    {apartments.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-500 py-4">
                                No apartments in this status
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Property Portfolio Report
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <ExportMenu
                data={exportData}
                columns={exportColumns}
                title="Property Portfolio Report"
                filename={`property_portfolio_report_${new Date().toISOString().split('T')[0]}`}
              />
              <Button variant="outline" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <StatusSection 
        title="Sold" 
        apartments={soldApartments} 
        totalValue={totalSoldValue} 
        color="border-green-500"
      />

      <StatusSection 
        title="Reserved" 
        apartments={reservedApartments} 
        totalValue={totalReservedValue} 
        color="border-amber-500"
      />

      <StatusSection 
        title="Available" 
        apartments={availableApartments} 
        totalValue={totalAvailableValue} 
        color="border-blue-500"
      />
    </div>
  );
}