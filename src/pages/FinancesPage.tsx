import React, { useMemo } from 'react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import { calculateNationalMetrics, formatNumber } from '../utils/metrics';
import './FinancesPage.css';

const FinancesPage: React.FC = () => {
  const { selectedRegion, selectedRegionId, setSelectedRegionId, regions, isNational } =
    useRegionContext();

  const nationalMetrics = useMemo(() => calculateNationalMetrics(), []);
  const metrics = selectedRegion?.stats ?? nationalMetrics;

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

    const share = (metrics.finances.total / nationalMetrics.finances.total) * 100;

    return [
      {
        label: 'Финансирование, млрд. тг',
        regionValue: `${formatNumber(metrics.finances.total, { maximumFractionDigits: 1 })}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.total, { maximumFractionDigits: 1 })}`,
        delta: `${share.toFixed(1)}% доля`,
      },
      {
        label: 'Финансирование за прошлый год, млрд. тг',
        regionValue: `${formatNumber(metrics.finances.lastYear, { maximumFractionDigits: 1 })}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.lastYear, { maximumFractionDigits: 1 })}`,
        delta: `${((metrics.finances.lastYear / nationalMetrics.finances.lastYear) * 100).toFixed(1)}% доля`,
      },
      {
        label: 'Средняя статья расходов, тыс. тг',
        regionValue: `${formatNumber(metrics.finances.avgExpense)}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.avgExpense)}`,
        delta: `${(metrics.finances.avgExpense - nationalMetrics.finances.avgExpense).toFixed(0)} тг`,
      },
      {
        label: 'Освоение бюджета',
        regionValue: `${formatNumber(metrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
        nationalValue: `${formatNumber(nationalMetrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
        delta: `${(metrics.finances.budgetUsage - nationalMetrics.finances.budgetUsage).toFixed(1)} п.п.`,
      },
      {
        label: 'Региональные программы',
        regionValue: `${formatNumber(metrics.finances.regionalPrograms)}`,
        nationalValue: `${formatNumber(nationalMetrics.finances.regionalPrograms)}`,
        delta: `${(
          (metrics.finances.regionalPrograms / nationalMetrics.finances.regionalPrograms) * 100
        ).toFixed(1)}% доля`,
      },
    ];
  }, [metrics, nationalMetrics, selectedRegion]);

  const summaryCards = [
    {
      title: 'Общий бюджет',
      value: `${formatNumber(metrics.finances.total, { maximumFractionDigits: 1 })} млрд. тг`,
      description: isNational
        ? 'Суммарный объем финансирования по Республике Казахстан'
        : 'Финансирование по выбранному региону',
    },
    {
      title: 'Последний финансовый год',
      value: `${formatNumber(metrics.finances.lastYear, { maximumFractionDigits: 1 })} млрд. тг`,
      description: 'Фактически освоенные средства за прошлый год',
    },
    {
      title: 'Средняя статья расходов',
      value: `${formatNumber(metrics.finances.avgExpense)} тыс. тг`,
      description: 'Средний объем финансирования на одну категорию расходов',
    },
    {
      title: 'Освоение бюджета',
      value: `${formatNumber(metrics.finances.budgetUsage, { maximumFractionDigits: 1 })}%`,
      description: 'Доля освоенных средств от утвержденного бюджета',
    },
  ];

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionId(event.target.value as RegionId);
  };

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
