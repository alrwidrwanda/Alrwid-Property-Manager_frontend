import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, differenceInMonths } from "date-fns";

export default function PaymentCalendar({ sales, clients, apartments, checkOverduePayments }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate expected payments for each day
  const getPaymentsForDay = (day) => {
    const dayPayments = [];
    
    sales.forEach(sale => {
      if (sale.status === 'completed') return; // Skip completed sales
      if (sale.total_paid >= sale.total_price) return; // Skip fully paid sales
      
      const client = clients.find(c => c.id === sale.client_id);
      const apartment = apartments.find(a => a.id === sale.apartment_id);
      const overdueInfo = checkOverduePayments(sale);
      
      // Check regular monthly payments
      if (sale.monthly_payment && sale.payment_duration_months && sale.sale_date) {
        const paymentFrequency = sale.payment_frequency_months || 1;
        
        // First payment date = sale_date + payment_frequency_months
        const saleDate = new Date(sale.sale_date);
        saleDate.setHours(0, 0, 0, 0);
        const firstPaymentDate = addMonths(saleDate, paymentFrequency);
        
        // Calculate the end date based on first payment date + total duration
        const paymentEndDate = addMonths(firstPaymentDate, sale.payment_duration_months);
        
        // Check if day is after payment end date
        if (day > paymentEndDate) return;
        
        // Check if this day matches the payment schedule starting from first payment date
        if (day.getDate() === firstPaymentDate.getDate() && day >= firstPaymentDate) {
          const monthsDiff = differenceInMonths(day, firstPaymentDate);
          
          // Check if this month aligns with the payment frequency
          if (monthsDiff % paymentFrequency === 0) {
            dayPayments.push({
              sale,
              client,
              apartment,
              isOverdue: overdueInfo?.isOverdue,
              amount: sale.monthly_payment,
            });
          }
        }
      }
    });
    
    return dayPayments;
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-slate-600" />
            Payment Schedule
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-lg font-semibold min-w-[150px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>On Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Upcoming</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {/* Calendar Days */}
            {daysInMonth.map(day => {
              const payments = getPaymentsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isPast = day < new Date();
              const hasOverdue = payments.some(p => p.isOverdue);
              const hasPayments = payments.length > 0;

              return (
                <div
                  key={day.toString()}
                  className={`
                    aspect-square border rounded-lg p-2 relative
                    ${isToday ? 'border-2 border-blue-500 bg-blue-50' : 'border-slate-200'}
                    ${hasPayments && !hasOverdue && !isPast ? 'bg-blue-50' : ''}
                    ${hasPayments && !hasOverdue && isPast ? 'bg-green-50' : ''}
                    ${hasOverdue ? 'bg-red-50 border-red-300' : ''}
                    hover:shadow-md transition-shadow cursor-pointer
                  `}
                  title={payments.map(p => `${p.client?.full_name} - Unit ${p.apartment?.unit_number}`).join('\n')}
                >
                  <div className="text-sm font-medium text-slate-900">
                    {format(day, 'd')}
                  </div>
                  {hasPayments && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <div className="flex items-center justify-center gap-1">
                        {hasOverdue ? (
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                        ) : isPast ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <span className="text-xs font-semibold">
                          {payments.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Upcoming Payments List */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">This Month's Payments</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by client or unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {daysInMonth.map(day => {
                const payments = getPaymentsForDay(day).filter(payment => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    payment.client?.full_name?.toLowerCase().includes(query) ||
                    payment.apartment?.unit_number?.toLowerCase().includes(query)
                  );
                });
                if (payments.length === 0) return null;

                return (
                  <div key={day.toString()}>
                    {payments.map((payment, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          payment.isOverdue 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[60px]">
                            <p className="text-2xl font-bold text-slate-900">
                              {format(day, 'd')}
                            </p>
                            <p className="text-xs text-slate-600">
                              {format(day, 'MMM')}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {payment.client?.full_name}
                            </p>
                            <p className="text-sm text-slate-600">
                              Unit {payment.apartment?.unit_number} • {payment.amount.toLocaleString()} {payment.sale.currency}
                            </p>
                          </div>
                        </div>
                        {payment.isOverdue && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 border">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
              {daysInMonth.every(day => {
                const payments = getPaymentsForDay(day).filter(payment => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    payment.client?.full_name?.toLowerCase().includes(query) ||
                    payment.apartment?.unit_number?.toLowerCase().includes(query)
                  );
                });
                return payments.length === 0;
              }) && (
                <p className="text-center text-slate-500 py-8">
                  {searchQuery ? 'No payments found matching your search' : 'No scheduled payments this month'}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}