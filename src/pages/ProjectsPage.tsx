import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  ChevronDown,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import './ProjectsPage.css';

type ProjectStatus = 'completed' | 'in-progress' | 'overdue';

interface ProjectRecord {
  id: string;
  order: number;
  name: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  irnId: string;
  nirContractNumber: string;
  customer: string;
  status: ProjectStatus;
}

const projectsData: ProjectRecord[] = [
  {
    id: 'p-1',
    order: 1,
    name: 'Тест проект 1',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-2',
    order: 2,
    name: 'Тест проект 2',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'overdue',
  },
  {
    id: 'p-3',
    order: 3,
    name: 'Тест проект 3',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'in-progress',
  },
  {
    id: 'p-4',
    order: 4,
    name: 'Тест проект 4',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-5',
    order: 5,
    name: 'Тест проект 5',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'overdue',
  },
  {
    id: 'p-6',
    order: 6,
    name: 'Тест проект 6',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'in-progress',
  },
  {
    id: 'p-7',
    order: 7,
    name: 'Тест проект 7',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'in-progress',
  },
  {
    id: 'p-8',
    order: 8,
    name: 'Тест проект 8',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-9',
    order: 9,
    name: 'Тест проект 9',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'overdue',
  },
  {
    id: 'p-10',
    order: 10,
    name: 'Тест проект 10',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'in-progress',
  },
  {
    id: 'p-11',
    order: 11,
    name: 'Тест проект 11',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'overdue',
  },
  {
    id: 'p-12',
    order: 12,
    name: 'Тест проект 12',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'in-progress',
  },
  {
    id: 'p-13',
    order: 13,
    name: 'Тест проект 13',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-14',
    order: 14,
    name: 'Тест проект 14',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-15',
    order: 15,
    name: 'Тест проект 15',
    contractNumber: '5365',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '423',
    nirContractNumber: '440207',
    customer: 'ТОО «Тест»',
    status: 'completed',
  },
  {
    id: 'p-16',
    order: 16,
    name: 'Тест проект 16',
    contractNumber: '6578',
    startDate: '2022-08-15T02:03:00',
    endDate: '2022-10-20T08:00:00',
    irnId: '578',
    nirContractNumber: '654377',
    customer: 'ТОО «Нуртан»',
    status: 'overdue',
  },
];

const statusLabels: Record<ProjectStatus, string> = {
  completed: 'Завершён',
  'in-progress': 'В работе',
  overdue: 'Просрочен',
};

type StatusFilter = ProjectStatus | 'all';

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Все проекты' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'overdue', label: 'Просроченные' },
  { value: 'completed', label: 'Завершённые' },
];

