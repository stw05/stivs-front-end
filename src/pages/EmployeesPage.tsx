import React, { useMemo, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext'; 
import './EmployeesPage.css';

// --- 1. Типы данных и мок-данные ---
export type AffiliateType = 'staff' | 'external' | 'all'; // Штатный/Сторонний/Все

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  regionId: RegionId;
  hireDate: string;
  email: string;
  birthYear: number; // Год рождения для расчета возраста
  affiliateType: AffiliateType;
}

const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Иванов И.И.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2015-01-10', email: 'ivanov@uni.kz', birthYear: 1985, affiliateType: 'staff' },
  { id: 'e2', name: 'Петрова А.К.', position: 'Доцент', department: 'Кафедра B', regionId: 'west-kazakhstan', hireDate: '2018-05-20', email: 'petrova@uni.kz', birthYear: 1990, affiliateType: 'staff' },
  { id: 'e3', name: 'Сидоров Н.В.', position: 'Научный сотрудник', department: 'Лаборатория', regionId: 'shymkent-city', hireDate: '2020-09-01', email: 'sidorov@uni.kz', birthYear: 1978, affiliateType: 'external' },
  { id: 'e4', name: 'Касымов Р.Ж.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2012-03-01', email: 'kasymov@uni.kz', birthYear: 1965, affiliateType: 'staff' },
  { id: 'e5', name: 'Ахметова З.М.', position: 'Ассистент', department: 'Кафедра C', regionId: 'west-kazakhstan', hireDate: '2023-11-15', email: 'akhmetova@uni.kz', birthYear: 2000, affiliateType: 'staff' },
  { id: 'e6', name: 'Нурланов Б.К.', position: 'Консультант', department: 'Внештатно', regionId: 'astana-city', hireDate: '2023-01-01', email: 'nurlan@ext.kz', birthYear: 1995, affiliateType: 'external' },
  { id: 'e7', name: 'Есимова М.Е.', position: 'Лаборант', department: 'Кафедра C', regionId: 'astana-city', hireDate: '2024-02-01', email: 'esimova@uni.kz', birthYear: 2002, affiliateType: 'staff' },
  { id: 'e8', name: 'Торекулов Ж.Т.', position: 'Менеджер проектов', department: 'Отдел разработок', regionId: 'shymkent-city', hireDate: '2019-07-01', email: 'torekulov@uni.kz', birthYear: 1980, affiliateType: 'staff' },
];

// --- 2. Определение значений фильтров и типов ---
const currentYear = new Date().getFullYear();
const allAges = mockEmployees.map(e => currentYear - e.birthYear);
const maxEmployeeAge = Math.max(...allAges); 
const minEmployeeAge = Math.min(...allAges);
const allPositions = Array.from(new Set(mockEmployees.map(e => e.position))).sort();
const allDepartments = Array.from(new Set(mockEmployees.map(e => e.department))).sort();

interface EmployeeFilters {
  searchTerm: string;
  position: string;
  department: string;
  minAge: number;
  maxAge: number;
  affiliateType: AffiliateType;
}

interface SortState {
  key: keyof Employee | ''; // Ключ поля для сортировки
  direction: 'asc' | 'desc' | ''; // Направление
}

