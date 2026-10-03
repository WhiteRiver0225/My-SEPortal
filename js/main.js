const STORAGE_KEY = "mySeTechInputs";

//-----------------------------------------------
//
// カテゴリを追加する場合はここから
//
// { nameから行コピーし追加する。
// ※コードの末に[,]を追加すること。ただし最後のものは,入れない。
//
//-----------------------------------------------
const categories = [
  { name: "Windows", icon: "WIN", type: "SYSTEM" },
  { name: "bat", icon: "BAT", type: "SCRIPT" },
  { name: "PowerShell", icon: "PS", type: "SCRIPT" },
  { name: "Python", icon: "PY", type: "DEVELOPMENT" },
  { name: "ネットワーク", icon: "NET", type: "NETWORK" },
  { name: "Linux", icon: "LNX", type: "SERVER" },
  { name: "Git", icon: "GIT", type: "VERSION CONTROL" },
  { name: "SQL", icon: "SQL", type: "DATABASE" },
  { name: "OracleDB", icon: "ORA", type: "DATABASE" },
  { name: "Excel/VBA", icon: "XLS", type: "AUTOMATION" },
  { name: "VBScript", icon: "VBS", type: "SCRIPT" }
];

let techs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const categoryGrid = document.getElementById("categoryGrid");
const categorySelect = document.getElementById("category");
const form = document.getElementById("techForm");
const globalSearch = document.getElementById("globalSearch");
const searchResults = document.getElementById("searchResults");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(techs));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCategory(name) {
  return categories.find(c => c.name === name) || { name, icon: "📁" };
}

function renderCategorySelect() {
  categorySelect.innerHTML = categories
    .map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
    .join("");
}

function renderCategories() {
  categoryGrid.innerHTML = "";

  categories.forEach(category => {
    const count = techs.filter(t => t.category === category.name).length;

    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-top">
        <div class="category-icon">${category.icon}</div>
        <span class="category-type">${category.type}</span>
      </div>

      <div class="category-name">
        ${escapeHtml(category.name)}
     </div>

      <div class="category-bottom">
        <span>KNOWLEDGE</span>
        <strong>${count.toString().padStart(2, "0")}</strong>
     </div>

     <div class="category-status">
       <span class="status-dot"></span>
       SYSTEM READY
     </div>
    `;

    card.addEventListener("click", () => openCategory(category.name));

    categoryGrid.appendChild(card);
  });
}

function openCategory(categoryName) {
  const category = getCategory(categoryName);
  const items = techs.filter(t => t.category === categoryName);

  modalContent.innerHTML = `
    <div class="detail-category">${category.icon} ${escapeHtml(categoryName)}</div>
    <h2 class="detail-title">インプット一覧（${items.length}件）</h2>
    <div id="categoryItems"></div>
  `;

  const list = document.getElementById("categoryItems");

  if (!items.length) {
    list.innerHTML = `
      <div class="empty">
        まだインプットがありません。<br>
        「📥 技術インプット」から追加できます。
      </div>
    `;
  } else {
    items.slice().reverse().forEach(item => {
      const row = document.createElement("div");
      row.className = "result-item";
      row.innerHTML = `
        <strong>${escapeHtml(item.name)}</strong>
        <div class="result-meta">${escapeHtml(item.reason || "知ったきっかけ未入力")}</div>
      `;
      row.addEventListener("click", () => showDetail(item.id));
      list.appendChild(row);
    });
  }

  modal.classList.remove("hidden");
}

function showDetail(id) {
  const item = techs.find(t => t.id === id);
  if (!item) return;

  const category = getCategory(item.category);

  modalContent.innerHTML = `
    <div class="detail-category">${category.icon} ${escapeHtml(item.category)}</div>
    <h2 class="detail-title">${escapeHtml(item.name)}</h2>

    <div class="detail-block">
      <div class="detail-label">知ったきっかけ</div>
      <div class="detail-value">${escapeHtml(item.reason || "未入力")}</div>
    </div>

    <div class="detail-block">
      <div class="detail-label">何ができる技術？</div>
      <div class="detail-value">${escapeHtml(item.what || "未入力")}</div>
    </div>

    <div class="detail-block">
      <div class="detail-label">参考URL</div>
      <div class="detail-value">${
        item.url
          ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)}</a>`
          : "未入力"
      }</div>
    </div>

    <div class="detail-block">
      <div class="detail-label">メモ</div>
      <div class="detail-value">${escapeHtml(item.memo || "未入力")}</div>
    </div>

    <div class="detail-actions">
      <button class="small-btn" onclick="deleteTech(${item.id})">🗑 削除</button>
    </div>
  `;

  modal.classList.remove("hidden");
}

function deleteTech(id) {
  const item = techs.find(t => t.id === id);
  if (!item) return;

  if (!confirm(`「${item.name}」を削除しますか？`)) return;

  techs = techs.filter(t => t.id !== id);
  save();
  renderCategories();
  closeModal();
  runSearch();
}

function closeModal() {
  modal.classList.add("hidden");
}

function runSearch() {
  const q = globalSearch.value.trim().toLowerCase();

  if (!q) {
    searchResults.classList.add("hidden");
    searchResults.innerHTML = "";
    return;
  }

  const results = techs.filter(t => {
    const text = [
      t.name, t.category, t.reason, t.what, t.memo
    ].join(" ").toLowerCase();
    return text.includes(q);
  });

  searchResults.classList.remove("hidden");
  searchResults.innerHTML = `<div class="result-title">検索結果：${results.length}件</div>`;

  if (!results.length) {
    searchResults.innerHTML += `<div class="empty">該当する技術がありません。</div>`;
    return;
  }

  results.slice().reverse().forEach(item => {
    const row = document.createElement("div");
    row.className = "result-item";
    row.innerHTML = `
      <strong>${escapeHtml(item.name)}</strong>
      <div class="result-meta">${escapeHtml(item.category)}　${escapeHtml(item.reason || "")}</div>
    `;
    row.addEventListener("click", () => showDetail(item.id));
    searchResults.appendChild(row);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const item = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value,
    reason: document.getElementById("reason").value.trim(),
    what: document.getElementById("what").value.trim(),
    url: document.getElementById("url").value.trim(),
    memo: document.getElementById("memo").value.trim(),
    createdAt: new Date().toISOString()
  };

  techs.push(item);
  save();
  renderCategories();
  form.reset();
  categorySelect.value = categories[0].name;

  alert(`「${item.name}」を${item.category}へ登録しました。`);
  switchTab("home");
});

function switchTab(tabName) {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === tabName);
  });
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

globalSearch.addEventListener("input", runSearch);

document.getElementById("modalClose").addEventListener("click", closeModal);
document.querySelector(".modal-backdrop").addEventListener("click", closeModal);

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("mySeTheme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("mySeTheme") === "dark") {
  document.body.classList.add("dark");
}

renderCategorySelect();
renderCategories();
