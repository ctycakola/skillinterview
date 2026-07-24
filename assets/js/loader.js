// Helper to fetch and render questions
class DataLoader {
  static async loadCategory(categoryFile) {
    try {
      const response = await fetch(`data/${categoryFile}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${categoryFile}:`, error);
      return [];
    }
  }

  static renderQuestion(question) {
    const isBookmarked = BookmarkManager.isBookmarked(question.id, question.category);
    const bookmarkBtnClass = isBookmarked ? 'btn-action bookmarked' : 'btn-action';
    const bookmarkIconClass = isBookmarked ? 'bi-bookmark-fill' : 'bi-bookmark';
    const bookmarkText = isBookmarked ? 'Saved' : 'Save';

    const diffBadge = `badge-${question.difficulty.toLowerCase()}`;
    
    let codeHtml = '';
    if (question.code) {
      codeHtml = `<div class="code-block"><pre><code>${this.escapeHtml(question.code)}</code></pre></div>`;
    }
    
    let outputHtml = '';
    if (question.output) {
      outputHtml = `<div class="output-block"><strong>Output:</strong><br><pre>${this.escapeHtml(question.output)}</pre></div>`;
    }

    let tipsHtml = '';
    if (question.tips && question.tips.length > 0) {
      tipsHtml = `<strong>Tips:</strong><ul>${question.tips.map(t => `<li>${this.escapeHtml(t)}</li>`).join('')}</ul>`;
    }

    let mistakesHtml = '';
    if (question.mistakes && question.mistakes.length > 0) {
      mistakesHtml = `<strong>Common Mistakes:</strong><ul>${question.mistakes.map(m => `<li>${this.escapeHtml(m)}</li>`).join('')}</ul>`;
    }

    const encodedQuestion = encodeURIComponent(JSON.stringify(question));

    return `
      <div class="question-card animate-slide-up" data-difficulty="${question.difficulty.toLowerCase()}">
        <div class="question-header" onclick="DataLoader.toggleAccordion(this)">
          <h3 class="question-title">${this.escapeHtml(question.question)}</h3>
          <div class="question-meta">
            <span class="badge-difficulty ${diffBadge}">${question.difficulty}</span>
            <span class="badge bg-secondary text-white rounded-pill px-2 py-1 ms-2" style="font-size:0.75rem">${question.topic}</span>
            <i class="bi bi-chevron-down ms-3 transition-transform"></i>
          </div>
        </div>
        <div class="question-body">
          <p>${this.escapeHtml(question.answer)}</p>
          ${codeHtml}
          ${outputHtml}
          <div class="row mt-3">
            <div class="col-md-6 text-success">${tipsHtml}</div>
            <div class="col-md-6 text-danger">${mistakesHtml}</div>
          </div>
          <div class="action-buttons">
            <button class="${bookmarkBtnClass}" onclick="DataLoader.handleBookmark(this, '${encodedQuestion}')">
              <i class="bi ${bookmarkIconClass}"></i> ${bookmarkText}
            </button>
            <button class="btn-action" onclick="DataLoader.copyToClipboard('${this.escapeHtml(question.answer.replace(/'/g, "\\'"))}')">
              <i class="bi bi-clipboard"></i> Copy
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static toggleAccordion(headerElement) {
    const body = headerElement.nextElementSibling;
    const icon = headerElement.querySelector('.bi-chevron-down, .bi-chevron-up');
    
    const isShowing = body.classList.contains('show');
    
    // Close all others
    document.querySelectorAll('.question-body.show').forEach(el => {
      if(el !== body) {
        el.classList.remove('show');
        const siblingIcon = el.previousElementSibling.querySelector('.bi-chevron-up');
        if(siblingIcon) {
          siblingIcon.classList.replace('bi-chevron-up', 'bi-chevron-down');
        }
      }
    });

    if (isShowing) {
      body.classList.remove('show');
      if(icon) icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
    } else {
      body.classList.add('show');
      if(icon) icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
    }
  }

  static handleBookmark(btnElement, encodedQuestion) {
    const question = JSON.parse(decodeURIComponent(encodedQuestion));
    BookmarkManager.toggleBookmark(question, btnElement);
  }

  static copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('Answer copied to clipboard!');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  static escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
}

window.DataLoader = DataLoader;
