// src/components/MedicationCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Medication } from '@/types/medication';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Trash2, ArrowUpRight } from 'lucide-react';

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
            <Card
                onClick={() => onView(medication)}
                className="group relative cursor-pointer bg-white border-stone-200/80 rounded-2xl shadow-none hover:shadow-md hover:border-stone-300 transition-all"
            >
                <CardHeader className="pb-2.5">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="rounded-xl bg-stone-100 p-2 shrink-0">
                                <Pill className="h-4 w-4 text-stone-600" />
                            </div>
                            <CardTitle className="text-base font-semibold text-stone-900 truncate capitalize tracking-tight">
                                {displayName.toLowerCase()}
                            </CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-red-600 hover:bg-red-50 -mr-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(medication.id);
                            }}
                            aria-label="Delete medication"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {medication.dosage && (
                        <p className="text-sm text-stone-700 font-medium">
                            {medication.dosage}
                        </p>
                    )}
                    {medication.fdaData?.purpose && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {medication.fdaData.purpose}
                        </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-stone-600 font-medium pt-2 group-hover:gap-1.5 transition-all">
                        View details
                        <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}