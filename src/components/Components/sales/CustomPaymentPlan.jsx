import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Calendar } from "lucide-react";

export default function CustomPaymentPlan({ value = [], onChange }) {
  const [schedule, setSchedule] = useState(value.length > 0 ? value : [{
    due_date: '',
    amount: 0,
    description: ''
  }]);

  const addPayment = () => {
    const newSchedule = [...schedule, { due_date: '', amount: 0, description: '' }];
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const removePayment = (index) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const updatePayment = (index, field, val) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: val };
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const totalAmount = schedule.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Customizable Payment Plan
        </CardTitle>
        <p className="text-sm text-slate-600">Create a flexible payment schedule for this client</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-3">
          {schedule.map((payment, index) => (
            <div key={index} className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Payment {index + 1}</span>
                {schedule.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePayment(index)}
                    className="h-6 w-6 text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={payment.due_date}
                    onChange={(e) => updatePayment(index, 'due_date', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', parseFloat(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={payment.description}
                    onChange={(e) => updatePayment(index, 'description', e.target.value)}
                    placeholder="e.g., 1st payment"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addPayment}
          className="w-full gap-2 h-8 text-sm"
        >
          <Plus className="w-3 h-3" />
          Add Payment
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-900">Total Scheduled:</span>
            <span className="text-lg font-bold text-blue-600">
              {totalAmount.toLocaleString()} AED
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1">{schedule.length} payment{schedule.length !== 1 ? 's' : ''} scheduled</p>
        </div>
      </CardContent>
    </Card>
  );
}