// ================================
// Dynamic Quote Generator
// Advanced DOM Manipulation Example
// ================================

// -----------------------------
// Step 1: Manage the quotes array
// -----------------------------
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "A day without laughter is a day wasted.", category: "Humor" }
];

// -----------------------------
// Step 2: Function to display random quote
// -----------------------------
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = ""; // clear old quote

  if (quotes.length === 0) {
    display.textContent = "No quotes available. Add one below!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Create quote text element
  const quoteText = document.createElement("div");
  quoteText.className = "quote-text";
  quoteText.textContent = `"${quote.text}"`;

  // Create category element
  const category = document.createElement("div");
  category.className = "category";
  category.textContent = `Category: ${quote.category}`;

  // Append elements to display
  const frag = document.createDocumentFragment();
  frag.appendChild(quoteText);
  frag.appendChild(category);
  display.appendChild(frag);
}

// -----------------------------
// Step 3: Function to create dynamic Add Quote form
// -----------------------------
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = ""; // clear old form if exists

  const form = document.createElement("form");

  // Create text input for quote
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.required = true;
  quoteInput.style.width = "100%";

  // Create text input for category
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;
  categoryInput.style.width = "100%";
  categoryInput.style.marginTop = "8px";

  // Create submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";
  submitBtn.type = "submit";
  submitBtn.style.marginTop = "10px";

  // Append elements to form
  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(submitBtn);

  // Event listener for submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newQuote = {
      text: quoteInput.value.trim(),
      category: categoryInput.value.trim(),
    };

    if (!newQuote.text || !newQuote.category) {
      alert("Please fill in both fields.");
      return;
    }

    quotes.push(newQuote);
    alert("Quote added successfully!");

    quoteInput.value = "";
    categoryInput.value = "";

    showRandomQuote(); // refresh display
  });

  // Append form to container
  container.appendChild(form);
}

// -----------------------------
// Step 4: Add buttons dynamically
// -----------------------------
function createButtons() {
  const controls = document.getElementById("controls");

  const showBtn = document.createElement("button");
  showBtn.textContent = "Show Random Quote";
  showBtn.addEventListener("click", showRandomQuote);

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add New Quote";
  addBtn.addEventListener("click", createAddQuoteForm);

  controls.appendChild(showBtn);
  controls.appendChild(addBtn);
}

// -----------------------------
// Step 5: Initialize application
// -----------------------------
function init() {
  createButtons();
  showRandomQuote();
}

window.addEventListener("DOMContentLoaded", init);
