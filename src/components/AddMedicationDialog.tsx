'use client';

import { useState, useEffect } from 'react';
import { Medication, FDADrugInfo, ScheduleFrequency } from '@/types/medication';
import { searchDrugs } from '@/lib/openfda';
import { FREQUENCY_LABELS, todayKey } from '@/lib/schedule';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Pill, ArrowLeft, Clock } from 'lucide-react';

interface AddMedicationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (med: Medication) => void;
}

export function AddMedicationDialog({
                                        open,
                                        onOpenChange,
                                        onAdd,
                                    }: AddMedicationDialogProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FDADrugInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<FDADrugInfo | null>(null);
    const [dosage, setDosage] = useState('');
    const [notes, setNotes] = useState('');

    // Schedule fields
    const [frequency, setFrequency] = useState<ScheduleFrequency>('once');
    const [durationDays, setDurationDays] = useState<string>(''); // empty = ongoing
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (!query.trim() || selected) {
            setResults([]);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const drugs = await searchDrugs(query);
            setResults(drugs);
            setLoading(false);
        }, 400);

        return () => clearTimeout(timer);
    }, [query, selected]);

    function resetForm() {
        setQuery('');
        setResults([]);
        setSelected(null);
        setDosage('');
        setNotes('');
        setFrequency('once');
        setDurationDays('');
        setInstructions('');
    }

    function handleClose(open: boolean) {
        if (!open) resetForm();
        onOpenChange(open);
    }

    function handleAdd() {
        if (!selected) return;
        const name = selected.brandName || selected.genericName || query;
        const parsedDuration = durationDays.trim() ? parseInt(durationDays, 10) : undefined;

        const newMed: Medication = {
            id: crypto.randomUUID(),
            name,
            dosage: dosage.trim() || undefined,
            notes: notes.trim() || undefined,
            addedAt: new Date().toISOString(),
            fdaData: selected,
            schedule: {
                frequency,
                durationDays: Number.isFinite(parsedDuration) ? parsedDuration : undefined,
                startDate: todayKey(),
                instructions: instructions.trim() || undefined,
            },
        };
        onAdd(newMed);
        resetForm();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {selected ? 'Add to your list' : 'Find a medication'}
                    </DialogTitle>
                    <DialogDescription>
                        {selected
                            ? 'Set your dosage and schedule.'
                            : 'Search the FDA database for your medication.'}
                    </DialogDescription>
                </DialogHeader>

                {!selected ? (
                    // Step 1: Search
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                            <Input
                                autoFocus
                                placeholder="Try 'Tylenol' or 'Ibuprofen'..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <div className="min-h-[200px] max-h-[300px] overflow-y-auto -mx-1 px-1">
                            {loading && (
                                <div className="flex items-center justify-center py-8 text-stone-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            )}

                            {!loading && query && results.length === 0 && (
                                <p className="text-center text-sm text-stone-500 py-8">
                                    No medications found. Try a different name.
                                </p>
                            )}

                            {!loading && !query && (
                                <p className="text-center text-sm text-stone-400 py-8">
                                    Start typing to search...
                                </p>
                            )}

                            <div className="space-y-1.5">
                                {results.map((drug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelected(drug)}
                                        className="w-full text-left p-3 rounded-md border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Pill className="h-4 w-4 mt-0.5 text-stone-600 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm capitalize">
                                                    {(drug.brandName || drug.genericName || 'Unknown').toLowerCase()}
                                                </p>
                                                {drug.genericName && drug.brandName && (
                                                    <p className="text-xs text-stone-500 capitalize">
                                                        {drug.genericName.toLowerCase()}
                                                    </p>
                                                )}
                                                {drug.purpose && (
                                                    <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                                                        {drug.purpose}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Step 2: Details + Schedule
                    <div className="space-y-4">
                        <button
                            onClick={() => setSelected(null)}
                            className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-900"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to search
                        </button>

                        <div className="rounded-lg bg-stone-50 border border-stone-200 p-3">
                            <p className="font-medium text-sm capitalize">
                                {(selected.brandName || selected.genericName || '').toLowerCase()}
                            </p>
                            {selected.purpose && (
                                <p className="text-xs text-stone-600 mt-1">{selected.purpose}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input
                                id="dosage"
                                placeholder="e.g. 500mg, 2 tablets"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                            />
                        </div>

                        {/* Schedule */}
                        <div className="pt-2 border-t border-stone-200">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-stone-500" />
                                <h4 className="text-sm font-medium text-stone-900">Schedule</h4>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="frequency">How often?</Label>
                                    <select
                                        id="frequency"
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
                                        className="w-full h-9 rounded-md border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400"
                                    >
                                        {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (days)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="1"
                                        placeholder="Leave empty for ongoing"
                                        value={durationDays}
                                        onChange={(e) => setDurationDays(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instructions">Instructions (optional)</Label>
                                    <Input
                                        id="instructions"
                                        placeholder="e.g. after meals, with water"
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Input
                                id="notes"
                                placeholder="Anything else..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => handleClose(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAdd}
                                className="flex-1 bg-stone-900 hover:bg-stone-800 text-stone-50"
                            >
                                Add to my list
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}