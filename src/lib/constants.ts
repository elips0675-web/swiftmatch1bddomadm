
export const THEME_OPTIONS: readonly string[] = ["light", "dark", "system"];

export const DATING_GOALS: readonly string[] = [
    "goal.serious_relationship",
    "goal.one_night",
    "goal.friendship",
    "goal.family_kids",
    "goal.travel",
    "goal.co_living",
    "goal.just_talk",
    "goal.penpal",
    "goal.dating",
    "goal.new_friends",
    "goal.no_commitment"
];

export const INTEREST_OPTIONS: readonly string[] = [
    "interest.sport",
    "interest.music",
    "interest.movies",
    "interest.books",
    "interest.travel",
    "interest.cooking",
    "interest.games",
    "interest.art",
    "interest.photography",
    "interest.tech",
    "interest.fashion",
    "interest.dance",
    "interest.animals",
    "interest.volunteering",
    "interest.politics",
    "interest.psychology",
    "interest.philosophy",
    "interest.yoga",
    "interest.meditation",
    "interest.gardening",
    "interest.cars",
    "interest.science",
    "interest.history",
    "interest.architecture",
    "interest.coffee",
    "interest.nature",
    "interest.design",
    "interest.pets",
];

export const ZODIAC_SIGNS: readonly string[] = [
    "common.zodiac.aries",
    "common.zodiac.taurus",
    "common.zodiac.gemini",
    "common.zodiac.cancer",
    "common.zodiac.leo",
    "common.zodiac.virgo",
    "common.zodiac.libra",
    "common.zodiac.scorpio",
    "common.zodiac.sagittarius",
    "common.zodiac.capricorn",
    "common.zodiac.aquarius",
    "common.zodiac.pisces"
];

