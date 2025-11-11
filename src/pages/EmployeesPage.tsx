import React, { useMemo, useState } from 'react';
import { Plus, Search, Eye, Pencil, Trash2, ArrowUpDown } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext'; 
import './EmployeesPage.css';

// --- 1. Типы данных и мок-данные ---
export type AffiliateType = 'staff' | 'external' | 'all'; // Штатный/Сторонний/Все
export type GenderType = 'male' | 'female' | 'all';
export type CitizenshipType = 'resident' | 'non-resident' | 'all';
export type DegreeType = 'doctor' | 'candidate' | 'master' | 'phd' | 'none' | 'all';
export type HIndexGroup = '0-1' | '2-5' | '6-10' | '10+' | 'all';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  regionId: RegionId;
  hireDate: string;
  email: string;
  birthYear: number;
  affiliateType: AffiliateType;
  // НОВЫЕ ПОЛЯ
  gender: GenderType;
  degree: DegreeType;
  citizenship: CitizenshipType;
  projectRole: string; // Роль в проекте (напр., "Руководитель", "Исполнитель")
  hIndex: number;
}

const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Иванов И.И.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2015-01-10', email: 'ivanov@uni.kz', birthYear: 1985, affiliateType: 'staff', gender: 'male', degree: 'doctor', citizenship: 'resident', projectRole: 'Руководитель', hIndex: 7 },
  { id: 'e2', name: 'Петрова А.К.', position: 'Доцент', department: 'Кафедра B', regionId: 'west-kazakhstan', hireDate: '2018-05-20', email: 'petrova@uni.kz', birthYear: 1990, affiliateType: 'staff', gender: 'female', degree: 'candidate', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 4 },
  { id: 'e3', name: 'Сидоров Н.В.', position: 'Научный сотрудник', department: 'Лаборатория', regionId: 'shymkent-city', hireDate: '2020-09-01', email: 'sidorov@uni.kz', birthYear: 1978, affiliateType: 'external', gender: 'male', degree: 'phd', citizenship: 'non-resident', projectRole: 'Консультант', hIndex: 1 },
  { id: 'e4', name: 'Касымов Р.Ж.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2012-03-01', email: 'kasymov@uni.kz', birthYear: 1965, affiliateType: 'staff', gender: 'male', degree: 'doctor', citizenship: 'resident', projectRole: 'Руководитель', hIndex: 11 },
  { id: 'e5', name: 'Ахметова З.М.', position: 'Ассистент', department: 'Кафедра C', regionId: 'west-kazakhstan', hireDate: '2023-11-15', email: 'akhmetova@uni.kz', birthYear: 2000, affiliateType: 'staff', gender: 'female', degree: 'master', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 0 },
  { id: 'e6', name: 'Нурланов Б.К.', position: 'Консультант', department: 'Внештатно', regionId: 'astana-city', hireDate: '2023-01-01', email: 'nurlan@ext.kz', birthYear: 1995, affiliateType: 'external', gender: 'male', degree: 'none', citizenship: 'non-resident', projectRole: 'Исполнитель', hIndex: 2 },
  { id: 'e7', name: 'Есимова М.Е.', position: 'Лаборант', department: 'Кафедра C', regionId: 'astana-city', hireDate: '2024-02-01', email: 'esimova@uni.kz', birthYear: 2002, affiliateType: 'staff', gender: 'female', degree: 'none', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 0 },
  { id: 'e8', name: 'Торекулов Ж.Т.', position: 'Менеджер проектов', department: 'Отдел разработок', regionId: 'shymkent-city', hireDate: '2019-07-01', email: 'torekulov@uni.kz', birthYear: 1980, affiliateType: 'staff', gender: 'male', degree: 'phd', citizenship: 'resident', projectRole: 'Руководитель', hIndex: 6 },
];

// --- 2. Определение значений фильтров и типов ---
const currentYear = new Date().getFullYear();
// Устанавливаем минимальные и максимальные границы для фильтра возраста (20 - 80)
const MIN_AGE_LIMIT = 20; 
const MAX_AGE_LIMIT = 80;
const allPositions = Array.from(new Set(mockEmployees.map(e => e.position))).sort();
// const allDepartments = Array.from(new Set(mockEmployees.map(e => e.department))).sort();
const allProjectRoles = Array.from(new Set(mockEmployees.map(e => e.projectRole))).sort();


interface EmployeeFilters {
  searchTerm: string;
  position: string;
  department: string;
  minAge: number;
  maxAge: number;
  affiliateType: AffiliateType;
  // НОВЫЕ ФИЛЬТРЫ
  gender: GenderType | 'all';
  degree: DegreeType | 'all';
  citizenship: CitizenshipType | 'all';
  projectRole: string;
  hIndexGroup: HIndexGroup | 'all';
}

