import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Receipt } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportMenu } from "../shared/ExportMenu";
import { Badge } from "@/components/ui/badge";

export default function PaymentReport({ payments, sales, clients, apartments, receipts, dateRange }) {
  // Calculate metrics
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const avgPayment = payments.length > 0 ? totalAmount / payments.length : 0;
  const delayedPayments = payments.filter(p => p.is_delayed).length;

  // Receipts status
  const receiptsAvailable = receipts.filter(r => r.status === 'available').length;
  const receiptsPending = receipts.filter(r => r.status === 'pending').length;

  const exportData = payments.map(payment => {
    const sale = sales.find(s => s.id === payment.sale_id);
    const client = sale ? clients.find(c => c.id === sale.client_id) : null;
    const apartment = sale ? apartments.find(a => a.id === sale.apartment_id) : null;
    const receipt = receipts.find(r => r.payment_id === payment.id);
    
    return {
      payment_date: format(new Date(payment.payment_date), 'yyyy-MM-dd'),
      client: client?.full_name || 'N/A',
      contract_number: sale?.contract_number || '',
      unit: apartment?.unit_number || 'N/A',
      amount: payment.amount,
      currency: payment.currency,
      payment_method: payment.payment_method,
      payment_type: payment.payment_type,
      is_delayed: payment.is_delayed ? 'Yes' : 'No',
      delay_days: payment.delay_days || 0,
      receipt_status: receipt?.status || 'N/A',
    };
  });

  const exportColumns = [
    { header: 'Payment Date', key: 'payment_date' },
    { header: 'Client', key: 'client' },
    { header: 'Contract Number', key: 'contract_number' },
    { header: 'Unit', key: 'unit' },
    { header: 'Amount', key: 'amount' },
    { header: 'Currency', key: 'currency' },
    { header: 'Payment Method', key: 'payment_method' },
    // Payment Type column removed
    { header: 'Is Delayed', key: 'is_delayed' },
    { header: 'Delay Days', key: 'delay_days' },
    { header: 'Receipt Status', key: 'receipt_status' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Receipt className="w-6 h-6" />
                Payment Collection Report
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <ExportMenu
                data={exportData}
                columns={exportColumns}
                title="Payment Collection Report"
                filename={`payment_report_${new Date().toISOString().split('T')[0]}`}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Payments</p>
            <p className="text-4xl font-bold text-slate-900">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Total Collected</p>
            <p className="text-3xl font-bold text-green-600">{totalAmount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Payment</p>
            <p className="text-3xl font-bold text-blue-600">{avgPayment.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Delayed</p>
            <p className="text-3xl font-bold text-red-600">{delayedPayments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Receipt Status */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Receipt Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-3xl font-bold text-slate-900">{receipts.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Receipts</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{receiptsAvailable}</p>
              <p className="text-sm text-slate-600 mt-1">Available</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-3xl font-bold text-amber-600">{receiptsPending}</p>
              <p className="text-sm text-slate-600 mt-1">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Payment Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Complete Payment List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  {/* Type Column Removed */}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map(payment => {
                  const sale = sales.find(s => s.id === payment.sale_id);
                  const client = sale ? clients.find(c => c.id === sale.client_id) : null;
                  const apartment = sale ? apartments.find(a => a.id === sale.apartment_id) : null;
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.payment_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="font-semibold">{client?.full_name || 'N/A'}</TableCell>
                      <TableCell>{sale?.contract_number || '-'}</TableCell>
                      <TableCell>{apartment?.unit_number || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">{payment.amount.toLocaleString()} {payment.currency}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      {/* Type Cell Removed */}
                      <TableCell>
                        {payment.is_delayed ? (
                          <Badge className="bg-red-100 text-red-700 border-red-200 border">
                            Delayed {payment.delay_days}d
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-700 border-green-200 border">
                            On Time
                          </Badge>
                        )}
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