import React, { useCallback, useMemo, useState, useRef, type CSSProperties } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Bar, Doughnut, Chart as ChartComponent } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import { formatNumber } from '../utils/metrics';
import './PublicationsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  LineController,
);

const YEAR_RANGE = { min: 2020, max: 2025 } as const;

interface FilterState {
  startYear: number;
  endYear: number;
  irn: string;
  financingType: string;
  priority: string;
  contest: string;
  applicant: string;
  customer: string;
  mrnti: string;
  status: string;
  trl: string;
}

const defaultFilters: FilterState = {
  startYear: YEAR_RANGE.min,
  endYear: YEAR_RANGE.max,
  irn: 'all',
  financingType: 'all',
  priority: 'all',
  contest: 'all',
  applicant: 'all',
  customer: 'all',
  mrnti: 'all',
  status: 'all',
  trl: 'all',
};

const irnOptions = ['all', 'IRN-001', 'IRN-045', 'IRN-512', 'IRN-970'];
const mrntiOptions = ['all', '11.00.00', '21.45.10', '27.00.00'];
const trlOptions = ['all', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'];

// Helper function to get translated publication filter options
const getPublicationFilterOptions = (t: (key: string) => string) => ({
  contests: [
    { value: 'all', label: t('pub_contests_all') },
    { value: 'national', label: t('pub_contests_national') },
    { value: 'grants', label: t('pub_contests_grants') },
    { value: 'programs', label: t('pub_contests_programs') },
  ],
  applicants: [
    { value: 'all', label: t('pub_applicants_all') },
    { value: 'kaznu', label: t('pub_applicants_kaznu') },
    { value: 'enu', label: t('pub_applicants_enu') },
    { value: 'nazarbayev', label: t('pub_applicants_nazarbayev') },
    { value: 'kaztk', label: t('pub_applicants_kaztk') },
  ],
  customers: [
    { value: 'all', label: t('pub_customers_all') },
    { value: 'minedu', label: t('pub_customers_minedu') },
    { value: 'minhealth', label: t('pub_customers_minhealth') },
    { value: 'mindigital', label: t('pub_customers_mindigital') },
  ],
  statusOptions: [
    { value: 'all', label: t('pub_status_all') },
    { value: 'inprogress', label: t('pub_status_inprogress') },
    { value: 'completed', label: t('pub_status_completed') },
    { value: 'pending', label: t('pub_status_pending') },
  ],
});

// Данные для графиков и карточек
const publicationYears = ['2020', '2021', '2022', '2023', '2024', '2025'];
const domesticPublications = [536, 1095, 1194, 1190, 976, 553];
const foreignPublications = [858, 1719, 1698, 1799, 1347, 810];

const scopusSiteScore = [5000, 5000, 2000, 2000];
const wosQuartiles = [10000, 8000, 8000, 5000];

const implementationTrend = {
  implementation: [319, 634, 657, 617, 633, 305],
  trl: [97, 219, 151, 129, 105, 58],
};

const patentTrend = {
  patents: [58, 123, 126, 105, 95, 70],
  deployments: [97, 219, 151, 129, 105, 58],
};

type CSSVars = CSSProperties & { '--accent'?: string };

const getHighlightCards = (t: (key: string) => string) => [
  { id: 'total', label: t('publications_card_total'), value: '17 130', accent: '#1d4ed8' },
  { id: 'domestic', label: t('publications_card_domestic'), value: '6 092', accent: '#16a34a' },
  { id: 'foreign', label: t('publications_card_foreign'), value: '11 038', accent: '#7c3aed' },
  { id: 'scopus', label: t('publications_card_scopus'), value: '1 498', accent: '#4338ca' },
  { id: 'wos', label: t('publications_card_wos'), value: '5 282', accent: '#0ea5e9' },
  { id: 'patents', label: t('publications_card_patents'), value: '2 792', accent: '#ea580c' },
  { id: 'implementations', label: t('publications_card_implementations'), value: '414', accent: '#db2777' },
  { id: 'projects', label: t('publications_card_projects'), value: '127', accent: '#059669' },
];

const getPriorityPerformance = (t: (key: string) => string) => [
  { label: t('publications_priority_digitalization'), value: 3279 },
  { label: t('publications_priority_ai'), value: 1005 },
  { label: t('publications_priority_medicine'), value: 674 },
  { label: t('publications_priority_geology'), value: 577 },
  { label: t('publications_priority_life_sciences'), value: 404 },
  { label: t('publications_priority_intellectual'), value: 386 },
  { label: t('publications_priority_sustainable_resources'), value: 378 },
  { label: t('publications_priority_ict'), value: 377 },
  { label: t('publications_priority_energy'), value: 331 },
  { label: t('publications_priority_sustainable_development'), value: 224 },
  { label: t('publications_priority_national_security'), value: 121 },
  { label: t('publications_priority_advanced_manufacturing'), value: 58 },
  { label: t('publications_priority_ecology'), value: 44 },
  { label: t('publications_priority_culture'), value: 11 },
  { label: t('publications_priority_youth'), value: 4 },
];

const getTopApplicants = (t: (key: string) => string) => [
  { id: 'kaznu', name: t('publications_university_kaznu'), value: 826 },
  { id: 'enu', name: t('publications_university_enu'), value: 765 },
  { id: 'kaznpu', name: t('publications_university_kaznpu'), value: 372 },
  { id: 'karu', name: t('publications_university_karu'), value: 360 },
  { id: 'kit', name: t('publications_university_kaznitu'), value: 252 },
];

const filterSelect = (
  id: string,
  label: string,
  value: string,
  options: Array<{ value: string; label: string }>,
  onChange: (next: string) => void,
) => (
  <label className="publications-filter-item" htmlFor={id} key={id}>
    <span>{label}</span>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const PublicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const { selectedRegion, selectedRegionId, setSelectedRegionId, regions } = useRegionContext();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const statsScrollRef = useRef<HTMLDivElement | null>(null);
  const statsDragRef = useRef<{ pointerId: number | null; startX: number; scrollLeft: number }>(
    { pointerId: null, startX: 0, scrollLeft: 0 },
  );
  const [isDraggingStats, setIsDraggingStats] = useState(false);

  // Get translated filter options
  const translatedFilterOptions = useMemo(() => getPublicationFilterOptions(t), [t]);

  const handleRangeChange = (key: 'startYear' | 'endYear', value: number) => {
    setFilters((prev) => {
      if (key === 'startYear') {
        const nextStart = Math.min(value, prev.endYear);
        return { ...prev, startYear: nextStart };
      }
      const nextEnd = Math.max(value, prev.startYear);
      return { ...prev, endYear: nextEnd };
    });
  };

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setSelectedRegionId('national');
  };
  const handleStatsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = statsScrollRef.current;
    if (!container) {
      return;
    }
    statsDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
    };
    container.setPointerCapture(event.pointerId);
    setIsDraggingStats(true);
  };

  const handleStatsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingStats) {
      return;
    }
    const container = statsScrollRef.current;
    if (!container) {
      return;
    }
    const delta = event.clientX - statsDragRef.current.startX;
    container.scrollLeft = statsDragRef.current.scrollLeft - delta;
  };

  const stopStatsDragging = () => {
    if (!isDraggingStats) {
      return;
    }
    const container = statsScrollRef.current;
    const pointerId = statsDragRef.current.pointerId;
    if (container && pointerId !== null) {
      try {
        container.releasePointerCapture(pointerId);
      } catch {
        /* ignore cleanup errors */
      }
    }
    statsDragRef.current.pointerId = null;
    setIsDraggingStats(false);
  };

  const handleMapSelect = useCallback(
    (regionId: string) => {
      const typedId = regionId as RegionId;
      const nextRegionId = selectedRegionId === typedId ? 'national' : typedId;
      setSelectedRegionId(nextRegionId);
    },
    [selectedRegionId, setSelectedRegionId],
  );

  const rangeBackgroundStyle = useMemo(() => {
    const total = YEAR_RANGE.max - YEAR_RANGE.min;
    const startPercent = ((filters.startYear - YEAR_RANGE.min) / total) * 100;
    const endPercent = ((filters.endYear - YEAR_RANGE.min) / total) * 100;
    return {
      '--range-start': `${startPercent}%`,
      '--range-end': `${endPercent}%`,
    } as CSSProperties;
  }, [filters.startYear, filters.endYear]);

  const publicationDynamicsData = useMemo(
    () => ({
      labels: publicationYears,
      datasets: [
        {
          label: t('publications_chart_domestic'),
          data: domesticPublications,
          backgroundColor: '#1d4ed8',
          borderRadius: 10,
          stack: 'publications',
        },
        {
          label: t('publications_chart_foreign'),
          data: foreignPublications,
          backgroundColor: '#60a5fa',
          borderRadius: 10,
          stack: 'publications',
        },
      ],
    }),
    [t],
  );

  const publicationDynamicsOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${formatNumber(Number(context.raw))}`,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
          ticks: {
            callback: (value) => formatNumber(Number(value)),
          },
        },
      },
    }),
    [],
  );

  const scopusChartData = useMemo(
    () => ({
      labels: ['90%', '80%', '70%', '60%'],
      datasets: [
        {
          data: scopusSiteScore,
          backgroundColor: ['#0ea5e9', '#1d4ed8', '#ea580c', '#6d28d9'],
          borderWidth: 0,
        },
      ],
    }),
    [],
  );

  const doughnutOptions = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, pointStyle: 'circle' },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatNumber(Number(context.raw))}`,
          },
        },
      },
    }),
    [],
  );

  const wosChartData = useMemo(
    () => ({
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          data: wosQuartiles,
          backgroundColor: ['#0ea5e9', '#1d4ed8', '#ea580c', '#6d28d9'],
          borderWidth: 0,
        },
      ],
    }),
    [],
  );

  const priorityPerformance = useMemo(() => getPriorityPerformance(t), [t]);

  const priorityChartData = useMemo(
    () => ({
      labels: priorityPerformance.map((item) => item.label),
      datasets: [
        {
          data: priorityPerformance.map((item) => item.value),
          backgroundColor: '#2563eb',
          borderRadius: 12,
          barThickness: 18,
        },
      ],
    }),
    [priorityPerformance]);

  const priorityChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${formatNumber(Number(context.raw))} публикаций`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(226,232,240,0.5)', drawBorder: false },
          ticks: {
            callback: (value) => `${formatNumber(Number(value))}`,
          },
        },
        y: {
          grid: { display: false },
        },
      },
    }),
    [],
  );

  const implementationChartData = useMemo<ChartData<'bar' | 'line'>>(
    () => ({
      labels: publicationYears,
      datasets: [
        {
          type: 'bar' as const,
          label: t('publications_chart_implementations_projects'),
          data: implementationTrend.implementation,
          backgroundColor: '#38bdf8',
          borderRadius: 12,
          maxBarThickness: 36,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: t('publications_chart_implementations_trl'),
          data: implementationTrend.trl,
          borderColor: '#0f172a',
          backgroundColor: '#0f172a',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 4,
          yAxisID: 'y1',
        },
      ],
    }),
    [t],
  );

  const implementationChartOptions = useMemo<ChartOptions<'bar' | 'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    [],
  );

  const patentsChartData = useMemo(
    () => ({
      labels: publicationYears,
      datasets: [
        {
          label: t('publications_chart_patents_label'),
          data: patentTrend.patents,
          backgroundColor: '#1d4ed8',
          borderRadius: 12,
          maxBarThickness: 32,
        },
        {
          label: t('publications_chart_deployments'),
          data: patentTrend.deployments,
          backgroundColor: '#0ea5e9',
          borderRadius: 12,
          maxBarThickness: 32,
        },
      ],
    }),
    [t],
  );

  const patentsChartOptions = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: 'rgba(226,232,240,0.6)', drawBorder: false } },
      },
    }),
    [],
  );

  const highlightCards = useMemo(() => getHighlightCards(t), [t]);
  const topApplicants = useMemo(() => getTopApplicants(t), [t]);
  const totalApplicantPublications = topApplicants.reduce((sum, applicant) => sum + applicant.value, 0);

  return (
    <div className="publications-page">
      <header className="publications-page-header">
        <div>
          <h1>{t('publications_page_heading')}</h1>
          <p>{t('publications_page_description')}</p>
        </div>
        <div className="publications-header-actions">
          <button type="button" className="publications-export-button">
            <Download size={18} />
            {t('publications_export_button')}
          </button>
        </div>
      </header>

      <section className="publications-stats-row" aria-label={t('publications_stats_aria')}>
        <div
          className={`publications-stats-scroll${isDraggingStats ? ' is-dragging' : ''}`}
          ref={statsScrollRef}
          onPointerDown={handleStatsPointerDown}
          onPointerMove={handleStatsPointerMove}
          onPointerUp={stopStatsDragging}
          onPointerCancel={stopStatsDragging}
          onPointerLeave={stopStatsDragging}
        >
          {highlightCards.map((card) => (
            <article
              key={card.id}
              className="publications-stat-card"
              style={{ '--accent': card.accent } as CSSVars}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="publications-map-and-filter">
        <article className="publications-map-panel">
          <header>
            <div>
              <p>{t('publications_map_title')}</p>
              <h2>{selectedRegion?.name ?? t('republic_kazakhstan')}</h2>
            </div>
            <small>{t('publications_map_hint')}</small>
          </header>
          <div className="publications-map-wrapper">
            <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleMapSelect} />
          </div>
        </article>

        <article className="publications-filters-panel">
          <header>
            <h2>{t('publications_filters_title')}</h2>
          </header>

          <section className="publications-filter-group" aria-label={t('publications_filters_years_aria')}>
            <div className="publications-filter-title">{t('publications_filters_years_title')}</div>
            <div className="period-range-slider" style={rangeBackgroundStyle}>
              <div className="period-range-values">
                <span className="period-range-value">{filters.startYear}</span>
                <span className="period-range-value">{filters.endYear}</span>
              </div>
              <div className="period-range-track" />
              <div className="period-range-inputs">
                <input
                  type="range"
                  min={YEAR_RANGE.min}
                  max={YEAR_RANGE.max}
                  value={filters.startYear}
                  onChange={(event) => handleRangeChange('startYear', Number(event.target.value))}
                  className="period-range-thumb"
                />
                <input
                  type="range"
                  min={YEAR_RANGE.min}
                  max={YEAR_RANGE.max}
                  value={filters.endYear}
                  onChange={(event) => handleRangeChange('endYear', Number(event.target.value))}
                  className="period-range-thumb period-range-thumb--upper"
                />
              </div>
            </div>
          </section>

          <div className="publications-filter-grid">
            {filterSelect(
              'filter-irn',
              'IRN',
              filters.irn,
              irnOptions.map((value) => ({ value, label: value === 'all' ? t('pub_contests_all') : value })),
              (value) => handleSelectChange('irn', value),
            )}
            {filterSelect(
              'filter-financing',
              t('pub_filter_financing_type'),
              filters.financingType,
              [
                { value: 'all', label: t('fin_all_types') },
                { value: 'grant', label: t('pub_financing_grant') },
                { value: 'program', label: t('pub_financing_program') },
                { value: 'contract', label: t('pub_financing_contract') },
              ],
              (value) => handleSelectChange('financingType', value),
            )}
            {filterSelect(
              'filter-priority',
              t('pub_filter_priority_direction'),
              filters.priority,
              [
                { value: 'all', label: t('pub_priority_all') },
                { value: 'health', label: t('pub_priority_health') },
                { value: 'economy', label: t('pub_priority_economy') },
                { value: 'energy', label: t('pub_priority_energy') },
                { value: 'ai', label: t('pub_priority_ai') },
              ],
              (value) => handleSelectChange('priority', value),
            )}
            {filterSelect(
              'filter-contest',
              t('pub_filter_contest_name'),
              filters.contest,
              translatedFilterOptions.contests,
              (value) => handleSelectChange('contest', value),
            )}
            {filterSelect(
              'filter-applicant',
              t('pub_filter_applicant'),
              filters.applicant,
              translatedFilterOptions.applicants,
              (value) => handleSelectChange('applicant', value),
            )}
            {filterSelect(
              'filter-customer',
              t('pub_filter_customer'),
              filters.customer,
              translatedFilterOptions.customers,
              (value) => handleSelectChange('customer', value),
            )}
            {filterSelect(
              'filter-mrnti',
              t('pub_filter_mrnti'),
              filters.mrnti,
              mrntiOptions.map((value) => ({ value, label: value === 'all' ? t('fin_all_types') : value })),
              (value) => handleSelectChange('mrnti', value),
            )}
            {filterSelect(
              'filter-status',
              t('pub_filter_status'),
              filters.status,
              translatedFilterOptions.statusOptions,
              (value) => handleSelectChange('status', value),
            )}
            <label className="publications-filter-item" htmlFor="filter-region">
              <span>{t('pub_filter_region')}</span>
              <select
                id="filter-region"
                value={selectedRegionId}
                onChange={(event) => setSelectedRegionId(event.target.value as RegionId)}
              >
                <option value="national">{t('pub_region_all')}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
            {filterSelect(
              'filter-trl',
              'TRL',
              filters.trl,
              trlOptions.map((value) => ({ value, label: value === 'all' ? t('fin_all_types') : value })),
              (value) => handleSelectChange('trl', value),
            )}
          </div>

          <div className="publications-filter-actions">
            <button type="button" onClick={handleResetFilters}>{t('pub_button_reset_filters')}</button>
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>{t('publications_chart_dynamics')}</h3>
            <p>{t('publications_chart_dynamics_subtitle')}</p>
          </header>
          <div className="chart-body">
            <Bar data={publicationDynamicsData} options={publicationDynamicsOptions} />
          </div>
        </article>

        <article className="publications-chart-card">
          <header>
            <h3>{t('publications_chart_scopus')}</h3>
          </header>
          <div className="chart-body">
            <Doughnut data={scopusChartData} options={doughnutOptions} />
          </div>
        </article>

        <article className="publications-chart-card">
          <header>
            <h3>{t('publications_chart_wos')}</h3>
          </header>
          <div className="chart-body">
            <Doughnut data={wosChartData} options={doughnutOptions} />
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>{t('publications_chart_priority')}</h3>
            <p>{t('publications_chart_priority_subtitle')}</p>
          </header>
          <div className="chart-body">
            <Bar data={priorityChartData} options={priorityChartOptions} />
          </div>
        </article>

        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>{t('publications_chart_implementation')}</h3>
          </header>
          <div className="chart-body">
            <ChartComponent type="bar" data={implementationChartData} options={implementationChartOptions} />
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>{t('publications_chart_applicants')}</h3>
            <p>{t('publications_chart_applicants_subtitle')}</p>
          </header>
          <div className="top-applicants-list">
            {topApplicants.map((applicant) => {
              const share = (applicant.value / totalApplicantPublications) * 100;
              return (
                <div key={applicant.id} className="top-applicant-row">
                  <div>
                    <strong>{applicant.name}</strong>
                    <span>{formatNumber(applicant.value)}</span>
                  </div>
                  <div className="top-applicant-bar">
                    <span style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="top-applicant-total">
              <span>{t('publications_top_applicants_total')}</span>
              <strong>{formatNumber(totalApplicantPublications)}</strong>
            </div>
          </div>
        </article>

        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>{t('publications_chart_patents')}</h3>
            <p>{t('publications_chart_patents_subtitle')}</p>
          </header>
          <div className="chart-body">
            <Bar data={patentsChartData} options={patentsChartOptions} />
          </div>
        </article>
      </section>
    </div>
  );
};

export default PublicationsPage;