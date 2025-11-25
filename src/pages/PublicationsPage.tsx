import React, { useCallback, useMemo, useState, useRef, type CSSProperties } from 'react';
import { Download } from 'lucide-react';
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
const contests = ['all', 'Национальный конкурс', 'Конкурс грантов', 'Конкурс программ'];
const applicants = ['all', 'КазНУ', 'ЕНУ', 'Назарбаев Университет', 'КазАТК'];
const customers = ['all', 'Минобрнауки', 'Минздрав', 'Минцифра'];
const mrntiOptions = ['all', '11.00.00', '21.45.10', '27.00.00'];
const statusOptions = ['all', 'В работе', 'Завершен', 'Ожидает публикации'];
const trlOptions = ['all', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'];

type CSSVars = CSSProperties & { '--accent'?: string };

const highlightCards = [
  { id: 'total', label: 'Всего публикаций', value: '17 130', accent: '#1d4ed8' },
  { id: 'domestic', label: 'Отечественные публикации', value: '6 092', accent: '#16a34a' },
  { id: 'foreign', label: 'Зарубежные публикации', value: '11 038', accent: '#7c3aed' },
  { id: 'scopus', label: 'Публикации в Scopus', value: '1 498', accent: '#4338ca' },
  { id: 'wos', label: 'Публикации в Web of Science', value: '5 282', accent: '#0ea5e9' },
  { id: 'patents', label: 'Патенты', value: '2 792', accent: '#ea580c' },
  { id: 'implementations', label: 'Количество внедрений', value: '414', accent: '#db2777' },
  { id: 'projects', label: 'Проекты с внедрением', value: '127', accent: '#059669' },
];

const publicationYears = ['2020', '2021', '2022', '2023', '2024', '2025'];
const domesticPublications = [536, 1095, 1194, 1190, 976, 553];
const foreignPublications = [858, 1719, 1698, 1799, 1347, 810];

const scopusSiteScore = [5000, 5000, 2000, 2000];
const wosQuartiles = [10000, 8000, 8000, 5000];

const priorityPerformance = [
  { label: 'Исследования в области цифровизации', value: 3279 },
  { label: 'Исследования в области ИИ', value: 1005 },
  { label: 'Научные исследования в медицине', value: 674 },
  { label: 'Геология, добыча и переработка', value: 577 },
  { label: 'Науки о жизни и здоровье', value: 404 },
  { label: 'Интеллектуальный потенциал', value: 386 },
  { label: 'Рациональное использование ресурсов', value: 378 },
  { label: 'Информационные и коммуникационные технологии', value: 377 },
  { label: 'Энергетика и машиностроение', value: 331 },
  { label: 'Устойчивое развитие', value: 224 },
  { label: 'Национальная безопасность', value: 121 },
  { label: 'Передовое производство', value: 58 },
  { label: 'Экология и окружающая среда', value: 44 },
  { label: 'Исследования в области культуры', value: 11 },
  { label: 'Интеллектуальный потенциал молодежи', value: 4 },
];

const implementationTrend = {
  implementation: [319, 634, 657, 617, 633, 305],
  trl: [97, 219, 151, 129, 105, 58],
};

const patentTrend = {
  patents: [58, 123, 126, 105, 95, 70],
  deployments: [97, 219, 151, 129, 105, 58],
};

const topApplicants = [
  { id: 'kaznu', name: 'КазНУ им. аль-Фараби', value: 826 },
  { id: 'enu', name: 'Евразийский НУ им. Л.Н. Гумилева', value: 765 },
  { id: 'kaznpu', name: 'КазНПУ им. Абая', value: 372 },
  { id: 'karu', name: 'Карагандинский университет им. Е.А. Букетова', value: 360 },
  { id: 'kit', name: 'КазНИТУ им. К.И. Сатпаева', value: 252 },
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
  const { selectedRegion, selectedRegionId, setSelectedRegionId, regions } = useRegionContext();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const statsScrollRef = useRef<HTMLDivElement | null>(null);
  const statsDragRef = useRef<{ pointerId: number | null; startX: number; scrollLeft: number }>(
    { pointerId: null, startX: 0, scrollLeft: 0 },
  );
  const [isDraggingStats, setIsDraggingStats] = useState(false);

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
          label: 'Отечественные публикации',
          data: domesticPublications,
          backgroundColor: '#1d4ed8',
          borderRadius: 10,
          stack: 'publications',
        },
        {
          label: 'Зарубежные публикации',
          data: foreignPublications,
          backgroundColor: '#60a5fa',
          borderRadius: 10,
          stack: 'publications',
        },
      ],
    }),
    [],
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
    []);

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
          label: 'Количество проектов с внедрением',
          data: implementationTrend.implementation,
          backgroundColor: '#38bdf8',
          borderRadius: 12,
          maxBarThickness: 36,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Количество проектов с TRL',
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
    [],
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
          label: 'Патенты',
          data: patentTrend.patents,
          backgroundColor: '#1d4ed8',
          borderRadius: 12,
          maxBarThickness: 32,
        },
        {
          label: 'Количество внедрений',
          data: patentTrend.deployments,
          backgroundColor: '#0ea5e9',
          borderRadius: 12,
          maxBarThickness: 32,
        },
      ],
    }),
    [],
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

  const totalApplicantPublications = topApplicants.reduce((sum, applicant) => sum + applicant.value, 0);

  return (
    <div className="publications-page">
      <header className="publications-page-header">
        <div>
          <h1>Результаты</h1>
          <p>Сводная аналитика публикаций, патентов и внедрений</p>
        </div>
        <div className="publications-header-actions">
          <button type="button" className="publications-export-button">
            <Download size={18} />
            Экспортировать отчёт
          </button>
        </div>
      </header>

      <section className="publications-stats-row" aria-label="Ключевые показатели">
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
              <p>Публикации по регионам</p>
              <h2>{selectedRegion?.name ?? 'Республика Казахстан'}</h2>
            </div>
            <small>Нажмите на регион, чтобы зафиксировать выбор</small>
          </header>
          <div className="publications-map-wrapper">
            <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleMapSelect} />
          </div>
        </article>

        <article className="publications-filters-panel">
          <header>
            <h2>Фильтры</h2>
          </header>

          <section className="publications-filter-group" aria-label="Диапазон годов">
            <div className="publications-filter-title">Годы</div>
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
              irnOptions.map((value) => ({ value, label: value === 'all' ? 'Все IRN' : value })),
              (value) => handleSelectChange('irn', value),
            )}
            {filterSelect(
              'filter-financing',
              'Тип финансирования',
              filters.financingType,
              [
                { value: 'all', label: 'Все типы финансирования' },
                { value: 'grant', label: 'Грантовое' },
                { value: 'program', label: 'Программно-целевое' },
                { value: 'contract', label: 'По договорам' },
              ],
              (value) => handleSelectChange('financingType', value),
            )}
            {filterSelect(
              'filter-priority',
              'Приоритетное направление',
              filters.priority,
              [
                { value: 'all', label: 'Все направления' },
                { value: 'health', label: 'Здравоохранение' },
                { value: 'economy', label: 'Экономика' },
                { value: 'energy', label: 'Энергетика' },
                { value: 'ai', label: 'Искусственный интеллект' },
              ],
              (value) => handleSelectChange('priority', value),
            )}
            {filterSelect(
              'filter-contest',
              'Наименование конкурса',
              filters.contest,
              contests.map((value) => ({ value, label: value === 'all' ? 'Все конкурсы' : value })),
              (value) => handleSelectChange('contest', value),
            )}
            {filterSelect(
              'filter-applicant',
              'Заявитель',
              filters.applicant,
              applicants.map((value) => ({ value, label: value === 'all' ? 'Все заявители' : value })),
              (value) => handleSelectChange('applicant', value),
            )}
            {filterSelect(
              'filter-customer',
              'Заказчик',
              filters.customer,
              customers.map((value) => ({ value, label: value === 'all' ? 'Все заказчики' : value })),
              (value) => handleSelectChange('customer', value),
            )}
            {filterSelect(
              'filter-mrnti',
              'МРНТИ',
              filters.mrnti,
              mrntiOptions.map((value) => ({ value, label: value === 'all' ? 'Все коды МРНТИ' : value })),
              (value) => handleSelectChange('mrnti', value),
            )}
            {filterSelect(
              'filter-status',
              'Статус',
              filters.status,
              statusOptions.map((value) => ({ value, label: value === 'all' ? 'Все статусы' : value })),
              (value) => handleSelectChange('status', value),
            )}
            <label className="publications-filter-item" htmlFor="filter-region">
              <span>Регион</span>
              <select
                id="filter-region"
                value={selectedRegionId}
                onChange={(event) => setSelectedRegionId(event.target.value as RegionId)}
              >
                <option value="national">Все регионы</option>
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
              trlOptions.map((value) => ({ value, label: value === 'all' ? 'Все уровни' : value })),
              (value) => handleSelectChange('trl', value),
            )}
          </div>

          <div className="publications-filter-actions">
            <button type="button" onClick={handleResetFilters}>Сбросить фильтры</button>
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>Динамика публикаций</h3>
            <p>Сравнение отечественных и зарубежных работ</p>
          </header>
          <div className="chart-body">
            <Bar data={publicationDynamicsData} options={publicationDynamicsOptions} />
          </div>
        </article>

        <article className="publications-chart-card">
          <header>
            <h3>Публикации Scopus по SiteScore</h3>
          </header>
          <div className="chart-body">
            <Doughnut data={scopusChartData} options={doughnutOptions} />
          </div>
        </article>

        <article className="publications-chart-card">
          <header>
            <h3>Публикации Web of Science по квартилям</h3>
          </header>
          <div className="chart-body">
            <Doughnut data={wosChartData} options={doughnutOptions} />
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>Результативность по приоритетным направлениям</h3>
            <p>Количество публикаций по ключевым кластерам</p>
          </header>
          <div className="chart-body">
            <Bar data={priorityChartData} options={priorityChartOptions} />
          </div>
        </article>

        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>Динамика проектов с внедрением и количеством TRL</h3>
          </header>
          <div className="chart-body">
            <ChartComponent type="bar" data={implementationChartData} options={implementationChartOptions} />
          </div>
        </article>
      </section>

      <section className="publications-chart-grid">
        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>Топ-5 заявителей</h3>
            <p>Отечественные публикации</p>
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
              <span>Всего</span>
              <strong>{formatNumber(totalApplicantPublications)}</strong>
            </div>
          </div>
        </article>

        <article className="publications-chart-card chart-span-2">
          <header>
            <h3>Динамика патентов и внедрений</h3>
            <p>Сравнение выданных патентов и актов внедрения</p>
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