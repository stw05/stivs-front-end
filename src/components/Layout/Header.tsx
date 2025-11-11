import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Settings, LogOut } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Главная' },
    { path: '/projects', label: 'Проекты' },
    { path: '/employees', label: 'Сотрудники' },
    { path: '/finances', label: 'Финансы' },
    { path: '/publications', label: 'Результаты' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <h1>UISKS</h1>
            <span className="logo-subtitle">Unified information system "Kazakhstan Science"</span>
          </div>
        </div>

        <nav className="navigation">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
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

        <div className="header-right">
          <div className="language-selector">
            <span className="lang-option active">RU</span>
            <span className="lang-option">EN</span>
          </div>
          
          <div className="user-menu">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-dropdown">
              <Settings size={16} />
              <LogOut size={16} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;