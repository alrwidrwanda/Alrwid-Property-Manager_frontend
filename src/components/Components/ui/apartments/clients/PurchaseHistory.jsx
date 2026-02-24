import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Building2, Calendar, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function PurchaseHistory({ sales, apartments, payments, clientCurrency }) {
  if (sales.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="py-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No purchase history available</p>
        </CardContent>
      </Card>
    );
  }

  const getApartment = (apartmentId) => {
    return apartments.find(apt => apt.id === apartmentId);
  };

  const getSalePayments = (saleId) => {
    return payments.filter(payment => payment.sale_id === saleId);
  };

  const calculatePaymentProgress = (sale) => {
    const paid = sale.total_paid || 0;
    const total = sale.total_price || 1;
    return (paid / total) * 100;
  };

  const calculateRemainingBalance = (sale) => {
    return (sale.total_price || 0) - (sale.total_paid || 0);
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
    defaulted: { label: 'Defaulted', color: 'bg-red-100 text-red-700 border-red-200' },
  };

  return (
    <div className="space-y-4">
      {sales.map((sale) => {
        const apartment = getApartment(sale.apartment_id);
        const salePayments = getSalePayments(sale.id);
        const progress = calculatePaymentProgress(sale);
        const remaining = calculateRemainingBalance(sale);
        const status = statusConfig[sale.status] || statusConfig.active;

        return (
          <Card key={sale.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {apartment ? `Unit ${apartment.unit_number}` : 'Unit Info Unavailable'}
                    </CardTitle>
                    <p className="text-sm text-slate-600">
                      {apartment && `Floor ${apartment.floor} • ${apartment.area_sqm} sqm`}
                    </p>
                  </div>
                </div>
                <Badge className={`${status.color} border`}>
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Price</p>
                  <p className="text-lg font-bold text-slate-900">
                    {sale.total_price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">{sale.currency}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-green-600">
                    {sale.total_paid?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-600">{sale.currency}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Remaining</p>
                  <p className="text-lg font-bold text-amber-600">
                    {remaining.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">{sale.currency}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Monthly Payment</p>
                  <p className="text-lg font-bold text-blue-600">
                    {sale.monthly_payment?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-slate-600">{sale.currency}</p>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Payment Progress</span>
                  <span className="font-semibold text-slate-900">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Sale Date</p>
                    <p className="font-medium text-slate-900">
                      {format(new Date(sale.sale_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Advanced Payment</p>
                    <p className="font-medium text-slate-900">
                      {sale.first_installment?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Duration</p>
                    <p className="font-medium text-slate-900">
                      {sale.payment_duration_months || 0} months
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Records */}
              {salePayments.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-slate-900 mb-3">
                    Recent Payments ({salePayments.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {salePayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {payment.amount.toLocaleString()} {payment.currency}
                          </p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(payment.payment_date), 'MMM d, yyyy')} • {payment.payment_type}
                          </p>
                        </div>
                        {payment.is_delayed && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Delayed {payment.delay_days}d
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}