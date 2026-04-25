import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SiteCardComponent } from '../../../components/ui/site-card';

@Component({
  selector: 'app-companies-installations-panel',
  standalone: true,
  imports: [CommonModule, SiteCardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      @for (site of sites; track site.id) {
        <app-site-card
          [site]="site"
          (siteSelected)="siteSelected.emit($event)"
        />
      }

      @if (sites.length === 0 && !loading) {
        <div class="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <span class="material-symbols-outlined text-slate-300 text-5xl mb-4">inventory_2</span>
          <p class="text-slate-400 font-bold uppercase tracking-widest">No hay instalaciones registradas</p>
        </div>
      }
    </div>
  `,
})
export class CompaniesInstallationsPanelComponent {
  @Input() sites: any[] = [];
  @Input() loading = false;

  @Output() siteSelected = new EventEmitter<any>();
}
