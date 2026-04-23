import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <aside class="fixed left-0 top-16 bottom-0 flex flex-col pt-4 overflow-y-auto bg-slate-50 border-r border-slate-200 w-[260px] z-40 transition-all font-['Inter'] text-xs">
      
      <!-- Navegación Principal -->
      <nav class="flex flex-col gap-1 px-4 mb-8">
        <a routerLink="/dashboard" routerLinkActive="bg-white shadow-sm text-primary-container font-black" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-white transition-all cursor-pointer">
          <span class="material-symbols-outlined text-lg">grid_view</span>
          <span class="text-[13px]">Inicio</span>
        </a>
      </nav>

      <!-- Grupo: Agua -->
      <div class="px-5 mb-2">
        <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-blue-500 text-sm">water_drop</span>
            <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Consumo de Agua</h3>
        </div>
      </div>

      <div class="flex flex-col px-3 overflow-y-auto pb-10 space-y-0.5">
        @for (company of filteredTree(); track company.id) {
          @if (company.tipo_empresa === 'Agua') {
            <div class="flex flex-col">
              <div (click)="toggleItem(company.id)" class="flex items-center gap-2 py-2 px-3 hover:bg-white rounded-xl cursor-pointer group transition-all">
                <span class="material-symbols-outlined text-lg text-slate-300 transition-transform" [class.rotate-90]="expanded[company.id]">keyboard_arrow_right</span>
                <span class="text-[13px] text-primary font-bold truncate flex-1">{{ company.nombre }}</span>
              </div>

              @if (expanded[company.id]) {
                <div class="ml-4 flex flex-col gap-0.5 mt-0.5">
                  @for (sub of company.subCompanies; track sub.id) {
                    <div 
                      (click)="selectSubCompany(sub.id)" 
                      [class]="'flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer transition-all ' + (selectedId() === sub.id ? 'bg-white shadow-sm text-primary-container ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white')"
                    >
                      <span class="text-[12px] font-semibold">{{ sub.nombre }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

        <!-- Grupo: Eléctrico -->
        <div class="px-2 mt-6 mb-2">
            <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-amber-500 text-sm">bolt</span>
                <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Suministro Eléctrico</h3>
            </div>
        </div>

        @for (company of filteredTree(); track company.id) {
          @if (company.tipo_empresa === 'Eléctrico') {
            <div class="flex flex-col">
              <div (click)="toggleItem(company.id)" class="flex items-center gap-2 py-2 px-3 hover:bg-white rounded-xl cursor-pointer group transition-all">
                <span class="material-symbols-outlined text-lg text-slate-300 transition-transform" [class.rotate-90]="expanded[company.id]">keyboard_arrow_right</span>
                <span class="text-[13px] text-primary font-bold truncate flex-1">{{ company.nombre }}</span>
              </div>

              @if (expanded[company.id]) {
                <div class="ml-4 flex flex-col gap-0.5 mt-0.5">
                  @for (sub of company.subCompanies; track sub.id) {
                    <div 
                      (click)="selectSubCompany(sub.id)" 
                      [class]="'flex items-center gap-2 py-2 px-4 rounded-xl cursor-pointer transition-all ' + (selectedId() === sub.id ? 'bg-white shadow-sm text-primary-container ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white')"
                    >
                      <span class="text-[12px] font-semibold">{{ sub.nombre }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        }
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  companyService = inject(CompanyService);
  router = inject(Router); // Para poder navegar
  
  filterTerm = '';
  expanded: Record<string, boolean> = {};
  filteredTree = signal<any[]>([]);
  selectedId = this.companyService.selectedSubCompanyId;

  ngOnInit() {
    this.companyService.fetchHierarchy().subscribe((res: any) => {
      if (res.ok) this.filteredTree.set(res.data);
    });
  }

  onFilterChange() {
    const term = this.filterTerm.toLowerCase();
    this.filteredTree.set(
      this.companyService.hierarchy().filter(c => c.nombre.toLowerCase().includes(term))
    );
  }

  toggleItem(id: string) {
    this.expanded[id] = !this.expanded[id];
  }

  selectSubCompany(id: string) {
    this.companyService.selectedSubCompanyId.set(id);
    // IMPORTANTE: Redirigir a la página de empresas para ver los sitios
    this.router.navigate(['/companies']);
  }
}
