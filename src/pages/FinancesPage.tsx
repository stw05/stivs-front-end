import React, { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import { calculateNationalMetrics, formatNumber } from '../utils/metrics';
import { DollarSign, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './FinancesPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

type FinancingType = 'gf' | 'pcf' | 'commercial';
type CofinancingType = 'contract' | 'actual';
type ExpenseCategory = 'salary' | 'travel' | 'support' | 'materials' | 'rent' | 'protocol';
type PriorityDirection = 'all' | 'digital' | 'education' | 'biotech' | 'energy';
type CompetitionName = 'all' | 'innovation' | 'grant2025' | 'pilot';
type ApplicantType = 'all' | 'universities' | 'companies' | 'research';
type CustomerType = 'all' | 'ministry' | 'state-companies' | 'private';
type ProjectStatus = 'all' | 'active' | 'completed' | 'pipeline';

interface FilterState {
  irn: string;
  period: number;
  financingType: FinancingType;
  cofinancing: CofinancingType;
  expense: ExpenseCategory;
  priority: PriorityDirection;
  competition: CompetitionName;
  applicant: ApplicantType;
  customer: CustomerType;
  status: ProjectStatus;
}

interface ChartFilterState {
  cofinancing: CofinancingType[];
  expenses: ExpenseCategory[];
  financingTypes: FinancingType[];
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

const PRIORITY_OPTIONS: Array<{ value: PriorityDirection; label: string }> = [
  { value: 'all', label: 'Все направления' },
  { value: 'digital', label: 'Цифровизация и ИИ' },
  { value: 'education', label: 'Образование и кадры' },
  { value: 'biotech', label: 'Биотех и медицина' },
  { value: 'energy', label: 'Энергетика и климат' },
];

const COMPETITION_OPTIONS: Array<{ value: CompetitionName; label: string }> = [
  { value: 'all', label: 'Все конкурсы' },
  { value: 'innovation', label: 'Инновационный драйвер' },
  { value: 'grant2025', label: 'Гранты 2025' },
  { value: 'pilot', label: 'Пилотные программы' },
];

const APPLICANT_OPTIONS: Array<{ value: ApplicantType; label: string }> = [
  { value: 'all', label: 'Все заявители' },
  { value: 'universities', label: 'Университеты' },
  { value: 'companies', label: 'Компании' },
  { value: 'research', label: 'НИИ и центры' },
];

const CUSTOMER_OPTIONS: Array<{ value: CustomerType; label: string }> = [
  { value: 'all', label: 'Все заказчики' },
  { value: 'ministry', label: 'Министерства' },
  { value: 'state-companies', label: 'Госкомпании' },
  { value: 'private', label: 'Частные заказчики' },
];

const STATUS_OPTIONS: Array<{ value: ProjectStatus; label: string }> = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'В реализации' },
  { value: 'completed', label: 'Завершены' },
  { value: 'pipeline', label: 'На рассмотрении' },
];

const DEFAULT_CHART_FILTERS: ChartFilterState = {
  cofinancing: COFINANCING_OPTIONS.map((option) => option.value),
  expenses: EXPENSE_OPTIONS.map((option) => option.value),
  financingTypes: FINANCING_TYPE_OPTIONS.map((option) => option.value),
};

const COFINANCING_YEAR_LABELS = ['2020', '2021', '2022', '2023', '2024'];

const EXPENSE_SHARES: Record<ExpenseCategory, number> = {
  salary: 0.32,
  travel: 0.08,
  support: 0.15,
  materials: 0.2,
  rent: 0.1,
  protocol: 0.15,
};

const EXPENSE_ACTIVE_COLORS = ['#2563eb', '#0ea5e9', '#14b8a6', '#f97316', '#f59e0b', '#a855f7'];

const FINANCING_TYPE_SHARES: Record<FinancingType, number> = {
  gf: 0.62,
  pcf: 0.26,
  commercial: 0.12,
};

const FINANCING_TYPE_COLORS = ['#1d4ed8', '#7c3aed', '#0ea5e9'];

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
    priority: 'all',
    competition: 'all',
    applicant: 'all',
    customer: 'all',
    status: 'all',
  });
  const [chartFilters, setChartFilters] = useState<ChartFilterState>({
    cofinancing: [],
    expenses: [],
    financingTypes: [],
  });
  const [isExpenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
  const [isFinancingDrawerOpen, setFinancingDrawerOpen] = useState(false);

  const handleChartFilterAdd = useCallback(<K extends keyof ChartFilterState>(key: K, value: ChartFilterState[K][number]) => {
    setChartFilters((prev) => {
      const current = prev[key] as Array<ChartFilterState[K][number]>;
      if (current.includes(value)) {
        return prev;
      }

      return {
        ...prev,
        [key]: [...current, value],
      } as ChartFilterState;
    });
  }, []);

  const handleChartFilterRemove = useCallback(<K extends keyof ChartFilterState>(key: K, value: ChartFilterState[K][number]) => {
    setChartFilters((prev) => {
      const current = prev[key] as Array<ChartFilterState[K][number]>;
      const filtered = current.filter((item) => item !== value);
      return {
        ...prev,
        [key]: filtered,
      } as ChartFilterState;
    });
  }, []);

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

  const selectedCofinancingFilters = chartFilters.cofinancing;
  const activeCofinancingFilters = selectedCofinancingFilters.length
    ? selectedCofinancingFilters
    : DEFAULT_CHART_FILTERS.cofinancing;

  const cofinancingChartData = useMemo(() => {
    const base = Math.max(adjustedMetrics.finances.total * 0.18, 1);
    const contractMultipliers = [0.72, 0.78, 0.86, 0.93, 1];
    const contractData = COFINANCING_YEAR_LABELS.map((_, index) =>
      Number((base * contractMultipliers[index]).toFixed(1)),
    );

    const factModifier = filters.cofinancing === 'actual' ? 1.06 : 0.98;
    const actualData = contractData.map((value, index) => {
      const drift = 0.9 + index * 0.035;
      return Number((value * drift * factModifier).toFixed(1));
    });

    const datasets = activeCofinancingFilters.map((filter) =>
      filter === 'contract'
        ? {
            label: 'По договору',
            data: contractData,
            backgroundColor: '#cbd5f5',
            borderRadius: 12,
            barThickness: 18,
            borderSkipped: false,
          }
        : {
            label: 'Фактическое',
            data: actualData,
            backgroundColor: '#2563eb',
            borderRadius: 12,
            barThickness: 18,
            borderSkipped: false,
          },
    );

    return {
      labels: COFINANCING_YEAR_LABELS,
      datasets,
    };
  }, [activeCofinancingFilters, adjustedMetrics.finances.total, filters.cofinancing]);

  const remainingCofinancingOptions = useMemo(
    () => COFINANCING_OPTIONS.filter((option) => !selectedCofinancingFilters.includes(option.value)),
    [selectedCofinancingFilters],
  );

  const cofinancingChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: '#0f172a',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 18,
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
              return `${label}: ${formatNumber(value, { maximumFractionDigits: 1 })} млрд ₸`;
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
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: {
            color: '#475569',
            callback: (value) => `${Number(value).toFixed(0)} млрд ₸`,
          },
        },
      },
    }),
    [],
  );

  const approvalChartData = useMemo(() => {
    const base = Math.max(adjustedMetrics.finances.lastYear * 0.8, 1);
    const progress = clampValue((filters.period - 2020) / 20, 0.2, 1.2);
    const multipliers = [0.84, 0.9, 0.98, 1.06, 1.12 * progress];

    const timeline = COFINANCING_YEAR_LABELS.map((_, index) =>
      Number((base * (multipliers[index] ?? 1)).toFixed(1)),
    );

    return {
      labels: COFINANCING_YEAR_LABELS,
      datasets: [
        {
          label: 'Одобренная сумма',
          data: timeline,
          backgroundColor: '#0ea5e9',
          hoverBackgroundColor: '#0369a1',
          borderRadius: 10,
          maxBarThickness: 32,
        },
      ],
    };
  }, [adjustedMetrics.finances.lastYear, filters.period]);

  const approvalChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
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
              const value = context.raw as number;
              return `${formatNumber(value, { maximumFractionDigits: 1 })} млрд ₸`;
            },
          },
        },
      },
      scales: {
        x: {
          border: { display: false },
          grid: { display: false },
          ticks: { color: '#475569' },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: {
            color: '#94a3b8',
            callback: (value) => `${value} млрд ₸`,
          },
        },
      },
    }),
    [],
  );

  const expenseBreakdown = useMemo(
    () =>
      EXPENSE_OPTIONS.map((option, index) => {
        const share = EXPENSE_SHARES[option.value];
        const value = Number((adjustedMetrics.finances.total * share).toFixed(1));
        return {
          key: option.value,
          label: option.label,
          value,
          percentage: Number((share * 100).toFixed(1)),
          color: EXPENSE_ACTIVE_COLORS[index],
        };
      }),
    [adjustedMetrics.finances.total],
  );

  const selectedExpenseFilters = chartFilters.expenses;
  const activeExpenseFilters = selectedExpenseFilters.length
    ? selectedExpenseFilters
    : DEFAULT_CHART_FILTERS.expenses;

  const filteredExpenses = useMemo(
    () => expenseBreakdown.filter((item) => activeExpenseFilters.includes(item.key)),
    [expenseBreakdown, activeExpenseFilters],
  );

  const selectedExpenseTotal = useMemo(
    () => filteredExpenses.reduce((acc, item) => acc + item.value, 0),
    [filteredExpenses],
  );

  const selectedExpenseLabel = useMemo(() => {
    if (!selectedExpenseFilters.length) {
      return 'Все категории';
    }
    if (filteredExpenses.length === 1) {
      return filteredExpenses[0]?.label ?? '';
    }
    return `Выбрано ${filteredExpenses.length}`;
  }, [filteredExpenses, selectedExpenseFilters.length]);

  const expenseChartData = useMemo(() => {
    return {
      labels: filteredExpenses.map((item) => item.label),
      datasets: [
        {
          data: filteredExpenses.map((item) => item.value),
          backgroundColor: filteredExpenses.map((item) => {
            const colorIndex = EXPENSE_OPTIONS.findIndex((option) => option.value === item.key);
            return EXPENSE_ACTIVE_COLORS[colorIndex] ?? '#2563eb';
          }),
          hoverBackgroundColor: filteredExpenses.map((item) => {
            const colorIndex = EXPENSE_OPTIONS.findIndex((option) => option.value === item.key);
            return EXPENSE_ACTIVE_COLORS[colorIndex] ?? '#1d4ed8';
          }),
          borderWidth: 0,
        },
      ],
    };
  }, [filteredExpenses]);

  const remainingExpenseOptions = useMemo(
    () => EXPENSE_OPTIONS.filter((option) => !selectedExpenseFilters.includes(option.value)),
    [selectedExpenseFilters],
  );

  const expenseChartOptions = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { weight: 600 },
          bodyFont: { weight: 500 },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const label = context.label ?? '';
              return `${label}: ${formatNumber(value, { maximumFractionDigits: 1 })} млрд ₸`;
            },
          },
        },
      },
    }),
    [],
  );

  const financingTypeBreakdown = useMemo(() => {
    const bonus = 0.05;
    const adjustedShares = FINANCING_TYPE_OPTIONS.map((option) => {
      const baseShare = FINANCING_TYPE_SHARES[option.value];
      if (option.value === filters.financingType) {
        return baseShare + bonus;
      }
      const remainder = FINANCING_TYPE_OPTIONS.length - 1;
      return clampValue(baseShare - bonus / Math.max(remainder, 1), 0.05, 1);
    });

    const shareSum = adjustedShares.reduce((acc, share) => acc + share, 0);

    return FINANCING_TYPE_OPTIONS.map((option, index) => {
      const share = adjustedShares[index] / shareSum;
      const value = Number((adjustedMetrics.finances.total * share).toFixed(1));
      return {
        key: option.value,
        label: option.label,
        value,
        percentage: Number((share * 100).toFixed(1)),
        color: FINANCING_TYPE_COLORS[index],
      };
    });
  }, [adjustedMetrics.finances.total, filters.financingType]);

  const selectedFinancingTypeFilters = chartFilters.financingTypes;
  const activeFinancingTypeFilters = selectedFinancingTypeFilters.length
    ? selectedFinancingTypeFilters
    : DEFAULT_CHART_FILTERS.financingTypes;

  const filteredFinancingTypes = useMemo(
    () => financingTypeBreakdown.filter((item) => activeFinancingTypeFilters.includes(item.key)),
    [financingTypeBreakdown, activeFinancingTypeFilters],
  );

  const selectedFinancingTypeTotal = useMemo(
    () => filteredFinancingTypes.reduce((acc, item) => acc + item.value, 0),
    [filteredFinancingTypes],
  );

  const selectedFinancingLabel = useMemo(() => {
    if (!selectedFinancingTypeFilters.length) {
      return 'Все типы';
    }
    if (filteredFinancingTypes.length === 1) {
      return filteredFinancingTypes[0]?.label ?? '';
    }
    return `Выбрано ${filteredFinancingTypes.length}`;
  }, [filteredFinancingTypes, selectedFinancingTypeFilters.length]);

  const financingTypeChartData = useMemo(() => {
    return {
      labels: filteredFinancingTypes.map((item) => item.label),
      datasets: [
        {
          data: filteredFinancingTypes.map((item) => item.value),
          backgroundColor: filteredFinancingTypes.map((item) => {
            const colorIndex = FINANCING_TYPE_OPTIONS.findIndex((option) => option.value === item.key);
            return FINANCING_TYPE_COLORS[colorIndex] ?? '#2563eb';
          }),
          hoverBackgroundColor: filteredFinancingTypes.map((item) => {
            const colorIndex = FINANCING_TYPE_OPTIONS.findIndex((option) => option.value === item.key);
            return FINANCING_TYPE_COLORS[colorIndex] ?? '#1d4ed8';
          }),
          borderWidth: 0,
        },
      ],
    };
  }, [filteredFinancingTypes]);

  const remainingFinancingTypeOptions = useMemo(
    () => FINANCING_TYPE_OPTIONS.filter((option) => !selectedFinancingTypeFilters.includes(option.value)),
    [selectedFinancingTypeFilters],
  );

  const financingTypeChartOptions = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { weight: 600 },
          bodyFont: { weight: 500 },
          callbacks: {
            label: (context) => {
              const value = context.raw as number;
              const label = context.label ?? '';
              return `${label}: ${formatNumber(value, { maximumFractionDigits: 1 })} млрд ₸`;
            },
          },
        },
      },
    }),
    [],
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

  const highlightCards = [
    {
      title: 'Общая сумма финансирования',
      value: `${formatNumber(adjustedMetrics.finances.total, { maximumFractionDigits: 1 })} млрд ₸`,
      icon: DollarSign,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#2563eb',
      accent: 'rgba(59, 130, 246, 0.35)',
    },
    {
      title: 'Сумма финансирования на текущий год',
      value: `${formatNumber(adjustedMetrics.finances.lastYear, { maximumFractionDigits: 1 })} млрд ₸`,
      icon: TrendingUp,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#059669',
      accent: 'rgba(16, 185, 129, 0.28)',
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

  const handleFinancingTypeSelect = useCallback(
    (value: FinancingType) => {
      setFilters((prev) => ({ ...prev, financingType: value }));
    },
    [setFilters],
  );

  const handleFinancingTypeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      handleFinancingTypeSelect(event.target.value as FinancingType);
    },
    [handleFinancingTypeSelect],
  );

  const handlePriorityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as PriorityDirection;
    setFilters((prev) => ({ ...prev, priority: value }));
  }, []);

  const handleCompetitionChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as CompetitionName;
    setFilters((prev) => ({ ...prev, competition: value }));
  }, []);

  const handleApplicantChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ApplicantType;
    setFilters((prev) => ({ ...prev, applicant: value }));
  }, []);

  const handleCustomerChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as CustomerType;
    setFilters((prev) => ({ ...prev, customer: value }));
  }, []);

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as ProjectStatus;
    setFilters((prev) => ({ ...prev, status: value }));
  }, []);

  const handleCofinancingChartSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as CofinancingType;
      if (!value) {
        return;
      }
      handleChartFilterAdd('cofinancing', value);
      event.currentTarget.value = '';
    },
    [handleChartFilterAdd],
  );

  const handleExpenseChartSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as ExpenseCategory;
      if (!value) {
        return;
      }
      handleChartFilterAdd('expenses', value);
      event.currentTarget.value = '';
    },
    [handleChartFilterAdd],
  );

  const handleFinancingTypeChartSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as FinancingType;
      if (!value) {
        return;
      }
      handleChartFilterAdd('financingTypes', value);
      event.currentTarget.value = '';
    },
    [handleChartFilterAdd],
  );

  const removeCofinancingChip = useCallback(
    (value: CofinancingType) => {
      handleChartFilterRemove('cofinancing', value);
    },
    [handleChartFilterRemove],
  );

  const removeExpenseChip = useCallback(
    (value: ExpenseCategory) => {
      handleChartFilterRemove('expenses', value);
    },
    [handleChartFilterRemove],
  );

  const removeFinancingChip = useCallback(
    (value: FinancingType) => {
      handleChartFilterRemove('financingTypes', value);
    },
    [handleChartFilterRemove],
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
          <label htmlFor="filter-priority">Приоритетные направления</label>
          <select
            id="filter-priority"
            className="finances-filter-select"
            value={filters.priority}
            onChange={handlePriorityChange}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-competition">Наименование конкурса</label>
          <select
            id="filter-competition"
            className="finances-filter-select"
            value={filters.competition}
            onChange={handleCompetitionChange}
          >
            {COMPETITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-applicant">Заявитель</label>
          <select
            id="filter-applicant"
            className="finances-filter-select"
            value={filters.applicant}
            onChange={handleApplicantChange}
          >
            {APPLICANT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-customer">Заказчик</label>
          <select
            id="filter-customer"
            className="finances-filter-select"
            value={filters.customer}
            onChange={handleCustomerChange}
          >
            {CUSTOMER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="finances-filter-group">
          <label htmlFor="filter-status">Статус</label>
          <select
            id="filter-status"
            className="finances-filter-select"
            value={filters.status}
            onChange={handleStatusChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="finances-visuals" aria-label="Визуализация финансирования">
        <div className="finances-top-row">
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
          </article>

          <article
            className="finances-chart-card finances-chart-card--primary finances-chart-card--expense"
            aria-label="Распределение объема финансирования по статьям расходов"
          >
            <header className="finances-chart-header">
              <h2>Распределение объема финансирования</h2>
              <span>Статьи расходов</span>
            </header>
            <div className="finances-chip-select-row">
              <label htmlFor="expenses-chart-filter">Добавить категорию</label>
              <select
                id="expenses-chart-filter"
                className="finances-chip-select"
                value=""
                onChange={handleExpenseChartSelect}
                disabled={remainingExpenseOptions.length === 0}
              >
                <option value="" disabled>
                  {remainingExpenseOptions.length ? 'Выберите категорию' : 'Все категории добавлены'}
                </option>
                {remainingExpenseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="finances-chip-list" aria-live="polite">
              {selectedExpenseFilters.length ? (
                selectedExpenseFilters.map((value) => {
                  const option = EXPENSE_OPTIONS.find((item) => item.value === value);
                  return (
                    <span key={value} className="finances-chip-pill">
                      {option?.label ?? value}
                      <button
                        type="button"
                        className="finances-chip-remove"
                        aria-label={`Убрать категорию ${option?.label ?? value}`}
                        onClick={() => removeExpenseChip(value)}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="finances-chip-placeholder">Категории не выбраны</span>
              )}
            </div>
            <div className="finances-distribution-content">
              <div className="finances-doughnut-wrapper finances-doughnut-wrapper--wide">
                <Doughnut data={expenseChartData} options={expenseChartOptions} updateMode="resize" />
                <div className="finances-doughnut-center">
                  <span className="value">
                    {formatNumber(selectedExpenseTotal, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="label">млрд ₸</span>
                  <span className="sub-label">{selectedExpenseLabel}</span>
                </div>
              </div>
              <button
                type="button"
                className="finances-drawer-toggle"
                onClick={() => setExpenseDrawerOpen((prev) => !prev)}
                aria-expanded={isExpenseDrawerOpen}
                aria-controls="expense-breakdown"
              >
                {isExpenseDrawerOpen ? 'Скрыть детализацию' : 'Показать детализацию'}
                <span aria-hidden="true">{isExpenseDrawerOpen ? '-' : '+'}</span>
              </button>
              <div
                id="expense-breakdown"
                className={`finances-breakdown-drawer${isExpenseDrawerOpen ? ' is-open' : ''}`}
              >
                <div
                  className="finances-breakdown-scroll"
                  role="region"
                  aria-label="Детализация расходов"
                  tabIndex={0}
                >
                  <ul className="finances-breakdown-list">
                    {filteredExpenses.map((item) => (
                      <li
                        key={item.key}
                        className={filters.expense === item.key ? 'active' : undefined}
                      >
                        <span
                          className="finances-breakdown-dot"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <div className="finances-breakdown-text">
                          <span className="finances-breakdown-value">
                            {formatNumber(item.value, { maximumFractionDigits: 1 })} млрд ₸
                          </span>
                          <span className="finances-breakdown-label">{item.label}</span>
                        </div>
                        <span className="finances-breakdown-percentage">{item.percentage.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>

          <article
            className="finances-chart-card finances-chart-card--compact finances-chart-card--donut"
            aria-label="Распределение финансирования по типу"
          >
            <header className="finances-chart-header">
              <h2>Распределение финансирования по типу</h2>
              <span>ГФ, ПЦФ и коммерциализация</span>
            </header>
            <div className="finances-chip-select-row">
              <label htmlFor="financing-type-chart-filter">Добавить тип</label>
              <select
                id="financing-type-chart-filter"
                className="finances-chip-select"
                value=""
                onChange={handleFinancingTypeChartSelect}
                disabled={remainingFinancingTypeOptions.length === 0}
              >
                <option value="" disabled>
                  {remainingFinancingTypeOptions.length ? 'Выберите тип' : 'Все типы добавлены'}
                </option>
                {remainingFinancingTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="finances-chip-list" aria-live="polite">
              {selectedFinancingTypeFilters.length ? (
                selectedFinancingTypeFilters.map((value) => {
                  const option = FINANCING_TYPE_OPTIONS.find((item) => item.value === value);
                  return (
                    <span key={value} className="finances-chip-pill">
                      {option?.label ?? value}
                      <button
                        type="button"
                        className="finances-chip-remove"
                        aria-label={`Убрать тип ${option?.label ?? value}`}
                        onClick={() => removeFinancingChip(value)}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="finances-chip-placeholder">Типы не выбраны</span>
              )}
            </div>
            <div className="finances-distribution-content">
              <div className="finances-doughnut-wrapper finances-doughnut-wrapper--wide">
                <Doughnut
                  data={financingTypeChartData}
                  options={financingTypeChartOptions}
                  updateMode="resize"
                />
                <div className="finances-doughnut-center">
                  <span className="value">
                    {formatNumber(selectedFinancingTypeTotal, { maximumFractionDigits: 1 })}
                  </span>
                  <span className="label">млрд ₸</span>
                  <span className="sub-label">{selectedFinancingLabel}</span>
                </div>
              </div>
              <button
                type="button"
                className="finances-drawer-toggle"
                onClick={() => setFinancingDrawerOpen((prev) => !prev)}
                aria-expanded={isFinancingDrawerOpen}
                aria-controls="financing-breakdown"
              >
                {isFinancingDrawerOpen ? 'Скрыть детализацию' : 'Показать детализацию'}
                <span aria-hidden="true">{isFinancingDrawerOpen ? '-' : '+'}</span>
              </button>
              <div
                id="financing-breakdown"
                className={`finances-breakdown-drawer${isFinancingDrawerOpen ? ' is-open' : ''}`}
              >
                <div
                  className="finances-breakdown-scroll"
                  role="region"
                  aria-label="Распределение по типам"
                  tabIndex={0}
                >
                  <ul className="finances-breakdown-list finances-breakdown-list--inline">
                    {filteredFinancingTypes.map((item) => (
                      <li
                        key={item.key}
                        className={filters.financingType === item.key ? 'active' : undefined}
                      >
                        <span
                          className="finances-breakdown-dot"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span className="finances-breakdown-label">{item.label}</span>
                        <span className="finances-breakdown-value">
                          {formatNumber(item.value, { maximumFractionDigits: 1 })} млрд ₸
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="finances-line-column">
          <article className="finances-chart-card finances-chart-card--primary" aria-label="Софинансирование по годам">
            <header className="finances-chart-header">
              <h2>Софинансирование по годам</h2>
              <span>Контрактные обязательства и факт</span>
            </header>
            <div className="finances-chip-select-row">
              <label htmlFor="cofinancing-chart-filter">Добавить фильтр</label>
              <select
                id="cofinancing-chart-filter"
                className="finances-chip-select"
                value=""
                onChange={handleCofinancingChartSelect}
                disabled={remainingCofinancingOptions.length === 0}
              >
                <option value="" disabled>
                  {remainingCofinancingOptions.length ? 'Выберите показатель' : 'Все варианты добавлены'}
                </option>
                {remainingCofinancingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="finances-chip-list" aria-live="polite">
              {selectedCofinancingFilters.length ? (
                selectedCofinancingFilters.map((value) => {
                  const option = COFINANCING_OPTIONS.find((item) => item.value === value);
                  return (
                    <span key={value} className="finances-chip-pill">
                      {option?.label ?? value}
                      <button
                        type="button"
                        className="finances-chip-remove"
                        aria-label={`Убрать фильтр ${option?.label ?? value}`}
                        onClick={() => removeCofinancingChip(value)}
                      >
                        ×
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="finances-chip-placeholder">Фильтры не выбраны</span>
              )}
            </div>
            <div className="finances-chart">
              <Bar data={cofinancingChartData} options={cofinancingChartOptions} updateMode="resize" />
            </div>
          </article>

          <article
            className="finances-chart-card finances-chart-card--compact finances-chart-card--approval"
            aria-label="Одобренная сумма по годам"
          >
            <header className="finances-chart-header">
              <h2>Одобренная сумма по годам</h2>
              <span>В млрд ₸</span>
            </header>
            <div className="finances-chart finances-chart--mini">
              <Bar data={approvalChartData} options={approvalChartOptions} updateMode="resize" />
            </div>
          </article>
        </div>
      </section>

      <section className="finances-highlight" aria-label="Ключевые показатели">
        {highlightCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="finances-highlight-card"
              style={{ '--highlight-accent': card.accent } as CSSProperties}
            >
              <span className="finances-highlight-icon" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="finances-highlight-content">
                <span className="finances-highlight-label">{card.title}</span>
                <span className="finances-highlight-value">{card.value}</span>
              </div>
            </article>
          );
        })}
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
