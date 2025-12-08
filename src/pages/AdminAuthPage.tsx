import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminAuthPage.css';

const AdminAuthPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: integrate with backend auth provider
    if (email && password) {
      navigate('/admin/console');
    }
  };

  const handleGeneratePin = () => {
    setShowPin(true);
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-panel" aria-live="polite">
        <header>
          <p>{t('admin_auth_subtitle')}</p>
          <h1>{t('admin_auth_title')}</h1>
        </header>

        <form className="admin-auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>{t('admin_auth_email_label')}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@uisks.kz"
              required
            />
          </label>

          <label className="auth-field">
            <span>{t('admin_auth_password_label')}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('admin_auth_password_placeholder')}
              required
            />
          </label>

          <div className="auth-mfa">
            <div>
              <span>{t('admin_auth_pin_label')}</span>
              <button type="button" onClick={handleGeneratePin}>
                {t('admin_auth_request_pin')}
              </button>
            </div>
            {showPin && (
              <input
                type="text"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
              />
            )}
          </div>

          <label className="auth-remember">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
            />
            <span>{t('admin_auth_remember_label')}</span>
          </label>

          <div className="auth-actions">
            <button type="submit">{t('admin_auth_login_button')}</button>
            <button type="button" className="ghost" onClick={() => navigate('/')}>{t('admin_auth_main_site')}</button>
          </div>
        </form>

        <div className="auth-support">
          <p>{t('admin_auth_support_title')}</p>
          <strong>{t('admin_auth_support_phone')}</strong>
          <a href="mailto:support@uisks.kz">support@uisks.kz</a>
        </div>
      </div>

      <aside className="admin-auth-hero" aria-hidden="true">
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">{t('admin_auth_secure_badge')}</div>
          <h2>{t('admin_auth_hero_title')}</h2>
          <p>{t('admin_auth_hero_copy')}</p>
          <ul>
            <li>{t('admin_auth_hero_point_one')}</li>
            <li>{t('admin_auth_hero_point_two')}</li>
            <li>{t('admin_auth_hero_point_three')}</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AdminAuthPage;
