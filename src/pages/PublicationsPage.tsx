import React, { useMemo, useState } from 'react';
import { Plus, Download, ArrowUpDown, Search } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext'; 
// !!! Обязательный импорт стилей !!!
import './PublicationsPage.css';

// --- 1. Типы данных и мок-данные ---
export type AffiliateType = 'staff' | 'external' | 'all';
export type DirectionType = 'science' | 'tech' | 'social' | 'all';

interface Publication {
  id: string;
  authorName: string;
  totalPublications: number;
  hIndex: number;
  latestPublicationTitle: string;
  latestPublicationDate: string; // Формат YYYY-MM-DD
  department: string;
  affiliateType: AffiliateType;
  direction: DirectionType;
  institute: string;
  chair: string;
  regionId: RegionId;
}

// УВЕЛИЧЕННОЕ КОЛИЧЕСТВО ЗАПИСЕЙ (10)
const mockPublications: Publication[] = [
  { id: 'p1', authorName: 'Иванов И.И.', totalPublications: 45, hIndex: 12, latestPublicationTitle: 'Квантовые алгоритмы', latestPublicationDate: '2023-11-01', department: 'Кафедра А', affiliateType: 'staff', direction: 'tech', institute: 'ИИТ', chair: 'КМ', regionId: 'almaty-city' },
  { id: 'p2', authorName: 'Петрова А.К.', totalPublications: 88, hIndex: 21, latestPublicationTitle: 'Методы социологии', latestPublicationDate: '2024-03-15', department: 'Кафедра B', affiliateType: 'staff', direction: 'social', institute: 'ИГУМ', chair: 'СИ', regionId: 'west-kazakhstan' },
  { id: 'p3', authorName: 'Сидоров Н.В.', totalPublications: 15, hIndex: 5, latestPublicationTitle: 'История Казахстана', latestPublicationDate: '2022-09-20', department: 'Лаборатория', affiliateType: 'external', direction: 'social', institute: 'ИГУМ', chair: 'ИС', regionId: 'shymkent-city' },
  { id: 'p4', authorName: 'Касымов Р.Ж.', totalPublications: 120, hIndex: 35, latestPublicationTitle: 'Новые материалы', latestPublicationDate: '2023-05-10', department: 'Кафедра А', affiliateType: 'staff', direction: 'science', institute: 'ИИТ', chair: 'ХТ', regionId: 'almaty-city' },
  { id: 'p5', authorName: 'Ахметова З.М.', totalPublications: 8, hIndex: 3, latestPublicationTitle: 'Педагогические основы', latestPublicationDate: '2024-01-25', department: 'Кафедра C', affiliateType: 'staff', direction: 'social', institute: 'ИПЕД', chair: 'ПТ', regionId: 'west-kazakhstan' },
  { id: 'p6', authorName: 'Нурланов Б.К.', totalPublications: 3, hIndex: 1, latestPublicationTitle: 'Блокчейн в финансах', latestPublicationDate: '2024-04-05', department: 'Внештатно', affiliateType: 'external', direction: 'tech', institute: 'ИИТ', chair: 'КМ', regionId: 'astana-city' },
  
  // НОВЫЕ ЗАПИСИ
  { id: 'p7', authorName: 'Султанова Г.Р.', totalPublications: 60, hIndex: 18, latestPublicationTitle: 'Моделирование систем', latestPublicationDate: '2023-10-10', department: 'Кафедра D', affiliateType: 'staff', direction: 'tech', institute: 'ИИТ', chair: 'ИС', regionId: 'almaty-city' },
  { id: 'p8', authorName: 'Абишев К.Т.', totalPublications: 22, hIndex: 7, latestPublicationTitle: 'Экономический рост', latestPublicationDate: '2024-02-01', department: 'НИИ Экономики', affiliateType: 'external', direction: 'social', institute: 'ИГУМ', chair: 'ИС', regionId: 'astana-city' },
  { id: 'p9', authorName: 'Мұсаев Е.А.', totalPublications: 155, hIndex: 40, latestPublicationTitle: 'Передовая физика', latestPublicationDate: '2023-07-28', department: 'Кафедра E', affiliateType: 'staff', direction: 'science', institute: 'ИФМ', chair: 'ФМ', regionId: 'shymkent-city' },
  { id: 'p10', authorName: 'Тұрар Г.Ж.', totalPublications: 5, hIndex: 2, latestPublicationTitle: 'Современная литература', latestPublicationDate: '2024-05-01', department: 'Кафедра C', affiliateType: 'staff', direction: 'social', institute: 'ИПЕД', chair: 'ПТ', regionId: 'west-kazakhstan' },
];

