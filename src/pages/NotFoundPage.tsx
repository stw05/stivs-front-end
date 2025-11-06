import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div>
      <h2>Страница не найдена</h2>
      <p>Похоже, такого раздела еще нет. Вернитесь на главную страницу.</p>
      <Link to="/">Вернуться на главную</Link>
    </div>
  );
};

export default NotFoundPage;
