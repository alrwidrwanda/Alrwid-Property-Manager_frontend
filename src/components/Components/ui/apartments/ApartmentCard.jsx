import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Home, Maximize, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const statusConfig = {
  available: { label: 'Available', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  reserved: { label: 'Reserved', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  sold: { label: 'Sold', color: 'bg-green-100 text-green-700 border-green-200' },
};

export default function ApartmentCard({ apartment, onEdit, onDelete, onReleaseReservation, viewMode = 'grid' }) {
  const status = statusConfig[apartment.status] || statusConfig.available;

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                  <Home className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {apartment.block} - Unit {apartment.unit_number}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Floor {apartment.floor} • {apartment.area_sqm} sqm • {apartment.apartment_description} • {apartment.direction}
                  </p>
                </div>
              </div>
              <Badge className={`${status.color} border`}>
                {status.label}
              </Badge>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  {apartment.base_price?.toLocaleString()} {apartment.currency}
                </p>
                <p className="text-sm text-slate-500">{apartment.bedrooms} BD • {apartment.bathrooms} BA</p>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(apartment)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    {apartment.status === 'reserved' && onReleaseReservation && (
                      <DropdownMenuItem onClick={onReleaseReservation} className="text-blue-600 focus:text-blue-700">
                        Release Reservation
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
        <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
          <Home className="w-20 h-20 text-amber-400 opacity-50 group-hover:opacity-100 transition-opacity" />
          <Badge className={`absolute top-4 right-4 ${status.color} border`}>
            {status.label}
          </Badge>
          <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs font-semibold text-slate-900">
            {apartment.block}
          </div>
        </div>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Unit {apartment.unit_number}</h3>
              <p className="text-sm text-slate-600">Floor {apartment.floor} • {apartment.direction}</p>
              <p className="text-xs text-slate-500 mt-1">{apartment.apartment_description}</p>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(apartment)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  {apartment.status === 'reserved' && onReleaseReservation && (
                    <DropdownMenuItem onClick={onReleaseReservation} className="text-blue-600 focus:text-blue-700">
                      Release Reservation
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Maximize className="w-4 h-4" />
            <span className="text-sm font-medium">{apartment.area_sqm} sqm</span>
            <span className="text-slate-400">•</span>
            <span className="text-sm">{apartment.bedrooms || 0} BD</span>
            <span className="text-slate-400">•</span>
            <span className="text-sm">{apartment.bathrooms || 0} BA</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">
            {apartment.description || 'No description available'}
          </p>
          <div className="pt-3 border-t border-slate-200">
            <p className="text-2xl font-bold text-slate-900">
              {apartment.base_price?.toLocaleString() || 'N/A'} <span className="text-lg text-slate-600">{apartment.currency}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}