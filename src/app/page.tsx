'use client';

import { useState, useEffect } from 'react';
import { Medication } from '@/types/medication';
import {
    getMedications,
    addMedication,
    removeMedication,
} from '@/lib/storage';
import { MedicationCard } from '@/components/MedicationCard';
import { MedicationCardSkeleton } from '@/components/MedicationCardSkeleton';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { MedicationDetailDialog } from '@/components/MedicationDetailDialog';
import { Button } from '@/components/ui/button';
import { Pill, Plus, AlertTriangle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
    const [meds, setMeds] = useState<Medication[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
    const [mounted, setMounted] = useState(false);

    // Load meds from localStorage on mount
    useEffect(() => {
        setMeds(getMedications());
        setMounted(true);
    }, []);

    function handleAdd(med: Medication) {
        setMeds(addMedication(med));
    }

    function handleDelete(id: string) {
        setMeds(removeMedication(id));
    }

    function handleView(med: Medication) {
        setSelectedMed(med);
        setDetailOpen(true);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm bg-white/90">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 shadow-sm">
                            <Pill className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900 leading-tight">MedApp</h1>
                            <p className="text-xs text-slate-500 leading-tight">
                                Your personal medication tracker
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add medication
                    </Button>
                </div>
            </header>

            {/* Disclaimer banner */}
            <div className="bg-amber-50 border-b border-amber-100">
                <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-900">
                        For informational tracking only. Not medical advice. Always consult a healthcare provider.
                    </p>
                </div>
            </div>

            {/* Main content */}
            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">My Medications</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {!mounted
                            ? 'Loading...'
                            : meds.length > 0
                                ? `Tracking ${meds.length} medication${meds.length === 1 ? '' : 's'}`
                                : 'Add medications to start tracking'}
                    </p>
                </div>

                {!mounted ? (
                    // Loading skeleton
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MedicationCardSkeleton />
                        <MedicationCardSkeleton />
                        <MedicationCardSkeleton />
                    </div>
                ) : meds.length === 0 ? (
                    // Empty state
                    <div className="text-center py-20 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        <div className="inline-flex rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-4 mb-4 ring-8 ring-blue-50/50">
                            <Pill className="h-7 w-7 text-blue-600" />
                        </div>
                        <h3 className="text-slate-900 font-semibold text-lg">
                            Start tracking your medications
                        </h3>
                        <p className="text-sm text-slate-500 mt-1.5 mb-6 max-w-sm mx-auto">
                            Search the FDA database to add medications and instantly see purpose, dosing, and warnings.
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add your first medication
                        </Button>
                    </div>
                ) : (
                    // Medication cards grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {meds.map((med, i) => (
                                <MedicationCard
                                    key={med.id}
                                    medication={med}
                                    index={i}
                                    onView={handleView}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <AddMedicationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onAdd={handleAdd}
            />
            <MedicationDetailDialog
                medication={selectedMed}
                allMedications={meds}
                open={detailOpen}
                onOpenChange={setDetailOpen}
            />
        </div>
    );
}