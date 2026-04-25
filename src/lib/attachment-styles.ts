
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant';

export const ATTACHMENT_STYLE_QUESTIONS = [
  {
    id: 'q1',
    text: 'Когда вы сближаетесь с кем-то, как вы обычно себя чувствуете?',
    options: [
      { id: 'a', text: 'Спокойно и уверенно, я наслаждаюсь близостью.', style: 'secure' as AttachmentStyle },
      { id: 'b', text: 'Немного тревожно, я боюсь, что человек может уйти.', style: 'anxious' as AttachmentStyle },
      { id: 'c', text: 'Некомфортно, я предпочитаю держать дистанцию.', style: 'avoidant' as AttachmentStyle },
    ],
  },
  {
    id: 'q2',
    text: 'Как вы ведете себя в конфликте с партнером?',
    options: [
      { id: 'a', text: 'Я стараюсь открыто обсудить проблему и найти решение.', style: 'secure' as AttachmentStyle },
      { id: 'b', text: 'Я сильно переживаю и могу быть очень эмоциональным, боясь разрыва.', style: 'anxious' as AttachmentStyle },
      { id: 'c', text: 'Я склонен замыкаться в себе и избегать обсуждения.', style: 'avoidant' as AttachmentStyle },
    ],
  },
  {
    id: 'q3',
    text: 'Насколько для вас важна независимость в отношениях?',
    options: [
      { id: 'a', text: 'Важна, но я ценю и взаимную поддержку.', style: 'secure' as AttachmentStyle },
      { id: 'b', text: 'Я предпочитаю проводить как можно больше времени вместе.', style: 'anxious' as AttachmentStyle },
      { id: 'c', text: 'Очень важна, мне нужно много личного пространства.', style: 'avoidant' as AttachmentStyle },
    ],
  },
    {
    id: 'q4',
    text: 'Что вы чувствуете, если партнер долго не отвечает на сообщения?',
    options: [
      { id: 'a', text: 'Скорее всего, он просто занят. Напишет, когда освободится.', style: 'secure' as AttachmentStyle },
      { id: 'b', text: 'Я начинаю волноваться, что что-то случилось или я что-то сделал не так.', style: 'anxious' as AttachmentStyle },
      { id: 'c', text: 'Я не обращаю на это особого внимания, у всех свои дела.', style: 'avoidant' as AttachmentStyle },
    ],
  },
];

export function calculateAttachmentStyle(answers: { [questionId: string]: AttachmentStyle }): AttachmentStyle {
  const counts: { [key in AttachmentStyle]: number } = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
  };

  for (const questionId in answers) {
    const style = answers[questionId];
    if (style in counts) {
      counts[style]++;
    }
  }

  let maxCount = 0;
  let resultStyle: AttachmentStyle = 'secure';

  for (const style in counts) {
    if (counts[style as AttachmentStyle] > maxCount) {
      maxCount = counts[style as AttachmentStyle];
      resultStyle = style as AttachmentStyle;
    }
  }

  return resultStyle;
}

export const ATTACHMENT_STYLE_INFO: { [key in AttachmentStyle]: { label: string; description: string; emoji: string; } } = {
    secure: {
        label: 'Надежный',
        description: 'Вы легко сближаетесь с людьми и не боитесь зависимости. Вы не беспокоитесь о том, что вас покинут.',
        emoji: '✅'
    },
    anxious: {
        label: 'Тревожный',
        description: 'Вы жаждете близости, но часто боитесь, что партнер не захочет быть с вами так же сильно. Вы очень чувствительны к настроению партнера.',
        emoji: '😟'
    },
    avoidant: {
        label: 'Избегающий',
        description: 'Вам некомфортна слишком большая близость. Вы цените свою независимость и самостоятельность, и не любите зависеть от других.',
        emoji: '💨'
    }
}
