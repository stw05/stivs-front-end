import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Ваши переводы
const resources = {
  ru: {
    translation: {
      // --- ОСНОВНАЯ НАВИГАЦИЯ И ШАПКА ---
      "app_name": "ЕИСНК",
      "app_title_full": "Единая информационная система «Наука Казахстана»",
      "rus_label": "RU",
      "kaz_label": "KZ",
      "settings_label": "Настройки",
      "logout_label": "Выход",
      
      // --- НАЗВАНИЯ СТРАНИЦ ---
      "home_page_title": "Главная", // статичная
      "projects_page_title": "Проекты",
      "employees_page_title": "Сотрудники",
      "publications_page_title": "Публикации", // Обновлено
      "finances_page_title": "Финансы",
      "republic_kazakhstan": "Республика Казахстан",
      
      // --- ЕДИНИЦЫ ИЗМЕРЕНИЯ (NEW) ---
      "unit_mlrd_tg": "млрд. тг",
      "unit_thousand_tg": "тыс. тг",
      "unit_projects": "проектов",
      "unit_people": "человек",
      "unit_publications": "публикаций",

      // --- ОБЩИЕ ЭЛЕМЕНТЫ НА СТРАНИЦАХ ---
      "projects_not_found": "Проекты не найдены, уточните фильтры.", 
      "employees_not_found": "Сотрудники не найдены по текущим фильтрам.", 
      "show_projects_summary": "Показано проектов: ", 
      "from_total_summary": " из ", 
      "show_employees_summary": "Показано сотрудников: ",
      
      // --- ОБЗОР (HomePage.tsx) - КАРТОЧКИ ---
      
      // Проекты
      "card_projects_title": "Проекты",
      "card_projects_grants": "Проекты по грантовому финансированию",
      "card_projects_programs": "Программы по программно-целевому финансированию",
      "card_projects_contracts": "Хозяйственные договоры",
      "card_projects_commercialization": "Проекты коммерциализации РННТ",
      "card_projects_trl_high": "Средняя длительность (лет)",
      
      // Публикации
      "card_publications_title": "Публикации",
      "card_publications_scopus": "Статьи в журналах (Scopus/WoS)",
      "card_publications_patents": "Материалы конференций",
      "card_publications_acts": "Монографии",
      "card_publications_monographs": "Прочие публикации",
      "card_publications_security_docs": "Охранные документы",
      "card_publications_implementations": "Акты внедрения",

      // Сотрудники
      "card_employees_title": "Сотрудники",
      "card_employees_doctors": "Доктора наук",
      "card_employees_candidates": "Кандидаты наук",
      "card_employees_masters": "Магистры",
      "card_employees_h_index_high": "Средний возраст (лет)",

      // Финансы (Карточка на Главной)
      "card_finances_title": "Финансы",
      "card_finances_total_current_year": "Общая сумма финансирования на текущий год",
      "card_finances_avg_per_project": "Средняя сумма на 1 проект/программу",
      "card_finances_cofinancing_amount": "Сумма софинансирования (%)",
      "card_finances_regional_programs": "Региональные программы",
      
      // --- ОБЗОР (HomePage.tsx) - КАРТА И ФИЛЬТРЫ ---
      "map_overview_title": "Обзор по регионам",
      "map_tag_national": "Свод по стране",
      "map_tag_selected": "Выбран регион",
      "map_subtitle": "Обновленные показатели проектов, публикаций и финансирования по выбранной территории.",
      "map_action_button": "Смотреть детальную статистику",
      "stats_section_title": "Основные показатели системы",
      
      // Фильтры
      "filter_select_direction": "Все направления",
      "filter_research": "Исследования",
      "filter_commercialization": "Коммерциализация",
      "filter_international_projects": "Международные проекты",
      "filter_select_organization": "Выбор организации",
      "filter_all_organizations": "Все организации",
      "filter_select_priority": "Приоритетные направления развития науки",
      "filter_all_priorities": "Все приоритеты",
      
      // Приоритеты
      "priority_energy_transport": "Энергия, передовые материалы и транспорт",
      "priority_advanced_tech": "Передовое производство, цифровые и космические технологии",
      "priority_intellect_natural": "\"Интеллектуальный потенциал страны\" (Естественные науки)",
      "priority_intellect_social": "\"Интеллектуальный потенциал страны\" (Социальные, гуманитарные науки и искусство)",
      "priority_agriculture": "Устойчивое развитие агропромышленного комплекса",
      "priority_life_health": "Наука о жизни и здоровье",
      "priority_security": "Национальная безопасность и оборона, биологическая безопасность",
      "priority_commercialization": "Коммерциализация результатов научной и (или) научно-технической деятельности",
      "priority_ecology": "Экология, окружающая среда и рациональное природопользование",


      // --- ФИНАНСЫ (FinancesPage.tsx) ---
      "filter_gf": "Грантовое финансирование",
      "filter_pcf": "Программно-целевое финансирование",
      "filter_commercial": "Коммерциализация",
      "filter_year_range": "Период",
      "filter_cofinancing_label": "Софинансирование:",
      "filter_cofinancing_contract": "По договору",
      "filter_cofinancing_actual": "Фактическое",
      "chart_finance_dynamics": "Финансовая динамика (млрд. тг)",
      "filter_all_financing": "Все виды финансирования",
      "chart_requested_approved": "Запрашиваемое и одобренное финансирование (млрд. тг)",
      "chart_expense_structure": "Структура расходов",
      "filter_all_categories": "Все категории",
      "filter_salary": "Зарплата",
      "filter_travel": "Командировочные",
      "filter_support": "Содержание",
      "filter_materials": "Материалы",
      "filter_rent": "Аренда",
      "filter_protocol": "Протокол",
      "map_financing_overview": "Обзор финансирования по регионам",
      "map_tag_national_finances": "Национальный уровень", // Отдельный ключ для финансов
      "map_tag_selected_finances": "Выбранный регион", // Отдельный ключ для финансов
      "chart_expenses_by_year": "Расходы по годам",
      // filter_all_directions (уже есть выше)
      "filter_digital": "Цифровизация",
      "filter_education": "Образование",
      "filter_biotech": "Биотехнологии",
      "filter_energy": "Энергетика",
      "filter_contest_label": "Конкурс:",
      "filter_all_contests": "Все конкурсы",
      "filter_innovation": "Инновации",
      "filter_grant2025": "Грант 2025",
      "filter_pilot": "Пилотный",
      "table_header_region": "Регион",
      "table_header_total_budget": "Общий бюджет (млрд. тг)",
      "table_header_cofinancing_perc": "Софинансирование (%)",
      "comparison_national_level": "Сравнение с национальным уровнем",
      "comparison_placeholder": "Выберите регион, чтобы увидеть сравнение с национальными значениями.",
      "table_header_indicator": "Показатель",
      "table_header_region_short": "Регион",
      "table_header_republic": "Республика",
      "table_header_share_delta": "Доля / Δ",
      "comparison_projects_count": "Количество проектов",
      "comparison_total_finances": "Общее финансирование",
    }
  },
  kk: {
    translation: {
      // --- ОСНОВНАЯ НАВИГАЦИЯ И ШАПКА ---
      "app_name": "БИАЖ", 
      "app_title_full": "Қазақстан Ғылымының Бірыңғай Ақпараттық Жүйесі",
      "rus_label": "RU",
      "kaz_label": "KZ",
      "settings_label": "Баптаулар",
      "logout_label": "Шығу",
      
      // --- НАЗВАНИЯ СТРАНИЦ ---
      "home_page_title": "Басты бет", // статичная
      "projects_page_title": "Жобалар",
      "employees_page_title": "Қызметкерлер",
      "publications_page_title": "Басылымдар", // Обновлено
      "finances_page_title": "Қаржы",
      "republic_kazakhstan": "Қазақстан Республикасы",

      // --- ЕДИНИЦЫ ИЗМЕРЕНИЯ (NEW) ---
      "unit_mlrd_tg": "млрд. тг",
      "unit_thousand_tg": "мың. тг",
      "unit_projects": "жоба",
      "unit_people": "адам",
      "unit_publications": "басылым",

      // --- ОБЩИЕ ЭЛЕМЕНТЫ НА СТРАНИЦАХ ---
      "projects_not_found": "Жобалар табылмады, сүзгілерді нақтылаңыз.", 
      "employees_not_found": "Ағымдағы сүзгілер бойынша қызметкерлер табылмады.", 
      "show_projects_summary": "Көрсетілген жобалар: ", 
      "from_total_summary": " ішінен ", 
      "show_employees_summary": "Көрсетілген қызметкерлер: ", 

      // --- ОБЗОР (HomePage.tsx) - КАРТОЧКИ ---

      // Жобалар (Проекты)
      "card_projects_title": "Жобалар",
      "card_projects_grants": "Гранттық қаржыландыру бойынша жобалар",
      "card_projects_programs": "Бағдарламалық-нысаналы қаржыландыру бойынша бағдарламалар",
      "card_projects_contracts": "Шаруашылық шарттар",
      "card_projects_commercialization": "ҒТН-ны коммерцияландыру жобалары",
      "card_projects_trl_high": "Орташа ұзақтығы (жыл)",
      
      // Басылымдар (Публикации)
      "card_publications_title": "Басылымдар",
      "card_publications_scopus": "Журналдардағы мақалалар (Scopus/WoS)",
      "card_publications_patents": "Конференция материалдары",
      "card_publications_acts": "Монографиялар",
      "card_publications_monographs": "Басқа басылымдар",
      "card_publications_security_docs": "Қорғау құжаттары",
      "card_publications_implementations": "Енгізу актілері",

      // Қызметкерлер (Сотрудники)
      "card_employees_title": "Қызметкерлер",
      "card_employees_doctors": "Ғылым докторлары",
      "card_employees_candidates": "Ғылым кандидаттары",
      "card_employees_masters": "Магистрлер",
      "card_employees_h_index_high": "Орташа жасы (жас)",

      // Қаржы (Карточка на Главной)
      "card_finances_title": "Қаржы",
      "card_finances_total_current_year": "Ағымдағы жылға жалпы қаржыландыру сомасы",
      "card_finances_avg_per_project": "1 жобаға/бағдарламаға орташа сома",
      "card_finances_cofinancing_amount": "Қоса қаржыландыру сомасы (%)",
      "card_finances_regional_programs": "Аймақтық бағдарламалар",

      // --- ОБЗОР (HomePage.tsx) - КАРТА ЖӘНЕ СҮЗГІЛЕР ---
      "map_overview_title": "Аймақтар бойынша шолу",
      "map_tag_national": "Ел бойынша жиынтық",
      "map_tag_selected": "Аймақ таңдалды",
      "map_subtitle": "Таңдалған аумақ бойынша жобалардың, басылымдардың және қаржыландырудың жаңартылған көрсеткіштері.",
      "map_action_button": "Егжей-тегжейлі статистиканы көру",
      "stats_section_title": "Жүйенің негізгі көрсеткіштері",
      
      // Сүзгілер (Фильтры)
      "filter_select_direction": "Бағытты таңдау",
      "filter_research": "Зерттеулер",
      "filter_commercialization": "Коммерцияландыру",
      "filter_international_projects": "Халықаралық жобалар",
      "filter_select_organization": "Ұйымды таңдау",
      "filter_all_organizations": "Барлық ұйымдар",
      "filter_select_priority": "Ғылымды дамытудың басым бағыттары",
      "filter_all_priorities": "Барлық басымдықтар",

      // Басымдықтар (Приоритеты)
      "priority_energy_transport": "Энергия, озық материалдар және көлік",
      "priority_advanced_tech": "Озық өндіріс, цифрлық және ғарыш технологиялары",
      "priority_intellect_natural": "\"Елдің зияткерлік әлеуеті\" (Жаратылыстану ғылымдары)",
      "priority_intellect_social": "\"Елдің зияткерлік әлеуеті\" (Әлеуметтік, гуманитарлық ғылымдар және өнер)",
      "priority_agriculture": "Агроөнеркәсіптік кешенді тұрақты дамыту",
      "priority_life_health": "Өмір және денсаулық туралы ғылым",
      "priority_security": "Ұлттық қауіпсіздік және қорғаныс, биологиялық қауіпсіздік",
      "priority_commercialization": "Ғылыми және (немесе) ғылыми-техникалық қызмет нәтижелерін коммерцияландыру",
      "priority_ecology": "Экология, қоршаған орта және табиғатты ұтымды пайдалану",
      
      // --- ҚАРЖЫ (FinancesPage.tsx) ---
      "filter_gf": "Гранттық қаржыландыру",
      "filter_pcf": "Бағдарламалық-нысаналы қаржыландыру",
      "filter_commercial": "Коммерцияландыру",
      "filter_year_range": "Кезең",
      "filter_cofinancing_label": "Қоса қаржыландыру:",
      "filter_cofinancing_contract": "Шарт бойынша",
      "filter_cofinancing_actual": "Нақты",
      "chart_finance_dynamics": "Қаржылық динамика (млрд. тг)",
      "filter_all_financing": "Барлық қаржыландыру түрлері",
      "chart_requested_approved": "Сұралған және бекітілген қаржыландыру (млрд. тг)",
      "chart_expense_structure": "Шығыс құрылымы",
      "filter_all_categories": "Барлық санаттар",
      "filter_salary": "Жалақы",
      "filter_travel": "Іссапар шығыстары",
      "filter_support": "Ұстау",
      "filter_materials": "Материалдар",
      "filter_rent": "Жалдау",
      "filter_protocol": "Протокол",
      "map_financing_overview": "Аймақтар бойынша қаржыландыру шолуы",
      "map_tag_national_finances": "Ұлттық деңгей", // Отдельный ключ для финансов
      "map_tag_selected_finances": "Таңдалған аймақ", // Отдельный ключ для финансов
      "chart_expenses_by_year": "Жылдар бойынша шығыстар",
      // filter_all_directions (уже есть выше)
      "filter_digital": "Цифрландыру",
      "filter_education": "Білім беру",
      "filter_biotech": "Биотехнологиялар",
      "filter_energy": "Энергетика",
      "filter_contest_label": "Байқау:",
      "filter_all_contests": "Барлық байқаулар",
      "filter_innovation": "Инновациялар",
      "filter_grant2025": "Грант 2025",
      "filter_pilot": "Пилоттық",
      "table_header_region": "Аймақ",
      "table_header_total_budget": "Жалпы бюджет (млрд. тг)",
      "table_header_cofinancing_perc": "Қоса қаржыландыру (%)",
      "comparison_national_level": "Ұлттық деңгеймен салыстыру",
      "comparison_placeholder": "Ұлттық мәндермен салыстыруды көру үшін аймақты таңдаңыз.",
      "table_header_indicator": "Көрсеткіш",
      "table_header_region_short": "Аймақ",
      "table_header_republic": "Республика",
      "table_header_share_delta": "Үлес / Δ",
      "comparison_projects_count": "Жобалар саны", 
      "comparison_total_finances": "Жалпы қаржыландыру", 
    }
  }
};

i18n
  .use(LanguageDetector) // Автоматически определяет язык браузера
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ru", // Язык по умолчанию, если выбранный язык недоступен
    interpolation: {
      escapeValue: false // react уже защищает от XSS
    }
  });

export default i18n;