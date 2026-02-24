import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, User, Building2, Calendar, DollarSign, AlertCircle, FileText, Upload, Eye, Download } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ReceiptUpload from "./ReceiptUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const paymentMethodConfig = {
  Cash: { label: 'Cash', color: 'bg-green-100 text-green-700 border-green-200' },
  Installment: { label: 'Installment', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  // Keep lowercase for backward compatibility if needed, or migration
  cash: { label: 'Cash', color: 'bg-green-100 text-green-700 border-green-200' },
};

const paymentTypeConfig = {
  first_installment: { label: 'Advanced Payment', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  monthly: { label: 'Monthly', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  additional: { label: 'Additional', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  final: { label: 'Final Payment', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export default function PaymentCard({ payment, sale, client, apartment, receipts, onEdit, onDelete }) {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showReceiptView, setShowReceiptView] = useState(false);
  
  const method = paymentMethodConfig[payment.payment_method] || paymentMethodConfig.cash;
  const type = paymentTypeConfig[payment.payment_type] || null;
  const hasReceipt = receipts && receipts.length > 0;
  const receiptStatus = hasReceipt ? receipts[0].status : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`hover:shadow-lg transition-all duration-300 border-0 shadow-md ${
          payment.is_delayed ? 'border-l-4 border-l-red-500' : ''
        }`}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </h3>
                      <Badge className={`${method.color} border`}>
                        {method.label}
                      </Badge>
                      {type && (
                        <Badge className={`${type.color} border`}>
                          {type.label}
                        </Badge>
                      )}
                      {payment.is_delayed && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 border flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Delayed {payment.delay_days}d
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{client?.full_name || 'Unknown Client'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Unit {apartment?.unit_number || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(payment.payment_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(payment)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(payment)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t">
                {payment.reference_number && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Reference #</p>
                    <p className="font-semibold text-slate-900 text-sm">{payment.reference_number}</p>
                  </div>
                )}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-slate-900 text-sm">{method.label}</p>
                </div>
                {payment.payment_type && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Payment Type</p>
                    <p className="font-semibold text-slate-900 text-sm">
                      {payment.payment_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                )}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Receipt Status</p>
                  {hasReceipt ? (
                    <Badge className={receiptStatus === 'available' 
                      ? 'bg-green-100 text-green-700 border-green-200 border' 
                      : 'bg-amber-100 text-amber-700 border-amber-200 border'
                    }>
                      {receiptStatus === 'available' ? 'Available' : 'Pending'}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200 border">
                      No Receipt
                    </Badge>
                  )}
                </div>
              </div>

              {/* Receipt Actions */}
              <div className="flex flex-wrap gap-3 pt-3 border-t">
                {hasReceipt ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowReceiptView(true)}
                    >
                      <Eye className="w-4 h-4" />
                      View Receipt
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setShowReceiptUpload(true)}
                    >
                      <Upload className="w-4 h-4" />
                      Update Receipt
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => setShowReceiptUpload(true)}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Receipt
                  </Button>
                )}
              </div>

              {/* Notes */}
              {payment.notes && (
                <div className="pt-3 border-t">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{payment.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptUpload} onOpenChange={setShowReceiptUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {hasReceipt ? 'Update Payment Receipt' : 'Upload Payment Receipt'}
            </DialogTitle>
          </DialogHeader>
          <ReceiptUpload
            payment={payment}
            existingReceipt={hasReceipt ? receipts[0] : null}
            onClose={() => setShowReceiptUpload(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Receipt View Dialog */}
      {hasReceipt && (
        <Dialog open={showReceiptView} onOpenChange={setShowReceiptView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Payment Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-140px)] pr-2">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Upload Date</p>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(receipts[0].upload_date || receipts[0].created_date), 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <Badge className={receiptStatus === 'available' 
                    ? 'bg-green-100 text-green-700 border-green-200 border' 
                    : 'bg-amber-100 text-amber-700 border-amber-200 border'
                  }>
                    {receiptStatus === 'available' ? 'Available' : 'Pending'}
                  </Badge>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden bg-white">
                {receipts[0].file_type === 'pdf' ? (
                  <iframe 
                    src={receipts[0].file_url} 
                    className="w-full min-h-[500px]"
                    title="Receipt PDF"
                  />
                ) : (
                  <img 
                    src={receipts[0].file_url} 
                    alt="Receipt" 
                    className="w-full h-auto max-w-full"
                  />
                )}
              </div>
              <div className="flex justify-end gap-3 pb-2">
                <Button variant="outline" onClick={() => setShowReceiptView(false)}>
                  Close
                </Button>
                <Button 
                  onClick={async () => {
                    const url = receipts[0].file_url;
                    const ext = receipts[0].file_type === 'pdf' ? 'pdf' : 'png';
                    const filename = `receipt-${payment.id || 'payment'}-${Date.now()}.${ext}`;
                    try {
                      const res = await fetch(url);
                      const blob = await res.blob();
                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = blobUrl;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(blobUrl);
                    } catch {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = filename;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="bg-gradient-to-r from-slate-900 to-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}