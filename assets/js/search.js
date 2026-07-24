class SearchManager {
  static CATEGORIES = [
    'python.json', 'aws.json', 'rag.json', 'sql.json', 
    'docker.json', 'linux.json', 'systemdesign.json', 'ml.json', 'genai.json'
  ];

  static async searchAll(query) {
    query = query.toLowerCase().trim();
    if (!query) return [];

    let results = [];
    for (const file of this.CATEGORIES) {
      const questions = await DataLoader.loadCategory(file);
      const matched = questions.filter(q => {
        return q.question.toLowerCase().includes(query) || 
               q.answer.toLowerCase().includes(query) ||
               (q.topic && q.topic.toLowerCase().includes(query));
      });
      results = results.concat(matched);
    }
    return results;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('globalSearch');
  const resultsContainer = document.getElementById('searchResults'); // if present

  if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value;
        if(query) {
           // Redirect to categories.html with search query
           window.location.href = `categories.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
});
