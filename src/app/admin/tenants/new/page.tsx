import { createTenant } from '@/app/admin/actions';
import { 
  Building2, 
  ChevronLeft, 
  CreditCard, 
  Info, 
  Mail, 
  Smartphone,
  Lock
} from 'lucide-react';
import Link from 'next/link';

export default function NewTenant() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 spatial-bg-mesh">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link 
          href="/admin" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
        >
          <div className="p-1.5 rounded-lg bg-muted border border-border group-hover:scale-110 transition-transform">
            <ChevronLeft size={16} />
          </div>
          Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">Registrar Nueva Empresa</h1>
          <p className="text-muted-foreground mt-1 text-lg">Configuración inicial del cliente SaaS</p>
        </div>

        {/* Form Container */}
        <div className="glass-card p-8 shadow-2xl">
          <form action={createTenant} className="space-y-8">
            
            {/* Section: Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Info size={18} />
                <h2 className="font-semibold uppercase tracking-wider text-sm">Información General</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Nombre Comercial</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      name="name" 
                      type="text" 
                      required
                      placeholder="Ej: Transportes del Norte"
                      className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Email del Administrador (Login)</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      name="email" 
                      type="email" 
                      required
                      placeholder="cliente@ejemplo.com"
                      className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">WhatsApp de Gestión</label>
                  <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      name="whatsapp" 
                      type="text" 
                      placeholder="Ejem: 593999999999"
                      className="w-full bg-muted border border-border rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Contraseña Inicial - Campo Clave */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1 flex items-center gap-2">
                    <Lock size={14} className="text-primary" />
                    Contraseña de Acceso Inicial
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                      name="password" 
                      type="text"
                      required
                      placeholder="mínimo 8 caracteres — se enviará al cliente"
                      minLength={8}
                      className="w-full bg-primary/5 border border-primary/30 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground px-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span>
                    El cliente recibirá esta contraseña por email y podrá cambiarla después.
                  </p>
                </div>

              </div>
            </div>

            {/* Section: Plan & Pricing */}
            <div className="space-y-6 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CreditCard size={18} />
                <h2 className="font-semibold uppercase tracking-wider text-sm">Plan Comercial</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Plan de Suscripción</label>
                  <select 
                    name="plan" 
                    className="w-full bg-muted border border-border rounded-xl py-3 px-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 appearance-none text-foreground"
                  >
                    <option value="solo">Solo (1 unidad)</option>
                    <option value="empresa_10">Empresa Básico (Hasta 10)</option>
                    <option value="empresa_50">Empresa Escalado (11-50)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground px-1">Precio Mensual ($)</label>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01"
                    defaultValue="13.00"
                    className="w-full bg-muted border border-border rounded-xl py-3 px-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all border border-white/10"
              >
                Crear Empresa y Activar Acceso
              </button>
              <p className="text-muted-foreground text-center text-xs mt-4 italic">
                Al crear la empresa, se generará el acceso automático para el email proporcionado.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
