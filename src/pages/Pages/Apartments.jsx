import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Grid3x3, List, Trash2, ClipboardPaste } from "lucide-react";
import ApartmentCard from "@/components/ui/apartments/ApartmentCard";
import ApartmentForm from "@/components/ui/apartments/ApartmentForm";
import BulkPasteForm from "@/components/ui/apartments/BulkPasteForm";
import BulkApartmentForm from "@/components/ui/apartments/BulkApartmentForm";
import ApartmentReservationForm from "@/components/ui/apartments/ApartmentReservationForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useDeleteWithUndo, DeleteUndoToast } from "@/components/shared/DeleteWithUndo";
import { ExportMenu } from "@/components/shared/ExportMenu";

export default function ApartmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [showBulkPasteForm, setShowBulkPasteForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedApartments, setSelectedApartments] = useState([]);

  const queryClient = useQueryClient();
  const { pendingDeletes, scheduleDelete, scheduleBulkDelete, undoDelete, dismissDelete } = useDeleteWithUndo();

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list('-created_date'),
    initialData: [],
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.ApartmentReservation.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Apartment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setShowForm(false);
      setEditingApartment(null);
      if (window.addNotification) {
        window.addNotification('New apartment added successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to create apartment', 'error');
      else alert(error?.message || 'Failed to create apartment');
    },
  });

  const bulkPasteMutation = useMutation({
    mutationFn: async (apartments) => {
      const results = [];
      for (const apt of apartments) {
        const created = await base44.entities.Apartment.create(apt);
        results.push(created);
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setShowBulkPasteForm(false);
      if (window.addNotification) {
        window.addNotification(`${results.length} apartments added successfully`, 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) {
        window.addNotification(error?.message || 'Failed to create apartments', 'error');
      } else {
        console.error('Bulk paste error:', error);
        alert(error?.message || 'Failed to create apartments. Check console for details.');
      }
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data) => {
      const reservation = await base44.entities.ApartmentReservation.create(data);
      await base44.entities.Apartment.update(data.apartment_id, { status: 'reserved' });
      return reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setShowReservationForm(false);
      setEditingReservation(null);
      if (window.addNotification) {
        window.addNotification('Apartment reserved successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to reserve apartment', 'error');
      else alert(error?.message || 'Failed to reserve apartment');
    },
  });

  const updateReservationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ApartmentReservation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setShowReservationForm(false);
      setEditingReservation(null);
      if (window.addNotification) {
        window.addNotification('Reservation updated successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to update reservation', 'error');
      else alert(error?.message || 'Failed to update reservation');
    },
  });

  const deleteReservationMutation = useMutation({
    mutationFn: async (reservation) => {
      await base44.entities.ApartmentReservation.delete(reservation.id);
      await base44.entities.Apartment.update(reservation.apartment_id, { status: 'available' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      if (window.addNotification) {
        window.addNotification('Reservation cancelled successfully', 'success');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Apartment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setShowForm(false);
      setEditingApartment(null);
      if (window.addNotification) {
        window.addNotification('Apartment updated successfully', 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to update apartment', 'error');
      else alert(error?.message || 'Failed to update apartment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (apartmentId) => {
      const allSales = await base44.entities.Sale.list();
      const apartmentSales = allSales.filter(sale => sale.apartment_id === apartmentId);
      
      for (const sale of apartmentSales) {
        const allPayments = await base44.entities.Payment.list();
        const salePayments = allPayments.filter(p => p.sale_id === sale.id);
        
        for (const payment of salePayments) {
          const allReceipts = await base44.entities.Receipt.list();
          const paymentReceipts = allReceipts.filter(r => r.payment_id === payment.id);
          for (const receipt of paymentReceipts) {
            await base44.entities.Receipt.delete(receipt.id);
          }
          await base44.entities.Payment.delete(payment.id);
        }
        
        await base44.entities.Sale.delete(sale.id);
      }
      
      await base44.entities.Apartment.delete(apartmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const handleSubmit = (data) => {
    if (editingApartment) {
      updateMutation.mutate({ id: editingApartment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBulkPasteSubmit = (apartments) => {
    bulkPasteMutation.mutate(apartments);
  };

  const bulkApartmentMutation = useMutation({
    mutationFn: async (apartments) => {
      const results = [];
      for (const apt of apartments) {
        const payload = { ...apt, area_sqm: Number(apt.area_sqm) || 0, base_price: Number(apt.base_price) || 0 };
        const created = await base44.entities.Apartment.create(payload);
        results.push(created);
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      setShowBulkForm(false);
      if (window.addNotification) {
        window.addNotification(`${results.length} apartment(s) added successfully`, 'success');
      }
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to create apartments', 'error');
      else alert(error?.message || 'Failed to create apartments');
    },
  });

  const handleBulkApartmentSubmit = (apartments) => {
    bulkApartmentMutation.mutate(apartments);
  };

  const handleReservationSubmit = (data) => {
    if (editingReservation) {
      updateReservationMutation.mutate({ id: editingReservation.id, data });
    } else {
      createReservationMutation.mutate(data);
    }
  };

  const handleEdit = (apartment) => {
    setEditingApartment(apartment);
    setShowForm(true);
  };

  const handleDelete = (apartment) => {
    scheduleDelete(
      apartment, 
      'Apartment', 
      (apt) => deleteMutation.mutate(apt.id)
    );
  };

  const handleReleaseReservation = (apartment) => {
    const reservation = reservations.find(r => r.apartment_id === apartment.id && r.status === 'active');
    if (reservation) {
      deleteReservationMutation.mutate(reservation);
    }
  };

  const handleUndoDelete = (deleteId) => {
    const deleteItem = pendingDeletes.find(d => d.id === deleteId);
    if (!deleteItem) return;
    const restoreFn = deleteItem.items
      ? (items) => items.forEach((item) => createMutation.mutate(item))
      : (item) => createMutation.mutate(item);
    undoDelete(deleteId, restoreFn);
  };

  const handleBulkDelete = () => {
    if (selectedApartments.length === 0) return;
    if (window.confirm(`Delete ${selectedApartments.length} selected apartments?`)) {
      const toDelete = selectedApartments
        .map((aptId) => apartments.find((a) => a.id === aptId))
        .filter(Boolean);
      scheduleBulkDelete(toDelete, 'Apartment', (apt) => deleteMutation.mutate(apt.id));
      setSelectedApartments([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedApartments.length === filteredApartments.length && filteredApartments.length > 0) {
      setSelectedApartments([]);
    } else {
      setSelectedApartments(filteredApartments.map(apt => apt.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedApartments(prev =>
      prev.includes(id) ? prev.filter(aptId => aptId !== id) : [...prev, id]
    );
  };

  const filteredApartments = apartments.filter(apt => {
    const matchesSearch = apt.unit_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const availableCount = apartments.filter(a => a.status === 'available').length;
  const reservedCount = apartments.filter(a => a.status === 'reserved').length;
  const soldCount = apartments.filter(a => a.status === 'sold').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Apartments</h1>
            <div className="flex gap-3 text-sm">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {soldCount} Sold
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                {reservedCount} Reserved
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {availableCount} Available
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {selectedApartments.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedApartments.length})
              </Button>
            )}
            <ExportMenu
              data={filteredApartments}
              filename="apartments_report"
              title="Apartments Report"
              columns={[
                { header: "Unit Number", key: "unit_number" },
                { header: "Block", key: "block" },
                { header: "Floor", key: "floor" },
                { header: "Direction", key: "direction" },
                { header: "Description", key: "apartment_description" },
                { header: "Area (sqm)", key: "area_sqm" },
                { header: "Parking Spot", key: "parking_spot" },
                { header: "Status", key: "status" },
                { header: "Base Price", key: "base_price" },
                { header: "Currency", key: "currency" },
                { header: "Bedrooms", key: "bedrooms" },
                { header: "Bathrooms", key: "bathrooms" },
                { header: "Created Date", key: "created_date" },
              ]}
            />
            <Button
              variant="outline"
              onClick={() => setShowBulkPasteForm(true)}
              className="gap-2"
            >
              <ClipboardPaste className="w-4 h-4" />
              Bulk Paste
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowBulkForm(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Bulk Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditingReservation(null);
                setShowReservationForm(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Reserve Apartment
            </Button>
            <Button
              onClick={() => {
                setEditingApartment(null);
                setShowForm(true);
              }}
              className="gap-2 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
            >
              <Plus className="w-4 h-4" />
              Add Apartment
            </Button>
          </div>
        </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedApartments.length === filteredApartments.length && filteredApartments.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-slate-600">
              {selectedApartments.length > 0 ? `${selectedApartments.length} selected` : 'Select all'}
            </span>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by unit number or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="reserved">Reserved</TabsTrigger>
              <TabsTrigger value="sold">Sold</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

      {/* Apartments Grid/List */}
      {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : filteredApartments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No apartments found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredApartments.map((apartment) => (
              <div key={apartment.id} className="relative">
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedApartments.includes(apartment.id)}
                    onCheckedChange={() => toggleSelect(apartment.id)}
                    className="bg-white"
                  />
                </div>
                <ApartmentCard
                  apartment={apartment}
                  onEdit={handleEdit}
                  onDelete={() => handleDelete(apartment)}
                  onReleaseReservation={() => handleReleaseReservation(apartment)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        )}

      {/* Bulk Paste Form Dialog */}
      <Dialog open={showBulkPasteForm} onOpenChange={setShowBulkPasteForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Paste Apartments</DialogTitle>
            </DialogHeader>
            <BulkPasteForm
              onSubmit={handleBulkPasteSubmit}
              onCancel={() => setShowBulkPasteForm(false)}
              isLoading={bulkPasteMutation.isPending}
            />
          </DialogContent>
        </Dialog>

      {/* Bulk Add Form Dialog */}
      <Dialog open={showBulkForm} onOpenChange={setShowBulkForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Add Apartments</DialogTitle>
            </DialogHeader>
            <BulkApartmentForm
              onSubmit={handleBulkApartmentSubmit}
              onCancel={() => setShowBulkForm(false)}
              isLoading={bulkApartmentMutation.isPending}
            />
          </DialogContent>
        </Dialog>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
              </DialogTitle>
            </DialogHeader>
            <ApartmentForm
              apartment={editingApartment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingApartment(null);
              }}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>

      {/* Reservation Form Dialog */}
      <Dialog open={showReservationForm} onOpenChange={setShowReservationForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? 'Edit Reservation' : 'Reserve Apartment'}
              </DialogTitle>
            </DialogHeader>
            <ApartmentReservationForm
              reservation={editingReservation}
              apartments={apartments.filter(a => a.status === 'available' || a.id === editingReservation?.apartment_id)}
              onSubmit={handleReservationSubmit}
              onCancel={() => {
                setShowReservationForm(false);
                setEditingReservation(null);
              }}
              isLoading={createReservationMutation.isPending || updateReservationMutation.isPending}
            />
          </DialogContent>
        </Dialog>

      <DeleteUndoToast 
        pendingDeletes={pendingDeletes} 
        onUndo={handleUndoDelete}
        onDismiss={dismissDelete}
      />
    </div>
  );
}