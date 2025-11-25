import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Search, ArrowUpDown, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useRegionContext } from '../context/RegionContext';
import type { RegionId } from '../context/RegionContext';
import './ProjectsPage.css';

type FinancingType = 'grant' | 'program' | 'contract';
type PriorityDirection = 'health' | 'economy' | 'ecology' | 'energy' | 'transport' | 'ai';
type ProjectStatus = 'active' | 'completed' | 'draft';
type TrlLevel = 3 | 4 | 5 | 6 | 7 | 8 | 9;
type DropdownFilterKey = 'irn' | 'financingType' | 'applicant' | 'customer' | 'mrnti';

interface Project {
	id: string;
	irn: string;
	title: string;
	applicant: string;
	supervisor: string;
	priority: PriorityDirection;
	contest: string;
	financingType: FinancingType;
	financingTotal: number;
	regionId: RegionId;
	customer: string;
	mrnti: string;
	status: ProjectStatus;
	trl: TrlLevel;
	startYear: number;
	endYear: number;
}

const YEAR_RANGE = { min: 2021, max: 2025 } as const;

const projects: Project[] = [
	{
		id: 'cp230198765',
		irn: 'CP230198765',
		title: 'Исследование воздействия климата на аграрные экосистемы',
		applicant: 'КНУ',
		supervisor: 'Кадыров Р.Р.',
		priority: 'health',
		contest: 'Конкурс 4',
		financingType: 'grant',
		financingTotal: 4_500_000,
		regionId: 'almaty',
		customer: 'Минсельхоз',
		mrnti: '62.33.15',
		status: 'active',
		trl: 5,
		startYear: 2021,
		endYear: 2024,
	},
	{
		id: 'bp240112233',
		irn: 'BP240112233',
		title: 'Разработка квантовых технологий',
		applicant: 'КарГУ',
		supervisor: 'Гумаров Е.Н.',
		priority: 'economy',
		contest: 'Конкурс 6',
		financingType: 'program',
		financingTotal: 2_540_000,
		regionId: 'karaganda',
		customer: 'Минцифра',
		mrnti: '12.45.01',
		status: 'active',
		trl: 4,
		startYear: 2022,
		endYear: 2025,
	},
	{
		id: 'ap130123456',
		irn: 'AP130123456',
		title: 'Исследование новых методов лечения рака',
		applicant: 'КАЗНУ',
		supervisor: 'Жоламанов А.С.',
		priority: 'health',
		contest: 'Конкурс 1',
		financingType: 'grant',
		financingTotal: 5_000_000,
		regionId: 'almaty-city',
		customer: 'Минздрав',
		mrnti: '11.22.31',
		status: 'completed',
		trl: 6,
		startYear: 2020,
		endYear: 2023,
	},
	{
		id: 'bp240987654',
		irn: 'BP240987654',
		title: 'Разработка новой технологии переработки отходов',
		applicant: 'ЕНУ',
		supervisor: 'Темиргалиев П.Р.',
		priority: 'ecology',
		contest: 'Конкурс 2',
		financingType: 'contract',
		financingTotal: 2_000_222,
		regionId: 'astana-city',
		customer: 'Акимат Астаны',
		mrnti: '28.91.05',
		status: 'active',
		trl: 7,
		startYear: 2023,
		endYear: 2025,
	},
	{
		id: 'ap210567890',
		irn: 'AP210567890',
		title: 'Исследования',
		applicant: 'Асфен',
		supervisor: 'Оспанбеков Ж.',
		priority: 'energy',
		contest: 'Конкурс 5',
		financingType: 'contract',
		financingTotal: 384_564_000,
		regionId: 'atyrau',
		customer: 'АО "КазМунайГаз"',
		mrnti: '21.54.12',
		status: 'active',
		trl: 8,
		startYear: 2021,
		endYear: 2024,
	},
	{
		id: 'ap230456789',
		irn: 'AP230456789',
		title: 'Создание энергоэффективного транспорта',
		applicant: 'Аль-Фараби',
		supervisor: 'Хусаинов А.Г.',
		priority: 'transport',
		contest: 'Конкурс 3',
		financingType: 'program',
		financingTotal: 7_500_000,
		regionId: 'almaty-city',
		customer: 'Минтранс',
		mrnti: '45.10.07',
		status: 'completed',
		trl: 6,
		startYear: 2020,
		endYear: 2022,
	},
	{
		id: 'ap250334455',
		irn: 'AP250334455',
		title: 'Искусственный интеллект в медицине',
		applicant: 'Nazarbayev Uni',
		supervisor: 'Мехди Х.',
		priority: 'ai',
		contest: 'Конкурс 7',
		financingType: 'grant',
		financingTotal: 1_000_000,
		regionId: 'astana-city',
		customer: 'Минздрав',
		mrnti: '62.45.10',
		status: 'draft',
		trl: 3,
		startYear: 2024,
		endYear: 2026,
	},
];

