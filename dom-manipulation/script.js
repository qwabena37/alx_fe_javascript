// ================================
// Dynamic Quote Generator
// Step 3: Add Quotes Dynamically
// ================================

// Existing array of quotes
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "A day without laughter is a day wasted.", category: "Humor" }
];

// Function: Display a random quote
function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  if (quotes.length === 0) {
    display.textContent = "No quotes available. Please add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteEl = document.createElement("p");
  quoteEl.textContent = `"${quote.text}"`;

  const categoryEl = document.createElement("small");
  categoryEl.textContent = `Category: ${quote.category}`;

  display.appendChild(quoteEl);
  display.appendChild(categoryEl);

}

// Function: Add a new quote dynamically
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Add new quote to the array
  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  // Update the DOM to show the new quote immediately
  showRandomQuote();

  // Clear input fields
  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added successfully!");
}

// Event listener to show random quote when button clicked
document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote);

// Show a random quote when page loads
window.addEventListener("DOMContentLoaded", showRandomQuote);


// Step 3: Function to Add a New Quote Dynamically
//"createAddQuoteForm"
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  // Create new quote object
  const newQuote = { text: quoteText, category: quoteCategory };

  // Add the new quote to the array
  quotes.push(newQuote);

  // Update the display area instantly
  showRandomQuote();

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("New quote added successfully!");
}
