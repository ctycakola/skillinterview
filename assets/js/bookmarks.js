const BOOKMARKS_KEY = 'skillinterview_bookmarks';

class BookmarkManager {
  static getBookmarks() {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
  }

  static isBookmarked(questionId, category) {
    const bookmarks = this.getBookmarks();
    return bookmarks.some(b => b.id === questionId && b.category === category);
  }

  static toggleBookmark(question, btnElement) {
    let bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex(b => b.id === question.id && b.category === question.category);

    if (existingIndex >= 0) {
      // Remove bookmark
      bookmarks.splice(existingIndex, 1);
      if(btnElement) {
        btnElement.classList.remove('bookmarked');
        btnElement.innerHTML = '<i class="bi bi-bookmark"></i> Save';
      }
    } else {
      // Add bookmark
      bookmarks.push(question);
      if(btnElement) {
        btnElement.classList.add('bookmarked');
        btnElement.innerHTML = '<i class="bi bi-bookmark-fill"></i> Saved';
      }
    }
    
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return existingIndex < 0; // returns true if added, false if removed
  }
}

// Global exposure for onClick events in HTML strings if needed
window.BookmarkManager = BookmarkManager;
