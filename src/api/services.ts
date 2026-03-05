import { regionsData } from '../components/Home/regionsData';
import { apiRequest, authStorage } from './client';
import type {
  AuthResponse,
  BackendEmployee,
  BackendProject,
  BackendPublication,
  DashboardSummary,
  EmployeeFilterOptions,
  EmployeeFilterMeta,
  ProjectFilterMeta,
  FinanceSummary,
  PaginatedResponse,
  ProjectFilterOptions,
  PublicationFilterOptions,
  PublicationFilterMeta,
  UserRole,
} from './types';

const asRole = (value: string | undefined): UserRole => {
  if (value === 'admin' || value === 'staff' || value === 'viewer') {
    return value;
  }
  return 'viewer';
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\./g, '')
    .trim();

const regionByNormalizedName = new Map(
  regionsData.map((region) => [normalize(region.name), region.id]),
);

const partialRegionAliases: Array<[string, string]> = [
  ['астана', 'astana-city'],
  ['алматы', 'almaty-city'],
  ['шымкент', 'shymkent-city'],
  ['западно-казахстан', 'west-kazakhstan'],
  ['восточно-казахстан', 'east-kazakhstan'],
  ['северо-казахстан', 'north-kazakhstan'],
  ['алматинская', 'almaty'],
  ['жетысуская', 'jetisu'],
  ['акмолинская', 'akmola'],
  ['атырауская', 'atyrau'],
  ['карагандинская', 'karaganda'],
  ['туркестанская', 'turkistan'],
  ['кызылординская', 'kyzylorda'],
  ['улытауская', 'ulytau'],
  ['абайская', 'abai'],
  ['павлодарская', 'pavlodar'],
  ['жамбылская', 'zhambyl'],
  ['костанайская', 'kostanay'],
  ['актюбинская', 'aktobe'],
  ['мангистауская', 'mangystau'],
];

export const mapRegionToId = (regionName: string): string => {
  const normalized = normalize(regionName);
  const exact = regionByNormalizedName.get(normalized);
  if (exact) {
    return exact;
  }

  for (const [needle, regionId] of partialRegionAliases) {
    if (normalized.includes(needle)) {
      return regionId;
    }
  }

  return 'national';
};

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async register(payload: { email: string; password: string; name: string; role?: UserRole }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  async me() {
    return apiRequest<{ user: { id: string; email: string; name: string; role: UserRole }; role: UserRole }>(
      '/api/auth/me',
      { auth: true },
    );
  },

  persistAuth(response: AuthResponse) {
    authStorage.setToken(response.token);
    const user = {
      ...response.user,
      role: asRole(response.role ?? response.user.role),
      name: response.user.name ?? response.user.fullName ?? '',
    };
    authStorage.setUser(JSON.stringify(user));
  },

  async logout(): Promise<void> {
    try {
      await apiRequest<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
        auth: true,
      });
    } finally {
      authStorage.clear();
    }
  },
};

const withQuery = (path: string, query?: Record<string, string | number | undefined>): string => {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const projectsApi = {
  list(query?: {
    irn?: string;
    status?: string;
    region?: string;
    financingType?: string;
    priority?: string;
    applicant?: string;
    contest?: string;
    customer?: string;
    mrnti?: string;
    trl?: number;
    startYear?: number;
    endYear?: number;
    q?: string;
    page?: number;
    limit?: number;
  }, signal?: AbortSignal) {
    return apiRequest<PaginatedResponse<BackendProject>>(withQuery('/api/projects', query), { signal });
  },

  filters() {
    return apiRequest<ProjectFilterOptions>('/api/projects/filters');
  },

  filtersMeta(query?: {
    irn?: string;
    status?: string;
    region?: string;
    financingType?: string;
    priority?: string;
    applicant?: string;
    q?: string;
  }) {
    return apiRequest<ProjectFilterMeta>(withQuery('/api/projects/filters-meta', query));
  },
};

export const employeesApi = {
  list(query?: {
    region?: string;
    position?: string;
    degree?: string;
    minHIndex?: number;
    maxHIndex?: number;
    q?: string;
    page?: number;
    limit?: number;
  }, signal?: AbortSignal) {
    return apiRequest<PaginatedResponse<BackendEmployee>>(withQuery('/api/employees', query), { signal });
  },

  filters() {
    return apiRequest<EmployeeFilterOptions>('/api/employees/filters');
  },

  filtersMeta(query?: {
    region?: string;
    position?: string;
    degree?: string;
    minHIndex?: number;
    maxHIndex?: number;
    q?: string;
  }, signal?: AbortSignal) {
    return apiRequest<EmployeeFilterMeta>(withQuery('/api/employees/filters-meta', query), { signal });
  },
};

export const publicationsApi = {
  list(query?: { year?: number; type?: string; q?: string; page?: number; limit?: number }, signal?: AbortSignal) {
    return apiRequest<PaginatedResponse<BackendPublication>>(withQuery('/api/publications', query), { signal });
  },

  filters() {
    return apiRequest<PublicationFilterOptions>('/api/publications/filters');
  },

  filtersMeta(query?: { year?: number; type?: string; q?: string }, signal?: AbortSignal) {
    return apiRequest<PublicationFilterMeta>(withQuery('/api/publications/filters-meta', query), { signal });
  },
};

export const financesApi = {
  summary(year?: number, signal?: AbortSignal) {
    return apiRequest<FinanceSummary>(withQuery('/api/finances/summary', year ? { year } : undefined), { signal });
  },
};

export const dashboardApi = {
  summary(region?: string) {
    return apiRequest<DashboardSummary>(withQuery('/api/dashboard/summary', region ? { region } : undefined));
  },
};
