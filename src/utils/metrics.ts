import { regionsData } from '../components/Home/regionsData';
import type { RegionMetrics, RegionShape } from '../components/Home/regionsData';

export interface FinancingTimelinePoint {
  label: string;
  value: number;
}

export interface FinancingDistribution {
  programmatic: number;
  grants: number;
}

export interface ProgramFundingPoint {
  label: string;
  value: number;
}

export interface BudgetExecutionSeries {
  labels: string[];
  planned: number[];
  fact: number[];
}

export interface PublicationTimelinePoint {
  label: string;
  value: number;
}

export interface PublicationTypeDistribution {
  journals: number;
  conferences: number;
  books: number;
  other: number;
}

export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
): string => {
  const mergedOptions: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
    ...options,
  };

  return new Intl.NumberFormat('ru-RU', mergedOptions).format(value);
};

export const calculateNationalMetrics = (
  regions: RegionShape[] = regionsData,
): RegionMetrics => {
  const summary: RegionMetrics = {
    projects: {
      total: 0,
      grants: 0,
      programs: 0,
      contracts: 0,
      commercialization: 0,
      avgDuration: 0,
    },
    publications: {
      total: 0,
      journals: 0,
      conferences: 0,
      books: 0,
      other: 0,
    },
    people: {
      total: 0,
      docents: 0,
      professors: 0,
      associateProfessors: 0,
      avgAge: 0,
    },
    finances: {
      total: 0,
      lastYear: 0,
      avgExpense: 0,
      budgetUsage: 0,
      regionalPrograms: 0,
    },
  };

  let durationAccumulator = 0;
  let durationWeight = 0;
  let ageAccumulator = 0;
  let ageWeight = 0;
  let usageAccumulator = 0;
  let usageWeight = 0;

  regions.forEach((region) => {
    const stats = region.stats;

    summary.projects.total += stats.projects.total;
    summary.projects.grants += stats.projects.grants;
    summary.projects.programs += stats.projects.programs;
    summary.projects.contracts += stats.projects.contracts;
    summary.projects.commercialization += stats.projects.commercialization;
    durationAccumulator += stats.projects.avgDuration * stats.projects.total;
    durationWeight += stats.projects.total;

    summary.publications.total += stats.publications.total;
    summary.publications.journals += stats.publications.journals;
    summary.publications.conferences += stats.publications.conferences;
    summary.publications.books += stats.publications.books;
    summary.publications.other += stats.publications.other;

    summary.people.total += stats.people.total;
    summary.people.docents += stats.people.docents;
    summary.people.professors += stats.people.professors;
    summary.people.associateProfessors += stats.people.associateProfessors;
    ageAccumulator += stats.people.avgAge * stats.people.total;
    ageWeight += stats.people.total;

    summary.finances.total += stats.finances.total;
    summary.finances.lastYear += stats.finances.lastYear;
    summary.finances.avgExpense += stats.finances.avgExpense * stats.finances.total;
    summary.finances.regionalPrograms += stats.finances.regionalPrograms;
    usageAccumulator += stats.finances.budgetUsage * stats.finances.total;
    usageWeight += stats.finances.total;
  });

  summary.projects.avgDuration = durationWeight ? durationAccumulator / durationWeight : 0;
  summary.people.avgAge = ageWeight ? ageAccumulator / ageWeight : 0;
  summary.finances.avgExpense = summary.finances.total
    ? summary.finances.avgExpense / summary.finances.total
    : 0;
  summary.finances.budgetUsage = usageWeight ? usageAccumulator / usageWeight : 0;

  return summary;
};

const roundFinancial = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const buildFinancingTimeline = (
  finances: RegionMetrics['finances'],
): FinancingTimelinePoint[] => {
  const base = Math.max(finances.total, 1);
  const lastYear = Math.max(finances.lastYear, base * 0.08);

  const planHorizon = Math.max(base * 0.44, lastYear * 1.6);
  const mediumTerm = Math.max(base * 0.3, lastYear * 1.1);
  const carryOver = Math.max(base * 0.18, lastYear * 0.75);
  const executed = Math.max(lastYear * 0.95, base * 0.12);
  const reserve = Math.max(base * 0.08, lastYear * 0.35);

  const timeline: FinancingTimelinePoint[] = [
    { label: '2024‒2026', value: planHorizon },
    { label: '2023‒2025', value: mediumTerm },
    { label: '2022‒2024', value: carryOver },
    { label: '2023‒2024', value: executed },
    { label: '2024‒2025', value: reserve },
  ];

  return timeline.map((point) => ({
    label: point.label,
    value: roundFinancial(point.value),
  }));
};

