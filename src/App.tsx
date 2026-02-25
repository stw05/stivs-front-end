import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const EmployeeProfilePage = lazy(() => import('./pages/EmployeeProfilePage'));
const PublicationsPage = lazy(() => import('./pages/PublicationsPage'));
const FinancesPage = lazy(() => import('./pages/FinancesPage'));
const MetricsPage = lazy(() => import('./pages/MetricsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const AdminAuthPage = lazy(() => import('./pages/AdminAuthPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const LLMChatPage = lazy(() => import('./pages/LLMChatPage'));

const App: React.FC = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/profile/:employeeId" element={<EmployeeProfilePage />} />
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="finances" element={<FinancesPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="assistant" element={<LLMChatPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegistrationPage />} />
          <Route path="forgot-password" element={<div>Страница восстановления пароля</div>} />
          <Route path="privacy-policy" element={<div>Политика конфиденциальности</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminAuthPage />} />
        <Route path="/admin/console" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
