import React, { useMemo } from 'react'; // 🟢 useMemo добавлен для навигации
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🟢 ИМПОРТ
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const navigationItems = useMemo(() => [
    { path: '/', label: t('home_page_title') },
    { path: '/projects', label: t('projects_page_title') }, // 🟢 ПЕРЕВОД
    { path: '/employees', label: t('employees_page_title') }, // 🟢 ПЕРЕВОД
    { path: '/finances', label: t('finances_page_title') }, // 🟢 ПЕРЕВОД
    { path: '/publications', label: t('publications_page_title') }, // 🟢 ПЕРЕВОД
    { path: '/metrics', label: t('metrics_page_title') },
    { path: '/assistant', label: t('llm_chat_nav_label') },
  ], [t]);

  // 🟢 ФУНКЦИЯ ДЛЯ СМЕНЫ ЯЗЫКА
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-top-row">
          <div className="header-left">
            <div className="logo">
              <Link to="/" className="app-logo-link"> 
                <h1>{t('app_name')}</h1> {/* 🟢 ПЕРЕВОД */}
              </Link>
              <span className="logo-subtitle">{t('app_title_full')}</span> {/* 🟢 ПЕРЕВОД */}
            </div>
          </div>

          <div className="header-right">
            <div className="language-selector">
              {/* 🟢 КНОПКА ДЛЯ КАЗАХСКОГО ЯЗЫКА */}
              <span 
                className={`lang-option ${i18n.language === 'kk' ? 'active' : ''}`}
                onClick={() => changeLanguage('kk')}
              >
                {t('kaz_label')}
              </span>
              {/* 🟢 КНОПКА ДЛЯ РУССКОГО ЯЗЫКА */}
              <span 
                className={`lang-option ${i18n.language === 'ru' ? 'active' : ''}`}
                onClick={() => changeLanguage('ru')}
              >
                {t('rus_label')}
              </span>
              {/* 🟢 КНОПКА ДЛЯ АНГЛИЙСКОГО ЯЗЫКА */}
              <span 
                className={`lang-option ${i18n.language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </span>
            </div>
            
            <div className="user-menu">
              <div className="user-avatar">
                <Link to="/login" className="user-avatar-link">
                <User size={20} />
                </Link>
              </div>
              <div className="user-dropdown">
                <Settings size={16} />
                <LogOut size={16} />
              </div>
            </div>
          </div>
        </div>

        <nav className="navigation">
          {navigationItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
              {item.label}
            </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;