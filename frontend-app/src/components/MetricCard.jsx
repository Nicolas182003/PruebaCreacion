import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function MetricCard({ title, value, unit, icon: Icon, time }) {
  // Format date if provided
  const formattedTime = time ? new Date(time).toLocaleString('es-ES', { 
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' 
  }) : 'Sin datos';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-md">
      {/* Top section: Title and Icon */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-700">{title}</h3>
            <p className="text-xs text-slate-400">{formattedTime}</p>
          </div>
        </div>
      </div>

      {/* Middle section: Big Value */}
      <div className="mt-2 flex items-baseline gap-1 relative z-10">
        <span className="text-4xl font-bold text-slate-800 tracking-tight">{value !== undefined ? value : '--'}</span>
        <span className="text-sm font-medium text-slate-500">{unit}</span>
      </div>

      {/* Bottom section: Trend/Status */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 relative z-10">
        <span className="text-xs text-slate-400">vs. anterior</span>
        <span className="flex items-center text-xs font-semibold text-emerald-500">
          <ArrowUpRight className="w-3 h-3 mr-1" /> Activo
        </span>
      </div>
      
      {/* Subtle background decoration (simulating the blue blocks from the original image) */}
      <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-50 rounded-tl-full opacity-50 z-0 border-l border-t border-blue-100"></div>
    </div>
  );
}
