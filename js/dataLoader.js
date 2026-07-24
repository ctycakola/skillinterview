/**
 * DataLoader Module
 * Fetches JSON files asynchronously and provides indexed lookups.
 */

export class DataLoader {
  constructor() {
    this.categories = [];
    this.allQuestions = [];
    this.questionsByCategory = {};
  }

  async init() {
    try {
      const res = await fetch('data/categories.json');
      this.categories = await res.json();

      // Fetch all category question JSON files in parallel
      const loadPromises = this.categories.map(async (cat) => {
        try {
          const catRes = await fetch(cat.file);
          const questions = await catRes.json();
          this.questionsByCategory[cat.id] = questions;
          return questions;
        } catch (err) {
          console.error(`Failed to load ${cat.file}`, err);
          return [];
        }
      });

      const results = await Promise.all(loadPromises);
      this.allQuestions = results.flat();

      // Update question counts in category objects dynamically
      this.categories.forEach(cat => {
        cat.questionCount = (this.questionsByCategory[cat.id] || []).length;
      });

      return {
        categories: this.categories,
        allQuestions: this.allQuestions
      };
    } catch (error) {
      console.error('Error initializing DataLoader:', error);
      throw error;
    }
  }

  getCategories() {
    return this.categories;
  }

  getAllQuestions() {
    return this.allQuestions;
  }

  getQuestionsByCategory(categoryId) {
    if (categoryId === 'all') return this.allQuestions;
    return this.questionsByCategory[categoryId] || [];
  }

  getQuestionById(id) {
    return this.allQuestions.find(q => q.id === id);
  }

  filterQuestions({ categoryId = 'all', difficulty = 'all', searchQuery = '' }) {
    let filtered = categoryId === 'all' 
      ? [...this.allQuestions] 
      : [...(this.questionsByCategory[categoryId] || [])];

    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q) ||
          (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q)))
        );
      });
    }

    return filtered;
  }
}
