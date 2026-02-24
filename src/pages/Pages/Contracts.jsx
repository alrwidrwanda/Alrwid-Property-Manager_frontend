import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, FileText, Download, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

function isPdfUrl(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return url.includes('application/pdf');
  return url.toLowerCase().endsWith('.pdf') || url.includes('application/pdf');
}

export default function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewContract, setViewContract] = useState({ url: null, contractNumber: '', clientName: '' });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list(),
    initialData: [],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
  });

  const { data: apartments = [] } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  const filteredSales = sales.filter(sale => {
    const client = clients.find(c => c.id === sale.client_id);
    const apartment = apartments.find(a => a.id === sale.apartment_id);
    const searchTerm = searchQuery.toLowerCase();
    
    return (
      client?.full_name?.toLowerCase().includes(searchTerm) ||
      sale?.contract_number?.toLowerCase().includes(searchTerm) ||
      apartment?.unit_number?.toLowerCase().includes(searchTerm)
    );
  });

  // handleGenerateContract removed in favor of top button blank template

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Contracts Dashboard</h1>
          <p className="text-sm text-slate-600">Manage and generate client contracts</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by client, contract #, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

      {/* Contracts List */}
      <Card className="shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle>Active Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No contracts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contract #</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Sale Date</TableHead>
                      <TableHead>Signed Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const client = clients.find(c => c.id === sale.client_id);
                      const apartment = apartments.find(a => a.id === sale.apartment_id);
                      const hasSignedContract = !!sale?.contract_document_url;
                      
                      return (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">
                            <Link to={createPageUrl(`ClientProfile?id=${client?.id}`)} className="hover:underline text-blue-600">
                              {client?.full_name || 'N/A'}
                            </Link>
                          </TableCell>
                          <TableCell>{sale?.contract_number || 'Pending'}</TableCell>
                          <TableCell>{apartment?.unit_number || 'N/A'}</TableCell>
                          <TableCell>{sale.sale_date}</TableCell>
                          <TableCell>
                            {hasSignedContract ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700 border-green-200 flex w-fit items-center gap-1">
                                  <FileCheck className="w-3 h-3" /> Signed
                                </Badge>
                                <button
                                  type="button"
                                  className="text-xs text-blue-600 hover:underline"
                                  onClick={() => setViewContract({
                                    url: sale.contract_document_url,
                                    contractNumber: sale.contract_number,
                                    clientName: client?.full_name || 'Client',
                                  })}
                                >
                                  (View)
                                </button>
                                <button
                                  type="button"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                                  onClick={async () => {
                                    const url = sale.contract_document_url;
                                    const ext = isPdfUrl(url) ? 'pdf' : 'png';
                                    const filename = `contract-${sale.contract_number?.replace(/\s+/g, '-') || 'document'}.${ext}`;
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
                                >
                                  <Download className="w-3 h-3" /> (Download)
                                </button>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 border-slate-300">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      <Dialog open={!!viewContract.url} onOpenChange={(open) => !open && setViewContract({ url: null, contractNumber: '', clientName: '' })}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Contract #{viewContract.contractNumber} — {viewContract.clientName}</DialogTitle>
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
            <Button
              variant="outline"
              onClick={() => setViewContract({ url: null, contractNumber: '', clientName: '' })}
            >
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
    </div>
  );
}