import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, FileText, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    { title: "Add Apartment", icon: Plus, url: createPageUrl("Apartments"), color: "from-blue-500 to-blue-600" },
    { title: "New Client", icon: UserPlus, url: createPageUrl("Clients"), color: "from-purple-500 to-purple-600" },
    { title: "Record Sale", icon: FileText, url: createPageUrl("Sales"), color: "from-green-500 to-green-600" },
    { title: "Add Payment", icon: Receipt, url: createPageUrl("Payments"), color: "from-amber-500 to-amber-600" },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.title} to={action.url}>
              <Button 
                variant="outline" 
                className="w-full h-24 flex flex-col gap-2 hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}