export const buildFinancingDistribution = (
  finances: RegionMetrics['finances'],
): FinancingDistribution => {
  const base = Math.max(finances.total, 0);

  if (base === 0) {
    return { programmatic: 0, grants: 0 };
  }

  const regionalFactor = finances.regionalPrograms * 0.85;
  const inferredShare = regionalFactor / base;
  const programmaticShare = Math.min(Math.max(0.52, inferredShare + 0.45), 0.78);

  const programmatic = roundFinancial(base * programmaticShare);
  const grantsRaw = base - programmatic;
  const grants = roundFinancial(Math.max(grantsRaw, base * 0.18));

  const normaliser = programmatic + grants;

  if (!normaliser) {
    return { programmatic: 0, grants: 0 };
  }

  const scale = base / normaliser;

  return {
    programmatic: roundFinancial(programmatic * scale),
    grants: roundFinancial(grants * scale),
  };
};

export const buildProgramFundingBreakdown = (
  metrics: RegionMetrics,
): ProgramFundingPoint[] => {
  const totalProjects = Math.max(metrics.projects.total, 1);
  const baseBudget = Math.max(metrics.finances.total, 0);

  if (baseBudget === 0) {
    return [
      { label: 'Гранты', value: 0 },
      { label: 'Программы', value: 0 },
      { label: 'Договоры', value: 0 },
      { label: 'Коммерциализация', value: 0 },
    ];
  }

  const categories = [
    { label: 'Гранты', count: metrics.projects.grants },
    { label: 'Программы', count: metrics.projects.programs },
    { label: 'Договоры', count: metrics.projects.contracts },
    { label: 'Коммерциализация', count: metrics.projects.commercialization },
  ];

  return categories.map((category) => {
    const share = category.count / totalProjects;
    const value = roundFinancial(baseBudget * share);
    return {
      label: category.label,
      value,
    } satisfies ProgramFundingPoint;
  });
};

const clampNonNegative = (value: number): number => {
  return Math.max(0, Math.round(value));
};

export const buildPublicationTimeline = (
  publications: RegionMetrics['publications'],
): PublicationTimelinePoint[] => {
  const total = Math.max(publications.total, 0);
  const baseShares = [0.12, 0.14, 0.16, 0.18, 0.2, 0.2];
  const labels = ['2019', '2020', '2021', '2022', '2023', '2024'];

  if (total === 0) {
    return labels.map((label) => ({ label, value: 0 }));
  }

  const scale = total / baseShares.reduce((acc, share) => acc + share, 0);
  const values = baseShares.map((share) => clampNonNegative(share * scale));
  const diff = total - values.reduce((acc, value) => acc + value, 0);
  values[values.length - 1] = clampNonNegative(values[values.length - 1] + diff);

  return labels.map((label, index) => ({ label, value: values[index] ?? 0 }));
};

export const buildPublicationTypeDistribution = (
  publications: RegionMetrics['publications'],
): PublicationTypeDistribution => {
  return {
    journals: clampNonNegative(publications.journals),
    conferences: clampNonNegative(publications.conferences),
    books: clampNonNegative(publications.books),
    other: clampNonNegative(publications.other),
  };
};

export const buildBudgetExecutionSeries = (
  finances: RegionMetrics['finances'],
  timeline: FinancingTimelinePoint[],
): BudgetExecutionSeries => {
  const labels = timeline.map((point) => point.label);
  const baseUsage = clamp(finances.budgetUsage, 45, 98);
  const executedShare = finances.total
    ? clamp((finances.lastYear / finances.total) * 100, 25, 96)
    : clamp(finances.budgetUsage, 45, 98);

  const planAdjustments = [-6, -3, -1, 2, 3];
  const factAdjustments = [-8, -4, -2, 1, 0];

  const planned = labels.map((_, index) => {
    const offset = planAdjustments[index] ?? 0;
    return clamp(baseUsage + offset, 40, 100);
  });

  const fact = labels.map((_, index) => {
    const offset = factAdjustments[index] ?? 0;
    return clamp(baseUsage + offset, 35, 100);
  });

  if (fact.length > 0) {
    fact[fact.length - 1] = clamp(executedShare, 30, 100);
  }

  return {
    labels,
    planned,
    fact,
  };
};