const priorityLabels: Record<PriorityDirection, string> = {
	health: 'Здравоохранение',
	economy: 'Экономика',
	ecology: 'Экология',
	energy: 'Энергетика',
	transport: 'Транспорт',
	ai: 'Искусственный интеллект',
};

const financingLabels: Record<FinancingType, string> = {
	grant: 'Грантовое',
	program: 'Программно-целевое',
	contract: 'По договорам',
};

const financingTypeOptionValues: (FinancingType | 'all')[] = ['all', 'grant', 'program', 'contract'];

const statusLabels: Record<ProjectStatus, string> = {
	active: 'В работе',
	completed: 'Завершен',
	draft: 'Подготовка',
};

type ColumnKey =
	| 'irn'
	| 'title'
	| 'applicant'
	| 'priority'
	| 'financingType'
	| 'financingTotal'
	| 'region'
	| 'status'
	| 'period';

interface ColumnDefinition {
	key: ColumnKey;
	label: string;
	sortKey?: keyof Project;
}

interface OptionItem {
	value: string;
	label: string;
}

interface SearchableSelectProps {
	id: string;
	label: string;
	placeholder: string;
	options: OptionItem[];
	value: string;
	isOpen: boolean;
	searchValue: string;
	onToggle: () => void;
	onSelect: (value: string) => void;
	onSearchChange: (value: string) => void;
	setRef: (node: HTMLDivElement | null) => void;
}

const columnDefinitions: ColumnDefinition[] = [
	{ key: 'irn', label: 'IRN', sortKey: 'irn' },
	{ key: 'title', label: 'Название', sortKey: 'title' },
	{ key: 'applicant', label: 'Заявитель', sortKey: 'applicant' },
	{ key: 'priority', label: 'Приоритет' },
	{ key: 'financingType', label: 'Финансирование' },
	{ key: 'financingTotal', label: 'Сумма', sortKey: 'financingTotal' },
	{ key: 'region', label: 'Регион' },
	{ key: 'status', label: 'Статус' },
	{ key: 'period', label: 'Период' },
];

const defaultVisibleColumns: Record<ColumnKey, boolean> = columnDefinitions.reduce(
	(acc, column) => ({
		...acc,
		[column.key]: true,
	}),
	{} as Record<ColumnKey, boolean>,
);

const dropdownKeys: DropdownFilterKey[] = ['irn', 'financingType', 'applicant', 'customer', 'mrnti'];

