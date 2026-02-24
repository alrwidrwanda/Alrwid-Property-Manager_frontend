import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Users, DollarSign, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [yearInputMode, setYearInputMode] = useState(false);
  const [yearInputValue, setYearInputValue] = useState(String(currentYear));
  const yearInputRef = useRef(null);

  useEffect(() => {
    if (yearInputMode && yearInputRef.current) {
      yearInputRef.current.focus();
      yearInputRef.current.select();
    }
  }, [yearInputMode]);

  const applyYear = () => {
    const year = parseInt(yearInputValue, 10);
    if (!isNaN(year) && year >= 2000 && year <= 2100) {
      setSelectedYear(year);
    } else {
      setYearInputValue(String(selectedYear));
    }
    setYearInputMode(false);
  };
  const { data: apartments = [], isLoading: loadingApartments } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  const { data: sales = [], isLoading: loadingSales } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date'),
    initialData: [],
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: [],
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date'),
    initialData: [],
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => base44.entities.ApartmentReservation.list(),
    initialData: [],
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueByMonth = monthNames.map((_, i) => ({ month: monthNames[i], revenue: 0 }));
  payments.forEach((p) => {
    const d = new Date(p.payment_date);
    if (d.getFullYear() === selectedYear) {
      const monthIndex = d.getMonth();
      revenueByMonth[monthIndex].revenue += p.amount || 0;
    }
  });

  const revenueTrendData = revenueByMonth;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-sm text-slate-600">Overview of your property portfolio (amounts in USD)</p>
        </div>
      </div>

        {/* Stats Cards */}
        <StatsCard
          apartments={apartments}
          sales={sales}
          clients={clients}
          reservations={reservations}
        />

      {/* Revenue Trend */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader className="pb-3">
          <div className="mb-0.5">
            {yearInputMode ? (
              <Input
                ref={yearInputRef}
                type="number"
                min={2000}
                max={2100}
                value={yearInputValue}
                onChange={(e) => setYearInputValue(e.target.value)}
                onBlur={applyYear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyYear();
                  if (e.key === 'Escape') {
                    setYearInputValue(String(selectedYear));
                    setYearInputMode(false);
                  }
                }}
                className="w-20 h-8 text-sm font-medium text-slate-700 py-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setYearInputValue(String(selectedYear));
                  setYearInputMode(true);
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 hover:underline cursor-pointer transition-colors"
              >
                {selectedYear}
              </button>
            )}
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900">Revenue Trend (USD)</CardTitle>
        </CardHeader>
        <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}