import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { LucideDynamicIcon } from '@lucide/angular';
import { DashboardService } from '../../core/services/dashboard.service';
import { CostTrendPoint, DashboardSummary } from '../../core/models/dashboard.model';
import { staggerDelay } from '../../core/utils/stagger.util';
import { CountUpDirective } from '../../core/directives/count-up.directive';

interface StatCard {
  label: string;
  icon: string;
  value: number;
  currency?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideDynamicIcon, CountUpDirective],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>

      <p *ngIf="errorMessage()" class="mt-4 text-sm text-red-600">{{ errorMessage() }}</p>

      <div *ngIf="loading()" class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          *ngFor="let _ of [0, 1, 2, 3]"
          class="rounded-lg border border-gray-200 bg-white p-6"
          animate.enter="fade-in-up"
          [style.animation-delay.ms]="staggerDelay(0)"
        >
          <div class="h-4 w-24 animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"></div>
          <div class="mt-3 h-8 w-32 animate-shimmer rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"></div>
        </div>
      </div>

      <ng-container *ngIf="summary() as summary">
        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            *ngFor="let card of statCards(); let i = index"
            class="group rounded-lg border border-gray-200 bg-white p-6 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(i)"
          >
            <div class="flex items-center gap-2">
              <svg
                lucideIcon="{{ card.icon }}"
                [size]="18"
                class="text-indigo-500 transition-transform duration-200 group-hover:scale-110"
              />
              <p class="text-xs font-medium uppercase text-gray-500">{{ card.label }}</p>
            </div>
            <p class="mt-3 text-3xl font-bold text-gray-900">
              <span *ngIf="!card.currency" [countUp]="card.value"></span>
              <span *ngIf="card.currency">{{ card.value | currency }}</span>
            </p>
          </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            class="rounded-lg border border-gray-200 bg-white p-6 lg:col-span-2"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(4)"
          >
            <h2 class="text-lg font-bold text-gray-900">Cost trend</h2>
            <div class="relative mt-4 h-72">
              <canvas baseChart [data]="chartData()" [options]="chartOptions" [type]="'bar'"></canvas>
            </div>
          </div>

          <div
            class="rounded-lg border border-gray-200 bg-white p-6"
            animate.enter="fade-in-up"
            [style.animation-delay.ms]="staggerDelay(5)"
          >
            <h2 class="text-lg font-bold text-gray-900">Recent activity</h2>
            <ul class="mt-4 divide-y divide-gray-200">
              <li
                *ngFor="let log of summary.recentLogs; let i = index"
                class="py-3"
                animate.enter="fade-in-up"
                [style.animation-delay.ms]="staggerDelay(i)"
              >
                <p class="text-sm font-semibold text-gray-900">{{ log.description }}</p>
                <p class="text-xs text-gray-500">{{ log.serviceDate | date }} · {{ log.cost | currency }}</p>
              </li>
              <li *ngIf="summary.recentLogs.length === 0" class="py-3 text-sm text-gray-400">
                No recent activity.
              </li>
            </ul>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  @ViewChild(BaseChartDirective) private readonly chartDirective?: BaseChartDirective;

  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly staggerDelay = staggerDelay;

  readonly chartData = signal<ChartConfiguration<'bar'>['data']>({
    labels: [],
    datasets: [{ data: [], label: 'Monthly cost' }],
  });
  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 280, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
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
      { label: 'Total vehicles', icon: 'gauge', value: s.totalActiveVehicles },
      { label: 'Lifetime cost', icon: 'indian-rupee', value: s.totalLifetimeCost, currency: true },
      { label: 'Cost this month', icon: 'indian-rupee', value: s.costThisMonth, currency: true },
      { label: 'Due for service', icon: 'triangle-alert', value: s.vehiclesDueForService },
    ];
  });

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

    const canvas = this.chartDirective?.chart?.ctx?.canvas;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        this.chartData.set({
          labels,
          datasets: [
            { data: values, label: 'Monthly cost', backgroundColor: gradient, borderRadius: 6, borderSkipped: false },
          ],
        });
        return;
      }
    }

    this.chartData.set({
      labels,
      datasets: [
        {
          data: values,
          label: 'Monthly cost',
          backgroundColor: 'rgba(99, 102, 241, 0.35)',
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    });
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
