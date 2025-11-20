import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Предполагаем, что у вас будет CSS файл для стилизации

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const navigate = useNavigate(); // Для перенаправления после успешного входа

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Здесь будет логика для аутентификации пользователя
    console.log('Попытка входа с:', { email, password, rememberMe });

    // Пример: имитация успешного входа
    if (email === 'test@example.com' && password === 'password') {
      alert('Вход выполнен успешно!');
      navigate('/'); // Перенаправляем на главную страницу после входа
    } else {
      alert('Неверный email или пароль.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2>Вход в личный кабинет</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Введите ваш e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Запомнить меня</label>
            </div>
            <Link to="/forgot-password" className="forgot-password-link">
              Забыли пароль?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Войти
          </button>
        </form>

        <p className="privacy-policy-text">
          Нажимая кнопку "Войти", я соглашаюсь с политикой
          <Link to="/privacy-policy"> конфиденциальности</Link> и обработкой персональных данных.
        </p>

        <div className="register-link-container">
          <Link to="/register" className="register-link">
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;