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

/* ✅ Show random quote (based on filter if applicable) */
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
