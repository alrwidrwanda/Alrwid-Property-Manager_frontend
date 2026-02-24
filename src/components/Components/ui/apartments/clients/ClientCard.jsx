import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Trash2, Eye, Mail, Phone, MapPin, CreditCard, Globe, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ClientCard({ client, purchaseCount, totalSpent, onEdit, onDelete, isDefaulted }) {
  const [showIdView, setShowIdView] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Client Info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-amber-400">
                  {client.full_name?.charAt(0).toUpperCase() || 'C'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-slate-900">{client.full_name}</h3>
                  {isDefaulted && (
                    <Badge className="bg-red-100 text-red-700 border-red-200 border flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Defaulted Client
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                  {client.nationality && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{client.nationality}</span>
                    </div>
                  )}
                  {client.identification_number && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>ID: {client.identification_number}</span>
                      {client.id_picture_url && (
                        <button
                          type="button"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                          onClick={(e) => { e.stopPropagation(); setShowIdView(true); }}
                        >
                          (View)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-slate-900">{purchaseCount}</p>
                  <p className="text-xs text-slate-600">Purchases</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-600">
                    {totalSpent.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600">{client.preferred_currency}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={createPageUrl(`ClientProfile?id=${client.id}`)}>
                  <Button variant="outline" size="icon" className="hover:bg-slate-100">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={() => onEdit(client)} className="hover:bg-slate-100">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => onDelete(client.id)} className="hover:bg-red-50">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showIdView} onOpenChange={setShowIdView}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>ID/Passport Document</DialogTitle>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-slate-50">
            <img
              src={client.id_picture_url}
              alt="ID Document"
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </div>
          <Button variant="outline" onClick={() => setShowIdView(false)} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}