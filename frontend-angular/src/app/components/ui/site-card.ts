import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-site-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="siteSelected.emit(site)"
      [attr.aria-pressed]="selected"
      [class]="'w-full text-left bg-white border rounded-xl p-5 transition-all duration-200 cursor-pointer group ' + (selected ? 'border-primary-container ring-2 ring-primary-container/15 shadow-lg shadow-blue-900/10' : 'border-slate-200 hover:shadow-lg hover:border-slate-300')"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <div
            [class]="'w-10 h-10 rounded-lg flex items-center justify-center transition-colors ' + (selected ? 'bg-blue-50' : 'bg-slate-100 group-hover:bg-blue-50')"
          >
            <span
              [class]="'material-symbols-outlined transition-colors ' + (selected ? 'text-primary-container' : 'text-slate-500 group-hover:text-primary-container')"
            >location_on</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-primary truncate max-w-[150px]">{{ site.descripcion }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">{{ site.ubicacion || 'Sin ubicacion' }}</p>
          </div>
        </div>
        <span
          [class]="'material-symbols-outlined transition-all ' + (selected ? 'text-primary-container translate-x-1' : 'text-slate-300 group-hover:text-primary-container group-hover:translate-x-1')"
        >chevron_right</span>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-emerald-500">sensors</span>
          <span class="text-[11px] text-slate-500 font-medium">Transmision Activa</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
          <span class="text-[11px] text-slate-400">Hace 5 min</span>
        </div>
      </div>
    </button>
  `,
})
export class SiteCardComponent {
  @Input() site: any;
  @Input() selected = false;

  @Output() siteSelected = new EventEmitter<any>();
}
