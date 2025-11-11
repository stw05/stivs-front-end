import React, { useCallback, useMemo, useState } from 'react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import {
  calculateNationalMetrics,
  buildFinancingDistribution,
  buildFinancingTimeline,
  buildProgramFundingBreakdown,
  buildBudgetExecutionSeries,
  formatNumber,
} from '../utils/metrics';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './FinancesPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
);

type FinancingType = 'gf' | 'pcf' | 'commercial';
type CofinancingType = 'contract' | 'actual';
type ExpenseCategory = 'salary' | 'travel' | 'support' | 'materials' | 'rent' | 'protocol';

interface FilterState {
  irn: string;
  period: number;
  financingType: FinancingType;
  cofinancing: CofinancingType;
  expense: ExpenseCategory;
}

const IRN_OPTIONS = [
  { value: 'all', label: 'Все ИРН' },
  { value: 'irn-001', label: 'ИРН 001' },
  { value: 'irn-057', label: 'ИРН 057' },
  { value: 'irn-112', label: 'ИРН 112' },
  { value: 'irn-204', label: 'ИРН 204' },
];

const FINANCING_TYPE_OPTIONS: Array<{ value: FinancingType; label: string }> = [
  { value: 'gf', label: 'Государственное финансирование (ГФ)' },
  { value: 'pcf', label: 'Программно-целевое (ПЦФ)' },
  { value: 'commercial', label: 'Коммерциализация' },
];

const COFINANCING_OPTIONS: Array<{ value: CofinancingType; label: string }> = [
  { value: 'contract', label: 'По договору' },
  { value: 'actual', label: 'Фактическое' },
];

const EXPENSE_OPTIONS: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'salary', label: 'Оплата труда' },
  { value: 'travel', label: 'Служебные командировки' },
  { value: 'support', label: 'Научно-организационное сопровождение' },
  { value: 'materials', label: 'Приобретение материалов' },
  { value: 'rent', label: 'Расходы на аренду' },
  { value: 'protocol', label: 'Протокол ННС' },
];

const clampValue = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const adjustFinancesByFilters = (
  baseFinances: ReturnType<typeof calculateNationalMetrics>['finances'],
  filters: FilterState,
) => {
  const typeFactors: Record<FinancingType, number> = {
    gf: 1.08,
    pcf: 1.14,
    commercial: 0.92,
  };

  const budgetUsageAdjustments: Record<FinancingType, number> = {
    gf: 1.02,
    pcf: 1.05,
    commercial: 0.96,
  };

  const cofinancingFactors: Record<CofinancingType, number> = {
    contract: 1,
    actual: 1.06,
  };

  const expenseAdjustments: Record<ExpenseCategory, { total: number; avgExpense: number; programs: number }> = {
    salary: { total: 1.04, avgExpense: 1.12, programs: 1.02 },
    travel: { total: 0.96, avgExpense: 0.9, programs: 0.95 },
    support: { total: 1.02, avgExpense: 1.05, programs: 1.08 },
    materials: { total: 1.08, avgExpense: 1.02, programs: 1.04 },
    rent: { total: 0.94, avgExpense: 0.88, programs: 0.92 },
    protocol: { total: 1.01, avgExpense: 1, programs: 1.06 },
  };

  const irnFactors: Record<string, number> = {
    'irn-001': 1.06,
    'irn-057': 1.02,
    'irn-112': 0.97,
    'irn-204': 1.1,
  };

  const typeFactor = typeFactors[filters.financingType];
  const cofinFactor = cofinancingFactors[filters.cofinancing];
  const expenseFactor = expenseAdjustments[filters.expense];
  const periodFactor = 1 + (filters.period - 2030) * 0.008;
  const irnFactor = filters.irn === 'all' ? 1 : irnFactors[filters.irn] ?? 1;

  const combinedTotalFactor = typeFactor * cofinFactor * expenseFactor.total * periodFactor * irnFactor;

  const total = clampValue(Number((baseFinances.total * combinedTotalFactor).toFixed(2)), 5, baseFinances.total * 1.8);
  const lastYearFactor = (cofinFactor + expenseFactor.programs + typeFactor) / 3;
  const lastYear = clampValue(Number((baseFinances.lastYear * lastYearFactor * periodFactor).toFixed(2)), 3, total);
  const avgExpense = clampValue(
    Number((baseFinances.avgExpense * expenseFactor.avgExpense).toFixed(2)),
    baseFinances.avgExpense * 0.75,
    baseFinances.avgExpense * 1.35,
  );
  const budgetUsage = clampValue(
    Number((baseFinances.budgetUsage * budgetUsageAdjustments[filters.financingType]).toFixed(2)),
    45,
    100,
  );
  const regionalPrograms = clampValue(
    Number((baseFinances.regionalPrograms * expenseFactor.programs * irnFactor).toFixed(2)),
    1,
    baseFinances.regionalPrograms * 1.6,
  );

  return {
    total,
    lastYear,
    avgExpense,
    budgetUsage,
    regionalPrograms,
  };
};

