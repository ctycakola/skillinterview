const DATA_ROOT = 'data/';

export class JsonLoader {
  constructor() {
    this.categories = [];
    this.questions = [];
    this.byCategory = new Map();
  }

  async loadQuestions() {
    if (this.questions.length) return this.questions;
    const response = await fetch(`${DATA_ROOT}categories.json`);
    if (!response.ok) throw new Error('The category index could not be loaded.');
    this.categories = await response.json();
    const results = await Promise.all(this.categories.map(async category => {
      const categoryResponse = await fetch(`${DATA_ROOT}${category.file}`);
      if (!categoryResponse.ok) throw new Error(`${category.name} questions could not be loaded.`);
      const questions = await categoryResponse.json();
      const normalized = questions.map(question => ({ ...question, uid: `${category.id}-${question.id}`, categoryId: category.id }));
      this.byCategory.set(category.id, normalized);
      category.count = normalized.length;
      return normalized;
    }));
    this.questions = results.flat();
    return this.questions;
  }

  async loadCategory(categoryId) {
    await this.loadQuestions();
    return this.byCategory.get(categoryId) || [];
  }

  getCategory(categoryId) {
    return this.categories.find(category => category.id === categoryId);
  }
}

export const loader = new JsonLoader();
