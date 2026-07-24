import { loader } from './loader.js';
import { progressStore } from './bookmarks.js';
import { applySavedTheme, toggleDarkMode } from './darkmode.js';
import { debounce, filterDifficulty, searchQuestions } from './search.js';

const page = document.body.dataset.page;
const icons = { python:'code-slash', aws:'cloud', rag:'diagram-3', sql:'database', docker:'box', linux:'terminal', systemdesign:'bezier2', ml:'cpu', genai:'stars', datastructures:'boxes', algorithms:'shuffle', llm:'chat-square-text', vectordb:'hdd-stack', promptengineering:'braces-asterisk' };
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));

function renderShell() {
  document.querySelector('#site-header').className = 'site-header';
  document.querySelector('#site-header').innerHTML = `
    <div class="navbar-inner">
      <button id="menu-toggle" class="menu-btn" type="button" aria-label="Open category menu" aria-expanded="false"><i class="bi bi-list"></i></button>
      <a class="brand" href="index.html"><span class="brand-mark"><i class="bi bi-mortarboard"></i></span><span>SkillInterview</span></a>
      <nav class="desktop-nav" aria-label="Primary">
        <a class="${page==='home'?'active':''}" href="index.html">Home</a><a class="${page==='categories'?'active':''}" href="categories.html">Categories</a><a class="${page==='practice'?'active':''}" href="practice.html">Practice</a>
      </nav>
      <div class="nav-actions">
        <form class="header-search" action="categories.html" role="search"><i class="bi bi-search"></i><label class="visually-hidden" for="global-search">Search all questions</label><input id="global-search" name="search" type="search" placeholder="Search questions…"></form>
        <a class="icon-btn" href="bookmarks.html" aria-label="View bookmarks" title="Bookmarks"><i class="bi bi-bookmark"></i></a>
        <button id="theme-toggle" class="icon-btn" type="button" aria-label="Use dark mode"></button>
      </div>
    </div>`;
  const activeCategory = new URLSearchParams(location.search).get('category') || '';
  document.querySelector('#sidebar').innerHTML = `
    <span class="sidebar-label">Categories</span>
    <nav class="sidebar-list">${loader.categories.map(category => `<a class="sidebar-link ${activeCategory===category.id?'active':''}" href="categories.html?category=${category.id}"><i class="bi bi-${icons[category.id] || 'folder'}"></i><span>${escapeHtml(category.name)}</span></a>`).join('')}</nav>
    <div class="sidebar-progress"><p>Your progress</p><strong><span id="sidebar-completed">0</span> questions completed</strong><div class="progress"><div id="sidebar-progress-bar" class="progress-bar"></div></div></div>`;
  applySavedTheme();
  document.querySelector('#theme-toggle').addEventListener('click', toggleDarkMode);
  const menu = document.querySelector('#menu-toggle');
  const sidebar = document.querySelector('#sidebar');
  const backdrop = document.querySelector('#mobile-backdrop');
  const setMenu = open => {
    sidebar.classList.toggle('open', open); backdrop.hidden = !open; menu.setAttribute('aria-expanded', String(open));
    menu.innerHTML = `<i class="bi bi-${open?'x-lg':'list'}"></i>`;
  };
  menu.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  backdrop.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  updateProgress();
}

function updateProgress() {
  const completed = progressStore.completed().size;
  const percent = loader.questions.length ? Math.round(completed / loader.questions.length * 100) : 0;
  document.querySelector('#sidebar-completed').textContent = completed;
  document.querySelector('#sidebar-progress-bar').style.width = `${percent}%`;
}

function categoryCard(category, index) {
  return `<a class="category-card" style="animation-delay:${index * 35}ms" href="categories.html?category=${category.id}">
    <span class="category-symbol"><i class="bi bi-${icons[category.id] || 'folder'}"></i></span><span class="count">${category.count} Qs</span>
    <h3>${escapeHtml(category.name)}</h3><p>${escapeHtml(category.shortDescription)}</p></a>`;
}

