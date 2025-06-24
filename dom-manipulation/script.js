const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

let quotes = loadQuotes(); // Load from localStorage on start

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    return JSON.parse(storedQuotes);
  }
  return [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
    { text: "Life is really simple, but we insist on making it complicated.", category: "Philosophy" }
  ];
}

// Populate category dropdown
function populateCategoryDropdown() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="">All</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Show a random quote and store it in sessionStorage
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory
    ? quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase())
    : quotes;

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `"${randomQuote.text}"<br/><em>(${randomQuote.category})</em>`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Add a new quote and save it
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');

  const quoteText = textInput.value.trim();
  const quoteCategory = categoryInput.value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);

  textInput.value = '';
  categoryInput.value = '';

  saveQuotes();
  populateCategoryDropdown();
  alert("Quote added successfully!");
}

// Create form dynamically
function createAddQuoteForm() {
  const container = document.createElement('div');
  container.classList.add('form-group');

  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.addEventListener('click', addQuote);

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);

  document.body.appendChild(document.createElement('h3')).textContent = 'Add a New Quote';
  document.body.appendChild(container);
}

// Export quotes to a JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategoryDropdown();
      alert('Quotes imported successfully!');
    } catch (error) {
      alert("Failed to import: Invalid JSON format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Show last viewed quote from sessionStorage (optional)
function loadLastViewedQuote() {
  const last = sessionStorage.getItem('lastViewedQuote');
  if (last) {
    const quote = JSON.parse(last);
    quoteDisplay.innerHTML = `"${quote.text}"<br/><em>(${quote.category})</em>`;
  }
}

// Initialize UI
function createImportExportButtons() {
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Quotes';
  exportBtn.addEventListener('click', exportToJson);

  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.id = 'importFile';
  importInput.addEventListener('change', importFromJsonFile);

  document.body.appendChild(document.createElement('h3')).textContent = 'Import / Export';
  document.body.appendChild(exportBtn);
  document.body.appendChild(importInput);
}

// Run on page load
window.addEventListener('load', () => {
  populateCategoryDropdown();
  createAddQuoteForm();
  createImportExportButtons();
  loadLastViewedQuote();
});

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);
