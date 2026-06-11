import React from 'react';

export const ZodiacIcon = ({ sign }: { sign: string }) => {
  const signs: Record<string, string> = {
    "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋", "Лев": "♌", "Дева": "♍",
    "Весы": "♎", "Скорпион": "♏", "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓",
    "Aries": "♈", "Taurus": "♉", "Gemini": "♊", "Cancer": "♋", "Leo": "♌", "Virgo": "♍",
    "Libra": "♎", "Scorpio": "♏", "Sagittarius": "♐", "Capricorn": "♑", "Aquarius": "♒", "Pisces": "♓",
    "common.zodiac.aries": "♈", "common.zodiac.taurus": "♉", "common.zodiac.gemini": "♊", "common.zodiac.cancer": "♋",
    "common.zodiac.leo": "♌", "common.zodiac.virgo": "♍", "common.zodiac.libra": "♎", "common.zodiac.scorpio": "♏",
    "common.zodiac.sagittarius": "♐", "common.zodiac.capricorn": "♑", "common.zodiac.aquarius": "♒", "common.zodiac.pisces": "♓"
  };
  return <span className="text-xl leading-none">{signs[sign] || "✨"}</span>;
};
