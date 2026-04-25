import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { CompaniesSiteDetailSkeletonComponent } from './components/companies-site-detail-skeleton';

@Component({
  selector: 'app-company-site-water-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CompaniesSiteDetailSkeletonComponent],
  template: `
    <div class="p-8">
      <div class="mb-5">
        <a
          routerLink="/companies"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all text-sm font-semibold shadow-sm"
        >
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Volver a instalaciones
        </a>
      </div>

      @if (accessible()) {
        <app-companies-site-detail-skeleton />
      } @else {
        <app-companies-site-detail-skeleton />
      }
    </div>
  `,
})
export class CompanySiteWaterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly companyService = inject(CompanyService);

  accessible = signal(false);

  ngOnInit(): void {
    const siteId = this.route.snapshot.paramMap.get('siteId');

    if (!siteId) {
      this.router.navigate(['/companies']);
      return;
    }

    this.companyService.fetchHierarchy().subscribe({
      next: (res: any) => {
        if (!res.ok) {
          this.router.navigate(['/companies']);
          return;
        }

        const match = this.findAccessibleSite(res.data, siteId);

        if (!match) {
          this.router.navigate(['/companies']);
          return;
        }

        this.companyService.selectedSubCompanyId.set(match.subCompany.id);
        this.accessible.set(true);
      },
      error: () => this.router.navigate(['/companies']),
    });
  }

  private findAccessibleSite(tree: any[], siteId: string): { company: any; subCompany: any; site: any } | null {
    for (const company of tree || []) {
      for (const subCompany of company.subCompanies || []) {
        const site = (subCompany.sites || []).find((item: any) => item.id === siteId);
        if (site) {
          return { company, subCompany, site };
        }
      }
    }

    return null;
  }
}
