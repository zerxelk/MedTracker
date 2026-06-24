'use client';

import { useState, useEffect } from 'react';
import { Medication } from '@/types/medication';
import {
    getMedications,
    addMedication,
    removeMedication,
    toggleDose,
    clearAllMedications,
} from '@/lib/storage';
import { MedicationCard } from '@/components/MedicationCard';
import { MedicationCardSkeleton } from '@/components/MedicationCardSkeleton';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { MedicationDetailDialog } from '@/components/MedicationDetailDialog';
import { Button } from '@/components/ui/button';
import { Pill, Plus, Sparkles, ChevronDown, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { detectInteractions } from '@/lib/interactions';
import { TodayOverview } from '@/components/TodayOverview';

export default function Home() {
    const [meds, setMeds] = useState<Medication[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
    const [mounted, setMounted] = useState(false);
    const [howItWorksOpen, setHowItWorksOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

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

    function handleToggleDose(medId: string, doseKey: string) {
        const updated = toggleDose(medId, doseKey);
        setMeds(updated);
        setSelectedMed((current) => {
            if (!current || current.id !== medId) return current;
            return updated.find((m) => m.id === medId) || current;
        });
    }

    function handleClearAll() {
        if (confirm('Delete all medications and dose history? This cannot be undone.')) {
            setMeds(clearAllMedications());
            setSettingsOpen(false);
        }
    }

    const totalInteractions = mounted
        ? (() => {
            const pairs = new Set<string>();
            for (const med of meds) {
                for (const inter of detectInteractions(med, meds)) {
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
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setSettingsOpen(true)}
                            size="sm"
                            variant="ghost"
                            className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            aria-label="Settings"
                        >
                            <SettingsIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={() => setDialogOpen(true)}
                            size="sm"
                            className="bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-lg"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add medication
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-stone-200/60">
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

                    <h1 className="text-5xl sm:text-7xl font-semibold text-stone-900 tracking-tight leading-[1.05] max-w-3xl">
                        A med tracker
                        <br />
                        <span className="text-stone-400">to know your meds.</span>
                    </h1>

                    <p className="text-base sm:text-lg text-stone-600 mt-8 max-w-xl leading-relaxed">
                        Search the FDA database, track your daily doses, and get warned when your medications interact. All in one place.
                    </p>

                    {mounted && meds.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mt-8 text-sm text-stone-600">
                            <span>
                                Tracking {meds.length} medication{meds.length === 1 ? '' : 's'}
                            </span>
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
            </section>

            {/* Main content */}
            <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
                {/* Today's doses */}
                {mounted && meds.some((m) => m.schedule) && (
                    <TodayOverview
                        medications={meds}
                        onToggleDose={handleToggleDose}
                        onViewMed={handleView}
                    />
                )}

                {/* Medications grid */}
                <div>
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
                </div>

                {/* How interaction detection works */}
                <div className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setHowItWorksOpen((o) => !o)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 transition-colors"
                    >
                        <div>
                            <h3 className="text-sm font-semibold text-stone-900">
                                How interaction detection works
                            </h3>
                            <p className="text-xs text-stone-500 mt-0.5">
                                A quick look under the hood
                            </p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 text-stone-500 transition-transform ${
                                howItWorksOpen ? 'rotate-180' : ''
                            }`}
                        />
                    </button>
                    {howItWorksOpen && (
                        <div className="px-5 pb-5 pt-1 text-sm text-stone-600 leading-relaxed space-y-3 border-t border-stone-100">
                            <p>
                                For each medication you add, MedTracker pulls the full FDA
                                label data from the openFDA Drug Label API — including the
                                warnings section that drug companies are required by law to
                                publish.
                            </p>
                            <p>
                                When you open a medication, the app searches that med&rsquo;s
                                FDA warnings for the names of every other medication in your
                                list (brand names, generic names, and active ingredients).
                                When it finds a match, it surfaces the exact sentence from
                                the FDA label as evidence.
                            </p>
                            <p>
                                This catches the interactions the FDA explicitly names in
                                label documentation, but it cannot catch every clinically
                                relevant interaction. It is not a substitute for a pharmacist
                                or licensed clinical decision support software.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-stone-200/60 bg-stone-50/50">
                <div className="max-w-5xl mx-auto px-6 py-8 space-y-4">
                    <p className="text-xs text-stone-500 text-center max-w-md mx-auto leading-relaxed">
                        For informational tracking only. Not medical advice. Interaction
                        detection is best-effort and based on FDA label text. Always consult
                        a healthcare provider.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-stone-400">
                        <span>&copy; {new Date().getFullYear()} MedTracker</span>
                        <span>·</span>
                    <a
                        href="https://github.com/zerxelk/MedTracker"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-stone-700 transition-colors"
                    >
                        GitHub
                    </a>
                    <span>·</span>
                    <a
                    href="https://github.com/zerxelk/MedTracker/blob/main/LICENSE"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-700 transition-colors"
                    >
                    MIT License
                </a>
        </div>
</div>
</footer>


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
        onToggleDose={handleToggleDose}
    />

    {/* Settings dialog */}
    {settingsOpen && (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setSettingsOpen(false)}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-semibold text-stone-900 mb-1">Settings</h2>
                <p className="text-sm text-stone-500 mb-6">
                    Manage your data
                </p>

                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                    <h3 className="text-sm font-medium text-stone-900 mb-1">
                        Clear all data
                    </h3>
                    <p className="text-xs text-stone-600 mb-3 leading-relaxed">
                        Permanently delete all medications and dose history from
                        this device. Cannot be undone.
                    </p>
                    <Button
                        onClick={handleClearAll}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Delete everything
                    </Button>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => setSettingsOpen(false)}
                        variant="ghost"
                        size="sm"
                    >
                        Close
                    </Button>
                </div>
            </div>
        </div>
    )}
</div>
);
}