/* script.js
   Dynamic Quote Generator — Category Filtering Edition
*/

const LS_QUOTES = 'dqg_quotes_v1';
const LS_CATEGORY = 'dqg_last_category';

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "A day without laughter is a day wasted.", category: "Humor" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');
const messageEl = document.getElementById('message');

/* Load quotes and category filter from localStorage */
function loadData() {
  const storedQuotes = localStorage.getItem(LS_QUOTES);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }

  const lastCategory = localStorage.getItem(LS_CATEGORY);
  populateCategories();
  if (lastCategory) {
    categoryFilter.value = lastCategory;
    filterQuotes();
  } else {
    showRandomQuote();
  }
}

/* Save quotes to localStorage */
function saveQuotes() {
  localStorage.setItem(LS_QUOTES, JSON.stringify(quotes));
}

/* ✅ Populate the category dropdown dynamically */
function populateCategories() {
  // Clear all except 'All Categories'
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))].sort();

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

/* ✅ Filter quotes based on selected category */
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(LS_CATEGORY, selected); // remember choice

  let filtered = [];
  if (selected === 'all') {
    filtered = quotes;
  } else {
    filtered = quotes.filter(q => q.category === selected);
  }

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes available for this category.';
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
    <p><em>"${randomQuote.text}"</em></p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

/* "selectedCategory" */
function showRandomQuote() {
  const selected = categoryFilter.value;
  if (selected && selected !== 'all') {
    filterQuotes();
    return;
  }
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = `
    <p><em>"${randomQuote.text}"</em></p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

/* ✅ Add new quote dynamically */
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    showMessage('Please enter both quote and category.', true);
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  newQuoteText.value = '';
  newQuoteCategory.value = '';
  showMessage('Quote added successfully!');
}

/* Utility: show a feedback message */
function showMessage(msg, isError = false) {
  messageEl.textContent = msg;
  messageEl.style.color = isError ? 'red' : 'green';
  setTimeout(() => (messageEl.textContent = ''), 3000);
}

/* Event Listeners */
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);

/* Initialize the app */
loadData();

/* ============================
   STEP 2: SERVER SYNCING LOGIC
============================ */

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock API
const SYNC_INTERVAL = 60000; // 1 minute

const syncNowBtn = document.getElementById('syncNowBtn');
const syncStatus = document.getElementById('syncStatus');

/* Simulate converting quote object to "server format" */
function quoteToServerFormat(quote, id = null) {
  return {
    id: id || Math.floor(Math.random() * 10000),
    title: quote.text,
    body: quote.category,
    userId: 1
  };
}

/* Convert server data back to local quote object */
function serverToLocalFormat(item) {
  return { text: item.title, category: item.body };
}

/* Fetch latest data from server */
async function fetchServerQuotes() {
  try {
    const res = await fetch(SERVER_URL + '?_limit=5'); // limit for demo
    if (!res.ok) throw new Error('Failed to fetch server data');
    const data = await res.json();
    const serverQuotes = data.map(serverToLocalFormat);
    return serverQuotes;
  } catch (err) {
    console.error('Fetch error:', err);
    updateSyncStatus('Error fetching server data.', true);
    return [];
  }
}

/* Push local quotes to server */
async function pushLocalQuotes() {
  try {
    const promises = quotes.map(q =>
      fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteToServerFormat(q))
      })
    );
    await Promise.all(promises);
    updateSyncStatus('Local quotes synced to server.');
  } catch (err) {
    console.error('Push error:', err);
    updateSyncStatus('Error pushing local quotes.', true);
  }
}

/* Simple conflict resolution: server wins */
function resolveConflicts(serverQuotes) {
  const merged = [...serverQuotes];
  const existingKeys = new Set(serverQuotes.map(q => q.text.toLowerCase()));

  for (const local of quotes) {
    if (!existingKeys.has(local.text.toLowerCase())) {
      merged.push(local);
    }
  }

  return merged;
}

/* Perform full sync */
async function syncWithServer() {
  updateSyncStatus('Syncing...');
  const serverQuotes = await fetchServerQuotes();
  if (serverQuotes.length === 0) {
    updateSyncStatus('No server data found.');
    return;
  }

  const merged = resolveConflicts(serverQuotes);
  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();
  updateSyncStatus('Sync completed. Data updated from server.');
}

/* Update UI message for sync status */
function updateSyncStatus(msg, isError = false) {
  syncStatus.textContent = msg;
  syncStatus.style.color = isError ? 'red' : 'green';
}

/* Periodic Sync */
setInterval(syncWithServer, SYNC_INTERVAL);

/* Manual Sync Button */
syncNowBtn.addEventListener('click', syncWithServer);

