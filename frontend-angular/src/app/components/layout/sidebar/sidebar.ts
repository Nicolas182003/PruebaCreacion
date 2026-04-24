import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <aside class="fixed left-0 top-16 bottom-0 flex flex-col pt-4 overflow-y-auto bg-slate-50 border-r border-slate-200 w-[260px] z-40 transition-all font-['Inter'] text-xs">
      
      <!-- Navegación Principal (todos los roles) -->
      <nav class="flex flex-col gap-1 px-4 mb-6">
        <a routerLink="/dashboard" routerLinkActive="bg-white shadow-sm text-primary-container font-black" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-white transition-all cursor-pointer">
          <span class="material-symbols-outlined text-lg">grid_view</span>
          <span class="text-[13px]">Inicio</span>
        </a>
      </nav>

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- VISTA: SuperAdmin — Árbol completo agrupado por tipo       -->
      <!-- ════════════════════════════════════════════════════════════ -->
      @if (auth.isSuperAdmin()) {
        <!-- Grupo: Agua -->
        <div class="px-5 mb-2">
          <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-blue-500 text-sm">water_drop</span>
            <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Consumo de Agua</h3>
          </div>
        </div>

        <div class="flex flex-col px-3 space-y-0.5">
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

          <!-- Grupo: Industrial (otros tipos) -->
          @if (hasOtherTypes()) {
            <div class="px-2 mt-6 mb-2">
              <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-slate-500 text-sm">factory</span>
                <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Industrial</h3>
              </div>
            </div>

            @for (company of filteredTree(); track company.id) {
              @if (company.tipo_empresa !== 'Agua' && company.tipo_empresa !== 'Eléctrico') {
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
          }
        </div>
      }

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- VISTA: Admin — Solo su empresa con sub-empresas            -->
      <!-- ════════════════════════════════════════════════════════════ -->
      @if (auth.isAdmin()) {
        <div class="px-5 mb-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-primary-container text-sm">domain</span>
            <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Mi Empresa</h3>
          </div>
        </div>

        <div class="flex flex-col px-3 space-y-0.5">
          @for (company of filteredTree(); track company.id) {
            <div class="flex flex-col">
              <!-- Nombre de la empresa (siempre visible, no colapsable) -->
              <div class="flex items-center gap-2 py-2 px-3 rounded-xl bg-white/50 mb-1">
                <span class="material-symbols-outlined text-primary-container text-lg">corporate_fare</span>
                <span class="text-[13px] text-primary font-black truncate flex-1">{{ company.nombre }}</span>
              </div>

              <!-- Sub-empresas siempre expandidas -->
              <div class="ml-2 flex flex-col gap-0.5">
                @for (sub of company.subCompanies; track sub.id) {
                  <div 
                    (click)="selectSubCompany(sub.id)" 
                    [class]="'flex items-center gap-2 py-2.5 px-4 rounded-xl cursor-pointer transition-all ' + (selectedId() === sub.id ? 'bg-white shadow-sm text-primary-container ring-1 ring-slate-200 font-black' : 'text-slate-500 hover:bg-white font-semibold')"
                  >
                    <span class="material-symbols-outlined text-sm" [class.text-primary-container]="selectedId() === sub.id">factory</span>
                    <span class="text-[12px]">{{ sub.nombre }}</span>
                    @if (sub.sites?.length) {
                      <span class="ml-auto text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-400">{{ sub.sites.length }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- VISTA: Gerente — Solo su sub-empresa                       -->
      <!-- ════════════════════════════════════════════════════════════ -->
      @if (auth.isGerente()) {
        <div class="px-5 mb-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-emerald-500 text-sm">shield_person</span>
            <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Mi División</h3>
          </div>
        </div>

        <div class="flex flex-col px-3 space-y-1">
          @for (company of filteredTree(); track company.id) {
            <!-- Empresa padre (referencia visual) -->
            <div class="flex items-center gap-2 py-1.5 px-3 text-slate-400">
              <span class="material-symbols-outlined text-sm">domain</span>
              <span class="text-[11px] font-medium">{{ company.nombre }}</span>
            </div>
            
            @for (sub of company.subCompanies; track sub.id) {
              <div 
                (click)="selectSubCompany(sub.id)"
                class="flex items-center gap-3 py-3 px-4 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 text-primary-container font-black cursor-pointer"
              >
                <div class="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined text-emerald-600 text-lg">factory</span>
                </div>
                <div>
                  <span class="text-[13px] block">{{ sub.nombre }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">Encargado de División</span>
                </div>
              </div>
            }
          }

          <!-- Acceso rápido a equipo -->
          <a routerLink="/companies" class="flex items-center gap-2 py-2 px-3 mt-4 rounded-xl text-slate-500 hover:bg-white transition-all cursor-pointer">
            <span class="material-symbols-outlined text-lg">group</span>
            <span class="text-[12px] font-medium">Mi Equipo</span>
          </a>
        </div>
      }

      <!-- ════════════════════════════════════════════════════════════ -->
      <!-- VISTA: Cliente — Solo lectura de su sub-empresa            -->
      <!-- ════════════════════════════════════════════════════════════ -->
      @if (auth.isCliente()) {
        <div class="px-5 mb-3">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-blue-400 text-sm">visibility</span>
            <h3 class="text-[11px] uppercase tracking-widest text-slate-400 font-black">Mi Vista</h3>
          </div>
        </div>

        <div class="flex flex-col px-3 space-y-1">
          @for (company of filteredTree(); track company.id) {
            <div class="flex items-center gap-2 py-1.5 px-3 text-slate-400">
              <span class="material-symbols-outlined text-sm">domain</span>
              <span class="text-[11px] font-medium">{{ company.nombre }}</span>
            </div>
            
            @for (sub of company.subCompanies; track sub.id) {
              <div 
                (click)="selectSubCompany(sub.id)"
                class="flex items-center gap-3 py-3 px-4 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 text-primary-container cursor-pointer"
              >
                <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span class="material-symbols-outlined text-blue-500 text-lg">factory</span>
                </div>
                <div>
                  <span class="text-[13px] font-bold block">{{ sub.nombre }}</span>
                  <span class="text-[10px] text-slate-400 font-medium">Solo lectura</span>
                </div>
              </div>
            }
          }
        </div>
      }

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Footer con info del rol -->
      <div class="px-4 py-3 border-t border-slate-200 bg-white/50">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-primary-container/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary-container text-sm">
              @if (auth.isSuperAdmin()) { admin_panel_settings }
              @else if (auth.isAdmin()) { manage_accounts }
              @else if (auth.isGerente()) { shield_person }
              @else { person }
            </span>
          </div>
          <div>
            <p class="text-[11px] font-bold text-slate-700">{{ auth.user()?.nombre || 'Usuario' }}</p>
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">{{ auth.user()?.tipo }}</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  companyService = inject(CompanyService);
  auth = inject(AuthService);
  router = inject(Router);
  
  expanded: Record<string, boolean> = {};
  filteredTree = signal<any[]>([]);
  selectedId = this.companyService.selectedSubCompanyId;

  ngOnInit() {
    this.companyService.fetchHierarchy().subscribe((res: any) => {
      if (res.ok) {
        this.filteredTree.set(res.data);

        // Auto-expandir y auto-seleccionar según rol
        if (res.data.length > 0) {
          const firstCompany = res.data[0];
          
          if (this.auth.isSuperAdmin()) {
            // SuperAdmin: expandir primera empresa
            this.expanded[firstCompany.id] = true;
            if (firstCompany.subCompanies?.[0]) {
              this.selectSubCompany(firstCompany.subCompanies[0].id);
            }
          } else if (this.auth.isAdmin()) {
            // Admin: expandir su empresa (ya viene solo la suya del backend)
            this.expanded[firstCompany.id] = true;
            if (firstCompany.subCompanies?.[0] && !this.selectedId()) {
              this.selectSubCompany(firstCompany.subCompanies[0].id);
            }
          } else {
            // Gerente/Cliente: auto-seleccionar su sub-empresa
            if (firstCompany.subCompanies?.[0]) {
              this.selectSubCompany(firstCompany.subCompanies[0].id);
            }
          }
        }
      }
    });
  }

  toggleItem(id: string) {
    this.expanded[id] = !this.expanded[id];
  }

  selectSubCompany(id: string) {
    this.companyService.selectedSubCompanyId.set(id);
    this.router.navigate(['/companies']);
  }

  hasOtherTypes(): boolean {
    return this.filteredTree().some(c => c.tipo_empresa !== 'Agua' && c.tipo_empresa !== 'Eléctrico');
  }
}
