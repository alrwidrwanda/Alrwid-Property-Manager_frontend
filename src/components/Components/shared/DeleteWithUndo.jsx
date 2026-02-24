import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function useDeleteWithUndo() {
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const undoneIdsRef = useRef(new Set());

  const scheduleDelete = (item, entityType, actualDeleteFn) => {
    const deleteId = Date.now();
    actualDeleteFn(item);
    const deleteItem = {
      id: deleteId,
      item,
      entityType,
      actualDeleteFn,
      timestamp: Date.now(),
      isDeleted: true,
    };
    setPendingDeletes(prev => [...prev, deleteItem]);
    setTimeout(() => setPendingDeletes(prev => prev.filter(d => d.id !== deleteId)), 30000);
    if (window.addNotification) {
      window.addNotification(`${entityType} deleted. Undo available for 30 seconds.`, 'info', 30000);
    }
  };

  const scheduleBulkDelete = (items, entityType, actualDeleteFn) => {
    if (items.length === 0) return;
    const deleteId = Date.now();
    items.forEach(item => actualDeleteFn(item));
    const deleteItem = {
      id: deleteId,
      items,
      entityType,
      actualDeleteFn,
      timestamp: Date.now(),
      isDeleted: true,
    };
    setPendingDeletes(prev => [...prev, deleteItem]);
    setTimeout(() => setPendingDeletes(prev => prev.filter(d => d.id !== deleteId)), 30000);
    if (window.addNotification) {
      window.addNotification(`${items.length} ${entityType}(s) deleted. Undo available for 30 seconds.`, 'info', 30000);
    }
  };

  const undoDelete = async (deleteId, restoreFn) => {
    if (undoneIdsRef.current.has(deleteId)) return;
    const deleteItem = pendingDeletes.find(d => d.id === deleteId);
    if (!deleteItem) return;
    undoneIdsRef.current.add(deleteId);
    setPendingDeletes(prev => prev.filter(d => d.id !== deleteId));
    if (restoreFn) {
      const dataToRestore = deleteItem.items ?? deleteItem.item;
      await restoreFn(dataToRestore);
      if (window.addNotification) {
        const count = deleteItem.items ? deleteItem.items.length : 1;
        window.addNotification(`${count} ${deleteItem.entityType}(s) restored successfully`, 'success', 3000);
      }
    }
  };

  const dismissDelete = (deleteId) => {
    setPendingDeletes(prev => prev.filter(d => d.id !== deleteId));
  };

  return { pendingDeletes, scheduleDelete, scheduleBulkDelete, undoDelete, dismissDelete };
}

export function DeleteUndoToast({ pendingDeletes, onUndo, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {pendingDeletes.map((deleteItem) => {
          const UndoTimer = () => {
            const [timeLeft, setTimeLeft] = useState(30);

            useEffect(() => {
              const interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - deleteItem.timestamp) / 1000);
                const remaining = 30 - elapsed;
                setTimeLeft(remaining);
                
                if (remaining <= 0) {
                  clearInterval(interval);
                }
              }, 1000);

              return () => clearInterval(interval);
            }, []);

            return <span>{timeLeft}s</span>;
          };

          const isBulk = !!deleteItem.items;
          const label = isBulk
            ? `${deleteItem.items.length} ${deleteItem.entityType}(s) deleted`
            : `${deleteItem.entityType} deleted`;

          return (
            <motion.div
              key={deleteItem.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900 text-white rounded-lg shadow-lg p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs opacity-90">
                    Undo available for <UndoTimer />
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUndo(deleteItem.id)}
                    className="text-white hover:bg-white/20 gap-2 h-8"
                  >
                    <Undo className="w-4 h-4" />
                    Undo
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDismiss(deleteItem.id)}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}