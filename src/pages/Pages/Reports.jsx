import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Building2, Users, DollarSign, Receipt, TrendingUp } from "lucide-react";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";
import ReportFilters from "@/components/reports/ReportFilters";
import SalesReport from "@/components/reports/SalesReport";
import PropertyPortfolioReport from "@/components/reports/PropertyPortfolioReport";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    type: 'all_time',
    startDate: null,
    endDate: null,
  });
  const [activeReport, setActiveReport] = useState('property_portfolio');

  // Fetch all data
  const { data: apartments = [], isLoading: loadingApartments } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date'),
    initialData: [],
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
    initialData: [],
  });

  const { data: receipts = [], isLoading: loadingReceipts } = useQuery({
    queryKey: ['receipts'],
    queryFn: () => base44.entities.Receipt.list(),
    initialData: [],
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.ApartmentReservation.list(),
    initialData: [],
  });

  const { data: defaultedSales = [] } = useQuery({
    queryKey: ['defaultedSales'],
    queryFn: () => base44.entities.DefaultedSale.list('-defaulted_date'),
    initialData: [],
  });

  const isLoading = loadingApartments || loadingClients || loadingSales || loadingPayments || loadingReceipts;

  // Apply date filtering
  const filterByDate = (items, dateField) => {
    if (dateRange.type === 'all_time') return items;
    
    let start, end;
    const now = new Date();

    switch (dateRange.type) {
      case 'this_week':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'last_week':
        start = startOfWeek(subWeeks(now, 1));
        end = endOfWeek(subWeeks(now, 1));
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        break;
      case 'custom':
        start = dateRange.startDate ? new Date(dateRange.startDate) : null;
        end = dateRange.endDate ? new Date(dateRange.endDate) : null;
        break;
      default:
        return items;
    }

    if (!start || !end) return items;

    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  };

  const filteredSales = filterByDate(sales, 'sale_date');
  const filteredPayments = filterByDate(payments, 'payment_date');
  const filteredClients = filterByDate(clients, 'created_date');
  const filteredReservations = filterByDate(reservations, 'reservation_date');
  const filteredApartments = filterByDate(apartments, 'created_date');

  // Report type cards
  const reportTypes = [
    {
      id: 'property_portfolio',
      title: 'Property Portfolio',
      description: 'Apartments by status, area, and value',
      icon: Building2,
      color: 'from-cyan-500 to-cyan-600',
    },

    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Transaction history and revenue analysis',
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Reports & Analytics</h1>
          <p className="text-sm text-slate-600">Generate comprehensive reports with custom date ranges</p>
        </div>
      </div>

        {/* Date Range Filters */}
        <ReportFilters dateRange={dateRange} setDateRange={setDateRange} />

        {/* Report Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map(report => (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                activeReport === report.id
                  ? 'border-slate-900 shadow-lg scale-105'
                  : 'border-transparent hover:border-slate-300 hover:shadow-md'
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg`}>
                    <report.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                    <p className="text-xs text-slate-600">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading report data...</p>
          </div>
        ) : (
          <div className="mt-6">
            {activeReport === 'property_portfolio' && (
              <PropertyPortfolioReport
                apartments={apartments}
                filteredApartments={filteredApartments}
                sales={filteredSales}
                reservations={filteredReservations}
                dateRange={dateRange}
              />
            )}

            {activeReport === 'sales' && (
              <SalesReport
                sales={filteredSales}
                clients={clients}
                apartments={apartments}
                payments={filteredPayments}
                defaultedSales={defaultedSales}
                dateRange={dateRange}
              />
            )}
          </div>
        )}
    </div>
  );
}