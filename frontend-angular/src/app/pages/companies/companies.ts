import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { AuthService } from '../../services/auth.service';
import { SiteCardComponent } from '../../components/ui/site-card';
import { KpiCardComponent } from '../../components/ui/kpi-card';
import { UserManagementComponent as UserMgmtUIComponent } from '../../components/ui/user-management';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, SiteCardComponent, KpiCardComponent, UserMgmtUIComponent],
  templateUrl: './companies.html'
})
export class CompaniesComponent implements OnInit {
  companyService = inject(CompanyService);
  auth = inject(AuthService);

  activeTab = signal('instalaciones');
  selectedSubCompany = signal<any>(null);
  sites = signal<any[]>([]);
  loading = signal(false);

  constructor() {
    effect(() => {
      const selectedId = this.companyService.selectedSubCompanyId();
      if (selectedId) {
        this.loadSubCompanyData(selectedId);
      }
    });
  }

  ngOnInit(): void {
    this.companyService.fetchHierarchy().subscribe((res: any) => {
      if (res.ok) {
        if (res.data.length > 0 && !this.companyService.selectedSubCompanyId()) {
          const firstSub = res.data[0].subCompanies?.[0];
          if (firstSub) {
            this.companyService.selectedSubCompanyId.set(firstSub.id);
          }
        }
      }
    });
  }

  loadSubCompanyData(id: string): void {
    this.loading.set(true);
    const tree = this.companyService.hierarchy();
    for (const comp of tree) {
      const sub = comp.subCompanies?.find((s: any) => s.id === id);
      if (sub) {
        this.selectedSubCompany.set({ ...sub, empresa_id: comp.id });
        break;
      }
    }

    this.companyService.getSites(id).subscribe({
      next: (json: any) => {
        if (json.ok) this.sites.set(json.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab);
  }

  get user() { return this.auth.user(); }

  /**
   * Tabs filtrados por rol:
   *  - SuperAdmin/Admin: General, Instalaciones, Contactos, Usuarios
   *  - Gerente: General, Instalaciones, Contactos, Equipo (solo lectura)
   *  - Cliente: General, Instalaciones
   */
  get tabs() {
    const base = [
      { key: 'general', label: 'General', icon: 'info' },
      { key: 'instalaciones', label: 'Instalaciones', icon: 'factory' },
    ];

    if (this.auth.isCliente()) {
      return base;
    }

    base.push({ key: 'contactos', label: 'Contactos', icon: 'contact_phone' });

    if (this.auth.canManageUsers()) {
      base.push({ key: 'usuarios', label: 'Gestión Usuarios', icon: 'person_add' });
    } else if (this.auth.isGerente()) {
      base.push({ key: 'usuarios', label: 'Mi Equipo', icon: 'group' });
    }

    return base;
  }
}
