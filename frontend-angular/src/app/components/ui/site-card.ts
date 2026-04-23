import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-200 cursor-pointer group">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <span class="material-symbols-outlined text-slate-500 group-hover:text-primary-container transition-colors">location_on</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-primary truncate max-w-[150px]">{{ site.descripcion }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ site.ubicacion || 'Sin ubicación' }}</p>
          </div>
        </div>
        <span class="material-symbols-outlined text-slate-300 group-hover:text-primary-container group-hover:translate-x-1 transition-all">chevron_right</span>
      </div>
      
      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-emerald-500">sensors</span>
          <span class="text-[11px] text-slate-500 font-medium">Transmisión Activa</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
          <span class="text-[11px] text-slate-400">Hace 5 min</span>
        </div>
      </div>
    </div>
  `
})
export class SiteCardComponent {
  @Input() site: any;
}
