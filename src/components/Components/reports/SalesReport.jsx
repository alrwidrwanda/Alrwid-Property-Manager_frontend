import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportMenu } from "../shared/ExportMenu";
import { Badge } from "@/components/ui/badge";

export default function SalesReport({ sales, clients, apartments, payments, defaultedSales = [], dateRange }) {
  // Calculate metrics (including defaulted sales)
  const allSales = [...sales, ...defaultedSales];
  const totalValue = sales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const totalCollected = sales.reduce((sum, s) => sum + (s.total_paid || 0), 0);
  const avgSaleValue = sales.length > 0 ? totalValue / sales.length : 0;
  const totalDefaultedValue = defaultedSales.reduce((sum, s) => sum + (s.total_price || 0), 0);
  const totalDefaultedPaid = defaultedSales.reduce((sum, s) => sum + (s.total_paid || 0), 0);

  const statusConfig = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    defaulted: { label: 'Defaulted', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  const exportData = [
    ...sales.map(sale => {
      const client = clients.find(c => c.id === sale.client_id);
      
      return {
        sale_date: format(new Date(sale.sale_date), 'yyyy-MM-dd'),
        client: client?.full_name || 'N/A',
        contract_number: sale.contract_number || '',
        total_price: sale.total_price,
        currency: sale.currency,
        advanced_payment: sale.first_installment || 0,
        monthly_payment: sale.monthly_payment || 0,
        total_paid: sale.total_paid || 0,
        balance: (sale.total_price || 0) - (sale.total_paid || 0),
        payment_method: sale.payment_method,
        status: sale.status,
      };
    }),
    ...defaultedSales.map(sale => {
      const client = clients.find(c => c.id === sale.client_id);
      
      return {
        sale_date: format(new Date(sale.sale_date), 'yyyy-MM-dd'),
        client: client?.full_name || 'N/A',
        contract_number: sale.contract_number || '',
        total_price: sale.total_price,
        currency: sale.currency,
        advanced_payment: sale.first_installment || 0,
        monthly_payment: sale.monthly_payment || 0,
        total_paid: sale.total_paid || 0,
        balance: (sale.total_price || 0) - (sale.total_paid || 0),
        payment_method: sale.payment_method,
        status: 'Defaulted',
        defaulted_date: format(new Date(sale.defaulted_date), 'yyyy-MM-dd'),
      };
    })
  ];

  const exportColumns = [
    { header: 'Sale Date', key: 'sale_date' },
    { header: 'Client', key: 'client' },
    { header: 'Contract Number', key: 'contract_number' },
    { header: 'Total Price', key: 'total_price' },
    { header: 'Currency', key: 'currency' },
    { header: 'Advanced Payment', key: 'advanced_payment' },
    { header: 'Monthly Payment', key: 'monthly_payment' },
    { header: 'Total Paid', key: 'total_paid' },
    { header: 'Balance', key: 'balance' },
    { header: 'Payment Method', key: 'payment_method' },
    { header: 'Status', key: 'status' },
    { header: 'Defaulted Date', key: 'defaulted_date' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Sales Transaction Report
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <ExportMenu
                data={exportData}
                columns={exportColumns}
                title="Sales Transaction Report"
                filename={`sales_report_${new Date().toISOString().split('T')[0]}`}
              />
              <Button variant="outline" onClick={() => window.print()} className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Sales</p>
            <p className="text-4xl font-bold text-slate-900">{sales.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Value</p>
            <p className="text-3xl font-bold text-green-600">{totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Collected</p>
            <p className="text-3xl font-bold text-blue-600">{totalCollected.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Sale Value</p>
            <p className="text-3xl font-bold text-purple-600">{avgSaleValue.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 mb-1">Defaulted Sales</p>
            <p className="text-4xl font-bold text-red-700">{defaultedSales.length}</p>
            <p className="text-xs text-red-600 mt-1">Lost: {totalDefaultedValue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sales Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Complete Sales List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Advanced Payment</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map(sale => {
                  const client = clients.find(c => c.id === sale.client_id);
                  const balance = (sale.total_price || 0) - (sale.total_paid || 0);
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>{format(new Date(sale.sale_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-semibold">{client?.full_name || 'N/A'}</TableCell>
                      <TableCell>{sale.contract_number || '-'}</TableCell>
                      <TableCell>{sale.total_price?.toLocaleString()} {sale.currency}</TableCell>
                      <TableCell className="text-blue-600 font-semibold">
                        {(sale.first_installment || 0).toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {(sale.total_paid || 0).toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell className="text-amber-600 font-semibold">
                        {balance.toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[sale.status]?.color} border`}>
                          {statusConfig[sale.status]?.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {defaultedSales.map(sale => {
                  const client = clients.find(c => c.id === sale.client_id);
                  const balance = (sale.total_price || 0) - (sale.total_paid || 0);
                  
                  return (
                    <TableRow key={sale.id} className="bg-red-50">
                      <TableCell>{format(new Date(sale.sale_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-semibold">{client?.full_name || 'N/A'}</TableCell>
                      <TableCell>{sale.contract_number || '-'}</TableCell>
                      <TableCell>{sale.total_price?.toLocaleString()} {sale.currency}</TableCell>
                      <TableCell className="text-blue-600 font-semibold">
                        {(sale.first_installment || 0).toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {(sale.total_paid || 0).toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell className="text-amber-600 font-semibold">
                        {balance.toLocaleString()} {sale.currency}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-700 border-red-200 border">
                          Defaulted
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}