// --- 2. Определение значений фильтров и типов ---
const allDepartments = Array.from(new Set(mockPublications.map(p => p.department))).sort();
const allInstitutes = Array.from(new Set(mockPublications.map(p => p.institute))).sort();
const allChairs = Array.from(new Set(mockPublications.map(p => p.chair))).sort();

interface PublicationFilters {
  searchTerm: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  department: string;
  affiliateType: AffiliateType | 'all';
  direction: DirectionType | 'all';
  institute: string;
  chair: string;
}

interface SortState {
  key: keyof Publication | '';
  direction: 'asc' | 'desc' | '';
}

// --- 3. Компонент страницы ---
const PublicationsPage: React.FC = () => {
  // ИСПРАВЛЕНИЕ: Теперь все три переменные используются, что устранит ошибку TS6133
  const { selectedRegionId, regions, setSelectedRegionId } = useRegionContext(); 
  
  const [filters, setFilters] = useState<PublicationFilters>({
    searchTerm: '',
    startDate: '2000-01-01', // Установка широкого диапазона по умолчанию
    endDate: new Date().toISOString().split('T')[0],
    department: 'all',
    affiliateType: 'all',
    direction: 'all',
    institute: 'all',
    chair: 'all',
  });
  const [sort, setSort] = useState<SortState>({ key: 'totalPublications', direction: 'desc' });

  // Универсальный обработчик
  const handleFilterChange = (name: keyof PublicationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
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
    const { searchTerm, department, affiliateType, direction, institute, chair, startDate, endDate } = filters;

    // 1. Фильтрация по региону (Использует selectedRegionId)
    if (selectedRegionId !== 'national') {
      list = list.filter((p) => p.regionId === selectedRegionId);
    }
    
    // 2. Фильтрация по периоду (latestPublicationDate)
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();
    
    if (startDate && endDate) {
        list = list.filter(p => {
            const pubDateTimestamp = new Date(p.latestPublicationDate).getTime();
            // Добавляем один день к конечной дате, чтобы включить весь день
            const adjustedEndTimestamp = endTimestamp + 86400000; 
            return pubDateTimestamp >= startTimestamp && pubDateTimestamp < adjustedEndTimestamp;
        });
    }

    // 3. Фильтрация по подразделениям, аффилированности и направлениям
    if (department !== 'all') {
      list = list.filter((p) => p.department === department);
    }
    if (affiliateType !== 'all') {
        list = list.filter((p) => p.affiliateType === affiliateType);
    }
    if (direction !== 'all') {
        list = list.filter((p) => p.direction === direction);
    }
    if (institute !== 'all') {
        list = list.filter((p) => p.institute === institute);
    }
    if (chair !== 'all') {
        list = list.filter((p) => p.chair === chair);
    }
    
    // 4. Фильтрация по поисковому запросу (ФИО или Название публикации)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.authorName.toLowerCase().includes(lowerCaseSearch) ||
          p.latestPublicationTitle.toLowerCase().includes(lowerCaseSearch),
      );
    }

    // 5. Сортировка
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
        <h1>Публикации</h1>
        <div className="header-actions">
           <button 
              type="button" 
              className="action-button export-button"
              onClick={() => handleAction('Экспорт данных')}
            >
              <Download size={20} />
              Экспорт данных
            </button>
            <button 
              type="button" 
              className="action-button add-button"
              onClick={() => handleAction('Создать публикацию')}
            >
              <Plus size={20} />
              Создать публикацию
            </button>
        </div>
      </div>
      
      <div className="publications-content-wrapper">
        
        {/* === БОКОВАЯ ПАНЕЛЬ ФИЛЬТРОВ === */}
        <aside className="publications-sidebar">
          
          <div className="sidebar-section search-section">
            <label className="filter-label">Поиск</label>
            <div className="search-input">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="ФИО или название публикации"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
          </div>
          
          {/* Фильтр региона (ИСПОЛЬЗУЕТ regions и setSelectedRegionId) */}
          <div className="sidebar-section">
            <label htmlFor="region-filter" className="filter-label">Фильтр по региону</label>
            <select
              id="region-filter"
              value={selectedRegionId} 
              onChange={(e) => setSelectedRegionId(e.target.value as RegionId)} 
              className="sidebar-select"
            >
              <option value="national">Все регионы</option>
              {/* regions используется для создания списка опций */}
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* СЕКЦИЯ: ПЕРИОД ПУБЛИКАЦИИ */}
          <div className="sidebar-section">
            <label className="filter-label">Период публикации (Последняя)</label>
            <div className="date-range-inputs">
                <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="sidebar-input date-input"
                    aria-label="Дата начала"
                />
                <span className="date-separator">-</span>
                <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="sidebar-input date-input"
                    aria-label="Дата окончания"
                />
            </div>
          </div>
          
          {/* Фильтр подразделения (Department) */}
          <div className="sidebar-section">
            <label htmlFor="department-filter" className="filter-label">Подразделение (Отдел)</label>
            <select
              id="department-filter"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все подразделения</option>
              {allDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          
          {/* Фильтр Института */}
          <div className="sidebar-section">
            <label htmlFor="institute-filter" className="filter-label">Институт</label>
            <select
              id="institute-filter"
              value={filters.institute}
              onChange={(e) => handleFilterChange('institute', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все институты</option>
              {allInstitutes.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          
          {/* Фильтр Кафедры */}
          <div className="sidebar-section">
            <label htmlFor="chair-filter" className="filter-label">Кафедра</label>
            <select
              id="chair-filter"
              value={filters.chair}
              onChange={(e) => handleFilterChange('chair', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все кафедры</option>
              {allChairs.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          
          {/* СЕКЦИЯ: АФФИЛИРОВАННОСТЬ */}
          <div className="sidebar-section">
            <label htmlFor="affiliate-filter" className="filter-label">Аффилированность</label>
            <select
              id="affiliate-filter"
              value={filters.affiliateType}
              onChange={(e) => handleFilterChange('affiliateType', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все</option>
              <option value="staff">Штатный сотрудник</option>
              <option value="external">Сторонний исполнитель</option>
            </select>
          </div>
          
          {/* СЕКЦИЯ: НАПРАВЛЕНИЯ */}
          <div className="sidebar-section">
            <label htmlFor="direction-filter" className="filter-label">Направление</label>
            <select
              id="direction-filter"
              value={filters.direction}
              onChange={(e) => handleFilterChange('direction', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все направления</option>
              <option value="science">Естественные науки</option>
              <option value="tech">Технические науки</option>
              <option value="social">Социальные/Гуманитарные</option>
            </select>
          </div>
          
          {/* КНОПКА: СОРТИРОВАТЬ / ПРИМЕНИТЬ */}
          <button 
            type="button" 
            className="action-button apply-button"
            onClick={() => { /* Применить сортировку/фильтры */ alert('Фильтры применены.'); }}
          >
            <ArrowUpDown size={20} />
            Сортировать / Применить
          </button>
          
        </aside>
        
        {/* === ОСНОВНОЕ СОДЕРЖИМОЕ (ТАБЛИЦА) === */}
        <main className="publications-main-content">

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