import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Receipt, TrendingUp, AlertCircle, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentStats({ totalPayments, totalAmount, avgPayment, delayedCount, receipts, payments }) {
  const receiptsAvailable = receipts.filter(r => r.status === 'available').length;
  const paymentsWithoutReceipts = payments.filter(payment => {
    return !receipts.some(receipt => receipt.payment_id === payment.id);
  }).length;

  const stats = [
    {
      title: "Delayed Payments",
      value: delayedCount,
      icon: AlertCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      title: "Receipts Pending",
      value: paymentsWithoutReceipts,
      icon: FileCheck,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}