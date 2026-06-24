'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MedicationCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-slate-100 h-8 w-8 shrink-0" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-4/5" />
      </CardContent>
    </Card>
  );
}
