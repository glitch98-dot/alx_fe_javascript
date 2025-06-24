const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const newQuoteBtn = document.getElementById('newQuote');

let quotes = loadQuotes(); // Local storage array
const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Mock server

// === Local Storage Functions ===
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  return stored ? JSON.parse(stored) : [];
}

// === ID Generator for Syncing ===
function generateId(quote) {
  return btoa(quote.text + quote.category).substring(0, 12);
}

// === Populate Dropdown from Categories ===
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

// === Show Random Quote ===
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `"${quote.text}"<br/><em>(${quote.category})</em>`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// === Add New Quote + Sync to Server ===
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  const newQuote = {
    id: generateId({ text, category }),
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  notifyUser("✅ Quote added locally.");
  postQuoteToServer(newQuote); // Sync
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

// === POST to Server ===
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_API_URL, {
      method: 'POST',
      body: JSON.stringify(quote),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });
    if (response.ok) {
      notifyUser("📤 Quote synced with server.");
    }
  } catch (err) {
    console.error("Post failed", err);
    notifyUser("⚠️ Failed to sync with server.");
  }
}

// === GET from Server ===
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    const data = await response.json();
    return data.slice(0, 5).map(item => ({
      id: "srv" + item.id,
      text: item.title || "Server quote",
      category: "Server"
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    notifyUser("⚠️ Failed to fetch from server.");
    return [];
  }
}

// === Sync Logic with Conflict Resolution ===
async function syncQuotes() {
  console.log("🔄 Syncing with server...");
  const serverQuotes = await fetchQuotesFromServer();
  const localMap = new Map(quotes.map(q => [q.id, q]));
  const newQuotes = [];

  serverQuotes.forEach(serverQ => {
    if (!localMap.has(serverQ.id)) {
      quotes.push(serverQ);
      newQuotes.push(serverQ);
    } else if (JSON.stringify(localMap.get(serverQ.id)) !== JSON.stringify(serverQ)) {
      // Conflict — Server wins
      quotes = quotes.map(q => q.id === serverQ.id ? serverQ : q);
      notifyUser(`⚠️ Conflict resolved (server version): "${serverQ.text}"`);
    }
  });

  saveQuotes();
  populateCategories();

  if (newQuotes.length) {
    notifyUser(`📥 ${newQuotes.length} new quote(s) fetched from server.`);
  }
}

// === Filter Quotes by Category ===
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('lastCategory', selected);
  showRandomQuote();
}

// === Notification UI ===
function notifyUser(message) {
  const notice = document.createElement('div');
  notice.textContent = message;
  notice.style.background = "#ffd700";
  notice.style.padding = "8px";
  notice.style.margin = "8px 0";
  notice.style.border = "1px solid #aaa";
  document.body.insertBefore(notice, quoteDisplay);
  setTimeout(() => notice.remove(), 5000);
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
      notifyUser("✅ Quotes imported successfully.");
    } catch (err) {
      notifyUser("❌ Invalid JSON format.");
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

// === Initial Setup ===
window.addEventListener('load', () => {
  populateCategories();
  loadLastViewedQuote();
  syncQuotes(); // Initial sync
  setInterval(syncQuotes, 30000); // Sync every 30 seconds
});

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
