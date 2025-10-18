/* script.js
   Dynamic Quote Generator - vanilla JS
   Features:
    - categories & quotes stored in localStorage
    - createElement + template usage + document fragments
    - MutationObserver to animate/observe changes
    - validation, event delegation, accessibility
*/

(function () {
  'use strict';

  const LS_KEY = 'dqg_state_v1';

  // UI elements
  const categorySelect = document.getElementById('categorySelect');
  const newQuoteBtn = document.getElementById('newQuote');
  const randomAllBtn = document.getElementById('randomAll');
  const copyBtn = document.getElementById('copyQuote');
  const quoteDisplay = document.getElementById('quoteDisplay');
  const messageEl = document.getElementById('message');

  const addCategoryForm = document.getElementById('addCategoryForm');
  const newCategoryNameInput = document.getElementById('newCategoryName');

  const addQuoteForm = document.getElementById('addQuoteForm');
  const quoteTextInput = document.getElementById('quoteText');
  const quoteAuthorInput = document.getElementById('quoteAuthor');
  const quoteCategorySelect = document.getElementById('quoteCategorySelect');

  const quoteTemplate = document.getElementById('quote-template');

  // Application state
  let state = {
    lastId: 0,
    categories: [],
    quotes: []
  };

  // --- Initialization & Storage ---
  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        state = parsed;
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Could not parse saved state:', err);
      return false;
    }
  }

  function saveState() {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }

  function seedDefaults() {
    // Only seed if there are no categories/quotes
    if (state.categories.length || state.quotes.length) return;
    state.categories = ['Inspiration', 'Humor', 'Life'];
    addQuoteInternal("The only way to do great work is to love what you do.", "Steve Jobs", "Inspiration");
    addQuoteInternal("I am so clever that sometimes I don't understand a single word of what I am saying.", "Oscar Wilde", "Humor");
    addQuoteInternal("Life is what happens when you're busy making other plans.", "John Lennon", "Life");
    saveState();
  }

  // --- Helpers / Utilities ---
  function nextId() {
    state.lastId = (state.lastId || 0) + 1;
    return state.lastId;
  }

  function normalizeName(name) {
    return (name || '').trim();
  }

  function findQuotesByCategory(category) {
    return state.quotes.filter(q => q.category === category);
  }

  function pickRandom(arr) {
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Use internal add to avoid double-saving overhead for seed
  function addQuoteInternal(text, author, category) {
    const id = nextId();
    const quote = {
      id,
      text: normalizeName(text),
      author: normalizeName(author) || 'Unknown',
      category: normalizeName(category)
    };
    state.quotes.push(quote);
    return quote;
  }

  function addCategoryInternal(name) {
    const n = normalizeName(name);
    if (!n) throw new Error('Empty category name');
    // case-insensitive uniqueness
    const exists = state.categories.some(c => c.toLowerCase() === n.toLowerCase());
    if (exists) throw new Error('Category already exists');
    state.categories.push(n);
    return n;
  }

  // --- Rendering ---
  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function renderCategoryOptions() {
    // Render options for both selects using document fragment for performance
    const frag = document.createDocumentFragment();

    // 'All' option to show random across all categories
    const allOption = document.createElement('option');
    allOption.value = '__ALL__';
    allOption.textContent = 'All Categories';
    frag.appendChild(allOption);

    state.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      frag.appendChild(opt);
    });

    // Apply to both selects
    clearChildren(categorySelect);
    clearChildren(quoteCategorySelect);

    categorySelect.appendChild(frag.cloneNode(true));
    quoteCategorySelect.appendChild(frag.cloneNode(true));
  }

  function renderQuote(quote) {
    // Use template for consistent DOM
    clearChildren(quoteDisplay);
    if (!quote) {
      const p = document.createElement('p');
      p.className = 'small';
      p.textContent = 'No quote available for this category. Add one using the form.';
      quoteDisplay.appendChild(p);
      return;
    }

    const clone = quoteTemplate.content.cloneNode(true);
    const block = clone.querySelector('.quote-text');
    const authorEl = clone.querySelector('.author');
    const catEl = clone.querySelector('.category');

    block.textContent = `"${quote.text}"`;
    authorEl.textContent = quote.author || 'Unknown';
    catEl.textContent = quote.category || 'Uncategorized';

    quoteDisplay.appendChild(clone);
  }

  // Display helper for messages
  let messageTimer = null;
  function flashMessage(msg, ms = 2500) {
    clearTimeout(messageTimer);
    messageEl.textContent = msg;
    messageTimer = setTimeout(() => messageEl.textContent = '', ms);
  }

  // --- Actions ---
  function showNewQuote() {
    const selected = categorySelect.value;
    if (selected === '__ALL__') {
      const quote = pickRandom(state.quotes);
      renderQuote(quote);
      return;
    }
    const quotes = findQuotesByCategory(selected);
    renderQuote(pickRandom(quotes));
  }

  function showRandomAll() {
    const quote = pickRandom(state.quotes);
    renderQuote(quote);
  }

  function onAddCategory(e) {
    e.preventDefault();
    const name = newCategoryNameInput.value;
    try {
      if (!name || !name.trim()) {
        flashMessage('Please enter a category name.', 2000);
        return;
      }
      addCategoryInternal(name);
      saveState();
      renderCategoryOptions();
      newCategoryNameInput.value = '';
      flashMessage(`Category "${name}" added.`);
    } catch (err) {
      flashMessage(err.message, 3000);
    }
  }

  function onAddQuote(e) {
    e.preventDefault();
    const text = quoteTextInput.value;
    const author = quoteAuthorInput.value || 'Unknown';
    const category = quoteCategorySelect.value;

    if (!text || !text.trim()) {
      flashMessage('Quote text cannot be empty.', 2000);
      return;
    }
    if (!category || category === '__ALL__') {
      flashMessage('Please select a valid category.', 2000);
      return;
    }

    const newQuote = addQuoteInternal(text, author, category);
    saveState();
    quoteTextInput.value = '';
    quoteAuthorInput.value = '';
    // Immediately display the newly added quote
    renderQuote(newQuote);
    flashMessage('Quote added successfully!');
  }

  // Copy active quote text to clipboard
  function onCopyQuote() {
    const block = quoteDisplay.querySelector('.quote-text');
    if (!block) {
      flashMessage('No quote to copy.', 1600);
      return;
    }
    const text = block.textContent || '';
    // Use Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => flashMessage('Copied to clipboard!'));
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flashMessage('Copied to clipboard!');
      } catch (err) {
        flashMessage('Copy failed.');
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  // --- MutationObserver (example of advanced DOM) ---
  const mo = new MutationObserver((mutList) => {
    for (const mut of mutList) {
      if (mut.type === 'childList' && mut.addedNodes.length) {
        // Add a simple fade-in animation by toggling class
        const node = mut.addedNodes[0];
        if (node && node.nodeType === Node.ELEMENT_NODE) {
          node.style.opacity = 0;
          node.style.transform = 'translateY(6px)';
          // trigger repaint then animate
          requestAnimationFrame(() => {
            node.style.transition = 'opacity .28s ease, transform .28s ease';
            node.style.opacity = 1;
            node.style.transform = 'translateY(0)';
          });
        }
      }
    }
  });
  mo.observe(quoteDisplay, { childList: true });

  // --- Bootstrapping ---
  function attachEventListeners() {
    newQuoteBtn.addEventListener('click', showNewQuote);
    randomAllBtn.addEventListener('click', showRandomAll);
    copyBtn.addEventListener('click', onCopyQuote);

    addCategoryForm.addEventListener('submit', onAddCategory);
    addQuoteForm.addEventListener('submit', onAddQuote);

    // When user changes selection, automatically show a quote for that category
    categorySelect.addEventListener('change', () => {
      // small delay for UX
      setTimeout(showNewQuote, 50);
    });

    // Keyboard accessibility: Enter on selects triggers a new quote
    categorySelect.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') showNewQuote();
    });
  }

  function start() {
    loadState() || seedDefaults();
    renderCategoryOptions();
    attachEventListeners();

    // Initial display: show a random quote in currently selected category
    // select first option (All Categories)
    categorySelect.selectedIndex = 0;
    showNewQuote();
  }

  // Run
  start();

  // Expose for debugging (optional)
  window.__DQG__ = {
    state,
    saveState,
    loadState,
    renderCategoryOptions,
    renderQuote
  };

})();
