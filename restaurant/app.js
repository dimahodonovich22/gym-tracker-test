// ====== RESTAURANT POS (касса) ======
// Столики, заказы, подсчёт суммы/количества и печать чека на термопринтер.

const STORAGE_KEY = "restpos.test.v1";
const DEFAULT_STATE = {
  tables: [],          // { id, name, items:[{id,menuId,name,price,qty}], openedAt }
  menu: [],            // { id, name, price, category }
  history: [],         // { id, tableName, items, subtotal, service, servicePct, total, closedAt }
  settings: {
    restaurant: "Мой ресторан",
    currency: "€",
    service: 0,        // процент обслуживания, 0 = выключено
    address: "",
    phone: "",
  },
  seeded: false,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed(structuredClone(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return seed(structuredClone(DEFAULT_STATE));
  }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// Стартовое меню-плейсхолдер (заменяется реальным меню пользователя / правится в приложении).
function seed(s) {
  s.menu = [
    { id: uid(), name: "Борщ", price: 4.5, category: "Кухня" },
    { id: uid(), name: "Цезарь с курицей", price: 6.9, category: "Кухня" },
    { id: uid(), name: "Стейк рибай", price: 18.0, category: "Кухня" },
    { id: uid(), name: "Картофель фри", price: 3.2, category: "Кухня" },
    { id: uid(), name: "Чизкейк", price: 4.0, category: "Десерты" },
    { id: uid(), name: "Эспрессо", price: 1.8, category: "Бар" },
    { id: uid(), name: "Капучино", price: 2.5, category: "Бар" },
    { id: uid(), name: "Лимонад", price: 2.8, category: "Бар" },
  ];
  s.seeded = true;
  return s;
}

// ====== UTIL ======
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// state инициализируется здесь — после объявления uid(), который использует seed()
let state = load();

function money(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const str = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return `${str} ${state.settings.currency}`;
}
function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

// ====== TOTALS ======
function tableSubtotal(t) {
  return (t.items || []).reduce((sum, i) => sum + i.price * i.qty, 0);
}
function tableQty(t) {
  return (t.items || []).reduce((sum, i) => sum + i.qty, 0);
}
function serviceAmount(subtotal) {
  const pct = Number(state.settings.service) || 0;
  return Math.round(subtotal * pct) / 100;
}

// ====== MODAL ======
function openModal(html) {
  const bg = $("#modalBg");
  bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  bg.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const bg = $("#modalBg");
  bg.classList.remove("show");
  bg.innerHTML = "";
  document.body.style.overflow = "";
}

// ====== ROUTER ======
function route() {
  return location.hash.replace(/^#/, "") || "tables";
}
function go(hash) { location.hash = hash; }

function render() {
  const r = route();
  const app = $("#app");
  let html = "";
  if (r === "tables") html = viewTables();
  else if (r.startsWith("table/")) html = viewTable(r.slice("table/".length));
  else if (r === "menu") html = viewMenu();
  else if (r === "history") html = viewHistory();
  else if (r === "settings") html = viewSettings();
  else html = viewTables();
  app.innerHTML = html;
  window.scrollTo(0, 0);
  syncNav(r);
}
function syncNav(r) {
  const active = r.startsWith("table/") ? "tables" : r;
  $$("nav.bottom a").forEach(a => {
    a.classList.toggle("active", a.dataset.route === active);
  });
}
window.addEventListener("hashchange", render);

// ====== VIEW: TABLES (home) ======
function viewTables() {
  const tables = state.tables;
  const cards = tables.map(t => {
    const subtotal = tableSubtotal(t);
    const qty = tableQty(t);
    return `
      <button class="card table-card ${qty ? "busy" : "free"}" onclick="go('table/${t.id}')">
        <div class="table-card-top">
          <span class="table-name">${icon("table", 18)} ${esc(t.name)}</span>
          <span class="badge ${qty ? "badge-busy" : "badge-free"}">${qty ? "Занят" : "Свободен"}</span>
        </div>
        <div class="table-card-bottom">
          <span class="muted">${qty ? `${qty} ${plural(qty, "позиция", "позиции", "позиций")}` : "Нет заказа"}</span>
          <span class="table-sum">${subtotal ? money(subtotal) : ""}</span>
        </div>
      </button>`;
  }).join("");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("store", 22)} ${esc(state.settings.restaurant)}</div>
      <button class="icon-btn" onclick="addTable()" aria-label="Добавить столик">${icon("plus", 22)}</button>
    </header>
    <div class="page">
      ${tables.length ? `<div class="grid">${cards}</div>` : emptyState("table", "Пока нет столиков", "Добавьте первый столик, чтобы начать принимать заказы.", "Добавить столик", "addTable()")}
    </div>`;
}

function emptyState(ico, title, text, btnLabel, btnAction) {
  return `
    <div class="empty">
      <div class="empty-ico">${icon(ico, 40)}</div>
      <div class="empty-title">${esc(title)}</div>
      <div class="empty-text">${esc(text)}</div>
      ${btnLabel ? `<button class="btn btn-primary" onclick="${btnAction}">${icon("plus", 18)} ${esc(btnLabel)}</button>` : ""}
    </div>`;
}

function addTable() {
  const n = state.tables.length + 1;
  openModal(`
    <div class="modal-head"><h2>Новый столик</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field">
      <span>Название</span>
      <input id="tblName" type="text" value="Столик ${n}" autocomplete="off">
    </label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveNewTable()">Создать</button>
    </div>`);
  setTimeout(() => { const i = $("#tblName"); i.focus(); i.select(); }, 50);
}
function saveNewTable() {
  const name = ($("#tblName").value || "").trim() || `Столик ${state.tables.length + 1}`;
  const t = { id: uid(), name, items: [], openedAt: new Date().toISOString() };
  state.tables.push(t);
  save();
  closeModal();
  go(`table/${t.id}`);
}

// ====== VIEW: TABLE ORDER ======
function viewTable(id) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return viewTables();
  const subtotal = tableSubtotal(t);
  const svc = serviceAmount(subtotal);
  const total = subtotal + svc;

  const items = (t.items || []).map(i => `
    <div class="order-row">
      <div class="order-info">
        <div class="order-name">${esc(i.name)}</div>
        <div class="order-price muted">${money(i.price)} × ${i.qty} = ${money(i.price * i.qty)}</div>
      </div>
      <div class="stepper">
        <button class="step-btn" onclick="changeQty('${t.id}','${i.id}',-1)" aria-label="Меньше">${icon("minus", 18)}</button>
        <span class="step-val">${i.qty}</span>
        <button class="step-btn" onclick="changeQty('${t.id}','${i.id}',1)" aria-label="Больше">${icon("plus", 18)}</button>
      </div>
    </div>`).join("");

  return `
    <header class="topbar">
      <button class="icon-btn" onclick="go('tables')" aria-label="Назад">${icon("arrowLeft", 22)}</button>
      <div class="topbar-title editable" onclick="renameTable('${t.id}')">${esc(t.name)} ${icon("edit", 15, "dim")}</div>
      <button class="icon-btn danger" onclick="confirmCloseTable('${t.id}')" aria-label="Закрыть столик">${icon("trash", 20)}</button>
    </header>
    <div class="page page-order">
      ${t.items.length ? `<div class="list">${items}</div>` : `<div class="empty small"><div class="empty-ico">${icon("utensils", 36)}</div><div class="empty-title">Заказ пуст</div><div class="empty-text">Добавьте блюда из меню.</div></div>`}
      <button class="btn btn-add-dish" onclick="openDishPicker('${t.id}')">${icon("plus", 18)} Добавить блюдо</button>
    </div>
    <div class="order-footer">
      <div class="totals">
        ${svc > 0 ? `<div class="totals-row muted"><span>Сумма (${tableQty(t)} ${plural(tableQty(t), "поз.", "поз.", "поз.")})</span><span>${money(subtotal)}</span></div>
        <div class="totals-row muted"><span>Обслуживание ${state.settings.service}%</span><span>${money(svc)}</span></div>` : `<div class="totals-row muted"><span>Позиций: ${tableQty(t)}</span><span></span></div>`}
        <div class="totals-row total"><span>Итого</span><span>${money(total)}</span></div>
      </div>
      <button class="btn btn-primary btn-block" ${t.items.length ? "" : "disabled"} onclick="showReceipt('${t.id}')">${icon("receipt", 20)} Чек</button>
    </div>`;
}

function renameTable(id) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return;
  openModal(`
    <div class="modal-head"><h2>Переименовать столик</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field"><span>Название</span><input id="tblName" type="text" value="${esc(t.name)}"></label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveRenameTable('${id}')">Сохранить</button>
    </div>`);
  setTimeout(() => { const i = $("#tblName"); i.focus(); i.select(); }, 50);
}
function saveRenameTable(id) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return closeModal();
  const name = ($("#tblName").value || "").trim();
  if (name) t.name = name;
  save();
  closeModal();
  render();
}

function changeQty(tableId, itemId, delta) {
  const t = state.tables.find(x => x.id === tableId);
  if (!t) return;
  const it = t.items.find(i => i.id === itemId);
  if (!it) return;
  it.qty += delta;
  if (it.qty <= 0) t.items = t.items.filter(i => i.id !== itemId);
  save();
  render();
}

function confirmCloseTable(id) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return;
  const hasOrder = t.items.length > 0;
  openModal(`
    <div class="modal-head"><h2>Закрыть столик?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">«${esc(t.name)}» будет удалён${hasOrder ? ", а заказ очищен" : ""}. ${hasOrder ? "Сохранить чек в историю перед закрытием?" : ""}</p>
    <div class="modal-actions column">
      ${hasOrder ? `<button class="btn btn-success btn-block" onclick="closeTable('${id}', true)">${icon("check", 18)} Оплачено — сохранить в историю</button>` : ""}
      <button class="btn btn-danger btn-block" onclick="closeTable('${id}', false)">${icon("trash", 18)} ${hasOrder ? "Удалить без сохранения" : "Удалить столик"}</button>
      <button class="btn btn-block" onclick="closeModal()">Отмена</button>
    </div>`);
}
function closeTable(id, saveToHistory) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return closeModal();
  if (saveToHistory && t.items.length) {
    const subtotal = tableSubtotal(t);
    const svc = serviceAmount(subtotal);
    state.history.unshift({
      id: uid(),
      tableName: t.name,
      items: structuredClone(t.items),
      subtotal,
      service: svc,
      servicePct: Number(state.settings.service) || 0,
      total: subtotal + svc,
      closedAt: new Date().toISOString(),
    });
  }
  state.tables = state.tables.filter(x => x.id !== id);
  save();
  closeModal();
  toast(saveToHistory ? "Чек сохранён в историю" : "Столик закрыт");
  go("tables");
}

// ====== DISH PICKER ======
function openDishPicker(tableId) {
  if (!state.menu.length) {
    openModal(`
      <div class="modal-head"><h2>Меню пустое</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
      <p class="modal-text">Сначала добавьте блюда в меню.</p>
      <div class="modal-actions">
        <button class="btn" onclick="closeModal()">Закрыть</button>
        <button class="btn btn-primary" onclick="closeModal(); go('menu')">Открыть меню</button>
      </div>`);
    return;
  }
  openModal(`
    <div class="modal-head"><h2>Добавить блюдо</h2><button class="icon-btn" onclick="closeModal(); render()">${icon("x", 20)}</button></div>
    <label class="field search-field">${icon("search", 18, "dim")}<input id="dishSearch" type="text" placeholder="Поиск по меню…" oninput="filterDishes(this.value)" autocomplete="off"></label>
    <div class="picker-list" id="pickerList">${renderPickerList(tableId, "")}</div>
    <div class="modal-actions"><button class="btn btn-primary btn-block" onclick="closeModal(); render()">Готово</button></div>`);
  openDishPicker._table = tableId;
  setTimeout(() => $("#dishSearch")?.focus(), 50);
}
function filterDishes(q) {
  $("#pickerList").innerHTML = renderPickerList(openDishPicker._table, q);
}
function renderPickerList(tableId, q) {
  const t = state.tables.find(x => x.id === tableId);
  const query = (q || "").trim().toLowerCase();
  const cats = {};
  state.menu
    .filter(m => !query || m.name.toLowerCase().includes(query))
    .forEach(m => { (cats[m.category || "Прочее"] ||= []).push(m); });

  const keys = Object.keys(cats);
  if (!keys.length) return `<div class="picker-empty muted">Ничего не найдено</div>`;

  return keys.map(cat => `
    <div class="picker-cat">${esc(cat)}</div>
    ${cats[cat].map(m => {
      const inOrder = t?.items.find(i => i.menuId === m.id);
      const qty = inOrder ? inOrder.qty : 0;
      return `
        <div class="picker-row" onclick="addDish('${tableId}','${m.id}')">
          <div class="picker-info">
            <div class="picker-name">${esc(m.name)}</div>
            <div class="picker-price muted">${money(m.price)}</div>
          </div>
          ${qty ? `<span class="qty-pill">${qty}</span>` : ""}
          <span class="picker-add">${icon("plus", 18)}</span>
        </div>`;
    }).join("")}`).join("");
}
function addDish(tableId, menuId) {
  const t = state.tables.find(x => x.id === tableId);
  const m = state.menu.find(x => x.id === menuId);
  if (!t || !m) return;
  const existing = t.items.find(i => i.menuId === m.id);
  if (existing) existing.qty += 1;
  else t.items.push({ id: uid(), menuId: m.id, name: m.name, price: m.price, qty: 1 });
  save();
  // обновляем только список выбора, чтобы поиск/скролл не сбрасывались
  const list = $("#pickerList");
  if (list) list.innerHTML = renderPickerList(tableId, $("#dishSearch")?.value || "");
}

// ====== RECEIPT (чек) ======
function showReceipt(tableId) {
  const t = state.tables.find(x => x.id === tableId);
  if (!t || !t.items.length) return;
  openModal(receiptHtml(receiptFromTable(t)) + `
    <div class="modal-actions column receipt-actions">
      <button class="btn btn-primary btn-block" onclick="printReceipt()">${icon("print", 20)} Печать чека</button>
      <button class="btn btn-success btn-block" onclick="closeModal(); confirmCloseTable('${tableId}')">${icon("check", 18)} Оплачено и закрыть</button>
      <button class="btn btn-block" onclick="closeModal()">Закрыть</button>
    </div>`);
}
function receiptFromTable(t) {
  const subtotal = tableSubtotal(t);
  const svc = serviceAmount(subtotal);
  return {
    tableName: t.name,
    items: t.items,
    subtotal,
    service: svc,
    servicePct: Number(state.settings.service) || 0,
    total: subtotal + svc,
    closedAt: new Date().toISOString(),
  };
}
function receiptHtml(rc) {
  const s = state.settings;
  const qty = (rc.items || []).reduce((n, i) => n + i.qty, 0);
  const rows = rc.items.map(i => `
    <div class="r-item">
      <div class="r-item-name">${esc(i.name)}</div>
      <div class="r-item-line">
        <span class="r-item-calc">${i.qty} × ${money(i.price)}</span>
        <span class="r-item-sum">${money(i.price * i.qty)}</span>
      </div>
    </div>`).join("");
  return `
  <div class="receipt-print" id="receiptSheet">
    <div class="r-head">
      <div class="r-store">${esc(s.restaurant || "Ресторан")}</div>
      ${s.address ? `<div class="r-sub">${esc(s.address)}</div>` : ""}
      ${s.phone ? `<div class="r-sub">тел. ${esc(s.phone)}</div>` : ""}
    </div>
    <div class="r-divider"></div>
    <div class="r-meta">
      <div>${esc(rc.tableName)}</div>
      <div>${fmtDateTime(rc.closedAt)}</div>
    </div>
    <div class="r-divider"></div>
    <div class="r-items">${rows}</div>
    <div class="r-divider"></div>
    <div class="r-total-row"><span>Позиций</span><span>${qty}</span></div>
    ${rc.service > 0 ? `
      <div class="r-total-row"><span>Сумма</span><span>${money(rc.subtotal)}</span></div>
      <div class="r-total-row"><span>Обслуж. ${rc.servicePct}%</span><span>${money(rc.service)}</span></div>` : ""}
    <div class="r-total-row r-grand"><span>ИТОГО</span><span>${money(rc.total)}</span></div>
    <div class="r-divider"></div>
    <div class="r-foot">Спасибо за визит!</div>
  </div>`;
}
function printReceipt() {
  document.body.classList.add("printing");
  const cleanup = () => {
    document.body.classList.remove("printing");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  setTimeout(() => window.print(), 60);
}

// ====== VIEW: MENU ======
function viewMenu() {
  const cats = {};
  state.menu.forEach(m => { (cats[m.category || "Прочее"] ||= []).push(m); });
  const keys = Object.keys(cats);

  const body = keys.length ? keys.map(cat => `
    <div class="menu-cat">${esc(cat)}</div>
    ${cats[cat].map(m => `
      <div class="card menu-item">
        <div class="menu-item-info">
          <div class="menu-item-name">${esc(m.name)}</div>
          <div class="menu-item-price muted">${money(m.price)}</div>
        </div>
        <button class="icon-btn" onclick="editDish('${m.id}')" aria-label="Изменить">${icon("edit", 18)}</button>
        <button class="icon-btn danger" onclick="deleteDish('${m.id}')" aria-label="Удалить">${icon("trash", 18)}</button>
      </div>`).join("")}
  `).join("") : emptyState("menu", "Меню пустое", "Добавьте блюда, чтобы добавлять их в заказы столиков.", "Добавить блюдо", "editDish()");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("menu", 22)} Меню</div>
      <button class="icon-btn" onclick="editDish()" aria-label="Добавить блюдо">${icon("plus", 22)}</button>
    </header>
    <div class="page">${body}</div>`;
}

function editDish(id) {
  const m = id ? state.menu.find(x => x.id === id) : null;
  const cats = [...new Set(state.menu.map(x => x.category).filter(Boolean))];
  const datalist = cats.map(c => `<option value="${esc(c)}"></option>`).join("");
  openModal(`
    <div class="modal-head"><h2>${m ? "Изменить блюдо" : "Новое блюдо"}</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field"><span>Название</span><input id="dName" type="text" value="${m ? esc(m.name) : ""}" placeholder="Напр. Борщ" autocomplete="off"></label>
    <label class="field"><span>Цена</span><input id="dPrice" type="number" inputmode="decimal" min="0" step="0.01" value="${m ? m.price : ""}" placeholder="0"></label>
    <label class="field"><span>Категория</span><input id="dCat" type="text" list="catList" value="${m ? esc(m.category || "") : ""}" placeholder="Напр. Кухня" autocomplete="off"><datalist id="catList">${datalist}</datalist></label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn btn-primary" onclick="saveDish('${id || ""}')">Сохранить</button>
    </div>`);
  setTimeout(() => $("#dName")?.focus(), 50);
}
function saveDish(id) {
  const name = ($("#dName").value || "").trim();
  const price = Math.max(0, parseFloat($("#dPrice").value) || 0);
  const category = ($("#dCat").value || "").trim() || "Прочее";
  if (!name) { toast("Введите название"); return; }
  if (id) {
    const m = state.menu.find(x => x.id === id);
    if (m) { m.name = name; m.price = price; m.category = category; }
  } else {
    state.menu.push({ id: uid(), name, price, category });
  }
  save();
  closeModal();
  render();
}
function deleteDish(id) {
  const m = state.menu.find(x => x.id === id);
  if (!m) return;
  openModal(`
    <div class="modal-head"><h2>Удалить блюдо?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">«${esc(m.name)}» будет удалено из меню. Уже добавленные в заказы позиции останутся.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn btn-danger" onclick="doDeleteDish('${id}')">Удалить</button>
    </div>`);
}
function doDeleteDish(id) {
  state.menu = state.menu.filter(x => x.id !== id);
  save();
  closeModal();
  render();
}

// ====== VIEW: HISTORY ======
function viewHistory() {
  const list = state.history;
  const body = list.length ? list.map(h => {
    const qty = (h.items || []).reduce((n, i) => n + i.qty, 0);
    return `
    <button class="card hist-item" onclick="showHistReceipt('${h.id}')">
      <div class="hist-info">
        <div class="hist-name">${esc(h.tableName)}</div>
        <div class="hist-meta muted">${icon("clock", 13, "dim")} ${fmtDateTime(h.closedAt)} · ${qty} ${plural(qty, "позиция", "позиции", "позиций")}</div>
      </div>
      <div class="hist-sum">${money(h.total)}</div>
      <span class="hist-chev">${icon("chevronRight", 18, "dim")}</span>
    </button>`;
  }).join("") : emptyState("history", "История пуста", "Сюда попадают закрытые (оплаченные) чеки.", "", "");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("history", 22)} История</div>
      ${list.length ? `<button class="icon-btn danger" onclick="confirmClearHistory()" aria-label="Очистить">${icon("trash", 20)}</button>` : ""}
    </header>
    <div class="page">
      ${list.length ? `<div class="hist-summary card">${icon("wallet", 18)} Всего за всё время: <b>${money(list.reduce((s, h) => s + h.total, 0))}</b> · ${list.length} ${plural(list.length, "чек", "чека", "чеков")}</div>` : ""}
      <div class="list-gap">${body}</div>
    </div>`;
}
function showHistReceipt(id) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;
  openModal(receiptHtml(h) + `
    <div class="modal-actions column receipt-actions">
      <button class="btn btn-primary btn-block" onclick="printReceipt()">${icon("print", 20)} Печать чека</button>
      <button class="btn btn-block" onclick="closeModal()">Закрыть</button>
    </div>`);
}
function confirmClearHistory() {
  openModal(`
    <div class="modal-head"><h2>Очистить историю?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">Все сохранённые чеки будут удалены. Это действие необратимо.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Отмена</button>
      <button class="btn btn-danger" onclick="clearHistory()">Очистить</button>
    </div>`);
}
function clearHistory() {
  state.history = [];
  save();
  closeModal();
  render();
  toast("История очищена");
}

// ====== VIEW: SETTINGS ======
function viewSettings() {
  const s = state.settings;
  return `
    <header class="topbar"><div class="topbar-title">${icon("settings", 22)} Настройки</div></header>
    <div class="page">
      <div class="card settings-card">
        <label class="field"><span>Название заведения</span><input id="setName" type="text" value="${esc(s.restaurant)}"></label>
        <label class="field"><span>Валюта</span><input id="setCur" type="text" maxlength="6" value="${esc(s.currency)}"></label>
        <label class="field"><span>Обслуживание, % (0 — выключено)</span><input id="setSvc" type="number" inputmode="decimal" min="0" max="100" step="1" value="${s.service}"></label>
        <label class="field"><span>Адрес (для чека)</span><input id="setAddr" type="text" value="${esc(s.address)}" placeholder="необязательно"></label>
        <label class="field"><span>Телефон (для чека)</span><input id="setPhone" type="text" value="${esc(s.phone)}" placeholder="необязательно"></label>
        <button class="btn btn-primary btn-block" onclick="saveSettings()">${icon("check", 18)} Сохранить</button>
      </div>
      <div class="muted footnote">Данные хранятся локально на этом устройстве. Приложение работает офлайн. Чек печатается на чековом (термо) принтере шириной 80&nbsp;мм через диалог печати браузера.</div>
    </div>`;
}
function saveSettings() {
  const s = state.settings;
  s.restaurant = ($("#setName").value || "").trim() || "Мой ресторан";
  s.currency = ($("#setCur").value || "").trim() || "€";
  s.service = Math.max(0, Math.min(100, parseFloat($("#setSvc").value) || 0));
  s.address = ($("#setAddr").value || "").trim();
  s.phone = ($("#setPhone").value || "").trim();
  save();
  toast("Настройки сохранены");
  render();
}

// expose for inline handlers
Object.assign(window, {
  go, addTable, saveNewTable, renameTable, saveRenameTable, changeQty,
  confirmCloseTable, closeTable, openDishPicker, filterDishes, addDish,
  showReceipt, printReceipt, editDish, saveDish, deleteDish, doDeleteDish,
  showHistReceipt, confirmClearHistory, clearHistory, saveSettings, closeModal,
  state, save, render, toast,
});

// ====== BOOT ======
document.getElementById("modalBg").addEventListener("click", e => { if (e.target.id === "modalBg") closeModal(); });
render();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
