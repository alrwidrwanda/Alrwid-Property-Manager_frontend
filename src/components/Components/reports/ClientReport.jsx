import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Users } from "lucide-react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportMenu } from "../shared/ExportMenu";

export default function ClientReport({ clients, sales, payments, apartments, dateRange }) {
  // Calculate client metrics
  const clientsWithPurchases = clients.map(client => {
    const clientSales = sales.filter(s => s.client_id === client.id);
    const clientPayments = payments.filter(p => 
      clientSales.some(s => s.id === p.sale_id)
    );
    const contractNumbers = [...new Set(clientSales.map(s => s.contract_number).filter(Boolean))].join(', ');
    
    const totalPurchased = clientSales.reduce((sum, s) => sum + (s.total_price || 0), 0);
    const totalPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      ...client,
      contractNumbers,
      purchaseCount: clientSales.length,
      totalPurchased,
      totalPaid,
      balance: totalPurchased - totalPaid,
    };
  }).sort((a, b) => b.totalPurchased - a.totalPurchased);

  const exportData = clientsWithPurchases.map(client => ({
    full_name: client.full_name,
    contract_number: client.contract_number || client.contractNumbers || '',
    email: client.email || '',
    phone: client.phone,
    nationality: client.nationality || '',
    payment_method: client.preferred_payment_method,
    currency: client.preferred_currency,
    purchase_count: client.purchaseCount,
    total_purchased: client.totalPurchased,
    total_paid: client.totalPaid,
    balance: client.balance,
  }));

  const exportColumns = [
    { header: 'Full Name', key: 'full_name' },
    { header: 'Contract Number', key: 'contract_number' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Nationality', key: 'nationality' },
    { header: 'Payment Method', key: 'payment_method' },
    { header: 'Currency', key: 'currency' },
    { header: 'Total Purchases', key: 'purchase_count' },
    { header: 'Total Purchased', key: 'total_purchased' },
    { header: 'Total Paid', key: 'total_paid' },
    { header: 'Balance', key: 'balance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Client Analysis Report
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Generated on {format(new Date(), 'PPP')}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <ExportMenu
                data={exportData}
                columns={exportColumns}
                title="Client Analysis Report"
                filename={`client_report_${new Date().toISOString().split('T')[0]}`}
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
            <p className="text-sm text-slate-600 mb-1">Total Clients</p>
            <p className="text-4xl font-bold text-slate-900">{clients.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Active Buyers</p>
            <p className="text-4xl font-bold text-green-600">
              {clientsWithPurchases.filter(c => c.purchaseCount > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Multi-Property</p>
            <p className="text-4xl font-bold text-purple-600">
              {clientsWithPurchases.filter(c => c.purchaseCount > 1).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">Avg Purchase</p>
            <p className="text-4xl font-bold text-blue-600">
              {clientsWithPurchases.length > 0 
                ? (clientsWithPurchases.reduce((sum, c) => sum + c.totalPurchased, 0) / clientsWithPurchases.filter(c => c.purchaseCount > 0).length).toFixed(0)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Client Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>Complete Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Total Purchased</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsWithPurchases.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-semibold">{client.full_name}</TableCell>
                    <TableCell>{client.contract_number || client.contractNumbers || '-'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{client.phone}</div>
                        {client.email && <div className="text-slate-500">{client.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{client.purchaseCount}</TableCell>
                    <TableCell>{client.totalPurchased.toLocaleString()} {client.preferred_currency}</TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {client.totalPaid.toLocaleString()} {client.preferred_currency}
                    </TableCell>
                    <TableCell className="text-amber-600 font-semibold">
                      {client.balance.toLocaleString()} {client.preferred_currency}
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