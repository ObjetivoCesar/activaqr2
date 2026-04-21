'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Unit, Tenant } from '@/lib/types';
import { 
  Car, 
  User, 
  Phone, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  IdCard,
  QrCode
} from 'lucide-react';
import { createUnit, updateUnit, deleteUnit } from '@/app/actions/unit-actions';

interface FleetManagerProps {
  units: Unit[];
  tenantId: string;
  brandColor: string;
  maxUnits?: number;
}

export default function FleetManager({ units: initialUnits, tenantId, brandColor, maxUnits = 0 }: FleetManagerProps) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUnit, setNewUnit] = useState({
    unit_code: '',
    plate: '',
    owner_name: '',
    driver_name: '',
    driver_id: '',
    notification_number: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await createUnit({ ...newUnit, tenant_id: tenantId });
      if (result.success) {
        setIsAdding(false);
        setNewUnit({
          unit_code: '',
          plate: '',
          owner_name: '',
          driver_name: '',
          driver_id: '',
          notification_number: ''
        });
        window.location.reload(); 
      } else {
        setError(result.error as string);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado al crear la unidad.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta unidad?')) return;
    try {
      const result = await deleteUnit(id);
      if (result.success) {
        setUnits(units.filter(u => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateNumber = async (id: string, num: string) => {
    try {
      await updateUnit(id, { notification_number: num });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card p-6 rounded-[2rem] border border-border/40 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-foreground tracking-tighter uppercase italic">Gestión de Flota</h3>
          <p className="text-[10px] font-bold text-foreground/60 dark:text-white/40 uppercase tracking-widest mt-1">Configura las unidades y receptores de alertas</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/print-qrs"
            className="vision-pill p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 bg-accent text-foreground border border-border/40"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Imprimir Todos</span>
          </Link>
          {units.length >= maxUnits && maxUnits > 0 ? (
            <div className="vision-pill px-4 py-3 flex items-center gap-3 bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed">
              <span className="text-[10px] font-black uppercase tracking-widest">
                Límite {units.length}/{maxUnits}
              </span>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="vision-pill p-4 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: isAdding ? 'rgba(255,255,255,0.1)' : brandColor }}
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
                {isAdding ? 'Cancelar' : `Nueva Unidad (${units.length}/${maxUnits})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="vision-card p-8 space-y-6 border-brand/30 ring-1 ring-brand/20 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">Código Unidad</label>
              <input 
                required
                value={newUnit.unit_code}
                onChange={e => setNewUnit({...newUnit, unit_code: e.target.value})}
                placeholder="Ej: 001"
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/50 transition-all text-foreground placeholder-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">Placa</label>
              <input 
                required
                value={newUnit.plate}
                onChange={e => setNewUnit({...newUnit, plate: e.target.value})}
                placeholder="Ej: LBA-1234"
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand text-foreground placeholder-foreground/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">WhatsApp Alerta</label>
              <input 
                required
                value={newUnit.notification_number}
                onChange={e => setNewUnit({...newUnit, notification_number: e.target.value})}
                placeholder="Ej: 593988..."
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-brand text-foreground placeholder-foreground/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">Nombre Dueño</label>
              <input 
                value={newUnit.owner_name}
                onChange={e => setNewUnit({...newUnit, owner_name: e.target.value})}
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">Nombre Chofer</label>
              <input 
                value={newUnit.driver_name}
                onChange={e => setNewUnit({...newUnit, driver_name: e.target.value})}
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-foreground/60 dark:text-white/40 uppercase tracking-widest ml-4">Cédula Chofer</label>
              <input 
                value={newUnit.driver_id}
                onChange={e => setNewUnit({...newUnit, driver_id: e.target.value})}
                className="w-full bg-background/50 border border-border/60 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none text-foreground"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              disabled={loading}
              className="vision-pill px-10 py-4 bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Registrar Unidad'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {units.map((unit) => (
          <div key={unit.id} className="vision-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-accent/50 transition-all duration-300">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-14 h-14 vision-pill flex flex-col items-center justify-center text-foreground border border-border/60 dark:border-white/10 bg-background/80 shrink-0 shadow-lg">
                <span className="text-[8px] font-black text-foreground/40 dark:text-white/30 leading-none mb-1">UNIT</span>
                <span className="text-xl font-black tracking-tighter italic leading-none">{unit.unit_code}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-foreground tracking-widest uppercase">{unit.plate}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/30">{unit.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-foreground/60 dark:text-white/50">
                    <User className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{unit.owner_name || 'Sin dueño'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/60 dark:text-white/50">
                    <IdCard className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{unit.driver_name || 'Sin chofer'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/qr?tenantId=${tenantId}&unitId=${unit.id}`);
                    const data = await response.json();
                    if (data.qrCode) {
                      const win = window.open();
                      win?.document.write(`
                        <body style="margin:0; background: #000; display:flex; align-items:center; justify-content:center; height:100vh;">
                          <img src="${data.qrCode}" style="max-width:80%; border-radius: 20px;" />
                        </body>
                      `);
                    }
                  } catch (e) {
                    console.error("Error cargando QR local", e);
                  }
                }}
                className="p-4 vision-pill bg-foreground text-background border-none flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest px-6"
              >
                <QrCode className="w-4 h-4" /> Ver QR
              </button>

              {/* Notificación Number Editor */}
              <div className="flex items-center gap-4 bg-background px-6 py-3 rounded-2xl border border-border/60 dark:border-white/10 w-full md:w-auto shadow-sm">
                <Phone className="w-4 h-4 text-brand" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-foreground/40 dark:text-white/30 uppercase tracking-widest leading-none mb-1 text-left">WhatsApp Alerta</span>
                  <input 
                    defaultValue={unit.notification_number || ''}
                    onBlur={(e) => handleUpdateNumber(unit.id, e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-sm font-black text-foreground placeholder-foreground/20 w-32"
                    placeholder="Sin número"
                  />
                </div>
              </div>

              <button 
                onClick={() => handleDelete(unit.id)}
                className="p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
