import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building2, User, Calendar, DollarSign, AlertTriangle, TrendingUp, MoreVertical, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 border-green-200' },
};

export default function SaleCard({ sale, client, apartment, remainingBalance, overdueInfo, payments, onEdit, onDelete, onMarkDefaulted }) {
  const status = statusConfig[sale.status] || statusConfig.active;
  const paymentProgress = ((sale.total_paid || 0) / (sale.total_price || 1)) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
        overdueInfo?.isOverdue ? 'border-l-4 border-l-red-500' : ''
      }`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      Unit {apartment?.unit_number || 'N/A'}
                    </h3>
                    <Badge className={`${status.color} border`}>
                      {status.label}
                    </Badge>
                    {overdueInfo?.isOverdue && (
                      <Badge className="bg-red-100 text-red-700 border-red-200 border flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{client?.full_name || 'Unknown Client'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(sale)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDelete(sale)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onMarkDefaulted && onMarkDefaulted(sale)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark Defaulted
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Price</p>
                <p className="text-lg font-bold text-slate-900">
                  {sale.total_price?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-green-600">
                  {(sale.total_paid || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className={`p-3 rounded-lg ${overdueInfo?.isOverdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                <p className="text-xs text-slate-500 mb-1">Remaining</p>
                <p className={`text-lg font-bold ${overdueInfo?.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                  {remainingBalance.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Monthly</p>
                <p className="text-lg font-bold text-blue-600">
                  {(sale.monthly_payment || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Payments Made</p>
                <p className="text-lg font-bold text-purple-600">
                  {payments.length}
                </p>
                <p className="text-xs text-slate-600">transactions</p>
              </div>
            </div>

            {/* Payment Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Payment Progress</span>
                <span className="font-bold text-slate-900">{paymentProgress.toFixed(1)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>

            {/* Overdue Alert */}
            {overdueInfo?.isOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-1">Payment Overdue</p>
                    <p className="text-sm text-red-700">
                      {overdueInfo.missedPayments} missed payment{overdueInfo.missedPayments > 1 ? 's' : ''} • 
                      {' '}{overdueInfo.amountOverdue.toLocaleString()} USD overdue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Sale Date: {format(new Date(sale.sale_date), 'MMM d, yyyy')}</span>
              </div>
              {sale.payment_start_date && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span>Payment Start: {format(new Date(sale.payment_start_date), 'MMM d, yyyy')}</span>
                </div>
              )}
              {sale.payment_duration_months && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <span>Duration: {sale.payment_duration_months} months</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}