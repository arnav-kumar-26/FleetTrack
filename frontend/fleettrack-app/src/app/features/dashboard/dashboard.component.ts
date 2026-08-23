import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { CostTrendPoint, DashboardSummary } from '../../core/models/dashboard.model';
import { staggerDelay } from '../../core/utils/stagger.util';
import { CountUpDirective } from '../../core/directives/count-up.directive';

interface StatCard {
  label: string;
  value: number;
  currency?: boolean;
  kind: 'cost' | 'operational';
  changePercent: number | null;
}

interface ChartTooltipData {
  month: string;
  value: string;
  left: number;
  top: number;
  align: 'top' | 'bottom';
  caretX: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, CountUpDirective],
  template: `
    <div class="p-4">
      <h1 class="text-page-title font-extrabold text-title">Dashboard</h1>
      <p class="mt-1 mb-6 text-sm text-muted">Overview of your fleet activity and real-time metrics</p>

      <p *ngIf="errorMessage()" class="mt-3 text-sm text-red-600">{{ errorMessage() }}</p>

      <div *ngIf="loading()" class="mt-3 grid grid-cols-1 gap-grid-gutter sm:grid-cols-2 lg:grid-cols-4">
        <div
          *ngFor="let _ of [0, 1, 2, 3]"
          class="rounded-card bg-card p-card-padding"
          animate.enter="fade-in-up"
          [style.animation-delay.ms]="staggerDelay(0)"
        >
          <div class="h-4 w-24 animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"></div>
          <div class="mt-3 h-8 w-32 animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"></div>
        </div>
      </div>

      <ng-container *ngIf="summary() as summary">
        <div class="mt-3 grid grid-cols-1 gap-grid-gutter sm:grid-cols-2 lg:grid-cols-4">
          <div
            *ngFor="let card of statCards(); let i = index"
            class="flex min-h-40 flex-col rounded-card p-card-padding transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            [class.bg-card]="i !== 0"
            [class.bg-brand-deep]="i === 0"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(i)"
          >
            <p
              class="text-sm font-normal"
              [class.text-muted]="i !== 0"
              [class.text-on-dark-muted]="i === 0"
            >{{ card.label }}</p>
            <p
              class="mt-6 text-stat-number font-medium leading-none"
              [class.text-title]="i !== 0"
              [class.text-on-dark]="i === 0"
            >
              <span *ngIf="!card.currency" [countUp]="card.value"></span>
              <span *ngIf="card.currency" [countUp]="card.value" [countUpCurrency]="'INR'"></span>
            </p>
            <p
              class="mt-auto pt-3 text-meta font-normal"
              [style.color]="trendColor(card, i === 0)"
            >{{ trendText(card) }}</p>
          </div>
        </div>

        <div class="mt-2 grid grid-cols-1 gap-grid-gutter lg:grid-cols-3">
          <div
            class="rounded-card bg-card p-card-padding lg:col-span-2"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(4)"
          >
            <h2 class="text-card-header font-bold text-brand-deep">Cost Trend</h2>
            <div class="relative mt-4 h-72">
              <canvas baseChart [data]="chartData()" [options]="chartOptions" [type]="'bar'"></canvas>
              @if (tooltipData(); as tip) {
                <div
                  class="chart-tooltip"
                  [attr.data-align]="tip.align"
                  [style.left.px]="tip.left"
                  [style.top.px]="tip.top"
                  [style.--caret-x]="tip.caretX"
                >
                  <div class="chart-tooltip-title">{{ tip.month }}</div>
                  <div class="chart-tooltip-value">{{ tip.value }}</div>
                </div>
              }
            </div>
          </div>

          <div
            class="rounded-card bg-card p-card-padding"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(5)"
          >
            <h2 class="text-card-header font-bold text-brand-deep">Recent Activity</h2>
            <ul class="mt-4 divide-y divide-hairline">
              <li
                *ngFor="let log of summary.recentLogs; let i = index"
                class="py-3"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <p class="text-sm font-normal text-body">{{ log.description }}</p>
                <p class="text-meta font-normal text-muted">{{ log.serviceDate | date }} · {{ log.cost | currency:'INR':'symbol-narrow':'1.0-0' }}</p>
              </li>
              <li *ngIf="summary.recentLogs.length === 0" class="py-3 text-meta text-muted">
                No recent activity.
              </li>
            </ul>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .chart-tooltip {
        position: absolute;
        z-index: 50;
        min-width: 8rem;
        padding: 0.5rem 0.75rem;
        background: var(--color-shell);
        border: 1px solid var(--color-hairline);
        border-radius: var(--radius-icon-chip);
        box-shadow: var(--shadow-popover);
        pointer-events: none;
        white-space: nowrap;
      }

      .chart-tooltip::after {
        content: '';
        position: absolute;
        left: var(--caret-x, 50%);
        bottom: -5px;
        width: 10px;
        height: 10px;
        background: var(--color-shell);
        transform: translateX(-50%) rotate(45deg);
      }

      .chart-tooltip[data-align='bottom']::after {
        top: -5px;
        bottom: auto;
      }

      .chart-tooltip-title {
        color: var(--color-muted);
        font-size: var(--text-meta);
        font-weight: 400;
      }

      .chart-tooltip-value {
        margin-top: 0.125rem;
        color: var(--color-title);
        font-size: 0.875rem;
        font-weight: 400;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly tooltipData = signal<ChartTooltipData | null>(null);

  readonly staggerDelay = staggerDelay;

  readonly chartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{ data: [], label: 'Monthly cost' }],
  });
  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (context) => {
          const { chart, tooltip } = context;
          if (tooltip.opacity === 0) {
            if (this.tooltipData() !== null) {
              this.tooltipData.set(null);
              this.cdr.detectChanges();
            }
            return;
          }
          const dataPoint = tooltip.dataPoints[0];
          if (!dataPoint) {
            return;
          }
          const value = Number(dataPoint.parsed.y);
          const below = tooltip.yAlign === 'bottom';
          const parent = chart.canvas.parentNode as HTMLElement;
          const width = tooltip.width;
          const height = tooltip.height;
          const maxLeft = Math.max(8, parent.clientWidth - width - 8);
          const maxTop = Math.max(8, parent.clientHeight - height - 8);
          const left = Math.min(Math.max(tooltip.caretX - width / 2, 8), maxLeft);
          const top = below
            ? Math.min(Math.max(tooltip.caretY + 12, 8), maxTop)
            : Math.min(Math.max(tooltip.caretY - height - 12, 8), maxTop);
          this.tooltipData.set({
            month: tooltip.title?.[0] ?? '',
            value: this.formatCurrency(value),
            left,
            top,
            align: below ? 'bottom' : 'top',
            caretX: `${tooltip.caretX - left}px`,
          });
          this.cdr.detectChanges();
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } },
    },
  };

  readonly statCards = computed<StatCard[]>(() => {
    const s = this.summary();
    if (!s) {
      return [];
    }
    return [
      { label: 'Total Vehicles', value: s.totalActiveVehicles, kind: 'operational', changePercent: s.activeVehiclesChangePercent },
      { label: 'Lifetime Cost', value: s.totalLifetimeCost, currency: true, kind: 'cost', changePercent: s.lifetimeCostChangePercent },
      { label: 'Cost This Month', value: s.costThisMonth, currency: true, kind: 'cost', changePercent: s.costThisMonthChangePercent },
      { label: 'Due for Service', value: s.vehiclesDueForService, kind: 'operational', changePercent: s.dueForServiceChangePercent },
    ];
  });

  trendText(card: StatCard): string {
    const change = card.changePercent;
    if (change === null || change === 0) {
      return 'neutral';
    }
    const sign = change > 0 ? '+' : '-';
    return `${sign}${Math.abs(change).toFixed(1)}% since last month`;
  }

  trendColor(card: StatCard, onDark: boolean): string {
    const change = card.changePercent;
    if (change === null || change === 0) {
      return onDark ? 'var(--color-on-dark-muted)' : 'var(--color-muted)';
    }
    const isGood = card.kind === 'cost' ? change < 0 : change > 0;
    if (onDark) {
      return isGood ? '#8FE3B3' : '#FF9C94';
    }
    return isGood ? '#1E8A4C' : '#E0524A';
  }

  ngOnInit() {
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load dashboard.');
        this.loading.set(false);
      },
    });

    this.dashboardService.getCostTrend().subscribe({
      next: (points) => {
        this.applyCostTrend(points);
      },
      error: () => {
        /* chart is non-critical */
      },
    });
  }

  private applyCostTrend(points: CostTrendPoint[]) {
    const labels = points.map((p) => this.formatMonth(p.month));
    const values = points.map((p) => p.totalCost);

    const styles = getComputedStyle(document.documentElement);
    const brandMid = styles.getPropertyValue('--color-brand-mid').trim();
    const accentMint = styles.getPropertyValue('--color-accent-mint').trim();
    const radiusCard = Number.parseFloat(styles.getPropertyValue('--radius-card')) || 16;

    const peak = values.length > 0 ? Math.max(...values) : 0;
    const backgroundColor = values.map((value) => (value === peak ? brandMid : accentMint));

    this.chartData.set({
      labels,
      datasets: [
        {
          data: values,
          label: 'Monthly cost',
          backgroundColor,
          borderRadius: radiusCard,
          borderSkipped: false,
        },
      ],
    });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatMonth(key: string): string {
    const [year, month] = key.split('-').map(Number);
    if (!year || !month) {
      return key;
    }
    return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }
}
