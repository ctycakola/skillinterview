/**
 * UIController Module
 * Manages DOM updates, user interactions, routing, cards, flashcards, stats, and device mode preview.
 */

import { StorageManager } from './storage.js';

export class UIController {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
    this.currentView = 'browse';
    this.selectedCategory = 'all';
    this.selectedDifficulty = 'all';
    this.searchQuery = '';
    
    // Flashcard State
    this.flashcardList = [];
    this.currentFlashcardIndex = 0;
    this.isCardFlipped = false;

    // Cache DOM Elements
    this.elements = {
      viewport: document.getElementById('app-viewport'),
      viewBrowse: document.getElementById('view-browse'),
      viewFlashcards: document.getElementById('view-flashcards'),
      viewBookmarks: document.getElementById('view-bookmarks'),
      viewStats: document.getElementById('view-stats'),
      
      navItems: document.querySelectorAll('.nav-item'),
      navBookmarkBadge: document.getElementById('nav-bookmark-badge'),
      
      categoryGrid: document.getElementById('category-grid'),
      questionsList: document.getElementById('questions-list'),
      bookmarksList: document.getElementById('bookmarks-list'),
      
      searchInput: document.getElementById('search-input'),
      searchClearBtn: document.getElementById('search-clear-btn'),
      chipContainer: document.getElementById('filter-chips'),

      
      // Header Stats
      headerMasteredText: document.getElementById('header-mastered-text'),
      
      // Flashcards
      flashcardInner: document.getElementById('flashcard-inner'),
      fcCategoryBadge: document.getElementById('fc-category-badge'),
      fcDifficultyBadge: document.getElementById('fc-difficulty-badge'),
      fcQuestionText: document.getElementById('fc-question-text'),
      fcAnswerText: document.getElementById('fc-answer-text'),
      fcCodeBox: document.getElementById('fc-code-box'),
      fcCodeContent: document.getElementById('fc-code-content'),
      fcProgressPill: document.getElementById('fc-progress-pill'),
      fcPrevBtn: document.getElementById('fc-prev-btn'),
      fcNextBtn: document.getElementById('fc-next-btn'),
      fcFlipBtn: document.getElementById('fc-flip-btn'),
      
      // Stats
      statTotalQuestions: document.getElementById('stat-total-q'),
      statMasteredCount: document.getElementById('stat-mastered-count'),
      statStarredCount: document.getElementById('stat-starred-count'),
      statProgressPercent: document.getElementById('stat-progress-percent'),
      statProgressBar: document.getElementById('stat-progress-bar'),
      statProgressBadge: document.getElementById('stat-progress-badge'),
      statsCategoryBreakdown: document.getElementById('stats-category-breakdown')
    };
  }

  init() {
    this.renderCategoryGrid();
    this.renderFilterChips();
    this.renderQuestions();
    this.updateStats();
  }

  // Switch Active View (Browse, Flashcards, Bookmarks, Stats)
  switchView(viewName) {
    this.currentView = viewName;
    
    // Update Nav buttons state
    this.elements.navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });

    // Hide all view sections, show target view
    const views = [
      { name: 'browse', el: this.elements.viewBrowse },
      { name: 'flashcards', el: this.elements.viewFlashcards },
      { name: 'bookmarks', el: this.elements.viewBookmarks },
      { name: 'stats', el: this.elements.viewStats }
    ];

    views.forEach(v => {
      if (v.name === viewName) {
        v.el.classList.add('active');
      } else {
        v.el.classList.remove('active');
      }
    });

    // Trigger view-specific re-renders
    if (viewName === 'flashcards') {
      this.initFlashcards();
    } else if (viewName === 'bookmarks') {
      this.renderBookmarks();
    } else if (viewName === 'stats') {
      this.updateStats();
    }
  }



  // Render Category Cards Grid
  renderCategoryGrid() {
    const categories = this.dataLoader.getCategories();
    let html = `
      <div class="category-card ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat-id="all">
        <div class="category-icon" style="background: rgba(6, 182, 212, 0.15)">🌟</div>
        <div>
          <div class="category-title">All Topics</div>
          <div class="category-meta">${this.dataLoader.getAllQuestions().length} Questions</div>
        </div>
      </div>
    `;

    categories.forEach(cat => {
      const isActive = this.selectedCategory === cat.id ? 'active' : '';
      html += `
        <div class="category-card ${isActive}" data-cat-id="${cat.id}" style="--card-color: ${cat.color}; --card-accent-bg: ${cat.accentBg}">
          <div class="category-icon">${cat.icon}</div>
          <div>
            <div class="category-title">${cat.title}</div>
            <div class="category-meta">${cat.questionCount} Questions</div>
          </div>
        </div>
      `;
    });

    this.elements.categoryGrid.innerHTML = html;

    this.elements.categoryGrid.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedCategory = card.dataset.catId;
        this.renderCategoryGrid();
        this.renderQuestions();
      });
    });
  }

  // Render Horizontal Filter Chips (Difficulty)
  renderFilterChips() {
    const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
    const html = difficulties.map(diff => `
      <button class="chip-btn ${this.selectedDifficulty === diff ? 'active' : ''}" data-diff="${diff}">
        ${diff === 'all' ? '🌟 All Levels' : (diff === 'beginner' ? '🟢 Beginner' : diff === 'intermediate' ? '🟡 Intermediate' : '🔴 Advanced')}
      </button>
    `).join('');

    this.elements.chipContainer.innerHTML = html;

    this.elements.chipContainer.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedDifficulty = btn.dataset.diff;
        this.renderFilterChips();
        this.renderQuestions();
      });
    });
  }

  // Render Filtered Question Accordion Cards
  renderQuestions() {
    const questions = this.dataLoader.filterQuestions({
      categoryId: this.selectedCategory,
      difficulty: this.selectedDifficulty,
      searchQuery: this.searchQuery
    });

    if (questions.length === 0) {
      this.elements.questionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text-primary);">No interview questions found</h3>
          <p style="font-size: 13px; margin-top: 6px; color: var(--text-muted);">Try refining your search keyword or selected filter tags.</p>
        </div>
      `;
      return;
    }

    this.elements.questionsList.innerHTML = questions.map(q => this.buildQuestionCardHTML(q)).join('');
    this.attachCardEventListeners(this.elements.questionsList);
  }

  // Render Starred Bookmarks View
  renderBookmarks() {
    const starredIds = StorageManager.getStarred();
    const questions = this.dataLoader.getAllQuestions().filter(q => starredIds.includes(q.id));

    if (questions.length === 0) {
      this.elements.bookmarksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <h3 style="font-family: var(--font-heading); font-size: 18px; font-weight: 700; color: var(--text-primary);">No Saved Questions Yet</h3>
          <p style="font-size: 13px; margin-top: 6px; color: var(--text-muted);">Tap the star icon (★) on any question card while browsing to bookmark it here for fast interview revision.</p>
        </div>
      `;
      return;
    }

    this.elements.bookmarksList.innerHTML = questions.map(q => this.buildQuestionCardHTML(q)).join('');
    this.attachCardEventListeners(this.elements.bookmarksList);
  }

  // Single Question Card Template Builder
  buildQuestionCardHTML(q) {
    const isStarred = StorageManager.isStarred(q.id);
    const isMastered = StorageManager.isMastered(q.id);
    const diffClass = `badge-${q.difficulty.toLowerCase()}`;

    const codeHTML = q.codeSnippet ? `
      <div class="code-box">
        <div class="code-header">
          <div class="window-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <span>CODE SNIPPET</span>
          <button class="copy-btn" data-code="${encodeURIComponent(q.codeSnippet)}">
            📋 Copy Code
          </button>
        </div>
        <pre class="code-content"><code>${this.escapeHTML(q.codeSnippet)}</code></pre>
      </div>
    ` : '';

    const takeawaysHTML = (q.keyTakeaways && q.keyTakeaways.length > 0) ? `
      <div class="takeaways-box">
        <div class="takeaways-title">💡 Key Takeaways</div>
        <ul class="takeaways-list">
          ${q.keyTakeaways.map(t => `<li>${this.escapeHTML(t)}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <div class="q-card" id="card-${q.id}">
        <div class="q-card-header" data-id="${q.id}">
          <div class="q-card-header-main">
            <div class="q-badges">
              <span class="badge ${diffClass}">${q.difficulty}</span>
              <span class="badge badge-topic">${q.topic}</span>
            </div>
            <div class="q-title">${this.escapeHTML(q.question)}</div>
          </div>
          <div class="q-header-actions">
            <button class="star-btn ${isStarred ? 'starred' : ''}" data-id="${q.id}" title="Bookmark Question">
              ★
            </button>
            <span class="expand-icon">▼</span>
          </div>
        </div>
        
        <div class="q-card-body">
          <div class="answer-section">
            <div class="answer-label">🎯 Explanation & Concept</div>
            <div class="answer-text">${this.escapeHTML(q.answer)}</div>
            ${q.explanation ? `<div class="answer-text" style="color: var(--text-muted); font-size: 13px;">${this.escapeHTML(q.explanation)}</div>` : ''}
            
            ${codeHTML}
            ${takeawaysHTML}

            <div class="card-actions-bar">
              <button class="master-toggle-btn ${isMastered ? 'mastered' : ''}" data-id="${q.id}">
                ${isMastered ? '✅ Mastered' : '⭕ Mark as Mastered'}
              </button>
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">
                🏷️ ${(q.tags || []).join(' • ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Card Event Listeners (Accordion, Starring, Mastering, Copying Code)
  attachCardEventListeners(container) {
    container.querySelectorAll('.q-card-header').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.star-btn')) return;
        const card = header.closest('.q-card');
        card.classList.toggle('open');
      });
    });

    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isStarred = StorageManager.toggleStar(id);
        btn.classList.toggle('starred', isStarred);
        this.updateStats();
        if (this.currentView === 'bookmarks') {
          this.renderBookmarks();
        }
      });
    });

    container.querySelectorAll('.master-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isMastered = StorageManager.toggleMastered(id);
        btn.classList.toggle('mastered', isMastered);
        btn.innerHTML = isMastered ? '✅ Mastered' : '⭕ Mark as Mastered';
        this.updateStats();
      });
    });

    container.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = decodeURIComponent(btn.dataset.code);
        navigator.clipboard.writeText(code).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          setTimeout(() => btn.innerHTML = originalText, 2000);
        });
      });
    });
  }

  // ==========================================
  // FLASHCARD STAGE CONTROLLER
  // ==========================================
  initFlashcards() {
    this.flashcardList = this.dataLoader.filterQuestions({
      categoryId: this.selectedCategory,
      difficulty: this.selectedDifficulty
    });

    if (this.flashcardList.length === 0) {
      this.flashcardList = this.dataLoader.getAllQuestions();
    }

    this.currentFlashcardIndex = 0;
    this.isCardFlipped = false;
    this.renderCurrentFlashcard();
  }

  renderCurrentFlashcard() {
    if (this.flashcardList.length === 0) return;
    const q = this.flashcardList[this.currentFlashcardIndex];

    this.isCardFlipped = false;
    this.elements.flashcardInner.classList.remove('flipped');

    this.elements.fcCategoryBadge.textContent = q.topic;
    this.elements.fcDifficultyBadge.textContent = q.difficulty;
    this.elements.fcDifficultyBadge.className = `badge badge-${q.difficulty.toLowerCase()}`;
    
    this.elements.fcQuestionText.textContent = q.question;
    this.elements.fcAnswerText.textContent = q.answer;

    if (q.codeSnippet) {
      this.elements.fcCodeBox.style.display = 'block';
      this.elements.fcCodeContent.textContent = q.codeSnippet;
    } else {
      this.elements.fcCodeBox.style.display = 'none';
    }

    if (this.elements.fcProgressPill) {
      this.elements.fcProgressPill.textContent = `Card ${this.currentFlashcardIndex + 1} of ${this.flashcardList.length}`;
    }
  }

  flipFlashcard() {
    this.isCardFlipped = !this.isCardFlipped;
    this.elements.flashcardInner.classList.toggle('flipped', this.isCardFlipped);
  }

  nextFlashcard() {
    if (this.currentFlashcardIndex < this.flashcardList.length - 1) {
      this.currentFlashcardIndex++;
    } else {
      this.currentFlashcardIndex = 0;
    }
    this.renderCurrentFlashcard();
  }

  prevFlashcard() {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
    } else {
      this.currentFlashcardIndex = this.flashcardList.length - 1;
    }
    this.renderCurrentFlashcard();
  }

  // ==========================================
  // ANALYTICS & STATS DASHBOARD
  // ==========================================
  updateStats() {
    const allQuestions = this.dataLoader.getAllQuestions();
    const totalCount = allQuestions.length;
    const masteredIds = StorageManager.getMastered();
    const starredIds = StorageManager.getStarred();

    const masteredCount = masteredIds.length;
    const starredCount = starredIds.length;
    const percent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

    this.elements.statTotalQuestions.textContent = totalCount;
    this.elements.statMasteredCount.textContent = masteredCount;
    this.elements.statStarredCount.textContent = starredCount;
    this.elements.statProgressPercent.textContent = `${percent}%`;
    this.elements.statProgressBar.style.width = `${percent}%`;
    
    if (this.elements.statProgressBadge) {
      this.elements.statProgressBadge.textContent = `${percent}% Complete`;
    }

    if (this.elements.headerMasteredText) {
      this.elements.headerMasteredText.textContent = `${masteredCount}/${totalCount}`;
    }

    if (this.elements.navBookmarkBadge) {
      if (starredCount > 0) {
        this.elements.navBookmarkBadge.textContent = starredCount;
        this.elements.navBookmarkBadge.style.display = 'inline-block';
      } else {
        this.elements.navBookmarkBadge.style.display = 'none';
      }
    }

    // Category Breakdown
    const categories = this.dataLoader.getCategories();
    let breakdownHTML = '';

    categories.forEach(cat => {
      const catQuestions = this.dataLoader.getQuestionsByCategory(cat.id);
      const catTotal = catQuestions.length;
      const catMastered = catQuestions.filter(q => masteredIds.includes(q.id)).length;
      const catPercent = catTotal > 0 ? Math.round((catMastered / catTotal) * 100) : 0;

      breakdownHTML += `
        <div style="background: var(--bg-card); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 6px;">
            <span>${cat.icon} ${cat.title}</span>
            <span style="color: var(--accent-cyan); font-family: var(--font-code);">${catMastered}/${catTotal} (${catPercent}%)</span>
          </div>
          <div class="progress-track" style="height: 7px; margin-top: 6px;">
            <div class="progress-fill" style="width: ${catPercent}%; background: ${cat.color};"></div>
          </div>
        </div>
      `;
    });

    this.elements.statsCategoryBreakdown.innerHTML = breakdownHTML;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
