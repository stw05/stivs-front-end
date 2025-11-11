import React, { useCallback, useMemo, useState } from 'react';
import { Download, ArrowUpDown } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import {
  buildPublicationTimeline,
  buildPublicationTypeDistribution,
  calculateNationalMetrics,
  formatNumber,
} from '../utils/metrics';
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
// !!! Обязательный импорт стилей !!!
import './PublicationsPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// --- 1. Типы данных и мок-данные ---
type PublicationIndex = 'wos' | 'scopus' | 'kazinc' | 'kokmvo';
type PatentRegistry = 'kazPatent' | 'derwent' | 'none';

interface Publication {
  id: string;
  authorName: string;
  totalPublications: number;
  hIndex: number;
  latestPublicationTitle: string;
  latestPublicationDate: string; // Формат YYYY-MM-DD
  regionId: RegionId;
  publicationIndex: PublicationIndex;
  patentRegistry: PatentRegistry;
  hasImplementationAct: boolean;
}

// УВЕЛИЧЕННОЕ КОЛИЧЕСТВО ЗАПИСЕЙ (10)
const mockPublications: Publication[] = [
  {
    id: 'p1',
    authorName: 'Иванов И.И.',
    totalPublications: 45,
    hIndex: 12,
    latestPublicationTitle: 'Квантовые алгоритмы',
    latestPublicationDate: '2023-11-01',
    regionId: 'almaty-city',
    publicationIndex: 'wos',
    patentRegistry: 'kazPatent',
    hasImplementationAct: true,
  },
  {
    id: 'p2',
    authorName: 'Петрова А.К.',
    totalPublications: 88,
    hIndex: 21,
    latestPublicationTitle: 'Методы социологии',
    latestPublicationDate: '2024-03-15',
    regionId: 'west-kazakhstan',
    publicationIndex: 'scopus',
    patentRegistry: 'derwent',
    hasImplementationAct: true,
  },
  {
    id: 'p3',
    authorName: 'Сидоров Н.В.',
    totalPublications: 15,
    hIndex: 5,
    latestPublicationTitle: 'История Казахстана',
    latestPublicationDate: '2022-09-20',
    regionId: 'shymkent-city',
    publicationIndex: 'kazinc',
    patentRegistry: 'kazPatent',
    hasImplementationAct: false,
  },
  {
    id: 'p4',
    authorName: 'Касымов Р.Ж.',
    totalPublications: 120,
    hIndex: 35,
    latestPublicationTitle: 'Новые материалы',
    latestPublicationDate: '2023-05-10',
    regionId: 'almaty-city',
    publicationIndex: 'kokmvo',
    patentRegistry: 'derwent',
    hasImplementationAct: true,
  },
  {
    id: 'p5',
    authorName: 'Ахметова З.М.',
    totalPublications: 8,
    hIndex: 3,
    latestPublicationTitle: 'Педагогические основы',
    latestPublicationDate: '2024-01-25',
    regionId: 'west-kazakhstan',
    publicationIndex: 'kazinc',
    patentRegistry: 'kazPatent',
    hasImplementationAct: false,
  },
  {
    id: 'p6',
    authorName: 'Нурланов Б.К.',
    totalPublications: 3,
    hIndex: 1,
    latestPublicationTitle: 'Блокчейн в финансах',
    latestPublicationDate: '2024-04-05',
    regionId: 'astana-city',
    publicationIndex: 'scopus',
    patentRegistry: 'none',
    hasImplementationAct: false,
  },
  {
    id: 'p7',
    authorName: 'Султанова Г.Р.',
    totalPublications: 60,
    hIndex: 18,
    latestPublicationTitle: 'Моделирование систем',
    latestPublicationDate: '2023-10-10',
    regionId: 'almaty-city',
    publicationIndex: 'wos',
    patentRegistry: 'kazPatent',
    hasImplementationAct: true,
  },
  {
    id: 'p8',
    authorName: 'Абишев К.Т.',
    totalPublications: 22,
    hIndex: 7,
    latestPublicationTitle: 'Экономический рост',
    latestPublicationDate: '2024-02-01',
    regionId: 'astana-city',
    publicationIndex: 'scopus',
    patentRegistry: 'derwent',
    hasImplementationAct: true,
  },
  {
    id: 'p9',
    authorName: 'Мұсаев Е.А.',
    totalPublications: 155,
    hIndex: 40,
    latestPublicationTitle: 'Передовая физика',
    latestPublicationDate: '2023-07-28',
    regionId: 'shymkent-city',
    publicationIndex: 'wos',
    patentRegistry: 'kazPatent',
    hasImplementationAct: true,
  },
  {
    id: 'p10',
    authorName: 'Тұрар Г.Ж.',
    totalPublications: 5,
    hIndex: 2,
    latestPublicationTitle: 'Современная литература',
    latestPublicationDate: '2024-05-01',
    regionId: 'west-kazakhstan',
    publicationIndex: 'kokmvo',
    patentRegistry: 'none',
    hasImplementationAct: false,
  },
];