interface SortState {
  key: keyof Employee | '';
  direction: 'asc' | 'desc' | '';
}

// --- 3. Компонент страницы ---
const EmployeesPage: React.FC = () => {
  const { selectedRegionId, regions } = useRegionContext();
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    searchTerm: '',
    position: 'all',
    department: 'all',
    minAge: MIN_AGE_LIMIT, // Инициализация с мин. границей
    maxAge: MAX_AGE_LIMIT, // <--- ИСПРАВЛЕНО ЗДЕСЬ
    affiliateType: 'all',
    // НОВЫЕ ФИЛЬТРЫ
    gender: 'all',
    degree: 'all',
    citizenship: 'all',
    projectRole: 'all',
    hIndexGroup: 'all',
  });
  
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });

  // Универсальный обработчик для текстовых и селектов
  const handleFilterChange = (name: keyof EmployeeFilters, value: string | AffiliateType | GenderType | CitizenshipType | DegreeType | HIndexGroup) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик для ввода возраста
  const handleAgeChange = (name: 'minAge' | 'maxAge', value: string) => {
    let numValue = parseInt(value, 10);
    
    // Если ввод пуст или нечисловой, используем крайние границы
    if (isNaN(numValue) || value === '') {
        numValue = (name === 'minAge') ? MIN_AGE_LIMIT : MAX_AGE_LIMIT;
    }

    // Проверка границ
    if (name === 'minAge') {
        numValue = Math.min(numValue, filters.maxAge);
        numValue = Math.max(numValue, MIN_AGE_LIMIT);
    }
    if (name === 'maxAge') {
        numValue = Math.max(numValue, filters.minAge);
        numValue = Math.min(numValue, MAX_AGE_LIMIT);
    }
    
    setFilters(prev => ({ ...prev, [name]: numValue }));
  };
  
  // Функция для изменения сортировки при клике на заголовок таблицы
  const handleSortChange = (key: keyof Employee | 'age') => {
      // Для возраста используем 'birthYear', но в обратном порядке сортировки
      const sortKey = key === 'age' ? 'birthYear' : key as keyof Employee;

      setSort(prev => {
          let direction: SortState['direction'] = 'asc';
          if (prev.key === sortKey) {
              direction = prev.direction === 'asc' ? 'desc' : 'asc';
          }
          
          // Чтобы сортировка была по возрастанию возраста, нужно asc по возрасту = desc по birthYear
          if (key === 'age') {
             direction = (prev.key === sortKey && prev.direction === 'desc') ? 'asc' : 'desc';
          }
          
          return { key: sortKey, direction };
      });
  };


  // Функция для преобразования H-index в группу
  const getHIndexGroup = (hIndex: number): HIndexGroup | '10+' => {
      if (hIndex >= 0 && hIndex <= 1) return '0-1';
      if (hIndex >= 2 && hIndex <= 5) return '2-5';
      if (hIndex >= 6 && hIndex <= 10) return '6-10';
      return '10+';
  };


  // --- ЛОГИКА ФИЛЬТРАЦИИ И СОРТИРОВКИ ---
  const filteredEmployees = useMemo(() => {
    let list = mockEmployees;
    const { searchTerm, position, department, minAge, maxAge, affiliateType, gender, degree, citizenship, projectRole, hIndexGroup } = filters;

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
    
    // 4. Фильтрация по аффилированности
    if (affiliateType !== 'all') {
        list = list.filter(e => e.affiliateType === affiliateType);
    }
    
    // 5. Фильтрация по полу
    if (gender !== 'all') {
        list = list.filter(e => e.gender === gender);
    }
    
    // 6. Фильтрация по ученой степени
    if (degree !== 'all') {
        list = list.filter(e => e.degree === degree);
    }
    
    // 7. Фильтрация по гражданству
    if (citizenship !== 'all') {
        list = list.filter(e => e.citizenship === citizenship);
    }
    
    // 8. Фильтрация по роли в проекте
    if (projectRole !== 'all') {
        list = list.filter(e => e.projectRole === projectRole);
    }

    // 9. Фильтрация по H-index
    if (hIndexGroup !== 'all') {
        list = list.filter(e => getHIndexGroup(e.hIndex) === hIndexGroup);
    }
    
    // 10. Фильтрация по возрасту
    const currentYear = new Date().getFullYear();
    list = list.filter(e => {
        const age = currentYear - e.birthYear;
        return age >= minAge && age <= maxAge;
    });

    // 11. Фильтрация по поисковому запросу
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

    // 12. Сортировка
    if (sort.key && sort.direction) {
      list = [...list].sort((a, b) => {
        const aValue = a[sort.key as keyof Employee];
        const bValue = b[sort.key as keyof Employee];
        
        let comparison = 0;

        // Обработка числовых (hIndex, birthYear)
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

          {/* СЕКЦИЯ: ПОЛ */}
          <div className="sidebar-section">
            <label htmlFor="gender-filter" className="filter-label">Пол (Гендер)</label>
            <select
              id="gender-filter"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value as GenderType)}
              className="sidebar-select"
            >
              <option value="all">Любой</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </div>

          

          {/* СЕКЦИЯ: ВОЗРАСТ (20 - 80) */}
          <div className="sidebar-section">
            <label className="filter-label">Возраст (лет)</label>
            <div className="age-range-inputs">
                {/* Ввод минимального возраста */}
                <input
                    type="number"
                    min={MIN_AGE_LIMIT}
                    max={MAX_AGE_LIMIT}
                    value={filters.minAge.toString()}
                    onChange={(e) => handleAgeChange('minAge', e.target.value)}
                    className="sidebar-input age-input"
                    placeholder="От 20"
                />
                <span className="age-separator">-</span>
                {/* Ввод максимального возраста */}
                <input
                    type="number"
                    min={MIN_AGE_LIMIT}
                    max={MAX_AGE_LIMIT}
                    value={filters.maxAge.toString()}
                    onChange={(e) => handleAgeChange('maxAge', e.target.value)}
                    className="sidebar-input age-input"
                    placeholder="До 80"
                />
            </div>
          </div>

          {/* Фильтр УЧЕНОЙ СТЕПЕНИ */}
          <div className="sidebar-section">
            <label htmlFor="degree-filter" className="filter-label">Ученая степень</label>
            <select
              id="degree-filter"
              value={filters.degree}
              onChange={(e) => handleFilterChange('degree', e.target.value as DegreeType)}
              className="sidebar-select"
            >
              <option value="all">Все степени</option>
              <option value="doctor">Доктор наук</option>
              <option value="candidate">Кандидат наук</option>
              <option value="phd">PhD</option>
              <option value="master">Магистр</option>
              <option value="none">Нет степени</option>
            </select>
          </div>
          
          
          {/* СЕКЦИЯ: ГРАЖДАНСТВО */}
          <div className="sidebar-section">
            <label htmlFor="citizenship-filter" className="filter-label">Гражданство</label>
            <select
              id="citizenship-filter"
              value={filters.citizenship}
              onChange={(e) => handleFilterChange('citizenship', e.target.value as CitizenshipType)}
              className="sidebar-select"
            >
              <option value="all">Любое</option>
              <option value="resident">Резидент (гражданин РК)</option>
              <option value="non-resident">Не резидент</option>
            </select>
          </div>
          
          {/* Фильтр региона */}
          {/* <div className="sidebar-section">
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
          </div> */}
          
          {/* Фильтр должности (Академическая степень) */}
          <div className="sidebar-section">
            <label htmlFor="position-filter" className="filter-label">Академическая степень</label>
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

          {/* Фильтр Роль в проекте */}
          <div className="sidebar-section">
            <label htmlFor="project-role-filter" className="filter-label">Роль в проекте</label>
            <select
              id="project-role-filter"
              value={filters.projectRole}
              onChange={(e) => handleFilterChange('projectRole', e.target.value)}
              className="sidebar-select"
            >
              <option value="all">Все роли</option>
              {allProjectRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          
          {/* Фильтр подразделения */}
          {/* <div className="sidebar-section">
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
          </div> */}
          

          {/* СЕКЦИЯ: АФФИЛИРОВАННОСТЬ (Штатный/Сторонний) */}
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
          
          {/* СЕКЦИЯ: H-INDEX */}
          <div className="sidebar-section">
            <label htmlFor="h-index-filter" className="filter-label">Индекс Хирша (H-index)</label>
            <select
              id="h-index-filter"
              value={filters.hIndexGroup}
              onChange={(e) => handleFilterChange('hIndexGroup', e.target.value as HIndexGroup)}
              className="sidebar-select"
            >
              <option value="all">Все</option>
              <option value="0-1">0 - 1</option>
              <option value="2-5">2 - 5</option>
              <option value="6-10">6 - 10</option>
              <option value="10+">10 и выше</option>
            </select>
          </div>
          
          <button 
            type="button" 
            className="add-employee-button sidebar-button"
            onClick={() => { alert('Фильтры применены.'); }}
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
                  <th>Уч. ст.</th>
                  <th onClick={() => handleSortChange('hIndex')} className={sort.key === 'hIndex' ? sort.direction : ''}>
                    H-index <ArrowUpDown size={14} />
                  </th>
                  <th>Регион</th>
                  <th onClick={() => handleSortChange('age')} className={sort.key === 'birthYear' ? sort.direction : ''}>
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
                    <td>{employee.name} ({employee.gender === 'male' ? 'М' : 'Ж'})</td>
                    <td>{employee.position}</td>
                    <td>{employee.degree === 'none' ? '-' : employee.degree}</td>
                    <td>{employee.hIndex}</td>
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