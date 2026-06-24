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
import { Pill, Plus, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { detectInteractions } from '@/lib/interactions';

export default function Home() {
    const [meds, setMeds] = useState<Medication[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
    const [mounted, setMounted] = useState(false);

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

    // Count unique interaction pairs (so A↔B isn't counted twice)
    const totalInteractions = mounted
        ? (() => {
            const pairs = new Set<string>();
            for (const med of meds) {
                for (const inter of detectInteractions(med, meds)) {
                    // Build a canonical pair id (sorted, so A-B and B-A are the same)
                    const pairId = [med.id, inter.withMed.id].sort().join('|');
                    pairs.add(pairId);
                }
            }
            return pairs.size;
        })()
        : 0;

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-stone-900 p-1.5">
                            <Pill className="h-4 w-4 text-stone-50" />
                        </div>
                        <span className="text-base font-semibold text-stone-900 tracking-tight">
              MedTracker
            </span>
                    </div>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        size="sm"
                        className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg"
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add medication
                    </Button>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-stone-200/60">
                {/* Soft gradient mesh in the background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-stone-50 to-amber-50/30 pointer-events-none" />
                <div
                    className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-100/40 blur-3xl pointer-events-none"
                    aria-hidden
                />
                <div
                    className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full bg-amber-100/30 blur-3xl pointer-events-none"
                    aria-hidden
                />

                <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm border border-stone-200/80 px-3 py-1 text-xs text-stone-600 mb-6">
                        <Sparkles className="h-3 w-3" />
                        Powered by openFDA data
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-semibold text-stone-900 tracking-tight leading-[1.1] max-w-2xl">
                        Your meds,
                        <br />
                        <span className="text-stone-500">in one calm place.</span>
                    </h1>

                    <p className="text-base sm:text-lg text-stone-600 mt-6 max-w-xl leading-relaxed">
                        Track what you take. See what the FDA actually says about it. Get
                        quietly warned when your medications warn about each other.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-8">
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg h-10 px-5"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Add medication
                        </Button>
                        {mounted && meds.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-stone-600">
                                <div className="h-1 w-1 rounded-full bg-stone-400" />
                                Tracking {meds.length} medication{meds.length === 1 ? '' : 's'}
                                {totalInteractions > 0 && (
                                    <>
                                        <div className="h-1 w-1 rounded-full bg-stone-400" />
                                        <span className="text-orange-700">
                      {totalInteractions} interaction
                                            {totalInteractions === 1 ? '' : 's'} detected
                    </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-6 flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
                        My medications
                    </h2>
                    {mounted && meds.length > 0 && (
                        <span className="text-xs text-stone-500">
              Saved on this device
            </span>
                    )}
                </div>

                {!mounted ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <MedicationCardSkeleton />
                        <MedicationCardSkeleton />
                        <MedicationCardSkeleton />
                    </div>
                ) : meds.length === 0 ? (
                    <div className="text-center py-20 px-6 rounded-2xl bg-white border border-stone-200/80">
                        <div className="inline-flex rounded-2xl bg-stone-100 p-3.5 mb-5">
                            <Pill className="h-6 w-6 text-stone-600" />
                        </div>
                        <h3 className="text-stone-900 font-semibold text-base">
                            Nothing here yet
                        </h3>
                        <p className="text-sm text-stone-500 mt-1.5 mb-6 max-w-sm mx-auto">
                            Search a medication to add it. We&rsquo;ll pull the FDA label
                            data and watch for interactions automatically.
                        </p>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add your first medication
                        </Button>
                    </div>
                ) : (
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

                {/* Disclaimer — moved to bottom, softer */}
                <p className="text-xs text-stone-400 text-center mt-16 max-w-md mx-auto leading-relaxed">
                    For informational tracking only. Not medical advice. Interaction
                    detection is best-effort and based on FDA label text. Always consult
                    a healthcare provider.
                </p>
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