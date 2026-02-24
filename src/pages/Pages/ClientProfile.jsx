import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MapPin, Globe, CreditCard, Download, FileText, DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";
import PurchaseHistory from "@/components/ui/apartments/clients/PurchaseHistory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExportMenu } from "@/components/shared/ExportMenu";

function isPdfUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return url.includes('application/pdf');
  return url.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');
}

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('id');
  const [viewContract, setViewContract] = useState({ url: null, contractNumber: '' });
  const [viewId, setViewId] = useState(false);

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const clients = await base44.entities.Client.list();
      return clients.find(c => c.id === clientId);
    },
    enabled: !!clientId,
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['client-sales', clientId],
    queryFn: async () => {
      const allSales = await base44.entities.Sale.list('-sale_date');
      return allSales.filter(sale => sale.client_id === clientId);
    },
    enabled: !!clientId,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['client-payments', clientId],
    queryFn: async () => {
      const allPayments = await base44.entities.Payment.list('-payment_date');
      const saleIds = sales.map(s => s.id);
      return allPayments.filter(payment => saleIds.includes(payment.sale_id));
    },
    enabled: sales.length > 0,
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  if (loadingClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Client not found</p>
        <Link to={createPageUrl("Clients")}>
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  // Calculate totals
  const totalPurchaseValue = sales.reduce((sum, sale) => sum + (sale.total_price || 0), 0);
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.total_paid || 0), 0);
  const totalRemaining = totalPurchaseValue - totalPaid;

  const paymentMethodConfig = {
    cash: 'Cash',
    cheque: 'Cheque',
    direct_deposit: 'Direct Deposit',
    bank_transfer: 'Bank',
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-slate-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Clients"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{client.full_name}</h1>
            <p className="text-slate-600">Client Profile</p>
          </div>
          <ExportMenu
            data={[{
              'Client Name': client.full_name,
              'Contract Numbers': [...new Set(sales.map(s => s.contract_number).filter(Boolean))].join(', ') || 'N/A',
              'Email': client.email || '',
              'Phone': client.phone,
              'Total Properties': sales.length,
              'Total Purchase Value': totalPurchaseValue,
              'Total Paid': totalPaid,
              'Total Remaining': totalRemaining,
              'Currency': client.preferred_currency,
              'Payment Method': (() => {
                const methods = [...new Set(sales.map(s => s.payment_method).filter(Boolean))];
                if (methods.length === 0) return client.preferred_payment_method || 'N/A';
                const formatted = methods.map(m => (m || '').charAt(0).toUpperCase() + (m || '').slice(1).toLowerCase());
                return formatted.join(', ');
              })(),
            }]}
            columns={[
              { header: 'Client Name', key: 'Client Name' },
              { header: 'Contract Numbers', key: 'Contract Numbers' },
              { header: 'Email', key: 'Email' },
              { header: 'Phone', key: 'Phone' },
              { header: 'Total Properties', key: 'Total Properties' },
              { header: 'Total Purchase Value', key: 'Total Purchase Value' },
              { header: 'Total Paid', key: 'Total Paid' },
              { header: 'Total Remaining', key: 'Total Remaining' },
              { header: 'Currency', key: 'Currency' },
              { header: 'Payment Method', key: 'Payment Method' },
            ]}
            title={`${client.full_name} - Client Profile`}
            filename={`client_profile_${client.full_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}`}
            buttonText="Export Profile"
          />
        </div>

        {/* Client Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-amber-400">
                    {client.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {client.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-900 break-words">{client.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500">Phone</p>
                  <p className="text-sm font-medium text-slate-900 break-words">{client.phone}</p>
                </div>
              </div>
              {client.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-900 break-words">{client.address}</p>
                  </div>
                </div>
              )}
              {client.nationality && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Nationality</p>
                    <p className="text-sm font-medium text-slate-900 break-words">{client.nationality}</p>
                  </div>
                </div>
              )}
              {client.identification_number && (
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">ID/Passport</p>
                    <p className="text-sm font-medium text-slate-900 break-words">{client.identification_number}</p>
                  </div>
                </div>
              )}
              {client.id_picture_url && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs text-slate-500 mb-2">ID/Passport Document</p>
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img 
                      src={client.id_picture_url} 
                      alt="ID Document" 
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const url = client.id_picture_url;
                        const filename = `id-document-${client.full_name?.replace(/\s+/g, '-') || 'client'}.png`;
                        try {
                          const res = await fetch(url);
                          const blob = await res.blob();
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = blobUrl;
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(blobUrl);
                        } catch {
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm hover:bg-white transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-700" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contracts & Notes (Replaced Payment Preferences) */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Contracts & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">Signed Contracts</p>
                {(() => {
                    const uniqueContracts = [];
                    const seen = new Set();
                    sales.forEach(s => {
                        if (s.contract_number && !seen.has(s.contract_number)) {
                            seen.add(s.contract_number);
                            uniqueContracts.push({
                                number: s.contract_number,
                                url: s.contract_document_url
                            });
                        }
                    });

                    if (uniqueContracts.length === 0) {
                        return <p className="text-sm text-slate-500">No contracts found</p>;
                    }

                    return (
                        <Select onValueChange={(value) => {
                            if (!value || value === '#') return;
                            const [url, number] = value.split('::');
                            if (url) setViewContract({ url, contractNumber: number || '' });
                        }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a contract to view..." />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueContracts.map((c, idx) => (
                                    <SelectItem key={idx} value={c.url ? `${c.url}::${c.number}` : '#'} disabled={!c.url}>
                                        Contract #{c.number} {c.url ? '(View)' : '(No Document)'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    );
                })()}
              </div>
              {client.id_picture_url && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">ID/Passport Document</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewId(true)}
                    className="gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    View ID Document
                  </Button>
                </div>
              )}
              {client.notes && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Notes</p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!viewContract.url} onOpenChange={(open) => !open && setViewContract({ url: null, contractNumber: '' })}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Contract #{viewContract.contractNumber}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-auto border rounded-lg bg-slate-50">
                {viewContract.url && (
                  isPdfUrl(viewContract.url) ? (
                    <iframe
                      src={viewContract.url}
                      title="Contract Document"
                      className="w-full h-[70vh] min-h-[400px]"
                    />
                  ) : (
                    <img
                      src={viewContract.url}
                      alt="Contract Document"
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  )
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewContract({ url: null, contractNumber: '' })}>
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    const url = viewContract.url;
                    const ext = isPdfUrl(url) ? 'pdf' : 'png';
                    const filename = `contract-${viewContract.contractNumber?.replace(/\s+/g, '-') || 'document'}.${ext}`;
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    } catch {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-gradient-to-r from-slate-900 to-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={viewId} onOpenChange={setViewId}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>ID/Passport Document</DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-auto border rounded-lg bg-slate-50">
                {client.id_picture_url && (
                  <img
                    src={client.id_picture_url}
                    alt="ID Document"
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setViewId(false)}>
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    const url = client.id_picture_url;
                    const filename = `id-document-${client.full_name?.replace(/\s+/g, '-') || 'client'}.png`;
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    } catch {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-gradient-to-r from-slate-900 to-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Financial Summary */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Properties</p>
                <p className="text-3xl font-bold text-slate-900">{sales.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalPaid.toLocaleString()} {client.preferred_currency}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Remaining Balance</p>
                <p className="text-2xl font-bold text-amber-600">
                  {totalRemaining.toLocaleString()} {client.preferred_currency}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts & Purchases Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Contracts & Purchases</h2>
          {(() => {
              // Get unique contracts
              const contracts = [...new Set(sales.map(s => s.contract_number).filter(Boolean))];
              // Sales without contracts (legacy support)
              const noContractSales = sales.filter(s => !s.contract_number);

              return (
                  <div className="space-y-8">
                      {contracts.map(contract => {
                          const contractSales = sales.filter(s => s.contract_number === contract);
                          return (
                              <div key={contract} className="space-y-4">
                                  <div className="flex items-center gap-2 border-b pb-2">
                                      <FileText className="w-5 h-5 text-slate-500" />
                                      <h3 className="text-xl font-bold text-slate-800">Contract #{contract}</h3>
                                      <Badge variant="outline">{contractSales.length} Unit{contractSales.length > 1 ? 's' : ''}</Badge>
                                  </div>
                                  <PurchaseHistory 
                                      sales={contractSales} 
                                      apartments={apartments} 
                                      payments={payments}
                                      clientCurrency={client.preferred_currency}
                                  />
                              </div>
                          );
                      })}
                      
                      {noContractSales.length > 0 && (
                          <div className="space-y-4">
                              <div className="flex items-center gap-2 border-b pb-2">
                                  <FileText className="w-5 h-5 text-slate-500" />
                                  <h3 className="text-xl font-bold text-slate-800">Other Purchases</h3>
                              </div>
                              <PurchaseHistory 
                                  sales={noContractSales} 
                                  apartments={apartments} 
                                  payments={payments}
                                  clientCurrency={client.preferred_currency}
                              />
                          </div>
                      )}
                      
                      {sales.length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                              No purchase history found.
                          </div>
                      )}
                  </div>
              );
          })()}
        </div>
      </div>
    </div>
  );
}