// --- 3. Компонент страницы ---
const EmployeesPage: React.FC = () => {
  const { selectedRegionId, regions, setSelectedRegionId } = useRegionContext();
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchTerm: '',
    position: 'all',
    department: 'all',
    minAge: minEmployeeAge,
    maxAge: maxEmployeeAge,
    affiliateType: 'all',
  });
  
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });

  // Универсальный обработчик для текстовых и селектов
  const handleFilterChange = (name: keyof EmployeeFilters, value: string | AffiliateType) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Безопасный обработчик для ввода возраста (предотвращает NaN)
  const handleAgeChange = (name: 'minAge' | 'maxAge', value: string) => {
    let numValue = parseInt(value, 10);
    
    // Если ввод пуст или нечисловой, используем крайние границы
    if (isNaN(numValue) || value === '') {
        numValue = (name === 'minAge') ? minEmployeeAge : maxEmployeeAge;
    }

    // Проверка границ: minAge не должен быть больше maxAge и наоборот
    if (name === 'minAge') {
        numValue = Math.min(numValue, filters.maxAge);
        numValue = Math.max(numValue, minEmployeeAge);
    }
    if (name === 'maxAge') {
        numValue = Math.max(numValue, filters.minAge);
        numValue = Math.min(numValue, maxEmployeeAge);
    }
    
    setFilters(prev => ({ ...prev, [name]: numValue }));
  };
  
  // Функция для изменения сортировки при клике на заголовок таблицы
  const handleSortChange = (key: keyof Employee) => {
    setSort(prev => {
      let direction: SortState['direction'] = 'asc';
      if (prev.key === key) {
        direction = prev.direction === 'asc' ? 'desc' : 'asc';
      }
      return { key, direction };
    });
  };


  // --- ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ---
  const filteredEmployees = useMemo(() => {
    let list = mockEmployees;
    const { searchTerm, position, department, minAge, maxAge, affiliateType } = filters;

    // 1. Фильтрация по региону
    if (selectedRegionId !== 'national') {
      list = list.filter((e) => e.regionId === selectedRegionId);
    }

    // 2. Фильтрация по должности
    if (position !== 'all') {
      list = list.filter((e) => e.position === position);
    }
    
    // 3. Фильтрация по подразделению
    if (department !== 'all') {
      list = list.filter((e) => e.department === department);
    }
    
    // 4. Фильтрация по возрасту
    const currentYear = new Date().getFullYear();
    list = list.filter(e => {
        const age = currentYear - e.birthYear;
        return age >= minAge && age <= maxAge;
    });

    // 5. Фильтрация по аффилированности
    if (affiliateType !== 'all') {
        list = list.filter(e => e.affiliateType === affiliateType);
    }
    
    // 6. Фильтрация по поисковому запросу
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(lowerCaseSearch) ||
          e.email.toLowerCase().includes(lowerCaseSearch) ||
          e.position.toLowerCase().includes(lowerCaseSearch) ||
          e.department.toLowerCase().includes(lowerCaseSearch),
      );
    }

    // 7. Сортировка
    if (sort.key && sort.direction) {
      list = [...list].sort((a, b) => {
        const aValue = (sort.key === 'birthYear' ? currentYear - a.birthYear : a[sort.key as keyof Employee]);
        const bValue = (sort.key === 'birthYear' ? currentYear - b.birthYear : b[sort.key as keyof Employee]);
        
        let comparison = 0;

        // Обработка числовых (возраст, год рождения)
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } 
        // Обработка строковых (имя, должность, дата)
        else if (aValue && bValue) {
          comparison = String(aValue).localeCompare(String(bValue));
        }

        return sort.direction === 'asc' ? comparison : -comparison;
      });
    }

    return list;
  }, [selectedRegionId, filters, sort]);

  // Заглушка для действий с сотрудниками
  const handleAction = (action: string, employee?: Employee) => {
    const employeeName = employee ? employee.name : 'новый сотрудник';
    alert(`${action}: ${employeeName}`);
  };

  return (
    <div className="employees-page">
      <div className="page-header-controls">
      <h1>Сотрудники</h1>
        <button 
          type="button" 
          className="add-employee-button"
          onClick={() => handleAction('Добавление')}
        >
          <Plus size={20} />
          Добавить сотрудника
        </button>
      </div>

      
      <div className="employees-content-wrapper">
        
        {/* === БОКОВАЯ ПАНЕЛЬ ФИЛЬТРОВ === */}
        <aside className="employees-sidebar">
          
          <div className="sidebar-section search-section">
            <label className="filter-label">Поиск</label>
            <div className="search-input">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Поиск по ФИО, email..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              />
            </div>
          </div>
          
          {/* Фильтр региона */}
          <div className="sidebar-section">
            <label htmlFor="region-filter" className="filter-label">Фильтр по региону</label>
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
          
          {/* Фильтр должности */}
          <div className="sidebar-section">
            <label htmlFor="position-filter" className="filter-label">Фильтр по должности</label>
            <select
              id="position-filter"
              value={filters.position}
              onChange={(e) => handleFilterChange('position', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все должности</option>
              {allPositions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          
          {/* Фильтр подразделения */}
          <div className="sidebar-section">
            <label htmlFor="department-filter" className="filter-label">Фильтр по подразделению</label>
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
          
          {/* СЕКЦИЯ: ВОЗРАСТ */}
          <div className="sidebar-section">
            <label className="filter-label">Возраст ({filters.minAge} - {filters.maxAge})</label>
            <div className="age-range-inputs">
                {/* Ввод минимального возраста */}
                <input
                    type="number"
                    min={minEmployeeAge}
                    max={filters.maxAge}
                    value={filters.minAge.toString()}
                    onChange={(e) => handleAgeChange('minAge', e.target.value)}
                    className="sidebar-input age-input"
                    placeholder="От"
                />
                <span className="age-separator">-</span>
                {/* Ввод максимального возраста */}
                <input
                    type="number"
                    min={filters.minAge}
                    max={maxEmployeeAge}
                    value={filters.maxAge.toString()}
                    onChange={(e) => handleAgeChange('maxAge', e.target.value)}
                    className="sidebar-input age-input"
                    placeholder="До"
                />
            </div>
          </div>
          
          {/* СЕКЦИЯ: АФФИЛИРОВАННОСТЬ */}
          <div className="sidebar-section">
            <label htmlFor="affiliate-filter" className="filter-label">Аффилированность</label>
            <select
              id="affiliate-filter"
              value={filters.affiliateType}
              onChange={(e) => handleFilterChange('affiliateType', e.target.value as AffiliateType)}
              className="sidebar-select"
            >
              <option value="all">Все</option>
              <option value="staff">Штатный сотрудник</option>
              <option value="external">Сторонний исполнитель</option>
            </select>
          </div>
          
          <button 
            type="button" 
            className="add-employee-button sidebar-button"
            onClick={() => { /* В реальном приложении здесь можно было бы сбросить пагинацию */ alert('Фильтры применены.'); }}
          >
            <ArrowUpDown size={20} />
            Сортировать / Применить
          </button>
          
        </aside>
        
        {/* === ОСНОВНОЕ СОДЕРЖИМОЕ (ТАБЛИЦА) === */}
        <main className="employees-main-content">
          


          <div className="employee-table-container">
            <table className="employee-table">
              <thead>
                <tr>
                  {/* Заголовки, которые можно сортировать */}
                  <th onClick={() => handleSortChange('name')} className={sort.key === 'name' ? sort.direction : ''}>
                    ФИО <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => handleSortChange('position')} className={sort.key === 'position' ? sort.direction : ''}>
                    Должность <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => handleSortChange('department')} className={sort.key === 'department' ? sort.direction : ''}>
                    Подразделение <ArrowUpDown size={14} />
                  </th>
                  <th>Регион</th>
                  <th onClick={() => handleSortChange('birthYear')} className={sort.key === 'birthYear' ? sort.direction : ''}>
                    Возраст <ArrowUpDown size={14} />
                  </th>
                  <th onClick={() => handleSortChange('hireDate')} className={sort.key === 'hireDate' ? sort.direction : ''}>
                    Дата приема <ArrowUpDown size={14} />
                  </th>
                  <th className="actions-column">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.name}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department}</td>
                    <td>{regions.find(r => r.id === employee.regionId)?.shortName || 'Н/Д'}</td>
                    <td>{currentYear - employee.birthYear}</td> 
                    <td>{new Date(employee.hireDate).toLocaleDateString('ru-RU')}</td>
                    
                    <td className="actions-column">
                      <div className="actions-buttons">
                        <button 
                          onClick={() => handleAction('Просмотр', employee)} 
                          aria-label="Просмотр сотрудника"
                          title="Просмотр"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction('Редактирование', employee)} 
                          aria-label="Редактировать сотрудника"
                          title="Редактировать"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleAction('Удаление', employee)} 
                          aria-label="Удалить сотрудника"
                          title="Удалить"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Сообщение, если список сотрудников пуст */}
            {filteredEmployees.length === 0 && (
              <div className="no-results">
                Сотрудники не найдены по текущим фильтрам.
              </div>
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
};

export default EmployeesPage;