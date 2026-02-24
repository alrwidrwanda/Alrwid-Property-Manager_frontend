import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ClientReports({ client, sales, payments, apartments }) {
  const totalPurchaseValue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.total_paid || 0), 0);
  const totalRemaining = totalPurchaseValue - totalPaid;

  const exportReport = (reportType) => {
    let csvData = [];
    let filename = '';

    if (reportType === 'summary') {
      csvData = [{
        'Client Name': client.full_name,
        'Contract Number': client.contract_number || '',
        'Email': client.email || '',
        'Phone': client.phone,
        'Total Properties': sales.length,
        'Total Purchase Value': totalPurchaseValue,
        'Total Paid': totalPaid,
        'Total Remaining': totalRemaining,
        'Currency': client.preferred_currency,
        'Payment Method': client.preferred_payment_method,
      }];
      filename = `client_summary_${client.full_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (reportType === 'payments') {
      csvData = payments.map(payment => ({
        'Payment Date': format(new Date(payment.payment_date), 'yyyy-MM-dd'),
        'Amount': payment.amount,
        'Currency': payment.currency,
        'Contract Number': client.contract_number || '',
        'Payment Method': payment.payment_method,
        'Payment Type': payment.payment_type,
        'Is Delayed': payment.is_delayed ? 'Yes' : 'No',
        'Delay Days': payment.delay_days || 0,
      }));
      filename = `client_payments_${client.full_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (reportType === 'purchases') {
      csvData = sales.map(sale => {
        const apartment = apartments.find(apt => apt.id === sale.apartment_id);
        return {
          'Unit Number': apartment?.unit_number || 'N/A',
          'Contract Number': client.contract_number || '',
          'Sale Date': format(new Date(sale.sale_date), 'yyyy-MM-dd'),
          'Total Price': sale.total_price,
          'Total Paid': sale.total_paid || 0,
          'Remaining': (sale.total_price || 0) - (sale.total_paid || 0),
          'Currency': sale.currency,
          'Monthly Payment': sale.monthly_payment || 0,
          'Duration (months)': sale.payment_duration_months || 0,
          'Status': sale.status,
        };
      });
      filename = `client_purchases_${client.full_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Quick Export Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Quick Export Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => exportReport('payments')}
            >
              <Download className="w-5 h-5" />
              <div className="text-center">
                <p className="font-semibold">Payment History</p>
                <p className="text-xs text-slate-500">All payment records</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-4"
              onClick={() => exportReport('purchases')}
            >
              <Download className="w-5 h-5" />
              <div className="text-center">
                <p className="font-semibold">Purchase Details</p>
                <p className="text-xs text-slate-500">Property purchases</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            Summary Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-slate-900">{sales.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Purchases</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-slate-900">{payments.length}</p>
              <p className="text-sm text-slate-600 mt-1">Total Payments</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">
                {((totalPaid / totalPurchaseValue) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600 mt-1">Payment Progress</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">
                {payments.length > 0 ? (totalPaid / payments.length).toFixed(0) : 0}
              </p>
              <p className="text-sm text-slate-600 mt-1">Avg Payment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}