function difficultyBadge(level) { return `<span class="badge-pill badge-${level.toLowerCase()}">${escapeHtml(level)}</span>`; }
function list(items) { return items?.length ? `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>No additional notes.</p>'; }

function answerMarkup(question) {
  return `<h3><i class="bi bi-lightbulb"></i> Answer</h3><p>${escapeHtml(question.answer)}</p>
    ${question.code ? `<div class="code-wrap"><div class="code-head"><span>Example code</span><button class="copy-code" type="button" data-copy="${escapeHtml(question.code)}"><i class="bi bi-copy"></i> Copy</button></div><pre><code>${escapeHtml(question.code)}</code></pre></div>` : ''}
    ${question.output ? `<h3><i class="bi bi-terminal"></i> Output</h3><div class="output-box">${escapeHtml(question.output)}</div>` : ''}
    ${question.notes ? `<h3><i class="bi bi-journal-text"></i> Notes</h3><p>${escapeHtml(question.notes)}</p>` : ''}
    <div class="detail-grid"><div class="detail-card tip"><h3><i class="bi bi-check-circle"></i> Interview tips</h3>${list(question.tips)}</div><div class="detail-card warning"><h3><i class="bi bi-exclamation-triangle"></i> Common mistakes</h3>${list(question.mistakes)}</div></div>
    <h3><i class="bi bi-link-45deg"></i> Related questions</h3>${list(question.related)}`;
}

function renderAccordion(question, index = 0) {
  const bookmarked = progressStore.bookmarks().has(question.uid);
  const completed = progressStore.completed().has(question.uid);
  return `<article class="question-card" data-uid="${question.uid}" style="animation-delay:${Math.min(index,8)*35}ms">
    <div class="question-summary">
      <span><span class="question-meta">${difficultyBadge(question.difficulty)}<span class="topic-label"><i class="bi bi-tag"></i> ${escapeHtml(question.topic)}</span><span class="time-label"><i class="bi bi-clock"></i> ${escapeHtml(question.time || '3 min')}</span></span><h2>${escapeHtml(question.question)}</h2></span>
      <span class="question-actions"><button class="icon-btn bookmark-btn" type="button" aria-label="${bookmarked?'Remove bookmark':'Bookmark question'}"><i class="bi bi-bookmark${bookmarked?'-fill':''}"></i></button><button class="icon-btn expand-btn" type="button" aria-label="Expand answer" aria-expanded="false"><i class="bi bi-chevron-down expand-icon"></i></button></span>
    </div>
    <div class="question-body"><div class="question-body-inner"><div class="answer-content">${answerMarkup(question)}
      <div class="question-footer"><button class="btn btn-light completed-btn ${completed?'completed':''}" type="button"><i class="bi bi-${completed?'check-circle-fill':'circle'}"></i> ${completed?'Completed':'Mark completed'}</button><button class="btn btn-light copy-question" type="button"><i class="bi bi-copy"></i> Copy</button><button class="btn btn-light share-question" type="button"><i class="bi bi-share"></i> Share</button></div>
    </div></div></div></article>`;
}

function wireQuestionCards(container, questionMap) {
  container.addEventListener('click', async event => {
    const card = event.target.closest('.question-card');
    if (!card) return;
    const question = questionMap.get(card.dataset.uid);
    if (event.target.closest('.bookmark-btn')) {
      event.stopPropagation(); const active = progressStore.toggleBookmark(question.uid); const button = event.target.closest('.bookmark-btn');
      button.innerHTML = `<i class="bi bi-bookmark${active?'-fill':''}"></i>`; button.setAttribute('aria-label', active?'Remove bookmark':'Bookmark question'); toast(active?'Question bookmarked':'Bookmark removed'); return;
    }
    if (event.target.closest('.completed-btn')) {
      const active = progressStore.toggleCompleted(question.uid); const button = event.target.closest('.completed-btn');
      button.classList.toggle('completed', active); button.innerHTML = `<i class="bi bi-${active?'check-circle-fill':'circle'}"></i> ${active?'Completed':'Mark completed'}`; updateProgress(); return;
    }
    if (event.target.closest('.copy-code')) { await copyText(event.target.closest('.copy-code').dataset.copy); return; }
    if (event.target.closest('.copy-question')) { await copyText(`${question.question}\n\n${question.answer}`); return; }
    if (event.target.closest('.share-question')) { await shareQuestion(question); return; }
    if (event.target.closest('.question-summary')) {
      const open = card.classList.toggle('open'); const button=card.querySelector('.expand-btn'); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open?'Collapse answer':'Expand answer');
    }
  });
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
  catch { const area=document.createElement('textarea'); area.value=text; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); toast('Copied to clipboard'); }
}

async function shareQuestion(question) {
  const data = { title: 'SkillInterview question', text: question.question, url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch {} } else await copyText(`${question.question}\n${location.href}`);
}

function toast(message) {
  const region = document.querySelector('#toast-region'); const item = document.createElement('div'); item.className='app-toast'; item.textContent=message; region.append(item); setTimeout(()=>item.remove(),2400);
}

async function initHome() {
  document.querySelector('#category-grid').innerHTML = loader.categories.slice(0,10).map(categoryCard).join('');
  const completed=progressStore.completed().size, bookmarks=progressStore.bookmarks().size, total=loader.questions.length, percent=total?Math.round(completed/total*100):0;
  document.querySelector('#home-total').textContent=total; document.querySelector('#home-completed').textContent=completed; document.querySelector('#home-bookmarks').textContent=bookmarks;
  document.querySelector('#home-progress').textContent=`${percent}%`; document.querySelector('#home-progress-bar').style.width=`${percent}%`;
  const last=loader.getCategory(progressStore.getLastCategory()); document.querySelector('#continue-category').textContent=last?`${last.name} interview questions`:'Python fundamentals';
}

async function initCategories() {
  const params=new URLSearchParams(location.search), categoryId=params.get('category')||progressStore.getLastCategory(), category=loader.getCategory(categoryId)||loader.categories[0];
  progressStore.setLastCategory(category.id); let base=await loader.loadCategory(category.id), difficulty='All', query=params.get('search')||'';
  document.title=`${category.name} Interview Questions — SkillInterview`; document.querySelector('#category-title').textContent=`${category.name} Interview Questions`; document.querySelector('#category-description').textContent=category.description;
  const input=document.querySelector('#question-search'); input.value=query; const container=document.querySelector('#questions-list'); const map=new Map(base.map(item=>[item.uid,item]));
  const render=()=>{ const items=filterDifficulty(searchQuestions(base,query),difficulty); document.querySelector('#visible-count').textContent=items.length; document.querySelector('#question-state').hidden=true; container.innerHTML=items.length?items.map(renderAccordion).join(''):`<div class="empty-state"><i class="bi bi-search"></i><h2>No matching questions</h2><p>Try another keyword or difficulty level.</p></div>`; };
  wireQuestionCards(container,map); input.addEventListener('input',debounce(event=>{query=event.target.value;render()}));
  const diffFilters=document.querySelector('#difficulty-filters');if(diffFilters)diffFilters.addEventListener('click',event=>{const button=event.target.closest('.filter-btn');if(!button)return;difficulty=button.dataset.difficulty;document.querySelectorAll('.filter-btn').forEach(item=>item.classList.toggle('active',item===button));render()});
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();input.focus()}}); render();
}

async function initBookmarks() {
  const saved=progressStore.bookmarks(), items=loader.questions.filter(item=>saved.has(item.uid)), container=document.querySelector('#questions-list'), map=new Map(items.map(item=>[item.uid,item]));
  document.querySelector('#visible-count').textContent=items.length; container.innerHTML=items.length?items.map(renderAccordion).join(''):`<div class="empty-state"><i class="bi bi-bookmark"></i><h2>No bookmarks yet</h2><p>Save useful questions while browsing and they will appear here.</p><a class="btn btn-primary" href="categories.html">Browse questions</a></div>`; wireQuestionCards(container,map);
}

async function initPractice() {
  let deck=[...loader.questions].sort(()=>Math.random()-.5), index=0, revealed=false;
  const render=()=>{const q=deck[index];revealed=false;document.querySelector('#practice-position').textContent=`${index+1} / ${deck.length}`;document.querySelector('#practice-badges').innerHTML=`${difficultyBadge(q.difficulty)} <span class="topic-label">${escapeHtml(q.category)} · ${escapeHtml(q.topic)}</span>`;document.querySelector('#practice-question').textContent=q.question;const answer=document.querySelector('#practice-answer');answer.hidden=true;answer.innerHTML=answerMarkup(q);document.querySelector('#reveal-answer').hidden=false;const active=progressStore.bookmarks().has(q.uid);document.querySelector('#practice-bookmark').innerHTML=`<i class="bi bi-bookmark${active?'-fill':''}"></i>`};
  const reveal=()=>{revealed=true;document.querySelector('#practice-answer').hidden=false;document.querySelector('#reveal-answer').hidden=true};
  document.querySelector('#reveal-answer').addEventListener('click',reveal);document.querySelector('#next-question').addEventListener('click',()=>{index=(index+1)%deck.length;render()});document.querySelector('#previous-question').addEventListener('click',()=>{index=(index-1+deck.length)%deck.length;render()});document.querySelector('#shuffle-questions').addEventListener('click',()=>{deck.sort(()=>Math.random()-.5);index=0;render();toast('Practice questions shuffled')});document.querySelector('#practice-bookmark').addEventListener('click',()=>{progressStore.toggleBookmark(deck[index].uid);render()});
  document.addEventListener('keydown',event=>{if(['INPUT','TEXTAREA'].includes(event.target.tagName))return;if(event.code==='Space'){event.preventDefault();reveal()}if(event.key==='ArrowRight'){index=(index+1)%deck.length;render()}if(event.key==='ArrowLeft'){index=(index-1+deck.length)%deck.length;render()}});
  document.querySelector('#practice-answer').addEventListener('click',event=>{if(event.target.closest('.copy-code'))copyText(event.target.closest('.copy-code').dataset.copy)});render();
}

function addRipples() {
  document.addEventListener('click',event=>{const button=event.target.closest('.btn-primary');if(!button)return;button.style.position='relative';button.style.overflow='hidden';const ripple=document.createElement('span'),rect=button.getBoundingClientRect(),size=Math.max(rect.width,rect.height);ripple.className='ripple';ripple.style.cssText=`width:${size}px;height:${size}px;left:${event.clientX-rect.left-size/2}px;top:${event.clientY-rect.top-size/2}px`;button.append(ripple);setTimeout(()=>ripple.remove(),600)});
}

try {
  await loader.loadQuestions(); renderShell(); addRipples();
  if(page==='home')await initHome(); if(page==='categories')await initCategories(); if(page==='bookmarks')await initBookmarks(); if(page==='practice')await initPractice();
} catch(error) {
  console.error(error); const main=document.querySelector('#main-content'); if(main)main.innerHTML=`<div class="empty-state"><i class="bi bi-exclamation-circle"></i><h1>Questions could not be loaded</h1><p>Run SkillInterview through a local web server, then refresh this page.</p></div>`;
}