const SearchableSelect: React.FC<SearchableSelectProps> = ({
	id,
	label,
	placeholder,
	options,
	value,
	isOpen,
	searchValue,
	onToggle,
	onSelect,
	onSearchChange,
	setRef,
}) => {
	const normalizedSearch = searchValue.trim().toLowerCase();
	const filteredOptions = options.filter((option) =>
		normalizedSearch.length === 0
			? true
			: option.label.toLowerCase().includes(normalizedSearch),
	);
	const activeOption = options.find((option) => option.value === value);
	const selectClassName = `projects-select${isOpen ? ' projects-select--open' : ''}`;
	const valueClassName = `projects-select-value${value === 'all' ? ' projects-select-value--placeholder' : ''}`;

	return (
		<div className={selectClassName} ref={setRef}>
			<button
				type="button"
				className="projects-select-trigger"
				onClick={onToggle}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				id={id}
			>
				<span className={valueClassName}>{activeOption?.label ?? placeholder}</span>
				<ChevronDown size={16} />
			</button>
				{isOpen && (
					<div className="projects-select-dropdown" role="listbox" aria-labelledby={id}>
					<div className="projects-select-search">
						<Search size={14} />
						<input
							type="text"
							value={searchValue}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder={`Поиск по ${label.toLowerCase()}`}
						/>
					</div>
					<ul className="projects-select-options">
						{filteredOptions.length === 0 ? (
							<li className="projects-select-empty">Ничего не найдено</li>
						) : (
							filteredOptions.map((option) => (
								<li key={option.value}>
									<button
										type="button"
										className={`projects-select-option${option.value === value ? ' projects-select-option--active' : ''}`}
										onClick={() => onSelect(option.value)}
									>
										{option.label}
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

interface FilterState {
	search: string;
	startYear: number;
	endYear: number;
	irn: string;
	financingType: FinancingType | 'all';
	priority: PriorityDirection | 'all';
	contest: string;
	applicant: string;
	customer: string;
	mrnti: string;
	status: ProjectStatus | 'all';
	trl: TrlLevel | 'all';
}

interface SortState {
	key: keyof Project | '';
	direction: 'asc' | 'desc' | '';
}

const formatCurrency = (value: number): string =>
	new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'KZT',
		maximumFractionDigits: 0,
	}).format(value);

const ProjectsPage: React.FC = () => {
	const { selectedRegionId, setSelectedRegionId, regions } = useRegionContext();
	const [filters, setFilters] = useState<FilterState>({
		search: '',
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
	});
	const [sort, setSort] = useState<SortState>({ key: '', direction: '' });
	const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => ({
		...defaultVisibleColumns,
	}));
	const [isColumnPickerOpen, setIsColumnPickerOpen] = useState(false);
	const columnPickerRef = useRef<HTMLDivElement | null>(null);
	const [openDropdown, setOpenDropdown] = useState<DropdownFilterKey | null>(null);
	const [dropdownSearch, setDropdownSearch] = useState<Record<DropdownFilterKey, string>>(() =>
		dropdownKeys.reduce((acc, key) => {
			acc[key] = '';
			return acc;
		}, {} as Record<DropdownFilterKey, string>),
	);
	const dropdownRefs = useRef<Partial<Record<DropdownFilterKey, HTMLDivElement | null>>>({});

	const irnOptions = useMemo(() => ['all', ...new Set(projects.map((item) => item.irn))], []);
	const contestOptions = useMemo(() => ['all', ...new Set(projects.map((item) => item.contest))], []);
	const applicantOptions = useMemo(() => ['all', ...new Set(projects.map((item) => item.applicant))], []);
	const customerOptions = useMemo(() => ['all', ...new Set(projects.map((item) => item.customer))], []);
	const mrntiOptions = useMemo(() => ['all', ...new Set(projects.map((item) => item.mrnti))], []);
	const trlOptions = useMemo<(TrlLevel | 'all')[]>(() => ['all', ...new Set(projects.map((item) => item.trl))], []);
	const dropdownOptions = useMemo<Record<DropdownFilterKey, OptionItem[]>>(() => {
		const buildOptions = (options: string[], allLabel: string): OptionItem[] =>
			options.map((value) => ({
				value,
				label: value === 'all' ? allLabel : value,
			}));

		return {
			irn: buildOptions(irnOptions, 'Все IRN'),
			applicant: buildOptions(applicantOptions, 'Все заявители'),
			customer: buildOptions(customerOptions, 'Все заказчики'),
			mrnti: buildOptions(mrntiOptions, 'Все МРНТИ'),
			financingType: financingTypeOptionValues.map((value) => ({
				value,
				label: value === 'all' ? 'Все типы финансирования' : financingLabels[value as FinancingType],
			})),
		};
	}, [applicantOptions, customerOptions, irnOptions, mrntiOptions]);

	const regionNameById = useMemo(() => {
		const map: Record<string, string> = {};
		regions.forEach((region) => {
			map[region.id] = region.name;
		});
		return map;
	}, [regions]);

	const activeColumns = useMemo(
		() => columnDefinitions.filter((column) => visibleColumns[column.key]),
		[visibleColumns],
	);

	const handleSort = (key: keyof Project) => {
		setSort((prev) => {
			if (prev.key === key) {
				const direction = prev.direction === 'asc' ? 'desc' : 'asc';
				return { key, direction };
			}
			return { key, direction: 'asc' };
		});
	};

	const toggleColumn = (columnKey: ColumnKey) => {
		setVisibleColumns((prev) => {
			const currentlyVisible = Object.values(prev).filter(Boolean).length;
			const nextValue = !prev[columnKey];
			if (!nextValue && currentlyVisible === 1) {
				return prev;
			}
			return { ...prev, [columnKey]: nextValue };
		});
	};

	useEffect(() => {
		if (!isColumnPickerOpen) {
			return;
		}

		const handleClick = (event: MouseEvent) => {
			if (columnPickerRef.current && !columnPickerRef.current.contains(event.target as Node)) {
				setIsColumnPickerOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [isColumnPickerOpen]);

	useEffect(() => {
		if (!openDropdown) {
			return;
		}

		const handleClickOutside = (event: MouseEvent) => {
			const dropdownNode = dropdownRefs.current[openDropdown];
			if (dropdownNode && !dropdownNode.contains(event.target as Node)) {
				setOpenDropdown(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [openDropdown]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpenDropdown(null);
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, []);

	const percentage = (value: number) =>
		((value - YEAR_RANGE.min) / (YEAR_RANGE.max - YEAR_RANGE.min)) * 100;

	const rangeBackgroundStyle = useMemo<React.CSSProperties>(
		() =>
			({
				'--range-start': `${percentage(filters.startYear)}%`,
				'--range-end': `${percentage(filters.endYear)}%`,
			} as React.CSSProperties),
		[filters.endYear, filters.startYear],
	);

	const renderCellContent = (columnKey: ColumnKey, project: Project): React.ReactNode => {
		switch (columnKey) {
			case 'irn':
				return project.irn;
			case 'title':
				return (
					<button type="button" className="projects-link-button">
						{project.title}
					</button>
				);
			case 'applicant':
				return project.applicant;
			case 'priority':
				return priorityLabels[project.priority];
			case 'financingType':
				return financingLabels[project.financingType];
			case 'financingTotal':
				return formatCurrency(project.financingTotal);
			case 'region':
				return regionNameById[project.regionId] ?? '—';
			case 'status':
				return statusLabels[project.status];
			case 'period':
				return `${project.startYear}-${project.endYear}`;
			default:
				return null;
		}
	};

	const handleYearChange = (key: 'startYear' | 'endYear', value: number) => {
		setFilters((prev) => {
			const next = { ...prev, [key]: value };
			if (next.startYear > next.endYear) {
				if (key === 'startYear') {
					next.endYear = next.startYear;
				} else {
					next.startYear = next.endYear;
				}
			}
			return next;
		});
	};

	const handleFilterChange = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const setDropdownRef = (key: DropdownFilterKey, node: HTMLDivElement | null) => {
		if (node) {
			dropdownRefs.current[key] = node;
		} else {
			delete dropdownRefs.current[key];
		}
	};

	const handleDropdownToggle = (key: DropdownFilterKey) => {
		setOpenDropdown((prev) => {
			const next = prev === key ? null : key;
			if (next) {
				setDropdownSearch((prevSearch) => ({ ...prevSearch, [key]: '' }));
			}
			return next;
		});
	};

	const handleDropdownSelect = (key: DropdownFilterKey, value: string) => {
		switch (key) {
			case 'financingType':
				handleFilterChange('financingType', value as FilterState['financingType']);
				break;
			case 'irn':
				handleFilterChange('irn', value);
				break;
			case 'applicant':
				handleFilterChange('applicant', value);
				break;
			case 'customer':
				handleFilterChange('customer', value);
				break;
			case 'mrnti':
			default:
				handleFilterChange('mrnti', value);
				break;
		}
		setOpenDropdown(null);
	};

	const handleDropdownSearchChange = (key: DropdownFilterKey, value: string) => {
		setDropdownSearch((prev) => ({ ...prev, [key]: value }));
	};

	const resetFilters = () => {
		setFilters({
			search: '',
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
		});
		setSelectedRegionId('national');
	};

	const filteredProjects = useMemo(() => {
		let list = projects.filter((project) => {
			const matchesSearch = filters.search
				? project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
					project.irn.toLowerCase().includes(filters.search.toLowerCase())
				: true;
			const matchesYears = project.startYear >= filters.startYear && project.endYear <= filters.endYear;
			const matchesRegion = selectedRegionId === 'national' || project.regionId === selectedRegionId;
			const matchesIrn = filters.irn === 'all' || project.irn === filters.irn;
			const matchesFinancing = filters.financingType === 'all' || project.financingType === filters.financingType;
			const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
			const matchesContest = filters.contest === 'all' || project.contest === filters.contest;
			const matchesApplicant = filters.applicant === 'all' || project.applicant === filters.applicant;
			const matchesCustomer = filters.customer === 'all' || project.customer === filters.customer;
			const matchesMrnti = filters.mrnti === 'all' || project.mrnti === filters.mrnti;
			const matchesStatus = filters.status === 'all' || project.status === filters.status;
			const matchesTrl = filters.trl === 'all' || project.trl === filters.trl;

			return (
				matchesSearch &&
				matchesYears &&
				matchesRegion &&
				matchesIrn &&
				matchesFinancing &&
				matchesPriority &&
				matchesContest &&
				matchesApplicant &&
				matchesCustomer &&
				matchesMrnti &&
				matchesStatus &&
				matchesTrl
			);
		});

		if (sort.key && sort.direction) {
			const key = sort.key;
			list = [...list].sort((a, b) => {
				const aValue = a[key];
				const bValue = b[key];

				if (typeof aValue === 'number' && typeof bValue === 'number') {
					return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
				}

				return sort.direction === 'asc'
					? String(aValue).localeCompare(String(bValue))
					: String(bValue).localeCompare(String(aValue));
			});
		}

		return list;
	}, [filters, sort, selectedRegionId]);

	return (
		<div className="projects-page">
			<header className="projects-header">
				<div>
					<h1>Проекты</h1>
					<p>Найдено проектов: {filteredProjects.length}</p>
				</div>
				<div className="projects-header-actions">
					<button type="button" className="projects-header-button">
						<Download size={18} />
						Выгрузить отчёт
					</button>
				</div>
			</header>

			<div className="projects-search-line">
				<div className="projects-search-toolbar">
					<div className="projects-search">
						<Search size={18} />
						<input
							type="text"
							placeholder="Поиск по названию или IRN"
							value={filters.search}
							onChange={(event) => handleFilterChange('search', event.target.value)}
						/>
					</div>
					<div className="projects-column-picker" ref={columnPickerRef}>
						<button
							type="button"
							className="projects-column-button"
							onClick={() => setIsColumnPickerOpen((prev) => !prev)}
						>
							<SlidersHorizontal size={16} />
							<span>Выбрать колонки</span>
						</button>
						{isColumnPickerOpen && (
							<div className="projects-column-list">
								{columnDefinitions.map((column) => (
									<label key={column.key} className="projects-column-option">
										<input
											type="checkbox"
											checked={visibleColumns[column.key]}
											onChange={() => toggleColumn(column.key)}
										/>
										<span>{column.label}</span>
									</label>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="projects-content">
				<aside className="projects-sidebar">
					<div className="projects-filter-block">
						<div className="projects-filter-title">Регион</div>
						<div className="projects-filter-item">
							<label htmlFor="projects-region">Выберите регион</label>
							<select
								id="projects-region"
								value={selectedRegionId}
								onChange={(event) => setSelectedRegionId(event.target.value as RegionId)}
							>
								<option value="national">Вся страна</option>
								{regions.map((region) => (
									<option key={region.id} value={region.id}>
										{region.name}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="projects-filter-block">
						<div className="projects-filter-title">Период</div>
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
									onChange={(event) => handleYearChange('startYear', Number(event.target.value))}
									className="period-range-thumb"
								/>
								<input
									type="range"
									min={YEAR_RANGE.min}
									max={YEAR_RANGE.max}
									value={filters.endYear}
									onChange={(event) => handleYearChange('endYear', Number(event.target.value))}
									className="period-range-thumb period-range-thumb--upper"
								/>
							</div>
						</div>
					</div>

					<div className="projects-filter-block">
						<div className="projects-filter-title">Фильтры</div>
						<div className="projects-filters-grid">
							<div className="projects-filter-item">
								<label htmlFor="filter-irn">IRN</label>
								<SearchableSelect
									id="filter-irn"
									label="IRN"
									placeholder="Выберите IRN"
									options={dropdownOptions.irn}
									value={filters.irn}
									isOpen={openDropdown === 'irn'}
									searchValue={dropdownSearch.irn}
									onToggle={() => handleDropdownToggle('irn')}
									onSelect={(value) => handleDropdownSelect('irn', value)}
									onSearchChange={(value) => handleDropdownSearchChange('irn', value)}
									setRef={(node) => setDropdownRef('irn', node)}
								/>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-financing">Тип финансирования</label>
								<SearchableSelect
									id="filter-financing"
									label="Тип финансирования"
									placeholder="Выберите тип финансирования"
									options={dropdownOptions.financingType}
									value={filters.financingType}
									isOpen={openDropdown === 'financingType'}
									searchValue={dropdownSearch.financingType}
									onToggle={() => handleDropdownToggle('financingType')}
									onSelect={(value) => handleDropdownSelect('financingType', value)}
									onSearchChange={(value) => handleDropdownSearchChange('financingType', value)}
									setRef={(node) => setDropdownRef('financingType', node)}
								/>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-priority">Приоритет</label>
								<select
									id="filter-priority"
									value={filters.priority}
									onChange={(event) =>
										handleFilterChange('priority', event.target.value as FilterState['priority'])
									}
								>
									<option value="all">Все направления</option>
									{(Object.keys(priorityLabels) as PriorityDirection[]).map((priority) => (
										<option key={priority} value={priority}>
											{priorityLabels[priority]}
										</option>
									))}
								</select>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-contest">Конкурс</label>
								<select
									id="filter-contest"
									value={filters.contest}
									onChange={(event) => handleFilterChange('contest', event.target.value)}
								>
									{contestOptions.map((option) => (
										<option key={option} value={option}>
											{option === 'all' ? 'Все конкурсы' : option}
										</option>
									))}
								</select>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-applicant">Заявитель</label>
								<SearchableSelect
									id="filter-applicant"
									label="Заявитель"
									placeholder="Выберите заявителя"
									options={dropdownOptions.applicant}
									value={filters.applicant}
									isOpen={openDropdown === 'applicant'}
									searchValue={dropdownSearch.applicant}
									onToggle={() => handleDropdownToggle('applicant')}
									onSelect={(value) => handleDropdownSelect('applicant', value)}
									onSearchChange={(value) => handleDropdownSearchChange('applicant', value)}
									setRef={(node) => setDropdownRef('applicant', node)}
								/>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-customer">Заказчик</label>
								<SearchableSelect
									id="filter-customer"
									label="Заказчик"
									placeholder="Выберите заказчика"
									options={dropdownOptions.customer}
									value={filters.customer}
									isOpen={openDropdown === 'customer'}
									searchValue={dropdownSearch.customer}
									onToggle={() => handleDropdownToggle('customer')}
									onSelect={(value) => handleDropdownSelect('customer', value)}
									onSearchChange={(value) => handleDropdownSearchChange('customer', value)}
									setRef={(node) => setDropdownRef('customer', node)}
								/>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-mrnti">МРНТИ</label>
								<SearchableSelect
									id="filter-mrnti"
									label="МРНТИ"
									placeholder="Выберите код МРНТИ"
									options={dropdownOptions.mrnti}
									value={filters.mrnti}
									isOpen={openDropdown === 'mrnti'}
									searchValue={dropdownSearch.mrnti}
									onToggle={() => handleDropdownToggle('mrnti')}
									onSelect={(value) => handleDropdownSelect('mrnti', value)}
									onSearchChange={(value) => handleDropdownSearchChange('mrnti', value)}
									setRef={(node) => setDropdownRef('mrnti', node)}
								/>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-status">Статус</label>
								<select
									id="filter-status"
									value={filters.status}
									onChange={(event) =>
										handleFilterChange('status', event.target.value as FilterState['status'])
									}
								>
									<option value="all">Все статусы</option>
									{(Object.keys(statusLabels) as ProjectStatus[]).map((status) => (
										<option key={status} value={status}>
											{statusLabels[status]}
										</option>
									))}
								</select>
							</div>

							<div className="projects-filter-item">
								<label htmlFor="filter-trl">TRL</label>
								<select
									id="filter-trl"
									value={filters.trl}
									onChange={(event) => {
										const value = event.target.value === 'all'
											? 'all'
											: (Number(event.target.value) as TrlLevel);
										handleFilterChange('trl', value);
									}}
								>
									{trlOptions.map((option) => (
										<option key={option} value={option}>
											{option === 'all' ? 'Все уровни' : `TRL ${option}`}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="projects-filter-actions">
						<button type="button" onClick={resetFilters}>
							Сбросить фильтры
						</button>
					</div>
				</aside>

				<main className="projects-main">
					<section className="projects-table-section">
						<div className="projects-table-wrapper">
							<table className="projects-table">
								<thead>
									<tr>
										{activeColumns.map((column) => {
											if (column.sortKey) {
												const headerState = sort.key === column.sortKey ? sort.direction : undefined;
												return (
													<th
														key={column.key}
														onClick={() => handleSort(column.sortKey!)}
														className={headerState}
													>
														{column.label}
														<ArrowUpDown size={14} />
													</th>
												);
											}
											return <th key={column.key}>{column.label}</th>;
										})}
									</tr>
								</thead>
								<tbody>
									{filteredProjects.map((project) => (
										<tr key={project.id}>
											{activeColumns.map((column) => (
												<td key={`${project.id}-${column.key}`}>
													{renderCellContent(column.key, project)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
							{filteredProjects.length === 0 && (
								<div className="no-results">Проекты не найдены, уточните фильтры.</div>
							)}
						</div>
						<p className="projects-summary">
							Показано проектов: {filteredProjects.length} из {projects.length}
						</p>
					</section>
				</main>
			</div>
		</div>
	);
};

export default ProjectsPage;
