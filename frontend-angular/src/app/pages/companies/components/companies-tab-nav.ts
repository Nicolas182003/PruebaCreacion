import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface CompaniesTabItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-companies-tab-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-4 mb-8">
      @for (tab of tabs; track tab.key) {
        <button
          type="button"
          (click)="selectTab(tab.key)"
          [class]="'px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center gap-2 ' + (activeTab === tab.key ? 'bg-white shadow-sm text-primary-container ring-1 ring-slate-200' : 'text-slate-400 hover:bg-slate-100')"
        >
          <span class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
          <span class="uppercase tracking-widest">{{ tab.label }}</span>
        </button>
      }
    </div>
  `,
})
export class CompaniesTabNavComponent {
  @Input() tabs: CompaniesTabItem[] = [];
  @Input() activeTab = '';

  @Output() activeTabChange = new EventEmitter<string>();

  selectTab(tab: string): void {
    this.activeTabChange.emit(tab);
  }
}
