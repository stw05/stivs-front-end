import React, { useMemo } from 'react';
import { Cpu, Users2, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import { regionsData } from '../components/Home/regionsData';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import { calculateNationalMetrics, formatNumber } from '../utils/metrics';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRegionId, selectedRegion, setSelectedRegionId } = useRegionContext();

  const nationalMetrics = useMemo(() => calculateNationalMetrics(), []);
  const metrics = selectedRegion?.stats ?? nationalMetrics;

  const summaryCards = useMemo(
    () => [
      {
        title: 'Проекты',
        icon: <Cpu size={40} />,
        value: formatNumber(metrics.projects.total),
        unit: 'проектов',
        details: [
          { label: 'Грантов', value: formatNumber(metrics.projects.grants) },
          { label: 'Программы по частным заказам', value: formatNumber(metrics.projects.programs) },
          { label: 'Хозяйственные договоры', value: formatNumber(metrics.projects.contracts) },
          { label: 'Коммерциализация', value: formatNumber(metrics.projects.commercialization) },
          {
            label: 'Средний срок, мес',
            value: metrics.projects.avgDuration.toFixed(1),
          },
        ],
      },
      {
        title: 'Публикации',
        icon: <FileText size={40} />,
        value: formatNumber(metrics.publications.total),
        unit: 'единиц',
        details: [
          { label: 'Журналы', value: formatNumber(metrics.publications.journals) },
          { label: 'Конференции', value: formatNumber(metrics.publications.conferences) },
          { label: 'Учебники', value: formatNumber(metrics.publications.books) },
          { label: 'Другие издания', value: formatNumber(metrics.publications.other) },
        ],
      },
      {
        title: 'Люди',
        icon: <Users2 size={40} />,
        value: formatNumber(metrics.people.total),
        unit: 'сотрудников',
        details: [
          { label: 'Доценты', value: formatNumber(metrics.people.docents) },
          { label: 'Профессора', value: formatNumber(metrics.people.professors) },
          {
            label: 'Ассоциированные профессора',
            value: formatNumber(metrics.people.associateProfessors),
          },
          { label: 'Средний возраст, лет', value: metrics.people.avgAge.toFixed(1) },
        ],
      },
      {
        title: 'Финансы',
        icon: <DollarSign size={40} />,
        value: formatNumber(metrics.finances.total, { maximumFractionDigits: 1 }),
        unit: 'млрд. тг',
        details: [
          {
            label: 'Финансирование (последний год)',
            value: `${formatNumber(metrics.finances.lastYear, { maximumFractionDigits: 1 })} млрд. тг`,
          },
          {
            label: 'Средняя статья расходов',
            value: `${formatNumber(metrics.finances.avgExpense, { maximumFractionDigits: 0 })} тыс. тг`,
          },
          {
            label: 'Освоение бюджета',
            value: `${formatNumber(metrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
          },
          {
            label: 'Региональные программы',
            value: formatNumber(metrics.finances.regionalPrograms),
          },
        ],
      },
    ],
    [metrics],
  );

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionId(event.target.value as RegionId);
  };

  const handleRegionSelect = (regionId: string) => {
    const nextRegionId: RegionId = selectedRegionId === regionId ? 'national' : (regionId as RegionId);
    setSelectedRegionId(nextRegionId);
  };

  const mapHighlights = [
    {
      label: 'Проекты',
      value: formatNumber(metrics.projects.total),
    },
    {
      label: 'Публикации',
      value: formatNumber(metrics.publications.total),
    },
    {
      label: 'Сотрудники',
      value: formatNumber(metrics.people.total),
    },
    {
      label: 'Финансы',
      value: `${formatNumber(metrics.finances.total, { maximumFractionDigits: 1 })} млрд. тг`,
    },
  ];

  return (
    <div className="home-page" data-testid="home-page">
      <section className="map-section">
        <div className="map-container">
          <div className="region-selector">
            <select value={selectedRegionId} onChange={handleRegionChange} aria-label="Выбор региона">
              <option value="national">Вся Республика Казахстан</option>
              {regionsData.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select defaultValue="direction" aria-label="Выбор направления">
              <option value="direction">Все направления</option>
              <option value="research">Исследования</option>
              <option value="commercialization">Коммерциализация</option>
              <option value="international">Международные проекты</option>
            </select>
            <select defaultValue="organization" aria-label="Выбор организации">
              <option value="organization">Все организации</option>
              <option value="su">Satbayev University</option>
              <option value="kaznu">KazNU</option>
              <option value="enu">ENU</option>
            </select>
          </div>

          <div className="map-panel">
            <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleRegionSelect} />

            <aside className="map-info">
              <span className="map-tag">
                {selectedRegion ? 'Выбран регион' : 'Свод по стране'}
              </span>
              <h2>{selectedRegion?.name ?? 'Республика Казахстан'}</h2>
              <p className="map-info-subtitle">
                Обновленные показатели проектов, публикаций и финансирования по выбранной территории.
              </p>

              <div className="map-info-grid">
                {mapHighlights.map((item) => (
                  <div key={item.label} className="map-info-item">
                    <span className="map-info-item-label">{item.label}</span>
                    <span className="map-info-item-value">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="map-action-button"
                onClick={() => navigate('/finances')}
              >
                Смотреть детальную статистику
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label="Основные показатели системы">
        <div className="stats-grid">
          {summaryCards.map((stat) => (
            <article key={stat.title} className="stat-card">
              <div className="stat-icon" aria-hidden="true">
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3>{stat.title}</h3>
                <div className="stat-main">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-unit">{stat.unit}</span>
                </div>
                <div className="stat-items">
                  {stat.details.map((detail) => (
                    <div key={detail.label} className="stat-item">
                      <span className="stat-item-value">{detail.value}</span>
                      <span className="stat-item-label">{detail.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;