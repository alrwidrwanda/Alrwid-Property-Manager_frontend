import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportFilters({ dateRange, setDateRange }) {
  const presetRanges = [
    { value: 'all_time', label: 'All Time' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Date Range Filter</h3>
        </div>

        <div className="space-y-4">
          {/* Preset Ranges */}
          <div className="flex flex-wrap gap-2">
            {presetRanges.map(range => (
              <Button
                key={range.value}
                variant={dateRange.type === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange({ ...dateRange, type: range.value })}
                className={dateRange.type === range.value ? 'bg-slate-900' : ''}
              >
                {range.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          {dateRange.type === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={dateRange.startDate || ''}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={dateRange.endDate || ''}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}