const FinancesPage: React.FC = () => {
  const { selectedRegion, selectedRegionId, setSelectedRegionId, regions, isNational } =
    useRegionContext();

  const nationalMetrics = useMemo(() => calculateNationalMetrics(), []);
  const metrics = selectedRegion?.stats ?? nationalMetrics;
  const [filters, setFilters] = useState<FilterState>({
    irn: 'all',
    period: 2030,
    financingType: 'gf',
    cofinancing: 'contract',
    expense: 'salary',
  });

  const adjustedFinances = useMemo(
    () => adjustFinancesByFilters(metrics.finances, filters),
    [metrics.finances, filters],
  );

  const adjustedMetrics = useMemo(
    () => ({
      projects: metrics.projects,
      publications: metrics.publications,
      people: metrics.people,
      finances: adjustedFinances,
    }),
    [metrics, adjustedFinances],
  );

  const timelinePoints = useMemo(
    () => buildFinancingTimeline(adjustedMetrics.finances),
    [adjustedMetrics.finances],
  );
  const distribution = useMemo(
    () => buildFinancingDistribution(adjustedMetrics.finances),
    [adjustedMetrics.finances],
  );
  const programFunding = useMemo(
    () => buildProgramFundingBreakdown(adjustedMetrics),
    [adjustedMetrics],
  );
  const budgetExecution = useMemo(
    () => buildBudgetExecutionSeries(adjustedMetrics.finances, timelinePoints),
    [adjustedMetrics.finances, timelinePoints],
  );
  const timelineChartData = useMemo(() => {
    return {
      labels: timelinePoints.map((point) => point.label),
      datasets: [
        {
          label: 'Общая сумма, трлн ₸',
          data: timelinePoints.map((point) => Number((point.value / 1000).toFixed(3))),
          backgroundColor: '#2563eb',
          hoverBackgroundColor: '#1e3a8a',
          borderRadius: 14,
          maxBarThickness: 56,
        },
      ],
    };
  }, [timelinePoints]);

  const timelineChartOptions = useMemo<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { weight: 600 },
        bodyFont: { weight: 500 },
        callbacks: {
          label: (context) => {
            const valueInBillions = (context.raw as number) * 1000;
            const formatted = formatNumber(valueInBillions, { maximumFractionDigits: 1 });
            return `${formatted} млрд ₸`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#475569',
          font: { weight: 600 },
        },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false },
        border: { display: false },
        ticks: {
          color: '#475569',
          callback: (value) => `${Number(value).toFixed(2)} трлн ₸`,
        },
      },
    },
  }), []);

  const distributionChartData = useMemo(() => {
    return {
      labels: ['Программно-целевое', 'Грантовое'],
      datasets: [
        {
          data: [distribution.programmatic, distribution.grants],
          backgroundColor: ['#1e3a8a', '#60a5fa'],
          hoverBackgroundColor: ['#172554', '#2563eb'],
          borderWidth: 0,
        },
      ],
    };
  }, [distribution]);

  const distributionChartOptions = useMemo<ChartOptions<'doughnut'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#475569',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { weight: 600 },
        bodyFont: { weight: 500 },
        callbacks: {
          label: (context) => {
            const label = context.label ?? '';
            const value = context.raw as number;
            const formatted = formatNumber(value, { maximumFractionDigits: 1 });
            return `${label}: ${formatted} млрд ₸`;
          },
        },
      },
    },
  }), []);

  const programFundingChartData = useMemo(() => {
    return {
      labels: programFunding.map((item) => item.label),
      datasets: [
        {
          data: programFunding.map((item) => Number(item.value.toFixed(2))),
          backgroundColor: ['#2563eb', '#1d4ed8', '#60a5fa', '#38bdf8'],
          hoverBackgroundColor: ['#1e3a8a', '#1e40af', '#2563eb', '#0284c7'],
          borderRadius: 14,
          barThickness: 26,
        },
      ],
    };
  }, [programFunding]);

  const programFundingChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { weight: 600 },
          bodyFont: { weight: 500 },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              return `${formatNumber(value, { maximumFractionDigits: 1 })} млрд ₸`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.25)', drawBorder: false },
          ticks: {
            color: '#475569',
            callback: (value) => `${Number(value).toFixed(1)} млрд ₸`,
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#0f172a',
            font: { weight: 600 },
          },
        },
      },
    }),
    [],
  );

  const budgetExecutionChartData = useMemo(() => {
    return {
      labels: budgetExecution.labels,
      datasets: [
        {
          label: 'План',
          data: budgetExecution.planned,
          fill: true,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.2)',
          tension: 0.35,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: '#0f172a',
          pointRadius: 4,
        },
        {
          label: 'Факт',
          data: budgetExecution.fact,
          fill: true,
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(29, 78, 216, 0.22)',
          tension: 0.35,
          pointBackgroundColor: '#1d4ed8',
          pointBorderColor: '#0f172a',
          pointRadius: 4,
        },
      ],
    };
  }, [budgetExecution]);

  const budgetExecutionChartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#475569',
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { weight: 600 },
          bodyFont: { weight: 500 },
          callbacks: {
            label: (context) => {
              const label = context.dataset.label ?? '';
              const value = context.raw as number;
              return `${label}: ${value.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: { color: '#475569', font: { weight: 600 } },
        },
        y: {
          beginAtZero: true,
          suggestedMax: 100,
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: {
            color: '#475569',
            callback: (value) => `${value} %`,
          },
        },
      },
    }),
    [],
  );

  const mapHighlights = useMemo(
    () => [
      {
        label: 'Общий объем',
        value: `${formatNumber(adjustedMetrics.finances.total, { maximumFractionDigits: 1 })} млрд ₸`,
      },
      {
        label: 'Последний год',
        value: `${formatNumber(adjustedMetrics.finances.lastYear, { maximumFractionDigits: 1 })} млрд ₸`,
      },
      {
        label: 'Освоение бюджета',
        value: `${formatNumber(adjustedMetrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
      },
      {
        label: 'Региональные программы',
        value: formatNumber(adjustedMetrics.finances.regionalPrograms),
      },
    ],
    [adjustedMetrics.finances],
  );

  const topRegions = useMemo(
    () =>
      regions
        .map((region) => ({
          id: region.id,
          name: region.name,
          total: region.stats.finances.total,
          lastYear: region.stats.finances.lastYear,
          budgetUsage: region.stats.finances.budgetUsage,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6),
    [regions],
  );

  const comparisonRows = useMemo(() => {
    if (!selectedRegion) {
      return [];
    }

    const share = (adjustedMetrics.finances.total / nationalMetrics.finances.total) * 100;

    return [
      {
        label: 'Финансирование, млрд. тг',
        regionValue: `${formatNumber(adjustedMetrics.finances.total, { maximumFractionDigits: 1 })}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.total, { maximumFractionDigits: 1 })}`,
        delta: `${share.toFixed(1)}% доля`,
      },
      {
        label: 'Финансирование за прошлый год, млрд. тг',
        regionValue: `${formatNumber(adjustedMetrics.finances.lastYear, { maximumFractionDigits: 1 })}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.lastYear, { maximumFractionDigits: 1 })}`,
        delta: `${((adjustedMetrics.finances.lastYear / nationalMetrics.finances.lastYear) * 100).toFixed(1)}% доля`,
      },
      {
        label: 'Средняя статья расходов, тыс. тг',
        regionValue: `${formatNumber(adjustedMetrics.finances.avgExpense)}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.avgExpense)}`,
        delta: `${(adjustedMetrics.finances.avgExpense - nationalMetrics.finances.avgExpense).toFixed(0)} тг`,
      },
      {
        label: 'Освоение бюджета',
        regionValue: `${formatNumber(adjustedMetrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
        nationalValue: `${formatNumber(nationalMetrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
        delta: `${(adjustedMetrics.finances.budgetUsage - nationalMetrics.finances.budgetUsage).toFixed(1)} п.п.`,
      },
      {
        label: 'Региональные программы',
        regionValue: `${formatNumber(adjustedMetrics.finances.regionalPrograms)}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.regionalPrograms)}`,
        delta: `${(
          (adjustedMetrics.finances.regionalPrograms / nationalMetrics.finances.regionalPrograms) * 100
        ).toFixed(1)}% доля`,
      },
    ];
  }, [adjustedMetrics, nationalMetrics, selectedRegion]);

  const summaryCards = [
    {
      title: 'Общий бюджет',
      value: `${formatNumber(adjustedMetrics.finances.total, { maximumFractionDigits: 1 })} млрд. тг`,
      description: isNational
        ? 'Суммарный объем финансирования по Республике Казахстан'
        : 'Финансирование по выбранному региону',
    },
    {
      title: 'Последний финансовый год',
      value: `${formatNumber(adjustedMetrics.finances.lastYear, { maximumFractionDigits: 1 })} млрд. тг`,
      description: 'Фактически освоенные средства за прошлый год',
    },
    {
      title: 'Средняя статья расходов',
      value: `${formatNumber(adjustedMetrics.finances.avgExpense)} тыс. тг`,
      description: 'Средний объем финансирования на одну категорию расходов',
    },
    {
      title: 'Освоение бюджета',
      value: `${formatNumber(adjustedMetrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
      description: 'Доля освоенных средств от утвержденного бюджета',
    },
  ];

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionId(event.target.value as RegionId);
  };

  const handleIrnChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, irn: event.target.value }));
    },
    [setFilters],
  );

  const handleFinancingTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, financingType: event.target.value as FinancingType }));
    },
    [setFilters],
  );

  const handleCofinancingChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, cofinancing: event.target.value as CofinancingType }));
    },
    [setFilters],
  );

  const handleExpenseChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters((prev) => ({ ...prev, expense: event.target.value as ExpenseCategory }));
    },
    [setFilters],
  );

  const handlePeriodChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, period: Number(event.target.value) }));
    },
    [setFilters],
  );

  const handleMapSelect = useCallback(
    (regionId: string) => {
      const typedId = regionId as RegionId;
      const nextRegionId = selectedRegionId === typedId ? 'national' : typedId;
      setSelectedRegionId(nextRegionId);
    },
    [selectedRegionId, setSelectedRegionId],
  );

  return (
    <div className="finances-page">
      <header className="finances-header">
        <div>
          <h1>Финансы</h1>
          <p>
            Мониторинг финансирования проектов и подразделений {selectedRegion?.name ?? 'Республики Казахстан'}.
          </p>
        </div>
        <div className="finances-controls">
          <label className="sr-only" htmlFor="finances-region-select">
            Выберите регион
          </label>
          <select
            id="finances-region-select"
            value={selectedRegionId}
            onChange={handleRegionChange}
            className="finances-region-select"
          >
            <option value="national">Вся Республика Казахстан</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="finances-filter-bar" aria-label="Фильтры финансирования">
        <div className="finances-filter-group">
          <label htmlFor="filter-irn">ИРН</label>
          <select
            id="filter-irn"
            className="finances-filter-select"
            value={filters.irn}
            onChange={handleIrnChange}
          >
            {IRN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group finances-filter-group--range">
          <div className="finances-filter-label">
            <label htmlFor="filter-period">Период</label>
            <span className="finances-filter-value">{filters.period} г.</span>
          </div>
          <input
            id="filter-period"
            type="range"
            min={2020}
            max={2040}
            step={1}
            value={filters.period}
            onChange={handlePeriodChange}
            className="finances-filter-range"
          />
          <div className="finances-filter-scale">
            <span>2020</span>
            <span>2040</span>
          </div>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-type">Тип финансирования</label>
          <select
            id="filter-type"
            className="finances-filter-select"
            value={filters.financingType}
            onChange={handleFinancingTypeChange}
          >
            {FINANCING_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-cofinancing">Софинансирование</label>
          <select
            id="filter-cofinancing"
            className="finances-filter-select"
            value={filters.cofinancing}
            onChange={handleCofinancingChange}
          >
            {COFINANCING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-expense">Статьи расходов</label>
          <select
            id="filter-expense"
            className="finances-filter-select"
            value={filters.expense}
            onChange={handleExpenseChange}
          >
            {EXPENSE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="finances-visuals" aria-label="Визуализация финансирования">
        <article className="finances-map-card">
          <header className="finances-map-header">
            <div>
              <span className="finances-map-tag">Финансирование по регионам</span>
              <h2>{selectedRegion?.name ?? 'Республика Казахстан'}</h2>
            </div>
            <span className="finances-map-hint">Нажмите на регион для фильтрации</span>
          </header>

          <div className="finances-map-frame">
            <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleMapSelect} />
          </div>

          <div className="finances-map-stats">
            {mapHighlights.map((item) => (
              <div key={item.label} className="finances-map-stat">
                <span className="finances-map-stat-label">{item.label}</span>
                <span className="finances-map-stat-value">{item.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="finances-chart-card finances-chart-card--primary" aria-label="Динамика по годам">
          <header className="finances-chart-header">
            <h2>Одобренная сумма по годам</h2>
            <span>В триллионах тенге</span>
          </header>
          <div className="finances-chart">
            <Bar data={timelineChartData} options={timelineChartOptions} updateMode="resize" />
          </div>
        </article>

        <article className="finances-chart-card finances-chart-card--primary" aria-label="Структура финансирования">
          <header className="finances-chart-header">
            <h2>Структура финансирования</h2>
            <span>Программно-целевое vs грантовое</span>
          </header>
          <div className="finances-doughnut-wrapper">
            <Doughnut data={distributionChartData} options={distributionChartOptions} updateMode="resize" />
            <div className="finances-doughnut-center">
              <span className="value">
                {formatNumber(adjustedMetrics.finances.total, { maximumFractionDigits: 1 })}
              </span>
              <span className="label">млрд ₸</span>
            </div>
          </div>
        </article>

        <article
          className="finances-chart-card finances-chart-card--compact finances-chart-card--secondary"
          aria-label="Распределение по типам проектов"
        >
          <header className="finances-chart-header">
            <h2>Распределение бюджета</h2>
            <span>По типам проектной деятельности</span>
          </header>
          <div className="finances-chart finances-chart--horizontal">
            <Bar
              data={programFundingChartData}
              options={programFundingChartOptions}
              updateMode="resize"
            />
          </div>
        </article>

        <article
          className="finances-chart-card finances-chart-card--compact finances-chart-card--line"
          aria-label="Выполнение бюджета"
        >
          <header className="finances-chart-header">
            <h2>Выполнение бюджета</h2>
            <span>План vs факт освоения</span>
          </header>
          <div className="finances-chart finances-chart--line">
            <Line
              data={budgetExecutionChartData}
              options={budgetExecutionChartOptions}
              updateMode="resize"
            />
          </div>
        </article>
      </section>

      <section className="finances-summary" aria-label="Ключевые показатели">
        {summaryCards.map((card) => (
          <article key={card.title} className="finances-summary-card">
            <span className="finances-summary-title">{card.title}</span>
            <span className="finances-summary-value">{card.value}</span>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <div className="finances-grid">
        <section className="finances-top" aria-label="Лидеры по финансированию">
          <header className="finances-panel-header">
            <h2>Лидеры по финансированию</h2>
            <span>топ-6 регионов</span>
          </header>
          <table>
            <thead>
              <tr>
                <th>Регион</th>
                <th>Финансирование, млрд. тг</th>
                <th>Прошлый год</th>
                <th>Освоение бюджета</th>
              </tr>
            </thead>
            <tbody>
              {topRegions.map((region) => (
                <tr key={region.id} className={region.id === selectedRegionId ? 'active-row' : undefined}>
                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setSelectedRegionId(region.id as RegionId)}
                    >
                      {region.name}
                    </button>
                  </td>
                  <td>{formatNumber(region.total, { maximumFractionDigits: 1 })}</td>
                  <td>{formatNumber(region.lastYear, { maximumFractionDigits: 1 })}</td>
                  <td>{formatNumber(region.budgetUsage, { maximumFractionDigits: 1 })}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="finances-comparison" aria-label="Сравнение с национальными показателями">
          <header className="finances-panel-header">
            <h2>Сравнение с национальным уровнем</h2>
            {!isNational && <span>{selectedRegion?.name}</span>}
          </header>
          {isNational ? (
            <p className="finances-placeholder">
              Выберите регион, чтобы увидеть сравнение с национальными значениями.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Показатель</th>
                  <th>{selectedRegion?.shortName ?? 'Регион'}</th>
                  <th>Республика</th>
                  <th>Доля / Δ</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.regionValue}</td>
                    <td>{row.nationalValue}</td>
                    <td>{row.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default FinancesPage;