// --- 2. Определение значений фильтров и типов ---
type PublicationIndexFilter = 'all' | PublicationIndex;
type PatentRegistryFilter = 'all' | 'kazPatent' | 'derwent';
type ImplementationActFilter = 'all' | 'yes' | 'no';

const PUBLICATION_INDEX_OPTIONS: Array<{ value: PublicationIndexFilter; label: string }> = [
  { value: 'all', label: 'Все публикации' },
  { value: 'wos', label: 'Web of Science (WoS)' },
  { value: 'scopus', label: 'Scopus' },
  { value: 'kazinc', label: 'КазИНЦ' },
  { value: 'kokmvo', label: 'КОКМВО' },
];

const PATENT_REGISTRY_OPTIONS: Array<{ value: PatentRegistryFilter; label: string }> = [
  { value: 'all', label: 'Все реестры' },
  { value: 'kazPatent', label: 'КазПатент' },
  { value: 'derwent', label: 'Derwent Innovations' },
];

const IMPLEMENTATION_ACT_OPTIONS: Array<{ value: ImplementationActFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'yes', label: 'Есть' },
  { value: 'no', label: 'Нет' },
];

interface PublicationFilters {
  publicationIndex: PublicationIndexFilter;
  patentRegistry: PatentRegistryFilter;
  implementationAct: ImplementationActFilter;
}

interface SortState {
  key: keyof Publication | '';
  direction: 'asc' | 'desc' | '';
}

