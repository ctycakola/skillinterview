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

    // Wire Search Input with Debounce
    const searchInput = document.getElementById('search-input');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        uiController.searchQuery = e.target.value;
        uiController.renderQuestions();
      }, 200);
    });

    // Wire Device Mode Switcher (Mobile, Tablet, Desktop)
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        uiController.setDeviceMode(mode);
      });
    });

    // Wire Flashcard Controls
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

    console.log('⚡ SkillInterview Responsive App initialized successfully.');
  } catch (error) {
    console.error('Failed to boot SkillInterview app:', error);
  }
});
