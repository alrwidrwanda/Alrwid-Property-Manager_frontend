import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, DollarSign, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { format } from "date-fns";

export default function FinancialSummary({ sales, payments, apartments, clients, dateRange }) {
  // Calculate financial metrics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
  const totalCollected = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalOutstanding = totalRevenue - totalCollected;
  const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

  // Sales by status
  const salesByStatus = [
    { name: 'Active', value: sales.filter(s => s.status === 'active').length },
    { name: 'Completed', value: sales.filter(s => s.status === 'completed').length },
    { name: 'Defaulted', value: sales.filter(s => s.status === 'defaulted').length },
  ].filter(item => item.value > 0);

  // Export functions
  const exportToCSV = () => {
    const allRows = [
      ['FINANCIAL SUMMARY REPORT'],
      ['Generated:', new Date().toLocaleString()],
      ['Date Range:', dateRange.type.replace(/_/g, ' ').toUpperCase()],
      [],
      ['SUMMARY METRICS'],
      ['Total Revenue', totalRevenue],
      ['Total Collected', totalCollected],
      ['Outstanding', totalOutstanding],
      ['Collection Rate', `${collectionRate.toFixed(2)}%`],
      ['Total Sales', sales.length],
      ['Total Payments', payments.length],
      ['Active Clients', clients.length],
      [],
      ['SALES BY STATUS'],
      ['Status', 'Count'],
      ...salesByStatus.map(s => [s.name, s.value]),
    ];

    const csvContent = allRows.map(row => row.map(cell => JSON.stringify(cell)).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header with Actions */}
      <Card className="shadow-lg border-0 print:shadow-none">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Financial Summary Report</CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={exportToCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">AED</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Collected</p>
                <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">AED</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Outstanding</p>
                <p className="text-2xl font-bold text-amber-600">{totalOutstanding.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">AED</p>
              </div>
              <TrendingDown className="w-10 h-10 text-amber-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Collection Rate</p>
                <p className="text-2xl font-bold text-blue-600">{collectionRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500 mt-1">of total</p>
              </div>
              <Percent className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{sales.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Sales</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{payments.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Payments</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{clients.length}</p>
              <p className="text-sm text-slate-600 mt-1">Active Clients</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">
                {sales.length > 0 ? (totalRevenue / sales.length).toFixed(0) : 0}
              </p>
              <p className="text-sm text-slate-600 mt-1">Avg Sale Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}