// --- 3. Компонент страницы ---
const PublicationsPage: React.FC = () => {
  const { selectedRegion, selectedRegionId, regions, setSelectedRegionId } = useRegionContext();
  
  const [filters, setFilters] = useState<PublicationFilters>({
    publicationIndex: 'all',
    patentRegistry: 'all',
    implementationAct: 'all',
  });
  const [sort, setSort] = useState<SortState>({ key: 'totalPublications', direction: 'desc' });

  const nationalMetrics = useMemo(() => calculateNationalMetrics(), []);
  const metrics = selectedRegion?.stats ?? nationalMetrics;
  const timelinePoints = useMemo(
    () => buildPublicationTimeline(metrics.publications),
    [metrics.publications],
  );
  const typeDistribution = useMemo(
    () => buildPublicationTypeDistribution(metrics.publications),
    [metrics.publications],
  );
  const { journals, conferences, books, other } = typeDistribution;
  const totalPublications = metrics.publications.total;
  const timelineChartData = useMemo(() => {
    return {
      labels: timelinePoints.map((point) => point.label),
      datasets: [
        {
          label: 'Количество публикаций',
          data: timelinePoints.map((point) => point.value),
          backgroundColor: '#2563eb',
          hoverBackgroundColor: '#1e3a8a',
          borderRadius: 12,
          maxBarThickness: 56,
        },
      ],
    };
  }, [timelinePoints]);

  const timelineChartOptions = useMemo<ChartOptions<'bar'>>(
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
              return `${formatNumber(value)} публикаций`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { weight: 600 },
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)', drawBorder: false },
          ticks: {
            color: '#475569',
            callback: (value) => formatNumber(Number(value)),
          },
        },
      },
    }),
    [],
  );

  const distributionChartData = useMemo(
    () => ({
      labels: ['Журналы', 'Конференции', 'Книги', 'Прочее'],
      datasets: [
        {
          data: [journals, conferences, books, other],
          backgroundColor: ['#1e3a8a', '#2563eb', '#38bdf8', '#81d4fa'],
          hoverBackgroundColor: ['#172554', '#1d4ed8', '#0ea5e9', '#4fc3f7'],
          borderWidth: 0,
        },
      ],
    }),
    [journals, conferences, books, other],
  );

  const distributionChartOptions = useMemo<ChartOptions<'doughnut'>>(
    () => ({
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
              const share = totalPublications ? ((value / totalPublications) * 100).toFixed(1) : '0.0';
              return `${label}: ${formatNumber(value)} (${share}%)`;
            },
          },
        },
      },
    }),
    [totalPublications],
  );

  const mapHighlights = useMemo(
    () => [
      { label: 'Всего публикаций', value: formatNumber(totalPublications) },
      { label: 'Журнальные статьи', value: formatNumber(journals) },
      { label: 'Конференции', value: formatNumber(conferences) },
      { label: 'Книги и прочее', value: formatNumber(books + other) },
    ],
    [totalPublications, journals, conferences, books, other],
  );

  const handleMapSelect = useCallback(
    (regionId: string) => {
      const typedId = regionId as RegionId;
      const nextRegionId = selectedRegionId === typedId ? 'national' : typedId;
      setSelectedRegionId(nextRegionId);
    },
    [selectedRegionId, setSelectedRegionId],
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      publicationIndex: 'all',
      patentRegistry: 'all',
      implementationAct: 'all',
    });
    setSelectedRegionId('national');
  }, [setSelectedRegionId]);

  // Функция для изменения сортировки
  const handleSortChange = (key: keyof Publication) => {
    setSort(prev => {
      let direction: SortState['direction'] = 'asc';
      if (prev.key === key) {
        direction = prev.direction === 'asc' ? 'desc' : 'asc';
      }
      return { key, direction };
    });
  };

  // --- ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ---
  const filteredPublications = useMemo(() => {
    let list = mockPublications;
    const { publicationIndex, patentRegistry, implementationAct } = filters;

    if (selectedRegionId !== 'national') {
      list = list.filter((p) => p.regionId === selectedRegionId);
    }

    if (publicationIndex !== 'all') {
      list = list.filter((p) => p.publicationIndex === publicationIndex);
    }

    if (patentRegistry !== 'all') {
      list = list.filter((p) => p.patentRegistry === patentRegistry);
    }

    if (implementationAct === 'yes') {
      list = list.filter((p) => p.hasImplementationAct);
    }

    if (implementationAct === 'no') {
      list = list.filter((p) => !p.hasImplementationAct);
    }

    if (sort.key && sort.direction) {
      list = [...list].sort((a, b) => {
        const aValue = a[sort.key as keyof Publication];
        const bValue = b[sort.key as keyof Publication];
        
        let comparison = 0;

        // Обработка числовых (кол-во, h-индекс)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } 
        // Обработка строковых (имя, дата)
        else if (aValue && bValue) {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return list;
  }, [selectedRegionId, filters, sort]);

  // Заглушка для действий
  const handleAction = (action: string) => {
    alert(action);
  };

  return (
    <div className="publications-page">
      
      {/* --- ШАПКА СТРАНИЦЫ (Заголовок, Экспорт, Создать) --- */}
      <div className="page-header-controls">
        <h1>Результаты</h1>
        <div className="header-actions">
           <button 
              type="button" 
              className="action-button export-button"
              onClick={() => handleAction('Экспорт данных')}
            >
              <Download size={20} />
              Экспорт данных
            </button>
        </div>
      </div>
      
      <div className="publications-content-wrapper">
        
        {/* === БОКОВАЯ ПАНЕЛЬ ФИЛЬТРОВ === */}
        <aside className="publications-sidebar">
          <div className="sidebar-section">
            <label htmlFor="publication-index-filter" className="filter-label">Публикации</label>
            <select
              id="publication-index-filter"
              value={filters.publicationIndex}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  publicationIndex: e.target.value as PublicationIndexFilter,
                }))
              }
              className="sidebar-select"
            >
              {PUBLICATION_INDEX_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label htmlFor="patent-registry-filter" className="filter-label">Патенты</label>
            <select
              id="patent-registry-filter"
              value={filters.patentRegistry}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  patentRegistry: e.target.value as PatentRegistryFilter,
                }))
              }
              className="sidebar-select"
            >
              {PATENT_REGISTRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label htmlFor="implementation-act-filter" className="filter-label">Акты внедрения</label>
            <select
              id="implementation-act-filter"
              value={filters.implementationAct}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  implementationAct: e.target.value as ImplementationActFilter,
                }))
              }
              className="sidebar-select"
            >
              {IMPLEMENTATION_ACT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <label htmlFor="region-filter" className="filter-label">Регионы</label>
            <select
              id="region-filter"
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value as RegionId)}
              className="sidebar-select"
            >
              <option value="national">Все регионы</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="action-button apply-button"
            style={{ color: '#fff', backgroundColor: '#2563eb', border: 'none', marginTop: '20px' }}
            onClick={handleResetFilters}
          >
            <ArrowUpDown size={20} />
            Сбросить фильтры
          </button>
        </aside>
        
        {/* === ОСНОВНОЕ СОДЕРЖИМОЕ === */}
        <main className="publications-main-content">
          <section className="publications-visuals" aria-label="Аналитика публикаций">
            <article className="publications-map-card">
              <header className="publications-map-header">
                <div>
                  <span className="publications-map-tag">Публикации по регионам</span>
                  <h2>{selectedRegion?.name ?? 'Республика Казахстан'}</h2>
                </div>
                <span className="publications-map-hint">Нажмите на карту для фильтрации</span>
              </header>

              <div className="publications-map-frame">
                <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleMapSelect} />
              </div>

              <div className="publications-map-stats">
                {mapHighlights.map((item) => (
                  <div key={item.label} className="publications-map-stat">
                    <span className="publications-map-stat-label">{item.label}</span>
                    <span className="publications-map-stat-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="publications-chart-card" aria-label="Динамика публикаций">
              <header className="publications-chart-header">
                <h2>Публикации по годам</h2>
                <span>Количество работ в UISKS</span>
              </header>
              <div className="publications-chart">
                <Bar data={timelineChartData} options={timelineChartOptions} updateMode="resize" />
              </div>
            </article>

            <article className="publications-chart-card" aria-label="Структура публикаций">
              <header className="publications-chart-header">
                <h2>Структура по типам</h2>
                <span>Журналы, конференции, книги, прочее</span>
              </header>
              <div className="publications-doughnut-wrapper">
                <Doughnut data={distributionChartData} options={distributionChartOptions} updateMode="resize" />
                <div className="publications-doughnut-center">
                  <span className="value">{formatNumber(totalPublications)}</span>
                  <span className="label">всего</span>
                </div>
              </div>
            </article>
          </section>

          <div className="publication-table-container">
            <table className="publication-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th onClick={() => handleSortChange('authorName')} className={sort.key === 'authorName' ? sort.direction : ''}>
                    ФИО <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => handleSortChange('totalPublications')} className={sort.key === 'totalPublications' ? sort.direction : ''}>
                    Кол-во публ. <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => handleSortChange('hIndex')} className={sort.key === 'hIndex' ? sort.direction : ''}>
                    Индекс Хирша <ArrowUpDown size={14} />
                  </th>
                  <th>Название последней публикации</th>
                  <th onClick={() => handleSortChange('latestPublicationDate')} className={sort.key === 'latestPublicationDate' ? sort.direction : ''}>
                    Дата последней публ. <ArrowUpDown size={14} />
                  </th>
                  <th className="actions-column">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPublications.map((pub, index) => (
                  <tr key={pub.id}>
                    <td>{index + 1}</td>
                    <td className="name-cell">{pub.authorName}</td>
                    <td className="center-cell">{pub.totalPublications}</td>
                    <td className="center-cell">{pub.hIndex}</td>
                    <td>{pub.latestPublicationTitle}</td>
                    <td>{new Date(pub.latestPublicationDate).toLocaleDateString('ru-RU')}</td>
                    <td className="actions-column">
                      <div className="actions-buttons">
                        <button onClick={() => handleAction(`Просмотр ${pub.id}`)} title="Просмотр">
                           Просмотр
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Сообщение, если список пуст */}
            {filteredPublications.length === 0 && (
              <div className="no-results">
                Публикации не найдены по текущим фильтрам.
              </div>
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default PublicationsPage;