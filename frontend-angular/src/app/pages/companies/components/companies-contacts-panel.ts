import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-companies-contacts-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-in fade-in duration-500">
      <h3 class="text-sm font-black text-primary mb-8 uppercase tracking-widest border-l-4 border-primary-container pl-4">Contactos</h3>
      <div class="py-12 text-center">
        <span class="material-symbols-outlined text-slate-300 text-5xl mb-4">contact_phone</span>
        <p class="text-slate-400 font-bold uppercase tracking-widest">Sin contactos registrados</p>
      </div>
    </div>
  `,
})
export class CompaniesContactsPanelComponent {}
