import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, AlertCircle, Receipt as ReceiptIcon, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SaleCard from "@/components/sales/SaleCard";
import SaleForm from "@/components/sales/SaleForm";
import MultiApartmentSaleForm from "@/components/sales/MultiApartmentSaleForm";
import DefaultedSaleCard from "@/components/sales/DefaultedSaleCard";
import PaymentCard from "@/components/payments/PaymentCard";
import PaymentForm from "@/components/payments/PaymentForm";
import { ExportMenu } from "@/components/shared/ExportMenu";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentCalendar from "@/components/sales/PaymentCalendar";
import PaymentTracker from "@/components/sales/PaymentTracker";
import { useDeleteWithUndo, DeleteUndoToast } from "@/components/shared/DeleteWithUndo";

export default function SalesAndPaymentsPage() {
  // --- State ---
  const [activeTab, setActiveTab] = useState("sales");
  
  // Sales State
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [salesSearchQuery, setSalesSearchQuery] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState("all");

  // Payments State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [paymentViewTab, setPaymentViewTab] = useState("list");

  const queryClient = useQueryClient();
  const { pendingDeletes, scheduleDelete, undoDelete, dismissDelete } = useDeleteWithUndo();

  // --- Data Fetching ---
  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date'),
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

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.ApartmentReservation.list(),
    initialData: [],
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
    initialData: [],
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => base44.entities.Receipt.list(),
    initialData: [],
  });

  const { data: defaultedSales = [] } = useQuery({
    queryKey: ['defaultedSales'],
    queryFn: () => base44.entities.DefaultedSale.list('-defaulted_date'),
    initialData: [],
  });

  // --- Helpers ---
  const getClient = (clientId) => clients.find(c => c.id === clientId);
  const getApartment = (apartmentId) => apartments.find(a => a.id === apartmentId);

  const calculateRemainingBalance = (sale) => {
    return (sale.total_price || 0) - (sale.total_paid || 0);
  };

  const checkOverduePayments = (sale) => {
    if (sale.status === 'completed') return { isOverdue: false };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expectedPaid = sale.first_installment || 0;
    
    // Check regular monthly payments
    if (sale.monthly_payment && sale.payment_duration_months && sale.sale_date) {
      const paymentFrequency = sale.payment_frequency_months || 1;
      
      // First payment date = sale_date + payment_frequency_months
      const saleDate = new Date(sale.sale_date);
      saleDate.setHours(0, 0, 0, 0);
      const firstPaymentDate = new Date(saleDate);
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + paymentFrequency);
      
      const paymentEndDate = new Date(firstPaymentDate);
      paymentEndDate.setMonth(paymentEndDate.getMonth() + sale.payment_duration_months);
      
      let currentDate = new Date(firstPaymentDate);
      while (currentDate < today && currentDate <= paymentEndDate) {
        expectedPaid += sale.monthly_payment;
        currentDate.setMonth(currentDate.getMonth() + paymentFrequency);
      }
    }
    
    const actualPaid = sale.total_paid || 0;
    
    if (actualPaid < expectedPaid) {
      const amountOverdue = expectedPaid - actualPaid;
      const missedPayments = sale.monthly_payment > 0 
        ? Math.floor(amountOverdue / sale.monthly_payment) 
        : 0;
      return {
        isOverdue: true,
        missedPayments,
        amountOverdue,
      };
    }
    
    return { isOverdue: false };
  };

  const getPaymentDetails = (payment) => {
    const sale = sales.find(s => s.id === payment.sale_id);
    const client = sale ? clients.find(c => c.id === sale.client_id) : null;
    const apartment = sale ? apartments.find(a => a.id === sale.apartment_id) : null;
    const paymentReceipts = receipts.filter(r => r.payment_id === payment.id);
    
    return { sale, client, apartment, receipts: paymentReceipts };
  };

  const getPaymentTypeLabel = (paymentType) => {
    const labels = {
      advanced_payment: 'Advanced Payment',
      scheduled_payment: 'Scheduled Payment',
      additional: 'Additional Payment',
      final: 'Final Payment',
      monthly: 'Monthly Payment',
    };
    return labels[paymentType] || (paymentType ? paymentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '');
  };

  const getRemainingBalanceAfterPayment = (payment, sale) => {
    if (!sale) return null;
    const salePayments = payments
      .filter(p => p.sale_id === payment.sale_id)
      .sort((a, b) => {
        const dateA = new Date(a.payment_date);
        const dateB = new Date(b.payment_date);
        return dateA - dateB || (a.id || '').localeCompare(b.id || '');
      });
    let cumulativePaid = 0;
    for (const p of salePayments) {
      cumulativePaid += p.amount || 0;
      if (p.id === payment.id) break;
    }
    return Math.max(0, (sale.total_price || 0) - cumulativePaid);
  };

  // --- Mutations (Sales) ---
  const createSaleMutation = useMutation({
    mutationFn: async (data) => {
      // Check if data is an array (multi-apartment sale)
      const salesArray = Array.isArray(data) ? data : [data];
      const salesCreated = [];

      for (const saleData of salesArray) {
        // 1. Create the sale
        const sale = await base44.entities.Sale.create(saleData);
        salesCreated.push(sale);
        
        // 2. Update apartment status
        await base44.entities.Apartment.update(saleData.apartment_id, { status: 'sold' });

        // 3. If there is an Advanced Payment (first_installment), create a Payment record
        if (saleData.first_installment > 0) {
            await base44.entities.Payment.create({
                sale_id: sale.id,
                payment_date: saleData.sale_date,
                amount: saleData.first_installment,
                currency: saleData.currency,
                payment_method: saleData.payment_method,
                payment_type: 'advanced_payment',
                reference_number: 'Advanced Payment',
                notes: 'Automatically created from Advanced Payment'
            });

            // 4. Update the sale's total_paid and status if fully paid
            const totalPrice = saleData.total_price || 0;
            const updateData = { total_paid: saleData.first_installment };
            if (saleData.first_installment >= totalPrice) updateData.status = 'completed';
            await base44.entities.Sale.update(sale.id, updateData);
        }
      }

      return salesCreated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowSaleForm(false);
      setEditingSale(null);
      if (window.addNotification) window.addNotification('Sale(s) created successfully', 'success');
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to create sale', 'error');
      else alert(error?.message || 'Failed to create sale');
    },
  });

  const updateSaleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Sale.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setShowSaleForm(false);
      setEditingSale(null);
      if (window.addNotification) window.addNotification('Sale updated successfully', 'success');
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to update sale', 'error');
      else alert(error?.message || 'Failed to update sale');
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (sale) => {
      // Fetch receipts and payments first (optimally) or use what we have in context if possible. 
      // But for safety, list them. To avoid N+1, list once.
      const allPayments = await base44.entities.Payment.list();
      const allReceipts = await base44.entities.Receipt.list();
      
      const relatedPayments = allPayments.filter(p => p.sale_id === sale.id);
      
      for (const payment of relatedPayments) {
        const paymentReceipts = allReceipts.filter(r => r.payment_id === payment.id);
        for (const receipt of paymentReceipts) {
          await base44.entities.Receipt.delete(receipt.id);
        }
        await base44.entities.Payment.delete(payment.id);
      }
      
      // Free up the apartment
      await base44.entities.Apartment.update(sale.apartment_id, { status: 'available' });
      
      // Delete the sale
      await base44.entities.Sale.delete(sale.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });

  const markDefaultedMutation = useMutation({
    mutationFn: async (sale) => {
      const reason = prompt('Enter reason for defaulting this sale (optional):');
      
      // Create DefaultedSale record
      await base44.entities.DefaultedSale.create({
        original_sale_id: sale.id,
        apartment_id: sale.apartment_id,
        client_id: sale.client_id,
        contract_number: sale.contract_number,
        contract_document_url: sale.contract_document_url,
        sale_date: sale.sale_date,
        defaulted_date: new Date().toISOString().split('T')[0],
        total_price: sale.total_price,
        currency: sale.currency,
        first_installment: sale.first_installment,
        monthly_payment: sale.monthly_payment,
        payment_duration_months: sale.payment_duration_months,
        payment_frequency_months: sale.payment_frequency_months,
        total_paid: sale.total_paid,
        payment_method: sale.payment_method,
        default_reason: reason || '',
        notes: sale.notes,
      });

      // Delete related payments and receipts
      const allPayments = await base44.entities.Payment.list();
      const allReceipts = await base44.entities.Receipt.list();
      const relatedPayments = allPayments.filter(p => p.sale_id === sale.id);
      
      for (const payment of relatedPayments) {
        const paymentReceipts = allReceipts.filter(r => r.payment_id === payment.id);
        for (const receipt of paymentReceipts) {
          await base44.entities.Receipt.delete(receipt.id);
        }
        await base44.entities.Payment.delete(payment.id);
      }

      // Reset apartment to available
      await base44.entities.Apartment.update(sale.apartment_id, { status: 'available' });

      // Delete the original sale
      await base44.entities.Sale.delete(sale.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['defaultedSales'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      if (window.addNotification) {
        window.addNotification('Sale marked as defaulted successfully', 'success');
      }
    },
  });

  const deleteDefaultedSaleMutation = useMutation({
    mutationFn: async (defaultedSaleId) => {
      await base44.entities.DefaultedSale.delete(defaultedSaleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultedSales'] });
    },
  });

  // --- Mutations (Payments) ---
  const createPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const payment = await base44.entities.Payment.create(data);
      const sale = sales.find(s => s.id === data.sale_id);
      if (sale) {
        const newTotalPaid = (sale.total_paid || 0) + data.amount;
        const totalPrice = sale.total_price || 0;
        const updateData = { total_paid: newTotalPaid };
        if (newTotalPaid >= totalPrice) updateData.status = 'completed';
        await base44.entities.Sale.update(sale.id, updateData);
      }
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setShowPaymentForm(false);
      setEditingPayment(null);
      if (window.addNotification) window.addNotification('Payment recorded successfully', 'success');
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to record payment', 'error');
      else alert(error?.message || 'Failed to record payment');
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, data, oldAmount }) => {
      await base44.entities.Payment.update(id, data);
      const sale = sales.find(s => s.id === data.sale_id);
      if (sale && oldAmount !== data.amount) {
        const adjustment = data.amount - oldAmount;
        const newTotalPaid = (sale.total_paid || 0) + adjustment;
        const totalPrice = sale.total_price || 0;
        const updateData = { total_paid: newTotalPaid };
        if (newTotalPaid >= totalPrice) updateData.status = 'completed';
        else if (sale.status === 'completed') updateData.status = 'active';
        await base44.entities.Sale.update(sale.id, updateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      setShowPaymentForm(false);
      setEditingPayment(null);
      if (window.addNotification) window.addNotification('Payment updated successfully', 'success');
    },
    onError: (error) => {
      if (window.addNotification) window.addNotification(error?.message || 'Failed to update payment', 'error');
      else alert(error?.message || 'Failed to update payment');
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (payment) => {
      // Fetch receipts to ensure we have latest
      const allReceipts = await base44.entities.Receipt.list();
      const paymentReceipts = allReceipts.filter(r => r.payment_id === payment.id);
      
      for (const receipt of paymentReceipts) {
        await base44.entities.Receipt.delete(receipt.id);
      }

      await base44.entities.Payment.delete(payment.id);
      
      const sale = sales.find(s => s.id === payment.sale_id);
      if (sale) {
        const newTotalPaid = Math.max(0, (sale.total_paid || 0) - payment.amount);
        const totalPrice = sale.total_price || 0;
        const updateData = { total_paid: newTotalPaid };
        if (newTotalPaid < totalPrice && sale.status === 'completed') updateData.status = 'active';
        await base44.entities.Sale.update(sale.id, updateData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
  });



  // --- Handlers ---
  const handleSaleSubmit = (data) => {
    if (editingSale) {
      updateSaleMutation.mutate({ id: editingSale.id, data });
    } else {
      // Data can be either a single sale object or array of sales
      createSaleMutation.mutate(data);
    }
  };

  const handlePaymentSubmit = (data) => {
    if (editingPayment) {
      updatePaymentMutation.mutate({ 
        id: editingPayment.id, 
        data,
        oldAmount: editingPayment.amount
      });
    } else {
      createPaymentMutation.mutate(data);
    }
  };

  const handleDeleteSale = (sale) => {
    scheduleDelete(
      sale,
      'Sale',
      (s) => deleteSaleMutation.mutate(s)
    );
  };

  const handleDeletePayment = (payment) => {
    scheduleDelete(
      payment,
      'Payment',
      (p) => deletePaymentMutation.mutate(p)
    );
  };

  const handleDeleteDefaultedSale = (defaultedSale) => {
    scheduleDelete(
      defaultedSale,
      'Defaulted Sale',
      (ds) => deleteDefaultedSaleMutation.mutate(ds.id)
    );
  };

  const handleUndoDelete = (deleteId) => {
    const deleteItem = pendingDeletes.find(d => d.id === deleteId);
    if (!deleteItem) return;
    const restoreFn = deleteItem.entityType === 'Sale'
      ? (item) => createSaleMutation.mutate(item)
      : deleteItem.entityType === 'Payment'
        ? (item) => createPaymentMutation.mutate(item)
        : deleteItem.entityType === 'Defaulted Sale'
          ? async (item) => {
              const { id, ...data } = item;
              await base44.entities.DefaultedSale.create(data);
              queryClient.invalidateQueries({ queryKey: ['defaultedSales'] });
            }
          : null;
    undoDelete(deleteId, restoreFn);
  };



  // --- Filtering & Export Data ---
  
  // Sales Filtering (exclude defaulted sales)
  const activeSales = sales.filter(sale => sale.status !== 'defaulted');
  
  const filteredSales = activeSales.filter(sale => {
    const client = getClient(sale.client_id);
    const apartment = getApartment(sale.apartment_id);
    
    const matchesSearch = 
      client?.full_name?.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      apartment?.unit_number?.toLowerCase().includes(salesSearchQuery.toLowerCase());
    
    const matchesStatus = salesStatusFilter === 'all' || sale.status === salesStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Defaulted Sales Filtering
  const filteredDefaultedSales = defaultedSales.filter(sale => {
    const client = getClient(sale.client_id);
    const apartment = getApartment(sale.apartment_id);
    
    const matchesSearch = 
      client?.full_name?.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
      apartment?.unit_number?.toLowerCase().includes(salesSearchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Reserved apartments filtering
  const filteredReservedApartments = salesStatusFilter === 'reserved' ? 
    reservations.filter(reservation => {
      const apartment = getApartment(reservation.apartment_id);
      return reservation.status === 'active' && 
        (reservation.non_client_name?.toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
         apartment?.unit_number?.toLowerCase().includes(salesSearchQuery.toLowerCase()));
    }) : [];

  const overdueSales = activeSales.filter(sale => {
    const overdueInfo = checkOverduePayments(sale);
    return overdueInfo?.isOverdue;
  });

  const salesExportData = filteredSales.map(sale => {
    const client = getClient(sale.client_id);
    const apartment = getApartment(sale.apartment_id);
    const remaining = calculateRemainingBalance(sale);
    const overdueInfo = checkOverduePayments(sale);

    return {
      client: client?.full_name || 'N/A',
      unit: apartment?.unit_number || 'N/A',
      sale_date: sale.sale_date,
      total_price: sale.total_price,
      total_paid: sale.total_paid || 0,
      remaining_balance: remaining,
      currency: 'USD',
      monthly_payment: sale.monthly_payment || 0,
      duration: sale.payment_duration_months || 0,
      status: sale.status,
      overdue: overdueInfo?.isOverdue ? 'Yes' : 'No',
    };
  });

  const salesExportColumns = [
    { header: 'Client', key: 'client' },
    { header: 'Unit', key: 'unit' },
    { header: 'Sale Date', key: 'sale_date' },
    { header: 'Total Price', key: 'total_price' },
    { header: 'Total Paid', key: 'total_paid' },
    { header: 'Remaining Balance', key: 'remaining_balance' },
    { header: 'Currency', key: 'currency' },
    { header: 'Monthly Payment', key: 'monthly_payment' },
    { header: 'Duration (months)', key: 'duration' },
    { header: 'Status', key: 'status' },
    { header: 'Overdue', key: 'overdue' },
  ];

  // Payments Filtering
  const filteredPayments = payments.filter(payment => {
    const { client, apartment } = getPaymentDetails(payment);
    
    const matchesSearch = 
      client?.full_name?.toLowerCase().includes(paymentsSearchQuery.toLowerCase()) ||
      apartment?.unit_number?.toLowerCase().includes(paymentsSearchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(paymentsSearchQuery.toLowerCase());
    
    const matchesMethod = paymentMethodFilter === 'all' || payment.payment_method === paymentMethodFilter;
    const matchesStatus = 
      paymentStatusFilter === 'all' || 
      (paymentStatusFilter === 'delayed' && payment.is_delayed) ||
      (paymentStatusFilter === 'on_time' && !payment.is_delayed);
    
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalPaymentAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const delayedPaymentCount = payments.filter(p => p.is_delayed).length;
  const avgPaymentAmount = payments.length > 0 ? totalPaymentAmount / payments.length : 0;

  const paymentsExportData = filteredPayments.map(payment => {
    const { sale, client, apartment, receipts } = getPaymentDetails(payment);
    const remainingBalance = getRemainingBalanceAfterPayment(payment, sale);

    return {
      payment_date: payment.payment_date,
      client: client?.full_name || 'N/A',
      contract_number: sale?.contract_number || '-',
      unit: apartment?.unit_number || 'N/A',
      amount: payment.amount,
      currency: 'USD',
      payment_method: payment.payment_method,
      payment_type: getPaymentTypeLabel(payment.payment_type),
      remaining_balance: remainingBalance !== null ? remainingBalance : '',
      is_delayed: payment.is_delayed ? 'Yes' : 'No',
      delay_days: payment.delay_days || 0,
      receipt_status: receipts.length > 0 ? receipts[0].status : 'No Receipt',
      notes: payment.notes || '',
    };
  });

  const paymentsExportColumns = [
    { header: 'Date', key: 'payment_date' },
    { header: 'Client', key: 'client' },
    { header: 'Contract Number', key: 'contract_number' },
    { header: 'Unit', key: 'unit' },
    { header: 'Amount', key: 'amount' },
    { header: 'Currency', key: 'currency' },
    { header: 'Payment method', key: 'payment_method' },
    { header: 'Payment type', key: 'payment_type' },
    { header: 'Remaining Balance', key: 'remaining_balance' },
    { header: 'Is Delayed', key: 'is_delayed' },
    { header: 'Delay Days', key: 'delay_days' },
    { header: 'Receipt Status', key: 'receipt_status' },
    { header: 'Notes', key: 'notes' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Sales & Payments Dashboard</h1>
        <p className="text-sm text-slate-600">Manage sales, payments, and track defaults</p>
      </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-8">
            <TabsTrigger value="sales" className="gap-2">
              <DollarSign className="w-4 h-4" /> Sales
            </TabsTrigger>
            <TabsTrigger value="defaulted" className="gap-2">
              <AlertTriangle className="w-4 h-4" /> Defaulted
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <ReceiptIcon className="w-4 h-4" /> Payments
            </TabsTrigger>
          </TabsList>

          {/* --- SALES TAB --- */}
          <TabsContent value="sales" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {activeSales.filter(s => s.status === 'active').length} Active
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {activeSales.filter(s => s.status === 'completed').length} Completed
                </span>
                {overdueSales.length > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {overdueSales.length} Overdue
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <ExportMenu 
                  data={salesExportData}
                  columns={salesExportColumns}
                  title="Sales List"
                  filename={`sales_${new Date().toISOString().split('T')[0]}`}
                />
                <Button 
                  onClick={() => {
                    setEditingSale(null);
                    setShowSaleForm(true);
                  }}
                  className="gap-2 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
                >
                  <Plus className="w-4 h-4" />
                  New Sale
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search by client name or unit number..."
                  value={salesSearchQuery}
                  onChange={(e) => setSalesSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={salesStatusFilter} onValueChange={setSalesStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="reserved">Reserved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {loadingSales ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              </div>
            ) : salesStatusFilter === 'reserved' ? (
              filteredReservedApartments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No reserved apartments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReservedApartments.map((reservation) => {
                    const apartment = getApartment(reservation.apartment_id);
                    return (
                      <div key={reservation.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                Reserved
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {reservation.non_client_name}
                            </h3>
                            <p className="text-slate-600">
                              Unit {apartment?.unit_number || 'N/A'} - {apartment?.block || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              Reserved on: {new Date(reservation.reservation_date).toLocaleDateString()}
                            </p>
                            {reservation.notes && (
                              <p className="text-sm text-slate-600 mt-2 italic">{reservation.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : filteredSales.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No sales found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <SaleCard
                    key={sale.id}
                    sale={sale}
                    client={getClient(sale.client_id)}
                    apartment={getApartment(sale.apartment_id)}
                    remainingBalance={calculateRemainingBalance(sale)}
                    overdueInfo={checkOverduePayments(sale)}
                    payments={payments.filter(p => p.sale_id === sale.id)}
                    onEdit={(s) => {
                      setEditingSale(s);
                      setShowSaleForm(true);
                    }}
                    onDelete={handleDeleteSale}
                    onMarkDefaulted={(s) => {
                      if (window.confirm('Are you sure you want to mark this sale as defaulted? This will reset the apartment to available and archive the sale.')) {
                        markDefaultedMutation.mutate(s);
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- DEFAULTED SALES TAB --- */}
          <TabsContent value="defaulted" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                  {defaultedSales.length} Defaulted Sales
                </span>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by client name or unit number..."
                value={salesSearchQuery}
                onChange={(e) => setSalesSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {filteredDefaultedSales.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No defaulted sales found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDefaultedSales.map((defaultedSale) => (
                  <DefaultedSaleCard
                    key={defaultedSale.id}
                    defaultedSale={defaultedSale}
                    client={getClient(defaultedSale.client_id)}
                    apartment={getApartment(defaultedSale.apartment_id)}
                    onDelete={handleDeleteDefaultedSale}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- PAYMENTS TAB --- */}
          <TabsContent value="payments" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {payments.length} Total
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {payments.filter(p => !p.is_delayed).length} On Time
                </span>
                {delayedPaymentCount > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {delayedPaymentCount} Delayed
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <ExportMenu 
                  data={paymentsExportData}
                  columns={paymentsExportColumns}
                  title="Payments List"
                  filename={`payments_${new Date().toISOString().split('T')[0]}`}
                />
                <Button 
                  onClick={() => {
                    setEditingPayment(null);
                    setShowPaymentForm(true);
                  }}
                  className="gap-2 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
                >
                  <Plus className="w-4 h-4" />
                  Record Payment
                </Button>
              </div>
            </div>

            <PaymentStats 
              totalPayments={payments.length}
              totalAmount={totalPaymentAmount}
              avgPayment={avgPaymentAmount}
              delayedCount={delayedPaymentCount}
              receipts={receipts}
              payments={payments}
            />

            <Tabs value={paymentViewTab} onValueChange={setPaymentViewTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                <TabsTrigger value="list">Payment List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="tracker">Tracker</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search by client, unit, or reference number..."
                      value={paymentsSearchQuery}
                      onChange={(e) => setPaymentsSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Tabs value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All Methods</TabsTrigger>
                      <TabsTrigger value="Cash">Cash</TabsTrigger>
                      <TabsTrigger value="Installment">Installment</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Tabs value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <TabsList>
                      <TabsTrigger value="all">All Status</TabsTrigger>
                      <TabsTrigger value="on_time">On Time</TabsTrigger>
                      <TabsTrigger value="delayed">Delayed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {loadingPayments ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <ReceiptIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No payments found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => {
                      const details = getPaymentDetails(payment);
                      return (
                        <PaymentCard
                          key={payment.id}
                          payment={payment}
                          {...details}
                          onEdit={(p) => {
                            setEditingPayment(p);
                            setShowPaymentForm(true);
                          }}
                          onDelete={handleDeletePayment}
                        />
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar">
                <PaymentCalendar 
                  sales={sales}
                  clients={clients}
                  apartments={apartments}
                  checkOverduePayments={checkOverduePayments}
                />
              </TabsContent>

              <TabsContent value="tracker">
                <PaymentTracker
                  sales={sales}
                  clients={clients}
                  apartments={apartments}
                  payments={payments}
                  checkOverduePayments={checkOverduePayments}
                  calculateRemainingBalance={calculateRemainingBalance}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showSaleForm} onOpenChange={setShowSaleForm}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSale ? 'Edit Sale' : 'Create New Sale'}</DialogTitle>
            </DialogHeader>
            {editingSale ? (
              <SaleForm
                sale={editingSale}
                clients={clients}
                apartments={apartments.filter(a => a.status === 'available' || a.id === editingSale?.apartment_id)}
                onSubmit={handleSaleSubmit}
                onCancel={() => {
                  setShowSaleForm(false);
                  setEditingSale(null);
                }}
                isLoading={createSaleMutation.isPending || updateSaleMutation.isPending}
              />
            ) : (
              <MultiApartmentSaleForm
                clients={clients}
                apartments={apartments.filter(a => a.status === 'available')}
                onSubmit={handleSaleSubmit}
                onCancel={() => {
                  setShowSaleForm(false);
                  setEditingSale(null);
                }}
                isLoading={createSaleMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
            </DialogHeader>
            <PaymentForm
              payment={editingPayment}
              sales={sales}
              clients={clients}
              apartments={apartments}
              onSubmit={handlePaymentSubmit}
              onCancel={() => {
                setShowPaymentForm(false);
                setEditingPayment(null);
              }}
              isLoading={createPaymentMutation.isPending || updatePaymentMutation.isPending}
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