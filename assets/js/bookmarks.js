const KEYS = { bookmarks: 'skillinterview.bookmarks', completed: 'skillinterview.completed', lastCategory: 'skillinterview.lastCategory' };

const readSet = key => new Set(JSON.parse(localStorage.getItem(key) || '[]'));
const writeSet = (key, set) => localStorage.setItem(key, JSON.stringify([...set]));

export const progressStore = {
  bookmarks: () => readSet(KEYS.bookmarks),
  completed: () => readSet(KEYS.completed),
  toggleBookmark(uid) {
    const items = readSet(KEYS.bookmarks);
    items.has(uid) ? items.delete(uid) : items.add(uid);
    writeSet(KEYS.bookmarks, items);
    return items.has(uid);
  },
  toggleCompleted(uid) {
    const items = readSet(KEYS.completed);
    items.has(uid) ? items.delete(uid) : items.add(uid);
    writeSet(KEYS.completed, items);
    return items.has(uid);
  },
  setLastCategory(categoryId) { localStorage.setItem(KEYS.lastCategory, categoryId); },
  getLastCategory() { return localStorage.getItem(KEYS.lastCategory) || 'python'; }
};
