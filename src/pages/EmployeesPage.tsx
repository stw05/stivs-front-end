import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search, Eye, Pencil, Trash2, ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext'; 
import './EmployeesPage.css';
import { useTranslation } from 'react-i18next';

// --- 1. Типы данных и мок-данные ---
export type AffiliateType = 'staff' | 'external' | 'all'; // Штатный/Сторонний/Все
export type GenderType = 'male' | 'female' | 'all';
export type CitizenshipType = 'resident' | 'non-resident' | 'all';
export type DegreeType = 'doctor' | 'candidate' | 'master' | 'phd' | 'none' | 'all';
export type HIndexGroup = '0-1' | '2-5' | '6-10' | '10+' | 'all';
export type MRNTIType = '11.00.00' | '27.00.00' | '55.00.00' | 'all'; // Примерные коды
export type ClassifierType = 'economic' | 'social' | 'technical' | 'all'; // Примерные категории

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
  mrntiCode: MRNTIType;
  classifier: ClassifierType;
  scopusAuthorId: string; // Author ID в Scopus
  researcherIdWos: string; // Researcher ID Web of Science
}

const mockEmployees: Employee[] = [
  // 🟢 ОБНОВЛЕННЫЕ МОК-ДАННЫЕ (добавлены mrntiCode и classifier)
  { id: 'e1', name: 'Иванов И.И.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2015-01-10', email: 'ivanov@uni.kz', birthYear: 1985, affiliateType: 'staff', gender: 'male', degree: 'doctor', citizenship: 'resident', projectRole: 'Руководитель', hIndex: 7, mrntiCode: '11.00.00', classifier: 'technical' , scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
  { id: 'e2', name: 'Петрова А.К.', position: 'Доцент', department: 'Кафедра B', regionId: 'west-kazakhstan', hireDate: '2018-05-20', email: 'petrova@uni.kz', birthYear: 1990, affiliateType: 'staff', gender: 'female', degree: 'candidate', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 4, mrntiCode: '27.00.00', classifier: 'social', scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
  { id: 'e3', name: 'Сидоров Н.В.', position: 'Научный сотрудник', department: 'Лаборатория', regionId: 'shymkent-city', hireDate: '2020-09-01', email: 'sidorov@uni.kz', birthYear: 1978, affiliateType: 'external', gender: 'male', degree: 'phd', citizenship: 'non-resident', projectRole: 'Консультант', hIndex: 1, mrntiCode: '11.00.00', classifier: 'economic' , scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
  { id: 'e4', name: 'Касымов Р.Ж.', position: 'Профессор', department: 'Кафедра А', regionId: 'almaty-city', hireDate: '2012-03-01', email: 'kasymov@uni.kz', birthYear: 1965, affiliateType: 'staff', gender: 'male', degree: 'doctor', citizenship: 'resident', projectRole: 'Руководитель', hIndex: 11, mrntiCode: '55.00.00', classifier: 'technical', scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
  { id: 'e5', name: 'Ахметова З.М.', position: 'Ассистент', department: 'Кафедра C', regionId: 'west-kazakhstan', hireDate: '2023-11-15', email: 'akhmetova@uni.kz', birthYear: 2000, affiliateType: 'staff', gender: 'female', degree: 'master', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 0, mrntiCode: '27.00.00', classifier: 'social' , scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171'},
  { id: 'e6', name: 'Нурланов Б.К.', position: 'Консультант', department: 'Внештатно', regionId: 'astana-city', hireDate: '2023-01-01', email: 'nurlan@ext.kz', birthYear: 1995, affiliateType: 'external', gender: 'male', degree: 'none', citizenship: 'non-resident', projectRole: 'Исполнитель', hIndex: 2, mrntiCode: '55.00.00', classifier: 'technical' , scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171'},
  { id: 'e7', name: 'Есимова М.Е.', position: 'Лаборант', department: 'Кафедра C', regionId: 'astana-city', hireDate: '2024-02-10', email: 'esimova@uni.kz', birthYear: 1998, affiliateType: 'staff', gender: 'female', degree: 'master', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 1, mrntiCode: '11.00.00', classifier: 'economic', scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
  { id: 'e8', name: 'Байтереков С.Т.', position: 'Младший научный сотрудник', department: 'Лаборатория', regionId: 'almaty-city', hireDate: '2024-03-01', email: 'baiterek@uni.kz', birthYear: 1996, affiliateType: 'staff', gender: 'male', degree: 'master', citizenship: 'resident', projectRole: 'Исполнитель', hIndex: 0, mrntiCode: '27.00.00', classifier: 'technical', scopusAuthorId: '56481630300', researcherIdWos: 'https://orcid.org/0000-0002-2348-171' },
];

// --- 2. Определение значений фильтров и типов ---
const currentYear = new Date().getFullYear();
// Устанавливаем минимальные и максимальные границы для фильтра возраста (20 - 80)
const MIN_AGE_LIMIT = 20; 
const MAX_AGE_LIMIT = 80;
const allPositions = Array.from(new Set(mockEmployees.map((e) => e.position))).sort();
const allProjectRoles = Array.from(new Set(mockEmployees.map((e) => e.projectRole))).sort();
const allDepartments = Array.from(new Set(mockEmployees.map((e) => e.department))).sort();


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
  mrnti: MRNTIType;
  classifier: ClassifierType;
  regionId: RegionId | 'all';
}

interface SortState {
  key: keyof Employee | '';
  direction: 'asc' | 'desc' | '';
}

type EmployeeColumnKey =
  | 'name'
  | 'position'
  | 'degree'
  | 'scopusAuthorId'
  | 'researcherIdWos'
  | 'hIndex'
  | 'region'
  | 'age'
  | 'hireDate';

interface EmployeeColumnDefinition {
  key: EmployeeColumnKey;
  label: string;
  sortKey?: keyof Employee | 'age';
}

const employeeColumnDefinitions: EmployeeColumnDefinition[] = [
  { key: 'name', label: 'ФИО', sortKey: 'name' },
  { key: 'position', label: 'Ученое звание', sortKey: 'position' },
  { key: 'degree', label: 'Ученая степень', sortKey: 'degree' },
  { key: 'scopusAuthorId', label: 'AUTHOR ID В SCOPUS' },
  { key: 'researcherIdWos', label: 'RESEARCHER ID WEB OF SCIENCE' },
  { key: 'hIndex', label: 'H-index', sortKey: 'hIndex' },
  { key: 'region', label: 'Регион' },
  { key: 'age', label: 'Возраст', sortKey: 'age' },
  { key: 'hireDate', label: 'Дата приема', sortKey: 'hireDate' },
];

const defaultVisibleEmployeeColumns: Record<EmployeeColumnKey, boolean> = employeeColumnDefinitions.reduce(
  (acc, column) => ({
    ...acc,
    [column.key]: true,
  }),
  {} as Record<EmployeeColumnKey, boolean>,
);

const createInitialFilters = (): EmployeeFilters => ({
  searchTerm: '',
  position: 'all',
  department: 'all',
  minAge: MIN_AGE_LIMIT,
  maxAge: MAX_AGE_LIMIT,
  affiliateType: 'all',
  gender: 'all',
  degree: 'all',
  citizenship: 'all',
  projectRole: 'all',
  hIndexGroup: 'all',
  mrnti: 'all',
  classifier: 'all',
  regionId: 'all',
});

// --- 3. Компонент страницы ---
const EmployeesPage: React.FC = () => {
  const { selectedRegionId, regions } = useRegionContext();
  const { t } = useTranslation(); 
  
  const [filters, setFilters] = useState<EmployeeFilters>(() => createInitialFilters());
  
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState<Record<EmployeeColumnKey, boolean>>(() => ({
    ...defaultVisibleEmployeeColumns,
  }));
  const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement | null>(null);

  const regionNameById = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((region) => {
      map[region.id] = region.shortName ?? region.name;
    });
    return map;
  }, [regions]);

  const activeColumns = useMemo(
    () => employeeColumnDefinitions.filter((column) => visibleColumns[column.key]),
    [visibleColumns],
  );

  // Универсальный обработчик для текстовых и селектов
  const handleFilterChange = (name: keyof EmployeeFilters, value: string | AffiliateType | GenderType | CitizenshipType | DegreeType | HIndexGroup) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const resetFilters = () => {
    setFilters(createInitialFilters());
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

  const toggleColumn = (columnKey: EmployeeColumnKey) => {
    setVisibleColumns((prev) => {
      const visibleCount = Object.values(prev).filter(Boolean).length;
      const nextValue = !prev[columnKey];
      if (!nextValue && visibleCount === 1) {
        return prev;
      }
      return { ...prev, [columnKey]: nextValue };
    });
  };

  useEffect(() => {
    if (!isColumnPickerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target as Node)) {
        setIsColumnPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isColumnPickerOpen]);


  // Функция для преобразования H-index в группу
  const getHIndexGroup = (hIndex: number): HIndexGroup | '10+' => {
      if (hIndex >= 0 && hIndex <= 1) return '0-1';
      if (hIndex >= 2 && hIndex <= 5) return '2-5';
      if (hIndex >= 6 && hIndex <= 10) return '6-10';
     return '10+';
  };

  const renderEmployeeCell = (columnKey: EmployeeColumnKey, employee: Employee): React.ReactNode => {
    switch (columnKey) {
      case 'name':
        return `${employee.name} (${employee.gender === 'male' ? t('gender_short_male') : t('gender_short_female')})`;
      case 'position':
        return employee.position;
      case 'degree':
        return employee.degree === 'none' ? '-' : employee.degree;
      case 'scopusAuthorId':
        return employee.scopusAuthorId;
      case 'researcherIdWos':
        return (
          <a
            href={employee.researcherIdWos}
            target="_blank"
            rel="noopener noreferrer"
            style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}
          >
            {employee.researcherIdWos}
          </a>
        );
      case 'hIndex':
        return employee.hIndex;
      case 'region':
        return regionNameById[employee.regionId] ?? t('not_available_short');
      case 'age':
        return currentYear - employee.birthYear;
      case 'hireDate':
        return new Date(employee.hireDate).toLocaleDateString('ru-RU');
      default:
        return null;
    }
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

    // 🟢 7. ФИЛЬТРАЦИЯ ПО МРНТИ
    if (filters.mrnti !== 'all') {
        // ✅ ИСПРАВЛЕНО
        list = list.filter((emp) => emp.mrntiCode === filters.mrnti); 
    }
    
    // 🟢 8. ФИЛЬТРАЦИЯ ПО КЛАССИФИКАТОРУ
    if (filters.classifier !== 'all') {
        // ✅ ИСПРАВЛЕНО
        list = list.filter((emp) => emp.classifier === filters.classifier);
    }

    // 🟢 9. ФИЛЬТРАЦИЯ ПО РЕГИОНУ (фильтр на боковой панели)
    if (filters.regionId !== 'all') {
        // ✅ ИСПРАВЛЕНО
        list = list.filter((emp) => emp.regionId === filters.regionId);
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
    const employeeName = employee ? employee.name : t('new_employee');
    alert(`${action}: ${employeeName}`);
  };
  
  const totalEmployeesCount = filteredEmployees.length;

  return (
    <div className="employees-page">
      <header className="employees-header">
        <div>
          <h1>{t('employees_page_title')}</h1>
          <p>
            {t('in_database')}{mockEmployees.length} {t('found_count')}{totalEmployeesCount}
          </p>
        </div>
        <div className="employees-header-actions">
          <button
            type="button"
            className="employees-header-button"
            onClick={() => handleAction('Выгрузка отчета')}
          >
            <Download size={18} />
            {t('button_export_report')}
          </button>
        </div>
      </header>

      <div className="employees-search-line">
        <div className="employees-search-toolbar">
          <div className="employees-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('search_placeholder_employees')}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          <div className="employees-column-picker" ref={columnPickerRef}>
            <button
              type="button"
              className="employees-column-button"
              onClick={() => setIsColumnPickerOpen((prev) => !prev)}
            >
              <SlidersHorizontal size={18} />
              {t('button_customize_columns')}
            </button>
            {isColumnPickerOpen && (
              <div className="employees-column-list">
                {employeeColumnDefinitions.map((column) => (
                  <label key={column.key} className="employees-column-option">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() => toggleColumn(column.key)}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="employees-content">
        <aside className="employees-sidebar">
          <div className="employees-filter-block">
            <div className="employees-filter-title">{t('filter_section_general')}</div>
            <div className="employees-filters-grid">
              <div className="employees-filter-item">
                <label htmlFor="gender-filter">{t('filter_label_gender')}</label>
                <select
                  id="gender-filter"
                  value={filters.gender}
                  onChange={(e) => handleFilterChange('gender', e.target.value as GenderType)}
                >
                  <option value="all">{t('filter_option_any')}</option>
                  <option value="male">{t('gender_male')}</option>
                  <option value="female">{t('gender_female')}</option>
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="affiliate-filter">{t('filter_label_affiliate')}</label>
                <select
                  id="affiliate-filter"
                  value={filters.affiliateType}
                  onChange={(e) => handleFilterChange('affiliateType', e.target.value as AffiliateType)}
                >
                  <option value="all">{t('filter_option_all')}</option>
                  <option value="staff">{t('affiliate_staff')}</option>
                  <option value="external">{t('affiliate_external')}</option>
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="citizenship-filter">{t('filter_label_citizenship')}</label>
                <select
                  id="citizenship-filter"
                  value={filters.citizenship}
                  onChange={(e) => handleFilterChange('citizenship', e.target.value as CitizenshipType)}
                >
                  <option value="all">{t('filter_option_any')}</option>
                  <option value="resident">{t('citizenship_resident')}</option>
                  <option value="non-resident">{t('citizenship_nonresident')}</option>
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="regionId">{t('employee_col_region')}</label>
                <select
                  id="regionId"
                  value={filters.regionId}
                  onChange={(e) => handleFilterChange('regionId', e.target.value as RegionId | 'all')}
                >
                  <option value="all">{t('filter_option_all_regions')}</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="employees-filter-block">
            <div className="employees-filter-title">{t('filter_section_activity')}</div>
            <div className="employees-filters-grid">
              <div className="employees-filter-item">
                <label htmlFor="degree-filter">{t('filter_label_degree')}</label>
                <select
                  id="degree-filter"
                  value={filters.degree}
                  onChange={(e) => handleFilterChange('degree', e.target.value as DegreeType)}
                >
                  <option value="all">{t('filter_option_all_degrees')}</option>
                  <option value="doctor">{t('degree_doctor')}</option>
                  <option value="candidate">{t('degree_candidate')}</option>
                  <option value="phd">{t('degree_phd')}</option>
                  <option value="master">{t('degree_master')}</option>
                  <option value="none">{t('degree_none')}</option>
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="position-filter">{t('filter_label_position')}</label>
                <select
                  id="position-filter"
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                >
                  <option value="all">{t('filter_option_all')}</option>
                  {allPositions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="department-filter">{t('filter_label_department')}</label>
                <select
                  id="department-filter"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                >
                  <option value="all">{t('filter_option_all_departments')}</option>
                  {allDepartments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="employees-filter-item">
                <label htmlFor="project-role-filter">{t('filter_label_project_role')}</label>
                <select
                  id="project-role-filter"
                  value={filters.projectRole}
                  onChange={(e) => handleFilterChange('projectRole', e.target.value)}
                >
                  <option value="all">{t('filter_option_all_roles')}</option>
                  {allProjectRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="employees-filter-block">
            {/* 🟢 ЗАГОЛОВОК СЕКЦИИ */}
            <div className="employees-filter-title">{t('filter_section_research_codes')}</div>
            <div className="employees-filters-grid">
              <div className="employees-filter-item">
                {/* 🟢 ФИЛЬТР: МРНТИ */}
                <label htmlFor="mrnti">{t('filter_label_mrnti')}</label>
                <select
                  id="mrnti"
                  value={filters.mrnti}
                  onChange={(e) => handleFilterChange('mrnti', e.target.value as MRNTIType)}
                >
                  <option value="all">{t('filter_option_all_codes')}</option>
                  <option value="11.00.00">11.00.00 — {t('mrnti_11_desc')}</option>
                  <option value="27.00.00">27.00.00 — {t('mrnti_27_desc')}</option>
                  <option value="55.00.00">55.00.00 — {t('mrnti_55_desc')}</option>
                </select>
            </div>

            <div className="employees-filter-item">
                {/* 🟢 ФИЛЬТР: КЛАССИФИКАТОР */}
                <label htmlFor="classifier">{t('filter_label_classifier')}</label>
                <select
                  id="classifier"
                  value={filters.classifier}
                  onChange={(e) => handleFilterChange('classifier', e.target.value as ClassifierType)}
                >
                  <option value="all">{t('filter_option_all_classifiers')}</option>
                  <option value="economic">{t('classifier_economic')}</option>
                  <option value="social">{t('classifier_social')}</option>
                  <option value="technical">{t('classifier_technical')}</option>
                </select>
              </div>
            </div>
          </div>

         <div className="employees-filter-block">
            {/* 🟢 ЗАГОЛОВОК СЕКЦИИ */}
            <div className="employees-filter-title">{t('filter_section_metrics')}</div>
            <div className="employees-filter-item employees-filter-item--vertical">
              {/* 🟢 ФИЛЬТР: ВОЗРАСТ */}
              <label>{t('filter_label_age_years')}</label>
              <div className="employees-age-range">
                <input
                  type="number"
                  min={MIN_AGE_LIMIT}
                  max={MAX_AGE_LIMIT}
                  value={filters.minAge.toString()}
                  onChange={(e) => handleAgeChange('minAge', e.target.value)}
                />
                <span>—</span>
                <input
                  type="number"
                  min={MIN_AGE_LIMIT}
                  max={MAX_AGE_LIMIT}
                  value={filters.maxAge.toString()}
                  onChange={(e) => handleAgeChange('maxAge', e.target.value)}
                />
              </div>
            </div>

            <div className="employees-filter-item">
              {/* 🟢 ФИЛЬТР: H-INDEX */}
              <label htmlFor="h-index-filter">{t('filter_label_hindex')}</label>
              <select
                id="h-index-filter"
                value={filters.hIndexGroup}
                onChange={(e) => handleFilterChange('hIndexGroup', e.target.value as HIndexGroup)}
              >
                <option value="all">{t('filter_option_all_values')}</option>
                <option value="0-1">0 - 1</option>
                <option value="2-5">2 - 5</option>
                <option value="6-10">6 - 10</option>
                <option value="10+">{t('hindex_10_plus')}</option>
              </select>
            </div>
          </div>

          <div className="employees-filter-actions">
            {/* 🟢 КНОПКА СБРОСА ФИЛЬТРОВ */}
            <button type="button" onClick={resetFilters}>
              {t('button_reset_filters')}
            </button>
          </div>
        </aside>
<main className="employees-main">
          <section className="employees-table-section">
            <div className="employee-table-container">
              <table className="employee-table">
                <thead>
                  <tr>
                    {activeColumns.map((column) => {
                      if (column.sortKey) {
                        const isAgeColumn = column.sortKey === 'age';
                        const sortKey = isAgeColumn ? 'birthYear' : column.sortKey;
                        const headerState = sort.key === sortKey ? sort.direction : undefined;
                        return (
                          <th
                            key={column.key}
                            onClick={() =>
                              handleSortChange((isAgeColumn ? 'age' : column.sortKey) as keyof Employee | 'age')
                            }
                            className={headerState}
                          >
                            {column.label}
                            <ArrowUpDown size={14} />
                          </th>
                        );
                      }

                      return (
                        <th key={column.key}>{column.label}</th>
                      );
                    })}
                    {/* 🟢 ЗАГОЛОВОК СТОЛБЦА ДЕЙСТВИЙ */}
                    <th className="actions-column">{t('table_header_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      {activeColumns.map((column) => (
                        <td key={`${employee.id}-${column.key}`}>{renderEmployeeCell(column.key, employee)}</td>
                      ))}
                      <td className="actions-column">
                        <div className="actions-buttons">
                          <button
                            // 🟢 ДЕЙСТВИЕ: ПРОСМОТР
                            onClick={() => handleAction(t('action_view'), employee)}
                            aria-label={t('aria_view_employee')}
                            title={t('action_view')}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            // 🟢 ДЕЙСТВИЕ: РЕДАКТИРОВАНИЕ
                            onClick={() => handleAction(t('action_edit'), employee)}
                            aria-label={t('aria_edit_employee')}
                            title={t('action_edit')}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            // 🟢 ДЕЙСТВИЕ: УДАЛЕНИЕ
                            onClick={() => handleAction(t('action_delete'), employee)}
                            aria-label={t('aria_delete_employee')}
                            title={t('action_delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && (
                <div className="no-results">{t('employees_not_found')}</div>
              )}
            </div>
            <p className="employees-summary">
              {t('show_employees_summary')}{filteredEmployees.length} {t('from_total_summary')}{mockEmployees.length}
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default EmployeesPage;