/**
 * Main Application Script for SkillInterview
 */

import { DataLoader } from './dataLoader.js';
import { UIController } from './uiController.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const dataLoader = new DataLoader();
    await dataLoader.init();

    const uiController = new UIController(dataLoader);
    uiController.init();

    // Wire Navigation Items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        uiController.switchView(view);
      });
    });

    // Wire Search Input with Debounce & Clear Button
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    let debounceTimer;

    const updateSearch = (query) => {
      uiController.searchQuery = query;
      if (searchClearBtn) {
        searchClearBtn.style.display = query.length > 0 ? 'block' : 'none';
      }
      uiController.renderQuestions();
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          updateSearch(e.target.value);
        }, 180);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        updateSearch('');
      });
    }

    // Wire Device Mode Switcher (Mobile, Tablet, Desktop)
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        uiController.setDeviceMode(mode);
      });
    });

    // Wire Flashcard Stage Controls
    const flashcardInner = document.getElementById('flashcard-inner');
    const fcFlipBtn = document.getElementById('fc-flip-btn');
    const fcPrevBtn = document.getElementById('fc-prev-btn');
    const fcNextBtn = document.getElementById('fc-next-btn');

    if (flashcardInner) {
      flashcardInner.addEventListener('click', () => {
        uiController.flipFlashcard();
      });
    }

    if (fcFlipBtn) {
      fcFlipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uiController.flipFlashcard();
      });
    }

    if (fcPrevBtn) {
      fcPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uiController.prevFlashcard();
      });
    }

    if (fcNextBtn) {
      fcNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uiController.nextFlashcard();
      });
    }

    // Keyboard Shortcuts Listener
    document.addEventListener('keydown', (e) => {
      // Focus Search Bar: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }

      // Escape key clears search
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        updateSearch('');
      }

      // Flashcards Keyboard Shortcuts (when flashcards view is active)
      if (uiController.currentView === 'flashcards') {
        if (e.code === 'Space') {
          e.preventDefault();
          uiController.flipFlashcard();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          uiController.prevFlashcard();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          uiController.nextFlashcard();
        }
      }
    });

    console.log('⚡ SkillInterview Cyber Dark Slate App booted successfully.');
  } catch (error) {
    console.error('Failed to boot SkillInterview app:', error);
  }
});
