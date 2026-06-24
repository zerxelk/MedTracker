// src/components/MedicationCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Medication } from '@/types/medication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Trash2 } from 'lucide-react';

interface MedicationCardProps {
    medication: Medication;
    index: number;
    onView: (med: Medication) => void;
    onDelete: (id: string) => void;
}

export function MedicationCard({
                                   medication,
                                   index,
                                   onView,
                                   onDelete,
                               }: MedicationCardProps) {
    const displayName =
        medication.fdaData?.brandName ||
        medication.fdaData?.genericName ||
        medication.name;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
        >
            <Card className="group relative cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-blue-200">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="rounded-lg bg-blue-50 p-2 shrink-0">
                                <Pill className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-base truncate capitalize">
                                {displayName.toLowerCase()}
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(medication.id);
                            }}
                            aria-label="Delete medication"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent onClick={() => onView(medication)} className="space-y-2">
                    {medication.dosage && (
                        <p className="text-sm text-slate-600">{medication.dosage}</p>
                    )}
                    {medication.fdaData?.purpose && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {medication.fdaData.purpose}
                        </p>
                    )}
                    <p className="text-xs text-blue-600 font-medium pt-1">View details →</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}