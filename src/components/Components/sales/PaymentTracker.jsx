import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle, Clock, Building2, User, DollarSign, TrendingDown, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PaymentTracker({ sales, clients, apartments, payments, checkOverduePayments, calculateRemainingBalance }) {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Categorize sales
  const categorizedSales = sales.map(sale => {
    const overdueInfo = checkOverduePayments(sale);
    const remaining = calculateRemainingBalance(sale);
    const client = clients.find(c => c.id === sale.client_id);
    const apartment = apartments.find(a => a.id === sale.apartment_id);
    const salePayments = payments.filter(p => p.sale_id === sale.id);

    return {
      ...sale,
      overdueInfo,
      remaining,
      client,
      apartment,
      paymentCount: salePayments.length,
      isOverdue: overdueInfo?.isOverdue,
      isOnTrack: !overdueInfo?.isOverdue && remaining > 0,
      isCompleted: remaining <= 0,
    };
  });

  const overdueSales = categorizedSales.filter(s => s.isOverdue);
  const onTrackSales = categorizedSales.filter(s => s.isOnTrack);
  const completedSales = categorizedSales.filter(s => s.isCompleted);

  let filteredSales = 
    filterType === 'overdue' ? overdueSales :
    filterType === 'ontrack' ? onTrackSales :
    filterType === 'completed' ? completedSales :
    categorizedSales;

  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredSales = filteredSales.filter(sale =>
      sale.client?.full_name?.toLowerCase().includes(query) ||
      sale.apartment?.unit_number?.toLowerCase().includes(query)
    );
  }

  const totalOverdueAmount = overdueSales.reduce((sum, sale) => 
    sum + (sale.overdueInfo?.amountOverdue || 0), 0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md border-0 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium mb-1">Overdue</p>
                <p className="text-3xl font-bold text-red-700">{overdueSales.length}</p>
                <p className="text-xs text-red-600 mt-1">
                  {totalOverdueAmount.toLocaleString()} overdue
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium mb-1">On Track</p>
                <p className="text-3xl font-bold text-blue-700">{onTrackSales.length}</p>
                <p className="text-xs text-blue-600 mt-1">Active payments</p>
              </div>
              <Clock className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-700">{completedSales.length}</p>
                <p className="text-xs text-green-600 mt-1">Fully paid</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-purple-700">{sales.length}</p>
                <p className="text-xs text-purple-600 mt-1">All transactions</p>
              </div>
              <TrendingDown className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold">Payment Status Tracker</CardTitle>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by client or unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="ontrack">On Track</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                {searchQuery ? 'No sales found matching your search' : 'No sales in this category'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map(sale => {
                const paymentProgress = ((sale.total_paid || 0) / (sale.total_price || 1)) * 100;

                return (
                  <div
                    key={sale.id}
                    className={`p-4 rounded-lg border-2 ${
                      sale.isOverdue 
                        ? 'border-red-200 bg-red-50' 
                        : sale.isCompleted 
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">
                              Unit {sale.apartment?.unit_number || 'N/A'}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="w-3 h-3" />
                              <span>{sale.client?.full_name || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Total Price</p>
                            <p className="font-semibold text-slate-900">
                              {sale.total_price?.toLocaleString()} {sale.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Paid</p>
                            <p className="font-semibold text-green-600">
                              {(sale.total_paid || 0).toLocaleString()} {sale.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Remaining</p>
                            <p className={`font-semibold ${sale.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                              {sale.remaining.toLocaleString()} {sale.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Payments</p>
                            <p className="font-semibold text-slate-900">
                              {sale.paymentCount} transactions
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 font-medium">Payment Progress</span>
                            <span className="font-bold">{paymentProgress.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={paymentProgress} 
                            className={`h-2 ${
                              sale.isOverdue ? '[&>div]:bg-red-500' : 
                              sale.isCompleted ? '[&>div]:bg-green-500' : 
                              '[&>div]:bg-blue-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-2">
                        {sale.isOverdue && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 border">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {sale.overdueInfo.missedPayments} Missed Payment{sale.overdueInfo.missedPayments > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {sale.isCompleted && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 border">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Fully Paid
                          </Badge>
                        )}
                        {sale.isOnTrack && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 border">
                            <Clock className="w-3 h-3 mr-1" />
                            On Schedule
                          </Badge>
                        )}
                      </div>
                    </div>

                    {sale.isOverdue && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <div className="flex items-start gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-red-900">
                              Overdue Amount: {sale.overdueInfo.amountOverdue.toLocaleString()} {sale.currency}
                            </p>
                            <p className="text-red-700">
                              Action required: Contact client to arrange payment
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}