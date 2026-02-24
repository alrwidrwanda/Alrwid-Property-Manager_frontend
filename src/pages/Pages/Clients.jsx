import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Users as UsersIcon, Eye, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ClientCard from "@/components/ui/apartments/clients/ClientCard";
import ClientForm from "@/components/ui/apartments/clients/ClientForm";
import { ExportMenu } from "@/components/shared/ExportMenu";

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list('-created_date'),
    initialData: [],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list(),
    initialData: [],
  });

  const isClientDefaulted = (clientId) => {
    return sales.some(s => s.client_id === clientId && s.status === 'defaulted');
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
      if (window.addNotification) {
        window.addNotification('Client added successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) {
        window.addNotification(error?.message || 'Failed to create client', 'error');
      } else {
        console.error('Create client error:', error);
        alert(error?.message || 'Failed to create client. Check console for details.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowForm(false);
      setEditingClient(null);
      if (window.addNotification) {
        window.addNotification('Client updated successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) {
        window.addNotification(error?.message || 'Failed to update client', 'error');
      } else {
        console.error('Update client error:', error);
        alert(error?.message || 'Failed to update client. Check console for details.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (clientId) => {
      // Get all sales for this client
      const clientSales = sales.filter(sale => sale.client_id === clientId);

      // Delete all related payments and receipts for each sale
      for (const sale of clientSales) {
        const salePayments = await base44.entities.Payment.list();
        const relatedPayments = salePayments.filter(p => p.sale_id === sale.id);

        // Delete receipts for each payment
        for (const payment of relatedPayments) {
          const allReceipts = await base44.entities.Receipt.list();
          const paymentReceipts = allReceipts.filter(r => r.payment_id === payment.id);
          for (const receipt of paymentReceipts) {
            await base44.entities.Receipt.delete(receipt.id);
          }
          // Delete payment
          await base44.entities.Payment.delete(payment.id);
        }

        // Update apartment status back to available
        if (sale.apartment_id) { // Ensure apartment_id exists before attempting to update
            await base44.entities.Apartment.update(sale.apartment_id, { status: 'available' });
        }

        // Delete sale
        await base44.entities.Sale.delete(sale.id);
      }

      // Finally delete the client
      await base44.entities.Client.delete(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all their sales, payments, and receipts.')) {
      deleteMutation.mutate(id);
    }
  };

  // Get client purchase count
  const getClientPurchaseCount = (clientId) => {
    return sales.filter(sale => sale.client_id === clientId).length;
  };

  // Get client total spent
  const getClientTotalSpent = (clientId) => {
    return sales
      .filter(sale => sale.client_id === clientId)
      .reduce((sum, sale) => sum + (sale.total_paid || 0), 0);
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.includes(searchQuery) ||
      client.identification_number?.includes(searchQuery);

    return matchesSearch;
  });

  const exportData = filteredClients.map(client => {
    const clientSales = sales.filter(s => s.client_id === client.id);
    const contractNumbers = [...new Set(clientSales.map(s => s.contract_number).filter(Boolean))].join(', ');
    return {
      full_name: client.full_name,
      contract_number: client.contract_number || contractNumbers || '',
      email: client.email || '',
      phone: client.phone,
      address: client.address || '',
      nationality: client.nationality || '',
      id_number: client.identification_number || '',
    };
  });

  const exportColumns = [
    { header: 'Full Name', key: 'full_name' },
    { header: 'Contract Number', key: 'contract_number' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Address', key: 'address' },
    { header: 'Nationality', key: 'nationality' },
    { header: 'ID Number', key: 'id_number' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Clients</h1>
          <p className="text-sm text-slate-600">{clients.length} total clients</p>
        </div>
          <div className="flex gap-3">
            <ExportMenu 
              data={exportData}
              columns={exportColumns}
              title="Clients List"
              filename={`clients_${new Date().toISOString().split('T')[0]}`}
            />
            <Button
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>
        </div>

      {/* Filters */}
      <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by name, email, phone, or ID number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

      {/* Clients List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No clients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isDefaulted={isClientDefaulted(client.id)}
                purchaseCount={getClientPurchaseCount(client.id)}
                totalSpent={getClientTotalSpent(client.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </DialogTitle>
            </DialogHeader>
            <ClientForm
              client={editingClient}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingClient(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}