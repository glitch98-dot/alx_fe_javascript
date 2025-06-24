
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

let quotes = loadQuotes();

// === Storage Functions ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  return storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
    { text: "Life is really simple, but we insist on making it complicated.", category: "Philosophy" }
  ];
}

// === Category Dropdown Functions ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  const lastSelected = localStorage.getItem('lastCategory') || 'all';

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === lastSelected) option.selected = true;
    categoryFilter.appendChild(option);
  });
}

// === Quote Display ===
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const random = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[random];
  quoteDisplay.innerHTML = `"${quote.text}"<br/><em>(${quote.category})</em>`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// === Add Quote ===
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert("Quote added!");

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// === Filter Quotes (Updates dropdown & display) ===
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastCategory', selected);
  showRandomQuote();
}

// === Import / Export ===
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid file");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported!");
    } catch (err) {
      alert("Failed to import: Invalid JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === Load Last Viewed Quote on Page Load ===
function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastViewedQuote');
  if (last) {
    const q = JSON.parse(last);
    quoteDisplay.innerHTML = `"${q.text}"<br/><em>(${q.category})</em>`;
  }
}

// === Init on Page Load ===
window.addEventListener('load', () => {
  populateCategories();
  loadLastViewedQuote();
});

newQuoteBtn.addEventListener('click', showRandomQuote);
