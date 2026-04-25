
export const THEME_OPTIONS: readonly string[] = ["light", "dark", "system"];

export const DATING_GOALS: readonly string[] = [
    "Серьезные отношения",
    "Отношения на одну ночь",
    "Дружба",
    "Семья и дети",
    "Путешествия",
    "Совместная аренда",
    "Просто общение",
    "Переписка",
    "Свидания",
    "Без обязательств"
];

export const INTEREST_OPTIONS: readonly string[] = [
    "Спорт", 
    "Музыка", 
    "Фильмы", 
    "Книги", 
    "Путешествия", 
    "Кулинария", 
    "Игры", 
    "Искусство",
    "Фотография",
    "Технологии",
    "Мода",
    "Танцы",
    "Животные",
    "Волонтерство",
    "Политика",
    "Психология",
    "Философия",
    "Йога",
    "Медитация",
    "Садоводство",
    "Автомобили",
    "Наука",
    "История",
    "Архитектура",
];

export const ZODIAC_SIGNS: readonly string[] = [
    "Овен",
    "Телец",
    "Близнецы",
    "Рак",
    "Лев",
    "Дева",
    "Весы",
    "Скорпион",
    "Стрелец",
    "Козерог",
    "Водолей",
    "Рыбы"
];

export const EDUCATION_OPTIONS: readonly string[] = [
    "Среднее",
    "Среднее специальное",
    "Неоконченное высшее",
    "Высшее",
    "Бакалавр",
    "Магистр",
    "Кандидат наук",
    "Доктор наук"
];

export const CAPITALS: readonly string[] = [
    "Москва", 
    "Санкт-Петербург",
    "Новосибирск",
    "Екатеринбург",
    "Казань",
    "Нижний Новгород",
    "Челябинск",
    "Самара",
    "Омск",
    "Ростов-на-Дону",
    "Уфа",
    "Красноярск",
    "Воронеж",
    "Пермь",
    "Волгоград"
];

export const CIRCADIAN_RHYTHM_OPTIONS = [
    { value: 'early-bird', label: 'Жаворонок (ранние подъемы)' },
    { value: 'night-owl', label: 'Сова (поздние отбои)' },
    { value: 'flexible', label: 'Гибкий (легко адаптируюсь)' },
];

export const ATTACHMENT_STYLE_OPTIONS = [
    { value: 'secure', label: 'Надежный' },
    { value: 'anxious', label: 'Тревожный' },
    { value: 'avoidant', label: 'Избегающий' },
];

export interface TitleMetadata {
  id: string;
  name_en: string;
  name_ru: string;
  icon: string;
  description_en: string;
  description_ru: string;
  color?: string;
}

export const ALL_TITLES: TitleMetadata[] = [
    {
        id: 'rookie',
        name_en: 'Rookie',
        name_ru: 'Новичок',
        icon: '👶',
        description_en: 'Just starting their journey on SwiftMatch.',
        description_ru: 'Только начинает свой путь на SwiftMatch.',
    },
    {
        id: 'romantic',
        name_en: 'Romantic',
        name_ru: 'Романтик',
        icon: '📜',
        description_en: 'Has a thoughtfully filled out bio.',
        description_ru: 'Имеет вдумчиво заполненную биографию.',
    },
    {
        id: 'party',
        name_en: 'Party Animal',
        name_ru: 'Душа компании',
        icon: '🎉',
        description_en: 'Has a wide variety of interests.',
        description_ru: 'Имеет широкий спектр интересов.',
    },
    {
        id: 'king',
        name_en: 'King of Hearts',
        name_ru: 'Король сердец',
        icon: '👑',
        description_en: 'Mastered the art of matching with over 90% compatibility.',
        description_ru: 'Освоил искусство мэтчинга с совместимостью более 90%.',
    },
];
