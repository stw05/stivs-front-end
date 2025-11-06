// Типы для проектов
export interface Project {
  id: string;
  name: string;
  projectNumber: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'completed' | 'in-progress' | 'overdue';
  executor: string;
}

// Типы для сотрудников
export interface Employee {
  id: string;
  fullName: string;
  position: string;
  age: number;
  phone: string;
  email: string;
  academicDegree: string;
  academicTitle: string;
  affiliation: string;
  roles: UserRole[];
}

// Типы для публикаций
export interface Publication {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  type: 'journal' | 'conference' | 'book' | 'patent';
  citations: number;
  impactFactor: number;
}

// Типы для финансов
export interface FinanceData {
  projectId: string;
  year: number;
  amount: number;
  category: string;
  description: string;
}

// Типы для пользователей и ролей
export interface User {
  id: string;
  fullName: string;
  email: string;
  login: string;
  roles: UserRole[];
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

// Типы для фильтров
export interface ProjectFilters {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface EmployeeFilters {
  ageRange?: string[];
  academicDegree?: string[];
  academicTitle?: string[];
  affiliation?: string[];
}

export interface PublicationFilters {
  year?: number[];
  type?: string[];
  categories?: string[];
}

// Типы для статистики
export interface DashboardStats {
  projects: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  employees: {
    total: number;
    professors: number;
    associateProfessors: number;
    assistantProfessors: number;
  };
  publications: {
    total: number;
    thisYear: number;
  };
  finances: {
    totalAmount: number;
    currency: string;
  };
}

// Типы для графиков
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}