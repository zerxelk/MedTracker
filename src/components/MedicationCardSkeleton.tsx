'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MedicationCardSkeleton() {
    return (
        <Card className="animate-pulse bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-stone-100 dark:bg-stone-800 h-8 w-8 shrink-0" />
                    <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-2/3" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-1/3" />
                <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-full" />
                <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-4/5" />
            </CardContent>
        </Card>
    );
}