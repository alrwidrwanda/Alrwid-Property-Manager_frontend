import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Home, Key, DollarSign } from "lucide-react";

export default function StatsCard({ apartments, sales, clients, reservations = [] }) {
  const available = apartments.filter(a => a.status === 'available').length;
  const reserved = apartments.filter(a => a.status === 'reserved').length;
  const sold = apartments.filter(a => a.status === 'sold').length;

  const stats = [
    {
      title: "Total Properties",
      value: apartments.length,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Available",
      value: available,
      icon: Home,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reserved",
      value: reserved,
      icon: Key,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Sold",
      value: sold,
      icon: DollarSign,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Overview of your property portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.title} className={`${stat.bgColor} p-4 rounded-xl`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-600 mt-1">{stat.title}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}