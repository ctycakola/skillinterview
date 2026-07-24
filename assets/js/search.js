export const searchQuestions = (questions, query) => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return questions;
  return questions.filter(item =>
    [item.question, item.answer, item.topic, item.category, ...(item.tips || []), ...(item.related || [])]
      .filter(Boolean).some(value => value.toLocaleLowerCase().includes(normalized))
  );
};

export const filterDifficulty = (questions, difficulty) =>
  difficulty === 'All' ? questions : questions.filter(item => item.difficulty === difficulty);

export function debounce(callback, delay = 160) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), delay);
  };
}