export const EDUCATION_OPTIONS: readonly string[] = [
    "education.secondary",
    "education.vocational",
    "education.incomplete_higher",
    "education.higher",
    "education.bachelor",
    "education.master",
    "education.candidate",
    "education.doctor"
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

export const POPULAR_CITIES: Record<string, string[]> = {
  "Россия": [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар",
    "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск",
    "Иркутск", "Хабаровск", "Ярославль", "Владивосток", "Махачкала",
    "Томск", "Оренбург", "Кемерово", "Рязань", "Астрахань", "Пенза",
    "Липецк", "Тула", "Калининград", "Курск", "Ставрополь", "Улан-Удэ",
    "Тверь", "Магнитогорск", "Иваново", "Брянск", "Сочи", "Белгород",
    "Сургут", "Владимир", "Нижний Тагил", "Архангельск", "Чита",
    "Калуга", "Смоленск", "Волжский", "Саранск", "Мурманск", "Кострома",
    "Новороссийск", "Подольск", "Комсомольск-на-Амуре", "Таганрог"
  ],
  "США": [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
    "Indianapolis", "San Francisco", "Seattle", "Denver", "Nashville",
    "Oklahoma City", "El Paso", "Washington", "Boston", "Las Vegas",
    "Portland", "Memphis", "Louisville", "Baltimore", "Milwaukee",
    "Albuquerque", "Tucson", "Fresno", "Sacramento", "Mesa",
    "Kansas City", "Atlanta", "Omaha", "Colorado Springs", "Raleigh",
    "Long Beach", "Virginia Beach", "Miami", "Oakland", "Minneapolis",
    "Tampa", "Tulsa", "Arlington", "New Orleans", "Cleveland"
  ],
  "Великобритания": [
    "London", "Birmingham", "Leeds", "Glasgow", "Sheffield",
    "Manchester", "Edinburgh", "Liverpool", "Bristol", "Cardiff",
    "Leicester", "Nottingham", "Newcastle upon Tyne", "Southampton",
    "Oxford", "Cambridge", "Brighton", "York", "Bath", "Belfast"
  ],
  "Германия": [
    "Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt",
    "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen",
    "Bremen", "Dresden", "Hanover", "Nuremberg", "Duisburg",
    "Bochum", "Wuppertal", "Bonn", "Münster", "Mannheim"
  ],
  "Франция": [
    "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
    "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
    "Rennes", "Reims", "Saint-Étienne", "Le Havre", "Grenoble",
    "Dijon", "Angers", "Nîmes", "Villeurbanne", "Clermont-Ferrand"
  ],
  "Испания": [
    "Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza",
    "Málaga", "Murcia", "Palma de Mallorca", "Las Palmas", "Bilbao",
    "Alicante", "Córdoba", "Valladolid", "Vigo", "Gijón",
    "Granada", "Santander", "Pamplona", "San Sebastián", "Toledo"
  ],
  "Италия": [
    "Rome", "Milan", "Naples", "Turin", "Palermo",
    "Genoa", "Bologna", "Florence", "Catania", "Bari",
    "Venice", "Verona", "Messina", "Padua", "Trieste",
    "Brescia", "Parma", "Taranto", "Modena", "Reggio Calabria"
  ],
  "Китай": [
    "Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu",
    "Nanjing", "Wuhan", "Xi'an", "Hangzhou", "Dongguan",
    "Foshan", "Shenyang", "Qingdao", "Harbin", "Dalian",
    "Jinan", "Zhengzhou", "Changsha", "Kunming", "Suzhou"
  ],
  "Индия": [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad",
    "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane",
    "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara"
  ],
  "Турция": [
    "Istanbul", "Ankara", "Izmir", "Bursa", "Antalya",
    "Adana", "Gaziantep", "Konya", "Mersin", "Diyarbakır",
    "Kayseri", "Eskişehir", "Samsun", "Denizli", "Trabzon",
    "Malatya", "Şanlıurfa", "Kahramanmaraş", "Van", "Elazığ"
  ],
  "Казахстан": [
    "Almaty", "Astana (Nur-Sultan)", "Shymkent", "Karagandy", "Aktobe",
    "Taraz", "Pavlodar", "Ust-Kamenogorsk", "Semey", "Atyrau",
    "Kostanay", "Kyzylorda", "Uralsk", "Petropavl", "Aktau"
  ],
  "Украина": [
    "Kyiv", "Kharkiv", "Odesa", "Dnipro", "Lviv",
    "Zaporizhzhia", "Kryvyi Rih", "Mykolaiv", "Vinnytsia", "Poltava",
    "Chernihiv", "Cherkasy", "Sumy", "Zhytomyr", "Rivne"
  ],
  "Узбекистан": [
    "Tashkent", "Samarkand", "Bukhara", "Namangan", "Andijan",
    "Fergana", "Nukus", "Qarshi", "Kokand", "Margilan"
  ],
  "Беларусь": [
    "Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno",
    "Brest", "Babruysk", "Baranovichi", "Borisov", "Pinsk"
  ],
  "Польша": [
    "Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań",
    "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Katowice"
  ],
  "Япония": [
    "Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo",
    "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Saitama",
    "Hiroshima", "Sendai", "Chiba", "Kitakyushu", "Naha"
  ],
  "ОАЭ": [
    "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah",
    "Fujairah", "Al Ain", "Umm Al Quwain"
  ],
  "Израиль": [
    "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva",
    "Ashdod", "Netanya", "Beer Sheva", "Holon", "Ramat Gan"
  ],
  "Таиланд": [
    "Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Nonthaburi",
    "Hat Yai", "Nakhon Ratchasima", "Khon Kaen", "Udon Thani", "Chon Buri"
  ],
  "Египет": [
    "Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Hurghada",
    "Luxor", "Aswan", "Port Said", "Suez", "Mansoura"
  ],
  "Вьетнам": [
    "Ho Chi Minh City", "Hanoi", "Da Nang", "Haiphong", "Can Tho",
    "Nha Trang", "Hue", "Da Lat", "Vung Tau", "Quy Nhon"
  ],
};

export const CIRCADIAN_RHYTHM_OPTIONS = [
    { value: 'early-bird', label: 'circadian.early_bird' },
    { value: 'night-owl', label: 'circadian.night_owl' },
    { value: 'flexible', label: 'circadian.flexible' },
];

export const ATTACHMENT_STYLE_OPTIONS = [
    { value: 'secure', label: 'attachment.secure' },
    { value: 'anxious', label: 'attachment.anxious' },
    { value: 'avoidant', label: 'attachment.avoidant' },
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