const ITEMS_PER_PAGE = 10;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportStatuses, setExportStatuses] = useState<ProjectStatus[]>([
    'in-progress',
    'overdue',
    'completed',
  ]);

  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const notify = (message: string) => console.info(message);

  const totals = useMemo(() => {
    return projectsData.reduce(
      (acc, project) => {
        acc.total += 1;
        acc[project.status] += 1;
        return acc;
      },
      {
        total: 0,
        completed: 0,
        'in-progress': 0,
        overdue: 0,
      } as Record<'total' | ProjectStatus, number>,
    );
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();
    return projectsData.filter((project) => {
      const matchesStatus =
        statusFilter === 'all' ? true : project.status === statusFilter;

      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : [
              project.name,
              project.contractNumber,
              project.irnId,
              project.nirContractNumber,
              project.customer,
            ]
              .join(' ')
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const isAllCurrentPageSelected = useMemo(() => {
    return (
      paginatedProjects.length > 0 &&
      paginatedProjects.every((project) => selectedProjects.has(project.id))
    );
  }, [paginatedProjects, selectedProjects]);

  useEffect(() => {
    // Close export dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (!isExportMenuOpen) {
        return;
      }
      if (
        exportMenuRef.current &&
        event.target instanceof Node &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setIsExportMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isExportMenuOpen]);

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const toggleSelectAllCurrentPage = (checked: boolean) => {
    setSelectedProjects((prev) => {
      const next = new Set(prev);
      paginatedProjects.forEach((project) => {
        if (checked) {
          next.add(project.id);
        } else {
          next.delete(project.id);
        }
      });
      return next;
    });
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const exportAllSelected = exportStatuses.length === 3;

  const toggleExportStatus = (status: ProjectStatus) => {
    setExportStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  const handleToggleExportAll = (checked: boolean) => {
    setExportStatuses(
      checked ? ['in-progress', 'overdue', 'completed'] : [],
    );
  };

  const selectedCount = selectedProjects.size;

  const summaryText = `Отфильтровано: ${filteredProjects.length} из ${projectsData.length}`;

  const handlePlaceholderAction = (action: string, project: ProjectRecord) => {
    notify(`${action} — ${project.name}`);
  };

  const handleExport = (mode: 'preview' | 'download') => {
    notify(
      `${mode === 'preview' ? 'Предпросмотр' : 'Скачивание'} — выбрано ${selectedCount} проектов, статусы: ${exportStatuses
        .map((status) => statusLabels[status])
        .join(', ') || 'ничего не выбрано'}.`,
    );
    setIsExportMenuOpen(false);
  };

  return (
    <div className="projects-page">
      <section className="projects-card">
        <div className="projects-page__headline">
          <div className="projects-page__title-block">
            <h1 className="projects-page__title">Проекты</h1>
            <p className="projects-page__subtitle">
              Найдено проектов: <span className="projects-tag">{filteredProjects.length}</span>
            </p>
            <div className="projects-page__stats">
              <span className="projects-stat-pill">
                Всего
                <strong>{totals.total}</strong>
              </span>
              <span className="projects-stat-pill" style={{ background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb' }}>
                В работе
                <strong>{totals['in-progress']}</strong>
              </span>
              <span className="projects-stat-pill" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#dc2626' }}>
                Просрочено
                <strong>{totals.overdue}</strong>
              </span>
              <span className="projects-stat-pill" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#047857' }}>
                Завершено
                <strong>{totals.completed}</strong>
              </span>
            </div>
          </div>
          <div className="projects-page__actions">
            <button
              type="button"
              className="projects-button projects-button--outline"
              onClick={() => notify('Импорт из Excel (заглушка)')}
            >
              <Download size={18} />
              Импорт Excel
            </button>
            <div className="projects-page__export" ref={exportMenuRef}>
              <button
                type="button"
                className="projects-button"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
              >
                <Download size={18} />
                Экспорт данных
                <span className="projects-tag">{selectedCount || '0'}</span>
                <ChevronDown size={18} />
              </button>
              {isExportMenuOpen && (
                <div className="projects-export-menu">
                  <h4>Что выгружаем?</h4>
                  <div className="projects-export-menu__option">
                    <label>
                      <input
                        type="checkbox"
                        checked={exportAllSelected}
                        onChange={(event) =>
                          handleToggleExportAll(event.target.checked)
                        }
                      />
                      Все проекты
                    </label>
                    <span>{totals.total}</span>
                  </div>
                  {(['in-progress', 'overdue', 'completed'] as ProjectStatus[]).map((status) => (
                    <div className="projects-export-menu__option" key={status}>
                      <label>
                        <input
                          type="checkbox"
                          checked={exportStatuses.includes(status)}
                          onChange={() => toggleExportStatus(status)}
                        />
                        {statusLabels[status]}
                      </label>
                      <span>{totals[status]}</span>
                    </div>
                  ))}
                  <div className="projects-export-menu__footer">
                    <button type="button" onClick={() => handleExport('preview')}>
                      Показать
                    </button>
                    <button type="button" onClick={() => handleExport('download')}>
                      Скачать
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              className="projects-button projects-button--primary"
              onClick={() => notify('Создание проекта (заглушка)')}
            >
              <Plus size={18} />
              Создать проект
            </button>
          </div>
        </div>
      </section>

      <section className="projects-card">
        <div className="projects-page__toolbar">
          <div className="projects-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Поиск по названию, заказчику или номеру договора"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="projects-page__filters">
            {statusFilterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx('projects-chip', {
                  'projects-chip--active': statusFilter === option.value,
                })}
                onClick={() => handleStatusFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-card projects-table-card">
        <div className="projects-page__summary-bar">
          <span className="projects-page__summary-text">{summaryText}</span>
          <span className="projects-page__summary-text">
            Выбрано для действий: <strong>{selectedCount}</strong>
          </span>
        </div>
        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="projects-checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={(event) =>
                      toggleSelectAllCurrentPage(event.target.checked)
                    }
                  />
                </th>
                <th>#</th>
                <th>Название проекта</th>
                <th>№ договора</th>
                <th>Начало договора</th>
                <th>Завершение</th>
                <th>ИРН ID</th>
                <th>№ договора НИР</th>
                <th>Заказчик</th>
                <th>Статус</th>
                <th className="actions-cell">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.map((project, index) => {
                const isSelected = selectedProjects.has(project.id);
                const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                return (
                  <tr
                    key={project.id}
                    className={clsx('projects-row', `projects-row--${project.status}`, {
                      'projects-row--selected': isSelected,
                    })}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="projects-checkbox"
                        checked={isSelected}
                        onChange={() => toggleProjectSelection(project.id)}
                      />
                    </td>
                    <td>{rowNumber}</td>
                    <td>{project.name}</td>
                    <td>{project.contractNumber}</td>
                    <td>{formatDate(project.startDate)}</td>
                    <td>{formatDate(project.endDate)}</td>
                    <td>{project.irnId}</td>
                    <td>{project.nirContractNumber}</td>
                    <td>{project.customer}</td>
                    <td>
                      <span className="projects-status">
                        <span className="projects-status-dot" />
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td>
                      <div className="projects-actions">
                        <button
                          type="button"
                          onClick={() => handlePlaceholderAction('Карточка проекта', project)}
                          aria-label="Просмотреть проект"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlaceholderAction('Редактирование', project)}
                          aria-label="Редактировать проект"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlaceholderAction('Удаление', project)}
                          aria-label="Удалить проект"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="projects-page__pagination">
          {Array.from({ length: totalPages }, (_, pageIndex) => pageIndex + 1).map((page) => (
            <button
              key={page}
              type="button"
              className={clsx({ active: currentPage === page })}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
