import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DollarSign, FileText } from "lucide-react";

export default function RecentActivity({ sales, payments }) {
  const activities = [
    ...sales.map(s => ({ type: 'sale', data: s, date: s.created_date })),
    ...payments.map(p => ({ type: 'payment', data: p, date: p.payment_date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg ${activity.type === 'sale' ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {activity.type === 'sale' ? (
                    <FileText className="w-4 h-4 text-green-600" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {activity.type === 'sale' ? 'New Sale' : 'Payment Received'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {activity.type === 'sale' 
                      ? `${activity.data.total_price} ${activity.data.currency}`
                      : `${activity.data.amount} ${activity.data.currency}`
                    }
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {format(new Date(activity.date), 'MMM d')}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}