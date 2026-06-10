
const FORBIDDEN_WORD_ROOTS = [
  // Нецензурная лексика (Swear words) и вариации
  'хуй', 'хуи', 'хуе', 'хуя', 'хую', 'пизд', 'ебан', 'ебал', 'бля', 'ебл', 'муд', 'сука', 'залуп', 'уеб',
  'fuck', 'cunt', 'shit', 'bitch', 'asshole', 'dick',

  // Оскорбления и Дискриминация (Insults & Discrimination)
  'мразь', 'урод', 'дебил', 'шлюх', 'ниггер', 'хохол', 'кацап', 'жид', 'чмо', 'пидор', 'гандон',
  'scum', 'freak', 'moron', 'slut', 'nigger', 

  // Призывы к насилию (Calls to violence)
  'уби', 'насил', 'террор', 'экстрем', 'расправ', 'взорв',
  'kill', 'murder', 'violen', 'terror', 'extremis', 'slaughter',

  // Политика (Politics)
  'политик', 'президент', 'правительств', 'выбор', 'митинг', 'оппозици', 'война',
  'politic', 'president', 'government', 'election', 'rally', 'opposition', 'war', 
  'навальн', 'путин', 'лукашенк', 'пересидент', 'зеленск', 'байден', 'трамп', 
  'спецопераци', 'кремль', 'госдума', 'майдан',

  // Спам и Реклама (Spam & Ads)
  'http:', 'https:', 'www.', '.com', '.ru', '.net', '.org', 't.me', 'vk.com',
  'купи', 'продай', 'акция', 'скидк', 'заработ', 'казино', 'ставк', 'крипт',
  'buy', 'sell', 'promo', 'discount', 'earn', 'casino', 'bet', 'crypto',

  // Мошенничество (Scam)
  'бинарн', 'опцион', 'пирамид',
  'binary', 'option', 'pyramid',

  // Запрещенные товары и услуги (Forbidden goods & services)
  'нарко', 'оружи', 'проститут', 'порно',
  'drug', 'weapon', 'prostitut', 'porn',

  // Конкуренты (Competitors)
  'tinder', 'badoo', 'mamba', 'pure', 'тиндер', 'баду', 'мамба'
];

/**
 * Checks if the text contains forbidden words.
 */
export const containsForbiddenWords = (text: string): boolean => {
  const lowerCaseText = text.toLowerCase();
  for (const root of FORBIDDEN_WORD_ROOTS) {
    if (lowerCaseText.includes(root)) {
      return true;
    }
  }
  return false;
};

/**
 * Checks if the text is likely a nonsensical keyboard mash (gibberish).
 */
export const isGibberish = (text: string): boolean => {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return false;

  // 1. Repeating characters like "aaaaaaa" or "!!!!! "
  if (/(.)\1{4,}/.test(normalized)) return true;

  // 2. Check for repeating trigrams across the ENTIRE text (catches "ыва ывааываывы ыавыва")
  const full = normalized.replace(/[^a-zа-яё]/g, '');
  if (full.length >= 6) {
    const seenFull: Record<string, number> = {};
    for (let i = 0; i <= full.length - 3; i++) {
      const tri = full.slice(i, i + 3);
      seenFull[tri] = (seenFull[tri] || 0) + 1;
      if (seenFull[tri] >= 3) return true;
    }
  }

  const words = normalized.split(/\s+/);

  for (const word of words) {
    const letters = word.replace(/[^a-zа-яё]/g, '');
    if (letters.length < 3) continue;

    // 3. No vowels at all in a word of 3+ letters.
    const vowelsMatch = letters.match(/[aeiouyаеёиоуыэюя]/g);
    const vowelsCount = vowelsMatch ? vowelsMatch.length : 0;
    if (letters.length >= 3 && vowelsCount === 0) return true;

    // 4. Check for excessive consonant clusters (5+ consecutive consonants is always gibberish).
    const consonantClusters = letters.match(/[bcdfghjklmnpqrstvwxzбвгджзйклмнпрстфхцчшщ]{5,}/g);
    if (consonantClusters) {
      return true;
    }

    // 5. Common keyboard row sequences (mashing)
    const mashPatterns = [
      'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'zxcv', 'xcvb',
      'йцук', 'цуке', 'укен', 'кенг', 'фыва', 'ывап', 'вапр', 'апро', 'прол', 'ролд', 'олдж',
      'ячсм', 'чсми', 'смит', 'мить',
      'ишрл', 'шрлш', 'рлши', 'некн', 'кегн', 'егнн'
    ];

    for (const pattern of mashPatterns) {
      if (letters.includes(pattern)) return true;
    }

    // 6. Check for repeating trigrams within a word
    const seenWord: Record<string, number> = {};
    for (let i = 0; i <= letters.length - 3; i++) {
      const tri = letters.slice(i, i + 3);
      seenWord[tri] = (seenWord[tri] || 0) + 1;
      if (seenWord[tri] >= 3) return true;
    }
  }

  return false;
};
