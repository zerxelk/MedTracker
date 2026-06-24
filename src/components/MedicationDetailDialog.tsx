'use client';

import { motion } from 'framer-motion';
import { Medication } from '@/types/medication';
import { formatFdaText } from '@/lib/formatFdaText';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Pill,
    Info,
    AlertTriangle,
    Activity,
    FileText,
    StickyNote,
    ShieldAlert,
} from 'lucide-react';
import { detectInteractions } from '@/lib/interactions';
import { ScheduleTracker } from "@/components/ScheduleTracker";

interface MedicationDetailDialogProps {
    medication: Medication | null;
    allMedications: Medication[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onToggleDose: (medId: string, doseKey: string) => void;
}

export function MedicationDetailDialog({
                                           medication,
                                           allMedications,
                                           open,
                                           onOpenChange,
                                           onToggleDose,
                                       }: MedicationDetailDialogProps) {
    if (!medication) return null;
    const interactions = detectInteractions(medication, allMedications);

    const fda = medication.fdaData;
    const displayName =
        fda?.brandName || fda?.genericName || medication.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
                <DialogHeader>
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 shrink-0 mt-0.5">
                            <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="text-xl capitalize text-stone-900 dark:text-stone-50">
                                {displayName.toLowerCase()}
                            </DialogTitle>
                            {fda?.genericName && fda?.brandName && (
                                <DialogDescription className="capitalize mt-0.5 text-stone-500 dark:text-stone-400">
                                    Generic: {fda.genericName.toLowerCase()}
                                </DialogDescription>
                            )}
                            {fda?.manufacturer && (
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 capitalize">
                                    by {fda.manufacturer.toLowerCase()}
                                </p>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* User's own info */}
                <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 p-3 space-y-2">
                    {medication.dosage && (
                        <div className="flex justify-between text-sm">
                            <span className="text-stone-500 dark:text-stone-400">Your dosage</span>
                            <span className="font-medium text-stone-900 dark:text-stone-50">
                                {medication.dosage}
                            </span>
                        </div>
                    )}
                    {medication.notes && (
                        <div className="text-sm">
                            <p className="text-stone-500 dark:text-stone-400 mb-0.5">Notes</p>
                            <p className="text-stone-900 dark:text-stone-50">{medication.notes}</p>
                        </div>
                    )}
                    <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200 dark:border-stone-700">
                        <span>Added</span>
                        <span>{new Date(medication.addedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Schedule tracker */}
                {medication.schedule && (
                    <ScheduleTracker
                        medication={medication}
                        onToggleDose={onToggleDose}
                    />
                )}

                {/* Interactions */}
                {interactions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <h3 className="font-medium text-sm text-stone-900 dark:text-stone-50">
                                Potential interactions with your other medications
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {interactions.map((inter, i) => (
                                <div
                                    key={i}
                                    className="bg-white dark:bg-stone-900/60 rounded-md border border-red-100 dark:border-red-900/30 p-3"
                                >
                                    <p className="text-sm font-medium text-stone-900 dark:text-stone-50 capitalize mb-1">
                                        ⚠ {(inter.withMed.fdaData?.brandName ||
                                        inter.withMed.fdaData?.genericName ||
                                        inter.withMed.name).toLowerCase()}
                                    </p>
                                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                        FDA label says: &ldquo;{inter.excerpt}&rdquo;
                                    </p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-red-900/70 dark:text-red-300/70 mt-3 italic">
                            Detected from FDA label text. May miss interactions not explicitly named in labels. Always verify with your pharmacist.
                        </p>
                    </motion.div>
                )}

                {/* FDA info sections */}
                <div className="space-y-4">
                    {fda?.purpose && (
                        <Section icon={Info} title="Purpose" tone="blue">
                            {fda.purpose}
                        </Section>
                    )}

                    {fda?.indications && (
                        <Section icon={Activity} title="When to use" tone="blue">
                            {fda.indications}
                        </Section>
                    )}

                    {fda?.dosageInfo && (
                        <Section
                            icon={FileText}
                            title="FDA dosing information"
                            tone="slate"
                            footnote="Official label text. Always follow your doctor or pharmacist's instructions for your specific case."
                        >
                            {fda.dosageInfo}
                        </Section>
                    )}

                    {fda?.warnings && (
                        <Section icon={AlertTriangle} title="Warnings" tone="amber">
                            {fda.warnings}
                        </Section>
                    )}

                    {fda?.sideEffects && (
                        <Section icon={AlertTriangle} title="Possible side effects" tone="amber">
                            {fda.sideEffects}
                        </Section>
                    )}

                    {!fda?.purpose &&
                        !fda?.indications &&
                        !fda?.warnings &&
                        !fda?.sideEffects && (
                            <div className="text-center py-6 text-sm text-stone-500 dark:text-stone-400">
                                <StickyNote className="h-5 w-5 mx-auto mb-2 text-stone-400 dark:text-stone-500" />
                                No FDA information available for this medication.
                            </div>
                        )}
                </div>

                <p className="text-xs text-stone-400 dark:text-stone-500 text-center pt-2 border-t border-stone-100 dark:border-stone-800">
                    Information sourced from openFDA. Not a substitute for professional medical advice.
                </p>
            </DialogContent>
        </Dialog>
    );
}

interface SectionProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    tone: 'blue' | 'amber' | 'slate';
    footnote?: string;
    children: React.ReactNode;
}

function Section({ icon: Icon, title, tone, footnote, children }: SectionProps) {
    const tones = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-950/20',
            border: 'border-blue-100 dark:border-blue-900/40',
            icon: 'text-blue-600 dark:text-blue-400',
        },
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-950/20',
            border: 'border-amber-100 dark:border-amber-900/40',
            icon: 'text-amber-600 dark:text-amber-400',
        },
        slate: {
            bg: 'bg-stone-50 dark:bg-stone-800/50',
            border: 'border-stone-200 dark:border-stone-800',
            icon: 'text-stone-600 dark:text-stone-400',
        },
    };
    const t = tones[tone];

    const paragraphs =
        typeof children === 'string' ? formatFdaText(children) : [String(children)];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border ${t.border} ${t.bg} p-4`}
        >
            <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${t.icon}`} />
                <h3 className="font-medium text-sm text-stone-900 dark:text-stone-50">{title}</h3>
            </div>
            <div className="space-y-2.5">
                {paragraphs.map((para, i) => (
                    <p key={i} className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        {para}
                    </p>
                ))}
            </div>
            {footnote && (
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 italic">{footnote}</p>
            )}
        </motion.div>
    );
}