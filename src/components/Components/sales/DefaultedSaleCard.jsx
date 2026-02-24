import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, User, Calendar, DollarSign, XCircle, FileText, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function DefaultedSaleCard({ defaultedSale, client, apartment, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md border-l-4 border-l-red-500">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      Unit {apartment?.unit_number || 'N/A'}
                    </h3>
                    <Badge className="bg-red-100 text-red-700 border-red-200 border">
                      Defaulted
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{client?.full_name || 'Unknown Client'}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(defaultedSale)}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Price</p>
                <p className="text-lg font-bold text-slate-900">
                  {defaultedSale.total_price?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Total Paid</p>
                <p className="text-lg font-bold text-red-600">
                  {(defaultedSale.total_paid || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Monthly</p>
                <p className="text-lg font-bold text-amber-600">
                  {(defaultedSale.monthly_payment || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">USD</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-lg font-bold text-blue-600">
                  {defaultedSale.payment_duration_months || 0}
                </p>
                <p className="text-xs text-slate-600">months</p>
              </div>
            </div>

            {/* Defaulted Information */}
            {defaultedSale.defaulted_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-1">Reason for Default</p>
                    <p className="text-sm text-red-700">{defaultedSale.defaulted_reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Sale Date: {format(new Date(defaultedSale.sale_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Defaulted: {format(new Date(defaultedSale.defaulted_date), 'MMM d, yyyy')}</span>
              </div>
              {defaultedSale.contract_number && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Contract: {defaultedSale.contract_number}</span>
                </div>
              )}
            </div>

            {defaultedSale.notes && (
              <div className="text-sm text-slate-600 pt-2 border-t">
                <p className="font-medium text-slate-700 mb-1">Notes:</p>
                <p>{defaultedSale.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}