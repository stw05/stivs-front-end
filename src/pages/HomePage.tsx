import React, { useMemo } from 'react';
import { Cpu, Users2, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KazakhstanMap from '../components/Home/KazakhstanMap';
import { regionsData } from '../components/Home/regionsData';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import { calculateNationalMetrics, formatNumber } from '../utils/metrics';
import './HomePage.css';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedRegionId, selectedRegion, setSelectedRegionId } = useRegionContext();

  const nationalMetrics = useMemo(() => calculateNationalMetrics(), []);
  const metrics = selectedRegion?.stats ?? nationalMetrics;

  const handleRegionSelect = (regionId: string) => {
    const nextRegionId: RegionId = selectedRegionId === regionId ? 'national' : (regionId as RegionId);
    setSelectedRegionId(nextRegionId);
  };

  const summaryCards = useMemo(
    () => [
      {
        title: t('card_projects_title'), // 🟢 ПЕРЕВОД
        icon: <Cpu size={40} />,
        value: formatNumber(metrics.projects.total),
        unit: t('unit_projects'), // 🟢 ПЕРЕВОД
        details: [
          { label: t('card_projects_grants'), value: formatNumber(metrics.projects.grants) }, // 🟢 ПЕРЕВОД
          { label: t('card_projects_programs'), value: formatNumber(metrics.projects.programs) }, // 🟢 ПЕРЕВОД
          { label: t('card_projects_contracts'), value: formatNumber(metrics.projects.contracts) }, // 🟢 ПЕРЕВОД
          { label: t('card_projects_commercialization'), value: formatNumber(metrics.projects.commercialization) }, // 🟢 ПЕРЕВОД
          {
            label: t('card_projects_trl_high'), // 🟢 ПЕРЕВОД
            value: metrics.projects.avgDuration.toFixed(1),
          },
        ],
      },
      {
        title: t('card_publications_title'), // 🟢 ПЕРЕВОД
        icon: <FileText size={40} />,
        value: formatNumber(metrics.publications.total),
        unit: t('unit_publications'), // 🟢 ПЕРЕВОД
        details: [
          { label: t('card_publications_scopus'), value: formatNumber(metrics.publications.journals) }, // 🟢 ПЕРЕВОД
          { label: t('card_publications_patents'), value: formatNumber(metrics.publications.conferences) }, // 🟢 ПЕРЕВОД
          { label: t('card_publications_acts'), value: formatNumber(metrics.publications.books) }, // 🟢 ПЕРЕВОД
          { label: t('card_publications_monographs'), value: formatNumber(metrics.publications.other) }, // 🟢 ПЕРЕВОД
          { label: t('card_publications_security_docs'), value: formatNumber(metrics.publications.other) }, // 🟢 НОВЫЙ ПЕРЕВОД
          { label: t('card_publications_implementations'), value: formatNumber(metrics.publications.other) }, // 🟢 НОВЫЙ ПЕРЕВОД
        ],
      },
      {
        title: t('card_employees_title'), // 🟢 ПЕРЕВОД
        icon: <Users2 size={40} />,
        value: formatNumber(metrics.people.total),
        unit: t('unit_people'), // 🟢 ПЕРЕВОД
        details: [
          { label: t('card_employees_doctors'), value: formatNumber(metrics.people.docents) }, // 🟢 ПЕРЕВОД
          { label: t('card_employees_candidates'), value: formatNumber(metrics.people.professors) }, // 🟢 ПЕРЕВОД
          { label: t('card_employees_masters'), value: formatNumber(metrics.people.associateProfessors) }, // 🟢 ПЕРЕВОД
          { label: t('card_employees_h_index_high'), value: metrics.people.avgAge.toFixed(1) }, // 🟢 ПЕРЕВОД
        ],
      },
      {
        title: t('card_finances_title'), // 🟢 ПЕРЕВОД
        icon: <DollarSign size={40} />,
        value: formatNumber(metrics.finances.total, { maximumFractionDigits: 1 }),
        unit: t('unit_mlrd_tg'), // 🟢 ПЕРЕВОД
        details: [
          {
            label: t('card_finances_total_current_year'), // 🟢 НОВЫЙ ПЕРЕВОД
            value: `${formatNumber(metrics.finances.lastYear, { maximumFractionDigits: 1 })} ${t('unit_mlrd_tg')}`, // 🟢 ПЕРЕВОД (Ед. изм)
          },
          {
            label: t('card_finances_avg_per_project'), // 🟢 НОВЫЙ ПЕРЕВОД
            value: `${formatNumber(metrics.finances.avgExpense, { maximumFractionDigits: 0 })} ${t('unit_thousand_tg')}`, // 🟢 НОВЫЙ ПЕРЕВОД (Ед. изм)
          },
          {
            label: t('card_finances_cofinancing_amount'), // 🟢 НОВЫЙ ПЕРЕВОД
            value: `${formatNumber(metrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
          },
          {
            label: t('card_finances_regional_programs'), // 🟢 НОВЫЙ ПЕРЕВОД
            value: formatNumber(metrics.finances.regionalPrograms),
          },
        ],
      },
    ],
    [metrics, t],
  );

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionId(event.target.value as RegionId);
  };

  const mapHighlights = [
    {
      label: t('projects_page_title'), // 🟢 ПЕРЕВОД
      value: formatNumber(metrics.projects.total),
    },
    {
      label: t('publications_page_title'), // 🟢 ПЕРЕВОД
      value: formatNumber(metrics.publications.total),
    },
    {
      label: t('employees_page_title'), // 🟢 ПЕРЕВОД
      value: formatNumber(metrics.people.total),
    },
    {
      label: t('finances_page_title'), // 🟢 ПЕРЕВОД
      value: `${formatNumber(metrics.finances.total, { maximumFractionDigits: 1 })} ${t('unit_mlrd_tg')}`, // 🟢 ПЕРЕВОД (Ед. изм)
    },
  ];

  return (
    <div className="home-page" data-testid="home-page">
      <section className="map-section">
        <div className="map-container">
          <div className="region-selector">
            <select value={selectedRegionId} onChange={handleRegionChange} aria-label={t('map_overview_title')}> {/* 🟢 ПЕРЕВОД */}
              <option value="national">{t('republic_kazakhstan')}</option> {/* 🟢 ПЕРЕВОД */}
              {regionsData.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select defaultValue="direction" aria-label={t('filter_select_direction')}> {/* 🟢 ПЕРЕВОД */}
              <option value="direction">{t('filter_select_direction')}</option> {/* 🟢 ПЕРЕВОД */}
              <option value="research">{t('filter_research')}</option> {/* 🟢 НОВЫЙ ПЕРЕВОД */}
              <option value="commercialization">{t('filter_commercialization')}</option> {/* 🟢 НОВЫЙ ПЕРЕВОД */}
              <option value="international">{t('filter_international_projects')}</option> {/* 🟢 НОВЫЙ ПЕРЕВОД */}
            </select>
            <select defaultValue="organization" aria-label={t('filter_select_organization')}> {/* 🟢 ПЕРЕВОД */}
              <option value="organization">{t('filter_all_organizations')}</option> {/* 🟢 ПЕРЕВОД */}
              {/* Опции для организаций остаются на английском, так как это названия */}
              <option value="su">Satbayev University</option>
              <option value="kaznu">KazNU</option>
              <option value="enu">ENU</option>
            </select>
            <select defaultValue="priority" aria-label={t('filter_select_priority')}> {/* 🟢 ПЕРЕВОД */}
              <option value="priority">{t('filter_all_priorities')}</option> {/* 🟢 ПЕРЕВОД */}
              {/* Все приоритетные направления */}
              <option value="energy">{t('priority_energy_transport')}</option>
              <option value="advanced-tech">{t('priority_advanced_tech')}</option>
              <option value="intellect-natural">{t('priority_intellect_natural')}</option>
              <option value="intellect-social">{t('priority_intellect_social')}</option>
              <option value="agriculture">{t('priority_agriculture')}</option>
              <option value="life-health">{t('priority_life_health')}</option>
              <option value="security">{t('priority_security')}</option>
              <option value="commercialization">{t('priority_commercialization')}</option>
              <option value="ecology">{t('priority_ecology')}</option>
            </select>
          </div>

          <div className="map-panel">
            <KazakhstanMap selectedRegionId={selectedRegionId} onRegionSelect={handleRegionSelect} />

            <aside className="map-info">
              <span className="map-tag">
                {selectedRegion ? t('map_tag_selected') : t('map_tag_national')} {/* 🟢 ПЕРЕВОД */}
              </span>
              <h2>{selectedRegion?.name ?? t('republic_kazakhstan')}</h2> {/* 🟢 ПЕРЕВОД */}
              <p className="map-info-subtitle">
                {t('map_subtitle')} {/* 🟢 НОВЫЙ ПЕРЕВОД */}
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
                {t('map_action_button')} {/* 🟢 ПЕРЕВОД */}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="stats-section" aria-label={t('stats_section_title')}> {/* 🟢 ПЕРЕВОД */}
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