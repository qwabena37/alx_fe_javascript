/* script.js
   Dynamic Quote Generator
   - localStorage persistence (quotes)
   - sessionStorage (last viewed quote)
   - JSON export/import (with validation and dedupe)
   - Add quote form dynamically updates state + storage
*/

(function () {
  'use strict';

  /*** CONFIG KEYS ***/
  const LS_KEY = 'dqg_quotes_v1';       // localStorage key for persisted quotes
  const SESSION_LAST_KEY = 'dqg_last';  // sessionStorage key for last viewed quote (object)

  /*** DEFAULT QUOTES (used if nothing in localStorage) ***/
  const DEFAULT_QUOTES = [
    { text: "The best way to predict the future is to create it.", category: "Inspiration" },
    { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
    { text: "A day without laughter is a day wasted.", category: "Humor" }
  ];

  /*** STATE ***/
  let quotes = []; // will load from localStorage or DEFAULT_QUOTES

  /*** UI ELEMENTS ***/
  const quoteDisplay = document.getElementById('quoteDisplay');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const randomAllBtn = document.getElementById('randomAllBtn');
  const addQuoteBtn = document.getElementById('addQuoteBtn');
  const newQuoteText = document.getElementById('newQuoteText');
  const newQuoteCategory = document.getElementById('newQuoteCategory');
  const importFile = document.getElementById('importFile');
  const exportBtn = document.getElementById('exportBtn');
  const messageEl = document.getElementById('message');
  const clearStorageBtn = document.getElementById('clearStorageBtn');

  /*** UTILITIES ***/
  function flashMessage(msg, isError = false, timeout = 3000) {
    messageEl.textContent = msg;
    messageEl.className = isError ? 'message error' : 'message';
    if (timeout > 0) {
      setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
      }, timeout);
    }
  }

  function isValidQuoteObject(obj) {
    return obj &&
      typeof obj === 'object' &&
      typeof obj.text === 'string' &&
      obj.text.trim().length > 0 &&
      typeof obj.category === 'string' &&
      obj.category.trim().length > 0;
  }

  function normalizeKey(q) {
    // normalizes for dedupe: lower-case trimmed text|category
    return (q.text.trim().toLowerCase() + '|' + q.category.trim().toLowerCase());
  }

  /*** STORAGE: localStorage (persistent) ***/
  function loadQuotesFromLocalStorage() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        quotes = DEFAULT_QUOTES.slice();
        saveQuotesToLocalStorage();
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Saved data was not an array');
      // Validate each item; filter out invalid ones
      quotes = parsed.filter(isValidQuoteObject);
      if (quotes.length === 0) {
        quotes = DEFAULT_QUOTES.slice();
        saveQuotesToLocalStorage();
      }
    } catch (err) {
      console.warn('Failed to load quotes from localStorage:', err);
      quotes = DEFAULT_QUOTES.slice();
      saveQuotesToLocalStorage();
    }
  }

  function saveQuotesToLocalStorage() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(quotes));
    } catch (err) {
      console.error('Failed to save quotes to localStorage:', err);
      flashMessage('Could not save quotes (storage limit?).', true);
    }
  }

  /*** STORAGE: sessionStorage (last viewed) ***/
  function saveLastViewedToSession(quoteObj) {
    try {
      sessionStorage.setItem(SESSION_LAST_KEY, JSON.stringify(quoteObj));
    } catch (err) {
      // sessionStorage typically won't fail, but catch anyway
      console.warn('sessionStorage error:', err);
    }
  }

  function loadLastViewedFromSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_LAST_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isValidQuoteObject(parsed) ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  /*** RENDERING ***/
  function clearQuoteDisplay() {
    quoteDisplay.innerHTML = '';
  }

  function renderQuote(quote) {
    clearQuoteDisplay();
    if (!quote) {
      quoteDisplay.textContent = 'No quote available.';
      return;
    }
    const frag = document.createDocumentFragment();

    const block = document.createElement('div');
    block.className = 'quote-text';
    block.textContent = `"${quote.text}"`;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Category: ${quote.category}`;

    frag.appendChild(block);
    frag.appendChild(meta);
    quoteDisplay.appendChild(frag);

    // Save last viewed to session storage
    saveLastViewedToSession(quote);
  }

  function pickRandomIndex() {
    if (!quotes.length) return -1;
    return Math.floor(Math.random() * quotes.length);
  }

  function showRandomQuote() {
    if (!quotes.length) {
      renderQuote(null);
      flashMessage('No quotes available. Add some!', true);
      return;
    }
    const idx = pickRandomIndex();
    const q = quotes[idx];
    renderQuote(q);
  }

  function showRandomFromAll() {
    // same as showRandomQuote here, kept for API parity
    showRandomQuote();
  }

  /*** ADD QUOTE (Step 3 integration) ***/
  function addQuoteFromInputs() {
    const text = (newQuoteText.value || '').trim();
    const category = (newQuoteCategory.value || '').trim();

    if (!text || !category) {
      flashMessage('Please fill both quote text and category.', true);
      return;
    }

    const newQ = { text, category };

    // Deduplicate: do not add exact duplicate
    const existingKeys = new Set(quotes.map(normalizeKey));
    const key = normalizeKey(newQ);
    if (existingKeys.has(key)) {
      flashMessage('This quote already exists.', true);
      newQuoteText.value = '';
      newQuoteCategory.value = '';
      return;
    }

    quotes.push(newQ);
    saveQuotesToLocalStorage();

    // Immediately show the newly added quote
    renderQuote(newQ);

    newQuoteText.value = '';
    newQuoteCategory.value = '';
    flashMessage('Quote added and saved!');
  }

  /*** JSON EXPORT ***/
  function exportQuotesToJson() {
    try {
      const jsonStr = JSON.stringify(quotes, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes_export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after short delay to allow download to start
      setTimeout(() => URL.revokeObjectURL(url), 1500);

      flashMessage('Export started (quotes_export.json).');
    } catch (err) {
      console.error('Export error:', err);
      flashMessage('Failed to export quotes.', true);
    }
  }

  /*** JSON IMPORT ***/
  function importFromJsonFile(file, options = { askReplace: true }) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File read error'));
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          if (!Array.isArray(parsed)) {
            reject(new Error('Imported JSON must be an array of quotes.'));
            return;
          }
          // Validate & filter imported quotes
          const valid = parsed.filter(isValidQuoteObject).map(q => ({ text: q.text.trim(), category: q.category.trim() }));
          if (!valid.length) {
            reject(new Error('No valid quotes found in the imported file.'));
            return;
          }

          // Ask user whether to replace or append (if enabled)
          const replace = options.askReplace && confirm('Replace existing quotes with the imported ones? Click OK to replace, Cancel to append.');
          if (replace) {
            quotes = valid;
            saveQuotesToLocalStorage();
            flashMessage(`Imported ${valid.length} quotes (replaced existing).`);
            resolve({ imported: valid.length, replaced: true });
            return;
          }

          // Append with dedupe
          const existingKeys = new Set(quotes.map(normalizeKey));
          let appended = 0;
          for (const q of valid) {
            const key = normalizeKey(q);
            if (!existingKeys.has(key)) {
              quotes.push(q);
              existingKeys.add(key);
              appended++;
            }
          }
          saveQuotesToLocalStorage();
          flashMessage(`Imported ${valid.length} quotes. ${appended} new quotes appended.`);
          resolve({ imported: valid.length, appended });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  /*** CLEAR STORAGE (for dev/testing) ***/
  function clearStoredQuotes() {
    if (!confirm('Clear stored quotes from localStorage? This will revert to defaults.')) return;
    try {
      localStorage.removeItem(LS_KEY);
      loadQuotesFromLocalStorage(); // reload defaults
      showRandomQuote();
      flashMessage('Local quotes cleared. Defaults restored.');
    } catch (err) {
      console.error('Clear storage error:', err);
      flashMessage('Failed to clear storage.', true);
    }
  }

  /*** BOOTSTRAP & EVENT LISTENERS ***/
  function attachListeners() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    randomAllBtn.addEventListener('click', showRandomFromAll);
    addQuoteBtn.addEventListener('click', addQuoteFromInputs);
    exportBtn.addEventListener('click', exportQuotesToJson);
    importFile.addEventListener('change', (ev) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      importFromJsonFile(file).then(result => {
        // optionally show first imported or last appended
        showRandomQuote();
      }).catch(err => {
        console.error('Import error:', err);
        flashMessage('Import failed: ' + err.message, true);
      }).finally(() => {
        // clear input value so same file can be re-selected later
        importFile.value = '';
      });
    });
    clearStorageBtn.addEventListener('click', clearStoredQuotes);

    // Optional: keyboard Enter on inputs adds
    [newQuoteText, newQuoteCategory].forEach(inp => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          addQuoteFromInputs();
        }
      });
    });
  }

  /*** STARTUP ***/
  function startApp() {
    loadQuotesFromLocalStorage();

    // If user had a last viewed in this session, show it; otherwise show random
    const last = loadLastViewedFromSession();
    if (last && isValidQuoteObject(last)) {
      // Prefer to display the exact object if it still exists in current quotes
      const match = quotes.find(q => normalizeKey(q) === normalizeKey(last));
      renderQuote(match || last);
    } else {
      showRandomQuote();
    }
    attachListeners();
  }

  // Run
  startApp();

  // Expose some internals for debugging in console if needed
  window.__DQG = {
    quotes,
    loadQuotesFromLocalStorage,
    saveQuotesToLocalStorage,
    importFromJsonFile,
    exportQuotesToJson,
    addQuoteFromInputs
  };

})();
