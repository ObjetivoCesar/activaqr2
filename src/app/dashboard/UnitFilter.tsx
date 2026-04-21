'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Car } from 'lucide-react';

interface Unit {
  id: string;
  unit_code: string;
  plate: string;
}

interface UnitFilterProps {
  units: Unit[] | null;
  selectedUnitId?: string;
  brandColor?: string;
}

export default function UnitFilter({ units, selectedUnitId, brandColor = '#2563eb' }: UnitFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUnitChange = (unitId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (unitId === 'all') {
      params.delete('unitId');
    } else {
      params.set('unitId', unitId);
    }
    params.set('page', '1'); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="vision-pill p-1.5 rounded-2xl flex items-center gap-2 bg-card/60 border border-border/60 dark:border-white/10 shadow-sm">
      <div 
        className="p-2 rounded-xl shadow-lg transition-colors"
        style={{ backgroundColor: brandColor }}
      >
        <Car className="text-white w-4 h-4" />
      </div>
      <select 
        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-foreground focus:ring-0 cursor-pointer pr-8"
        value={selectedUnitId || 'all'}
        onChange={(e) => handleUnitChange(e.target.value)}
      >
        <option value="all" className="bg-background text-foreground">Todas las Unidades</option>
        {units?.map(u => (
          <option key={u.id} value={u.id} className="bg-background text-foreground">
            Unidad #{u.unit_code} ({u.plate})
          </option>
        ))}
      </select>
    </div>
  );
}
