'use client';

import { useState, useEffect } from 'react';
import { Medication, FDADrugInfo } from '@/types/medication';
import { searchDrugs } from '@/lib/openfda';
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
import { Search, Loader2, Pill, ArrowLeft } from 'lucide-react';

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

    // Debounced search — wait 400ms after user stops typing
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
    }

    function handleClose(open: boolean) {
        if (!open) resetForm();
        onOpenChange(open);
    }

    function handleAdd() {
        if (!selected) return;
        const name =
            selected.brandName || selected.genericName || query;
        const newMed: Medication = {
            id: crypto.randomUUID(),
            name,
            dosage: dosage.trim() || undefined,
            notes: notes.trim() || undefined,
            addedAt: new Date().toISOString(),
            fdaData: selected,
        };
        onAdd(newMed);
        resetForm();
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {selected ? 'Add to your list' : 'Find a medication'}
                    </DialogTitle>
                    <DialogDescription>
                        {selected
                            ? 'Add your dosage and any notes.'
                            : 'Search the FDA database for your medication.'}
                    </DialogDescription>
                </DialogHeader>

                {!selected ? (
                    // ─── Step 1: Search ───
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                                <div className="flex items-center justify-center py-8 text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            )}

                            {!loading && query && results.length === 0 && (
                                <p className="text-center text-sm text-slate-500 py-8">
                                    No medications found. Try a different name.
                                </p>
                            )}

                            {!loading && !query && (
                                <p className="text-center text-sm text-slate-400 py-8">
                                    Start typing to search...
                                </p>
                            )}

                            <div className="space-y-1.5">
                                {results.map((drug, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelected(drug)}
                                        className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Pill className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm capitalize">
                                                    {(drug.brandName || drug.genericName || 'Unknown').toLowerCase()}
                                                </p>
                                                {drug.genericName && drug.brandName && (
                                                    <p className="text-xs text-slate-500 capitalize">
                                                        {drug.genericName.toLowerCase()}
                                                    </p>
                                                )}
                                                {drug.purpose && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
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
                    // ─── Step 2: Add details ───
                    <div className="space-y-4">
                        <button
                            onClick={() => setSelected(null)}
                            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to search
                        </button>

                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                            <p className="font-medium text-sm capitalize">
                                {(selected.brandName || selected.genericName || '').toLowerCase()}
                            </p>
                            {selected.purpose && (
                                <p className="text-xs text-slate-600 mt-1">{selected.purpose}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dosage">Dosage (optional)</Label>
                            <Input
                                id="dosage"
                                placeholder="e.g. 500mg, 2 tablets daily"
                                value={dosage}
                                onChange={(e) => setDosage(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Input
                                id="notes"
                                placeholder="e.g. Take with food"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => handleClose(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleAdd} className="flex-1">
                                Add to my list
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}