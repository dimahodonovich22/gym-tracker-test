// ====== RESTAURANT POS (касса) ======
// Столики, заказы, подсчёт суммы/количества и печать чека на термопринтер.

const STORAGE_KEY = "restpos.test.v1";
const DEFAULT_STATE = {
  tables: [],          // { id, name, items:[{id,menuId,name,price,qty}], openedAt }
  menu: [],            // { id, name, price, category }
  history: [],         // { id, tableName, items, subtotal, service, servicePct, total, closedAt }
  settings: {
    restaurant: "Vyshnia House",
    currency: "€",
    service: 0,
    address: "Oude Koornmarkt 44A",
    city: "2000 Antwerpen",
    vatNumber: "BE1026823291",
    phone: "",
    server: "01ha",
    printerIp: "",
  },
  seeded: false,
  menuVersion: 0,
  billCounter: 1000,
};

const MENU_VERSION = 3;
const MENU = [
  // Cold Appetizers
  ["1 · Cossack's appetizer platter", 27, "Cold Appetizers"],
  ["2 · White Gold of Ukraine (lard)", 10, "Cold Appetizers"],
  ["3 · Lard assortment", 16, "Cold Appetizers"],
  ["4 · Artisan lard spreads", 13, "Cold Appetizers"],
  ["5 · Veal and chicken aspic", 12, "Cold Appetizers"],
  ["6 · Cheese plate", 9, "Cold Appetizers"],
  ["7 · Village-style herring", 14, "Cold Appetizers"],
  ["8 · Salted fish with fried potatoes", 14, "Cold Appetizers"],
  ["9 · Fresh seasonal vegetables", 7, "Cold Appetizers"],
  ["10 · Cured meat platter", 18, "Cold Appetizers"],
  ["11 · Pickled mushrooms", 12, "Cold Appetizers"],
  ["12 · Olives", 5, "Cold Appetizers"],
  ["13 · Grandma's pantry pickles", 14, "Cold Appetizers"],
  ["14 · Homemade Ukrainian blood sausage", 6, "Cold Appetizers"],
  // Salads
  ["15 · Greek salad", 11, "Salads"],
  ["16 · Caesar salad with chicken and bacon", 16, "Salads"],
  ["17 · Caesar salad with salmon", 16, "Salads"],
  ["18 · Shuba (beet & herring salad)", 15, "Salads"],
  ["19 · Olivier salad", 15, "Salads"],
  ["20 · Salad with beef tongue", 15, "Salads"],
  ["21 · Shrimp salad", 16, "Salads"],
  ["22 · Eggplant appetizer", 9, "Salads"],
  ["23 · Ukrainian fermented cabbage salad", 6, "Salads"],
  // Soups
  ["24 · Ukrainian borscht", 14, "Soups"],
  ["25 · Okroshka (cold soup)", 12, "Soups"],
  ["26 · Chicken broth (just like mum's)", 9, "Soups"],
  ["27 · Solyanka (smoked soup)", 16, "Soups"],
  // Side Dishes
  ["28 · Banosh with cheese and bacon", 16, "Side Dishes"],
  ["29 · Boiled young potatoes with bacon", 9, "Side Dishes"],
  ["30 · Mashed potatoes", 7, "Side Dishes"],
  ["31 · Country-style potatoes", 8, "Side Dishes"],
  ["32 · French fries", 8, "Side Dishes"],
  ["33 · Rice with vegetables", 7, "Side Dishes"],
  // Varenyky & Halushky
  ["34 · Varenyky with potato", 12, "Varenyky & Halushky"],
  ["35 · Varenyky with stewed cabbage", 12, "Varenyky & Halushky"],
  ["36 · Varenyky with potato and liver", 14, "Varenyky & Halushky"],
  ["37 · Varenyky with cherries", 17, "Varenyky & Halushky"],
  ["38 · Sweet varenyky with cottage cheese", 17, "Varenyky & Halushky"],
  ["39 · Potato and cheese halushky", 14, "Varenyky & Halushky"],
  // Pelmeni
  ["40 · Chicken pelmeni", 17, "Pelmeni"],
  ["41 · Veal pelmeni", 17, "Pelmeni"],
  ["42 · Pork and veal pelmeni", 17, "Pelmeni"],
  // Deruny
  ["43 · Traditional Deruny", 11, "Deruny"],
  ["44 · Deruny with mushrooms", 13, "Deruny"],
  ["45 · Deruny with cheese and herbs", 14, "Deruny"],
  ["46 · Deruny with chicken", 15, "Deruny"],
  ["47 · Deruny with meat", 15, "Deruny"],
  // Crepes
  ["48 · Crepes with cottage cheese (sweet)", 12, "Crepes"],
  ["49 · Crepes with cherries", 14, "Crepes"],
  ["50 · Crepes with banana and chocolate", 10, "Crepes"],
  ["51 · Crepes with chicken and cheese", 14, "Crepes"],
  ["52 · Crepes with meat", 14, "Crepes"],
  ["53 · Crepes with salmon", 12, "Crepes"],
  // Hot Dishes — Meat
  ["54 · Cabbage rolls with sour cream", 19, "Hot Dishes — Meat"],
  ["55 · Kyiv cutlet", 21, "Hot Dishes — Meat"],
  ["56 · Crispy chicken wings with sauce", 19, "Hot Dishes — Meat"],
  ["57 · Pork ribs with cherry sauce", 22, "Hot Dishes — Meat"],
  ["58 · Fried pork with onions", 21, "Hot Dishes — Meat"],
  ["59 · Veal fillet in creamy sauce", 22, "Hot Dishes — Meat"],
  ["60 · Baked veal with mushroom sauce", 27, "Hot Dishes — Meat"],
  // Hot Dishes — Fish
  ["61 · Salmon steak", 27, "Hot Dishes — Fish"],
  ["62 · Baked mackerel", 27, "Hot Dishes — Fish"],
  ["63 · Cossack-style fish steak", 27, "Hot Dishes — Fish"],
  ["64 · Fish cutlets with mashed potatoes", 22, "Hot Dishes — Fish"],
  ["65 · Shrimps in cream sauce", 22, "Hot Dishes — Fish"],
  // Desserts
  ["66 · Monastyrska Izba (cherry & cream)", 11, "Desserts"],
  ["67 · Syrnyky (3 pcs)", 11, "Desserts"],
  ["68 · Napoleon cake", 9, "Desserts"],
  ["69 · Cheesecake with berry sauce", 10, "Desserts"],
  ["70 · Spartak cake", 11, "Desserts"],
  ["71 · Walnut-shaped cookies (1 pc)", 2.5, "Desserts"],
  ["72 · Ice cream", 6, "Desserts"],
  // Tea
  ["Classic black tea", 4.5, "Tea"],
  ["Classic green tea", 4.5, "Tea"],
  ["Ukrainian steppe herbal tea", 5, "Tea"],
  ["Mint tea", 5, "Tea"],
  ["Ginger tea", 6, "Tea"],
  ["Raspberry tea", 6, "Tea"],
  ["Cherry tea", 6, "Tea"],
  // Coffee
  ["Espresso", 4, "Coffee"],
  ["Americano", 4, "Coffee"],
  ["Cappuccino", 5, "Coffee"],
  ["Latte", 5, "Coffee"],
  // Sparkling Wines
  ["Cava (Spain), glass", 7, "Sparkling Wines"],
  ["Cava (Spain), bottle", 35, "Sparkling Wines"],
  ["Prosecco (Italy), glass", 7, "Sparkling Wines"],
  ["Prosecco (Italy), bottle", 35, "Sparkling Wines"],
  // Wines
  ["White wine, glass", 7, "Wines"],
  ["White wine, bottle", 35, "Wines"],
  ["Rosé wine, glass", 7, "Wines"],
  ["Rosé wine, bottle", 35, "Wines"],
  ["Red wine, glass", 7, "Wines"],
  ["Red wine, bottle", 35, "Wines"],
  // Spirits
  ["Vodka Nemiroff (100ml)", 8, "Spirits"],
  ["Vodka Finlandia (100ml)", 8, "Spirits"],
  ["Whisky Ballantine's (50ml)", 8, "Spirits"],
  ["Whisky Jameson (50ml)", 9, "Spirits"],
  ["Becherovka (50ml)", 8, "Spirits"],
  ["Tequila (50ml)", 9, "Spirits"],
  ["Sambuca (50ml)", 9, "Spirits"],
  ["Bacardi Rum (50ml)", 8, "Spirits"],
  ["Beefeater Gin (50ml)", 8, "Spirits"],
  ["Martini (50ml)", 7, "Spirits"],
  // Beer
  ["Jupiler", 3.5, "Beer"],
  ["Stella", 4, "Beer"],
  ["Leffe Blond", 5, "Beer"],
  ["Leffe Blond 0.0%", 5, "Beer"],
  ["Leffe Bruin", 5, "Beer"],
  ["Leffe Bruin 0.0%", 5, "Beer"],
  ["Liefmans Fruitesse (cherry beer)", 4.5, "Beer"],
  ["Duvel", 5.5, "Beer"],
  ["Karmeliet", 6, "Beer"],
  ["Beer nuts (80g)", 4, "Beer"],
  ["Potato chips (50g)", 4, "Beer"],
  // Cocktails
  ["Aperol spritz", 13, "Cocktails"],
  ["Cherry spritz", 14, "Cocktails"],
  ["Mojito", 13, "Cocktails"],
  ["Cherry mojito", 14, "Cocktails"],
  // Infusions (shot)
  ["Cherry infusion", 4.5, "Infusions (shot)"],
  ["Blackberry infusion", 4.5, "Infusions (shot)"],
  ["Raspberry infusion", 4.5, "Infusions (shot)"],
  ["Strawberry infusion", 4.5, "Infusions (shot)"],
  ["Blackcurrant infusion", 4.5, "Infusions (shot)"],
  ["Lemon infusion", 4.5, "Infusions (shot)"],
  ["Horseradish infusion", 4.5, "Infusions (shot)"],
  ["Pepper infusion", 4.5, "Infusions (shot)"],
  // Soft Drinks
  ["Mineral water (sparkling/still)", 4, "Soft Drinks"],
  ["Natural juices (assorted)", 4.5, "Soft Drinks"],
  ["Cola / Fanta / Sprite", 4, "Soft Drinks"],
  ["Compote / uzvar, glass 0.30L", 3, "Soft Drinks"],
  ["Compote / uzvar, jug", 10, "Soft Drinks"],
  ["Red Bull (0.25 l)", 5, "Soft Drinks"],
  ["Milkshake (0.30 l)", 9, "Soft Drinks"],
  ["Non-alcoholic mojito (0.35 l)", 9, "Soft Drinks"],
].map(([name, price, category]) => ({ name, price, category }));

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed(structuredClone(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    const s = {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
    };
    if (!s.settings.server) s.settings.server = "01ha"; // официант по умолчанию (как на образце)
    // Обновляем меню до актуальной версии + префилл реквизитов заведения.
    if (s.menuVersion !== MENU_VERSION) {
      applyMenu(s);
      s.settings.address ||= "Oude Koornmarkt 44A";
      s.settings.city ||= "2000 Antwerpen";
      s.settings.vatNumber ||= "BE1026823291";
    }
    return s;
  } catch {
    return seed(structuredClone(DEFAULT_STATE));
  }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

// Категории с алкоголем — ставка НДС 21% (A); остальное — 6% (C).
const VAT_ALCOHOL = new Set(["Beer", "Cocktails", "Spirits", "Wines", "Sparkling Wines", "Infusions (shot)"]);
function vatForCategory(cat) { return VAT_ALCOHOL.has(cat) ? 21 : 6; }
// Загрузка/обновление меню ресторана из канонического списка MENU.
function applyMenu(s) {
  s.menu = MENU.map(m => ({ id: uid(), ...m, vat: vatForCategory(m.category) }));
  s.menuVersion = MENU_VERSION;
  return s;
}
function seed(s) {
  applyMenu(s);
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
save(); // зафиксировать загрузку/обновление меню

function money(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  const str = Number.isInteger(v) ? v.toString() : v.toFixed(2);
  return `${str} ${state.settings.currency}`;
}
function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}
// ----- формат для чека (бельгийский: запятая-разделитель, 2 знака) -----
function euro(n) { return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace(".", ","); }
function fmtReceiptDateTime(iso) {
  const d = new Date(iso), p = x => String(x).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
const VAT_LETTER = { 21: "A", 12: "B", 6: "C" };
function vatLetter(r) { return VAT_LETTER[r] || "C"; }
function nextBillNo() { state.billCounter = (Number(state.billCounter) || 1000) + 1; return state.billCounter; }
// ----- учебные «фискальные» контрольные данные (случайные, как на образце чека) -----
function randDigits(n) { let s = ""; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; }
function randHex(n, upper) { const c = upper ? "0123456789ABCDEF" : "0123456789abcdef"; let s = ""; for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * 16)]; return s; }
function genFiscal() {
  const vatDigits = ((state.settings.vatNumber || "").replace(/\D/g, "") || randDigits(10)).slice(0, 10).padEnd(10, "0");
  return {
    fdm: "BMC" + randDigits(8),
    fdmTicket: randDigits(4),
    operator: randDigits(2) + "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)] + "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)],
    vsc: vatDigits + "-" + randDigits(3),
    sce: "BTIL" + randDigits(10),
    ver: randDigits(3) + "." + randDigits(2) + ".R." + randDigits(5),
    ticket: randDigits(4) + "/" + randDigits(4) + " NS",
    hash: randHex(8, false),
    net: randHex(6, false),
    pc: "PC" + (1 + Math.floor(Math.random() * 3)),
    sig: randHex(40, true),
  };
}
function fmtControlDateTime(iso) {
  const d = new Date(iso), p = x => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
// Имя для чека — без номера позиции из меню ("12 · Борщ" -> "Борщ").
function dishName(name) { return String(name ?? "").replace(/^\d+\s*·\s*/, ""); }
// Короткое имя для чека: основное название (первые 2-3 слова), без скобок,
// без хвостовых служебных слов и без многоточия — как в образце чека.
const NAME_STOP = new Set(["with", "and", "of", "the", "in", "on", "met", "en", "de", "het", "a", "an", "la", "le", "&", "-", "/"]);
function receiptName(name) {
  const s = dishName(name).replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const words = s.split(" ");
  const out = [];
  let len = 0;
  for (const w of words) {
    if (out.length >= 3) break;
    const add = (out.length ? 1 : 0) + w.length;
    if (out.length && len + add > 22) break;
    out.push(w); len += add;
  }
  while (out.length > 1 && NAME_STOP.has(out[out.length - 1].toLowerCase())) out.pop();
  return out.join(" ") || s;
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
          <span class="table-name">${icon("table", 18)}<span class="tname">${esc(t.name)}</span></span>
          <span class="badge ${qty ? "badge-busy" : "badge-free"}">${qty ? "Зайнятий" : "Вільний"}</span>
        </div>
        <div class="table-card-bottom">
          <span class="muted">${qty ? `${qty} ${plural(qty, "позиція", "позиції", "позицій")}` : "Немає замовлення"}</span>
          <span class="table-sum">${subtotal ? money(subtotal) : ""}</span>
        </div>
      </button>`;
  }).join("");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("store", 22)} ${esc(state.settings.restaurant)}</div>
      <button class="icon-btn" onclick="addTable()" aria-label="Додати столик">${icon("plus", 22)}</button>
    </header>
    <div class="page">
      ${tables.length ? `<div class="grid">${cards}</div>` : emptyState("table", "Поки немає столиків", "Додайте перший столик, щоб почати приймати замовлення.", "Додати столик", "addTable()")}
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
    <div class="modal-head"><h2>Новий столик</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field">
      <span>Назва</span>
      <input id="tblName" type="text" value="Столик ${n}" autocomplete="off">
    </label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Скасувати</button>
      <button class="btn btn-primary" onclick="saveNewTable()">Створити</button>
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
        <button class="step-btn" onclick="changeQty('${t.id}','${i.id}',-1)" aria-label="Менше">${icon("minus", 18)}</button>
        <span class="step-val">${i.qty}</span>
        <button class="step-btn" onclick="changeQty('${t.id}','${i.id}',1)" aria-label="Більше">${icon("plus", 18)}</button>
      </div>
    </div>`).join("");

  return `
    <header class="topbar">
      <button class="icon-btn" onclick="go('tables')" aria-label="Назад">${icon("arrowLeft", 22)}</button>
      <div class="topbar-title editable" onclick="renameTable('${t.id}')">${esc(t.name)} ${icon("edit", 15, "dim")}</div>
      <button class="icon-btn danger" onclick="confirmCloseTable('${t.id}')" aria-label="Закрити столик">${icon("trash", 20)}</button>
    </header>
    <div class="page page-order">
      ${t.items.length ? `<div class="list">${items}</div>` : `<div class="empty small"><div class="empty-ico">${icon("utensils", 36)}</div><div class="empty-title">Замовлення порожнє</div><div class="empty-text">Додайте страви з меню.</div></div>`}
      <button class="btn btn-add-dish" onclick="openDishPicker('${t.id}')">${icon("plus", 18)} Додати страву</button>
    </div>
    <div class="order-footer">
      <div class="totals">
        ${svc > 0 ? `<div class="totals-row muted"><span>Сума (${tableQty(t)} ${plural(tableQty(t), "поз.", "поз.", "поз.")})</span><span>${money(subtotal)}</span></div>
        <div class="totals-row muted"><span>Обслуговування ${state.settings.service}%</span><span>${money(svc)}</span></div>` : `<div class="totals-row muted"><span>Позицій: ${tableQty(t)}</span><span></span></div>`}
        <div class="totals-row total"><span>Разом</span><span>${money(total)}</span></div>
      </div>
      <button class="btn btn-primary btn-block" ${t.items.length ? "" : "disabled"} onclick="showReceipt('${t.id}')">${icon("receipt", 20)} Чек</button>
    </div>`;
}

function renameTable(id) {
  const t = state.tables.find(x => x.id === id);
  if (!t) return;
  openModal(`
    <div class="modal-head"><h2>Перейменувати столик</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field"><span>Назва</span><input id="tblName" type="text" value="${esc(t.name)}"></label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Скасувати</button>
      <button class="btn btn-primary" onclick="saveRenameTable('${id}')">Зберегти</button>
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
    <div class="modal-head"><h2>Закрити столик?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">«${esc(t.name)}» буде видалено${hasOrder ? ", а замовлення очищено" : ""}. ${hasOrder ? "Зберегти чек в історію перед закриттям?" : ""}</p>
    <div class="modal-actions column">
      ${hasOrder ? `<button class="btn btn-success btn-block" onclick="closeTable('${id}', true)">${icon("check", 18)} Сплачено — зберегти в історію</button>` : ""}
      <button class="btn btn-danger btn-block" onclick="closeTable('${id}', false)">${icon("trash", 18)} ${hasOrder ? "Видалити без збереження" : "Видалити столик"}</button>
      <button class="btn btn-block" onclick="closeModal()">Скасувати</button>
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
      billNo: t.billNo,
      fiscal: t.fiscal,
      pay: t.pay || "Card",
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
  toast(saveToHistory ? "Чек збережено в історію" : "Столик закрито");
  go("tables");
}

// ====== DISH PICKER ======
function openDishPicker(tableId) {
  if (!state.menu.length) {
    openModal(`
      <div class="modal-head"><h2>Меню порожнє</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
      <p class="modal-text">Спочатку додайте страви в меню.</p>
      <div class="modal-actions">
        <button class="btn" onclick="closeModal()">Закрити</button>
        <button class="btn btn-primary" onclick="closeModal(); go('menu')">Відкрити меню</button>
      </div>`);
    return;
  }
  openModal(`
    <div class="modal-head"><h2>Додати страву</h2><button class="icon-btn" onclick="closeModal(); render()">${icon("x", 20)}</button></div>
    <label class="field search-field">${icon("search", 18, "dim")}<input id="dishSearch" type="text" placeholder="Пошук по меню…" oninput="filterDishes(this.value)" autocomplete="off"></label>
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
    .forEach(m => { (cats[m.category || "Інше"] ||= []).push(m); });

  const keys = Object.keys(cats);
  if (!keys.length) return `<div class="picker-empty muted">Нічого не знайдено</div>`;

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
  else t.items.push({ id: uid(), menuId: m.id, name: m.name, price: m.price, vat: m.vat ?? 6, qty: 1 });
  save();
  // обновляем только список выбора, чтобы поиск/скролл не сбрасывались
  const list = $("#pickerList");
  if (list) list.innerHTML = renderPickerList(tableId, $("#dishSearch")?.value || "");
}

// ====== RECEIPT (rekening, нидерландский формат) ======
function payToggleHtml(call, pay) {
  return `<div class="pay-toggle">
      <button class="btn ${pay === "Card" ? "btn-primary" : ""}" onclick="${call.replace("%P", "Card")}">Card</button>
      <button class="btn ${pay === "Cash" ? "btn-primary" : ""}" onclick="${call.replace("%P", "Cash")}">Cash</button>
    </div>`;
}
function showReceipt(tableId, pay) {
  const t = state.tables.find(x => x.id === tableId);
  if (!t || !t.items.length) return;
  if (!t.billNo) t.billNo = nextBillNo();
  t.fiscal = { ...genFiscal(), ...(t.fiscal || {}) }; // дозаполняем недостающие поля, существующие сохраняем
  pay = pay || "Card";
  t.pay = pay; // запоминаем выбранный способ оплаты (для отчёта)
  save();
  openModal(receiptHtml(receiptFromTable(t), pay) +
    payToggleHtml(`showReceipt('${tableId}', '%P')`, pay) + `
    <div class="modal-actions column receipt-actions">
      <button class="btn btn-primary btn-block" onclick="printReceiptToPrinter('${tableId}','${pay}')">${icon("print", 20)} Друк на принтер</button>
      <button class="btn btn-block" onclick="printReceipt()">Друк через браузер</button>
      <button class="btn btn-success btn-block" onclick="closeModal(); confirmCloseTable('${tableId}')">${icon("check", 18)} Сплачено і закрити</button>
      <button class="btn btn-block" onclick="closeModal()">Закрити</button>
    </div>`);
}
function receiptFromTable(t) {
  return { tableName: t.name, items: t.items, billNo: t.billNo, fiscal: t.fiscal, closedAt: new Date().toISOString() };
}
function receiptHtml(rc, pay) {
  const s = state.settings;
  pay = pay || "Card";
  const f = { ...genFiscal(), ...(rc.fiscal || {}) };
  const dt = fmtControlDateTime(rc.closedAt);
  const r2 = n => Math.round(n * 100) / 100;
  const total = rc.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  // группировка по ставкам НДС
  const groups = {};
  rc.items.forEach(i => { const r = i.vat ?? 6; groups[r] = (groups[r] || 0) + i.price * i.qty; });
  const rates = Object.keys(groups).map(Number).sort((a, b) => b - a);
  let totVat = 0, totExcl = 0, totIncl = 0;
  const vatRows = rates.map(r => {
    const incl = r2(groups[r]), excl = r2(incl / (1 + r / 100)), vat = r2(incl - excl);
    totVat += vat; totExcl += excl; totIncl += incl;
    return `<div class="r-vat"><span>${vatLetter(r)} ${r}%</span><span>${euro(vat)}</span><span>${euro(excl)}</span><span>${euro(incl)}</span></div>`;
  }).join("");
  const itemRows = rc.items.map(i => `
    <div class="r-line">
      <span class="r-q">${i.qty}</span>
      <span class="r-d">${esc(receiptName(i.name))}</span>
      <span class="r-ep">${euro(i.price)}</span>
      <span class="r-tot">${euro(i.price * i.qty)}</span>
      <span class="r-vl">${vatLetter(i.vat ?? 6)}</span>
    </div>`).join("");
  return `
  <div class="receipt-print" id="receiptSheet">
    <div class="r-bar">BTW KASTICKET</div>
    <div class="r-head">
      <div class="r-store">${esc(s.restaurant || "RESTAURANT")}</div>
      ${s.address ? `<div class="r-sub r-addr">${esc(s.address)}</div>` : ""}
      ${s.city ? `<div class="r-sub">${esc(s.city)}</div>` : ""}
      ${s.vatNumber ? `<div class="r-sub">${esc(s.vatNumber)}</div>` : ""}
    </div>
    <div class="r-rule"></div>
    <div class="r-meta">
      <div class="r-mrow"><span>Tafel: ${esc(rc.tableName)}</span><span>${fmtReceiptDateTime(rc.closedAt)}</span></div>
      <div class="r-mrow"><span>Rek. nr: ${rc.billNo ?? "-"}</span><span>Stoel: 1</span></div>
      <div class="r-mrow"><span>FDM Ticket nr: ${f.fdmTicket}</span><span></span></div>
      <div class="r-mrow"><span>Bediend door: ${esc(s.server || f.operator)}</span><span></span></div>
    </div>
    <div class="r-rule"></div>
    <div class="r-line r-lhead"><span class="r-q">Qty</span><span class="r-d">Omschrijving</span><span class="r-ep">E.P.</span><span class="r-tot">Totaal</span><span class="r-vl"></span></div>
    ${itemRows}
    <div class="r-rule"></div>
    <div class="r-grandrow"><span>Algemeen Totaal:</span><span>${euro(total)}</span></div>
    <div class="r-payrow"><span>${esc(pay)}</span><span>${euro(total)}</span></div>
    <div class="r-rule"></div>
    <div class="r-vat r-vathead"><span>BTW%</span><span>BTW:</span><span>Excl.:</span><span>Incl.:</span></div>
    ${vatRows}
    <div class="r-rule"></div>
    <div class="r-vat r-vattot"><span>Totaal:</span><span>${euro(totVat)}</span><span>${euro(totExcl)}</span><span>${euro(totIncl)}</span></div>
    <div class="r-foot">Bedankt voor uw bezoek!</div>
    <div class="r-rule"></div>
    <div class="r-ctrl-title">Controlegegevens:</div>
    <div class="r-ctrl">
      <span>Fdm: ${f.fdm}</span><span>${dt}</span>
      <span>Vsc: ${f.vsc}</span><span>Hash: ${f.hash}</span>
      <span>Sce: ${f.sce}</span><span>NetwerkID: ${f.net}</span>
      <span>Ver.: ${f.ver}</span><span>PC: ${f.pc}</span>
      <span>Ticket: ${f.ticket}</span><span></span>
      <span class="full">${f.sig}</span>
    </div>
  </div>`;
}
function printReceipt() {
  const sheet = document.getElementById("receiptSheet");
  if (!sheet) return;
  let area = document.getElementById("printArea");
  if (!area) { area = document.createElement("div"); area.id = "printArea"; document.body.appendChild(area); }
  const clone = sheet.cloneNode(true);
  clone.removeAttribute("id");
  area.innerHTML = "";
  area.appendChild(clone);
  document.body.classList.add("printing");
  const cleanup = () => {
    document.body.classList.remove("printing");
    area.innerHTML = "";
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // даём браузеру отрисовать клон, затем печать
  setTimeout(() => window.print(), 120);
}

// ====== EPSON ePOS-Print (прямой Wi-Fi печать, напр. TM-m30III) ======
const POS_W = 48; // символов в строке (80мм, шрифт A)
const posRep = (c, n) => c.repeat(Math.max(0, n));
function posCenter(s) { s = String(s).slice(0, POS_W); const pad = POS_W - s.length, l = Math.floor(pad / 2); return posRep(" ", l) + s + posRep(" ", pad - l); }
function posDiv() { return posRep("-", POS_W); }
function posLR(l, r) {
  l = String(l); r = String(r);
  let sp = POS_W - l.length - r.length;
  if (sp < 1) { l = l.slice(0, Math.max(0, POS_W - r.length - 1)); sp = Math.max(1, POS_W - l.length - r.length); }
  return l + posRep(" ", sp) + r;
}
function posItem(qty, name, ep, total, vat) {
  const nameW = POS_W - 3 - 1 - 7 - 8 - 2; // =27
  return String(qty).padStart(3) + " " + String(name).slice(0, nameW).padEnd(nameW) +
    String(ep).padStart(7) + String(total).padStart(8) + String(vat).padStart(2);
}
function posVat(c1, c2, c3, c4) {
  return String(c1).slice(0, 8).padEnd(8) + String(c2).padStart(13) + String(c3).padStart(13) + String(c4).padStart(14);
}
function posCols(l, r, lw) { return String(l).slice(0, lw).padEnd(lw) + String(r); }
// одна строка ePOS-Print XML
function eposLine(content, opt) {
  opt = opt || {};
  const pre = opt.align ? `<text align="${opt.align}"/>` : "";
  let attrs = "";
  if (opt.bold) attrs += ` em="true"`;
  if (opt.reverse) attrs += ` reverse="true"`;
  return pre + `<text${attrs}>${esc(content)}&#10;</text><text em="false" reverse="false" align="left"/>`;
}
function eposEnvelope(body) {
  return `<?xml version="1.0" encoding="utf-8"?>` +
    `<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>` +
    `<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">` +
    body + `<feed line="3"/><cut type="feed"/></epos-print></s:Body></s:Envelope>`;
}
// общий расчёт НДС
function vatBreakdown(items) {
  const r2 = n => Math.round(n * 100) / 100;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const groups = {};
  items.forEach(i => { const r = i.vat ?? 6; groups[r] = (groups[r] || 0) + i.price * i.qty; });
  const rates = Object.keys(groups).map(Number).sort((a, b) => b - a);
  let tV = 0, tE = 0, tI = 0;
  const rows = rates.map(r => {
    const incl = r2(groups[r]), excl = r2(incl / (1 + r / 100)), vat = r2(incl - excl);
    tV += vat; tE += excl; tI += incl;
    return { rate: r, letter: vatLetter(r), vat, excl, incl };
  });
  return { total, rows, tV: r2(tV), tE: r2(tE), tI: r2(tI) };
}
// тело чека для принтера
function receiptEposBody(rc, pay) {
  pay = pay || "Card";
  const s = state.settings;
  const f = { ...genFiscal(), ...(rc.fiscal || {}) };
  const dt = fmtControlDateTime(rc.closedAt);
  const b = vatBreakdown(rc.items);
  let o = "";
  o += eposLine(posCenter("BTW KASTICKET"), { reverse: true, bold: true });
  o += eposLine(s.restaurant || "RESTAURANT", { align: "center", bold: true });
  if (s.address) o += eposLine(posCenter(String(s.address).toUpperCase()));
  if (s.city) o += eposLine(posCenter(s.city));
  if (s.vatNumber) o += eposLine(posCenter(s.vatNumber));
  o += eposLine(posDiv());
  o += eposLine(posLR("Tafel: " + rc.tableName, fmtReceiptDateTime(rc.closedAt)));
  o += eposLine(posLR("Rek. nr: " + (rc.billNo ?? "-"), "Stoel: 1"));
  o += eposLine("FDM Ticket nr: " + f.fdmTicket);
  o += eposLine("Bediend door: " + (s.server || f.operator));
  o += eposLine(posDiv());
  o += eposLine(posItem("Qty", "Omschrijving", "E.P.", "Totaal", ""), { bold: true });
  rc.items.forEach(i => { o += eposLine(posItem(i.qty, receiptName(i.name), euro(i.price), euro(i.price * i.qty), vatLetter(i.vat ?? 6))); });
  o += eposLine(posDiv());
  o += eposLine(posLR("Algemeen Totaal:", euro(b.total)), { bold: true });
  o += eposLine(posLR(pay, euro(b.total)), { bold: true });
  o += eposLine(posDiv());
  o += eposLine(posVat("BTW%", "BTW:", "Excl.:", "Incl.:"), { bold: true });
  b.rows.forEach(v => { o += eposLine(posVat(v.letter + " " + v.rate + "%", euro(v.vat), euro(v.excl), euro(v.incl))); });
  o += eposLine(posDiv());
  o += eposLine(posVat("Totaal:", euro(b.tV), euro(b.tE), euro(b.tI)), { bold: true });
  o += eposLine(posCenter("Bedankt voor uw bezoek!"));
  o += eposLine(posDiv());
  o += eposLine("Controlegegevens:", { bold: true });
  o += eposLine(posCols("Fdm: " + f.fdm, dt, 24));
  o += eposLine(posCols("Vsc: " + f.vsc, "Hash: " + f.hash, 24));
  o += eposLine(posCols("Sce: " + f.sce, "NetwerkID: " + f.net, 24));
  o += eposLine(posCols("Ver.: " + f.ver, "PC: " + f.pc, 24));
  o += eposLine("Ticket: " + f.ticket);
  o += eposLine(f.sig);
  return o;
}
// тело Z-отчёта для принтера
function reportEposBody(dateStr) {
  const s = state.settings;
  const entries = state.history.filter(h => localDateKey(h.closedAt) === dateStr);
  let total = 0; const pay = { Card: 0, Cash: 0 }; const items = [];
  entries.forEach(h => { total += h.total; pay[h.pay === "Cash" ? "Cash" : "Card"] += h.total; (h.items || []).forEach(i => items.push(i)); });
  const b = vatBreakdown(items);
  const [y, m, d] = dateStr.split("-");
  let o = "";
  o += eposLine(posCenter("Z-RAPPORT"), { reverse: true, bold: true });
  o += eposLine(s.restaurant || "RESTAURANT", { align: "center", bold: true });
  o += eposLine(posCenter(`${d}.${m}.${y}`));
  o += eposLine(posDiv());
  o += eposLine(posLR("Tickets:", String(entries.length)), { bold: true });
  o += eposLine(posLR("Omzet:", euro(total)), { bold: true });
  o += eposLine(posDiv());
  o += eposLine(posLR("Card", euro(pay.Card)));
  o += eposLine(posLR("Cash", euro(pay.Cash)));
  o += eposLine(posDiv());
  o += eposLine(posVat("BTW%", "BTW:", "Excl.:", "Incl.:"), { bold: true });
  b.rows.forEach(v => { o += eposLine(posVat(v.letter + " " + v.rate + "%", euro(v.vat), euro(v.excl), euro(v.incl))); });
  o += eposLine(posDiv());
  o += eposLine(posVat("Totaal:", euro(b.tV), euro(b.tE), euro(b.tI)), { bold: true });
  return o;
}
// отправка на принтер
async function sendToPrinter(xml) {
  const ip = (state.settings.printerIp || "").trim();
  if (!ip) { toast("Вкажіть IP принтера в Налаштуваннях"); go("settings"); return; }
  const url = `https://${ip}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000`;
  toast("Друк…");
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/xml; charset=utf-8", "SOAPAction": "\"\"" }, body: xml });
    const txt = await res.text();
    if (/success\s*=\s*"true"/i.test(txt)) toast("Надіслано на принтер ✓");
    else { const m = txt.match(/code\s*=\s*"([^"]+)"/i); toast("Принтер: помилка" + (m ? " (" + m[1] + ")" : "")); }
  } catch (e) {
    toast("Немає зв'язку з принтером. Перевірте Wi-Fi, IP і довіру до https://" + ip);
  }
}
function printReceiptToPrinter(tableId, pay) {
  const t = state.tables.find(x => x.id === tableId);
  if (!t || !t.items.length) return;
  sendToPrinter(eposEnvelope(receiptEposBody(receiptFromTable(t), pay)));
}
function printHistToPrinter(id, pay) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;
  sendToPrinter(eposEnvelope(receiptEposBody(h, pay)));
}
function printReportToPrinter(dateStr) {
  sendToPrinter(eposEnvelope(reportEposBody(dateStr)));
}
function testPrinter() {
  let o = "";
  o += eposLine(posCenter("VYSHNIA HOUSE"), { reverse: true, bold: true });
  o += eposLine(posCenter("Test print OK"));
  o += eposLine(posCenter(fmtControlDateTime(new Date().toISOString())));
  o += eposLine(posDiv());
  o += eposLine(posItem("1", "Test item", "0,00", "0,00", "C"));
  sendToPrinter(eposEnvelope(o));
}


// ====== VIEW: MENU ======
function viewMenu() {
  const cats = {};
  state.menu.forEach(m => { (cats[m.category || "Інше"] ||= []).push(m); });
  const keys = Object.keys(cats);

  const body = keys.length ? keys.map(cat => `
    <div class="menu-cat">${esc(cat)}</div>
    ${cats[cat].map(m => `
      <div class="card menu-item">
        <div class="menu-item-info">
          <div class="menu-item-name">${esc(m.name)}</div>
          <div class="menu-item-price muted">${money(m.price)}</div>
        </div>
        <button class="icon-btn" onclick="editDish('${m.id}')" aria-label="Змінити">${icon("edit", 18)}</button>
        <button class="icon-btn danger" onclick="deleteDish('${m.id}')" aria-label="Видалити">${icon("trash", 18)}</button>
      </div>`).join("")}
  `).join("") : emptyState("menu", "Меню порожнє", "Додайте страви, щоб додавати їх у замовлення столиків.", "Додати страву", "editDish()");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("menu", 22)} Меню</div>
      <button class="icon-btn" onclick="editDish()" aria-label="Додати страву">${icon("plus", 22)}</button>
    </header>
    <div class="page">${body}</div>`;
}

function editDish(id) {
  const m = id ? state.menu.find(x => x.id === id) : null;
  const cats = [...new Set(state.menu.map(x => x.category).filter(Boolean))];
  const datalist = cats.map(c => `<option value="${esc(c)}"></option>`).join("");
  const dvat = m ? (m.vat ?? 6) : 6;
  openModal(`
    <div class="modal-head"><h2>${m ? "Змінити страву" : "Нова страва"}</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field"><span>Назва</span><input id="dName" type="text" value="${m ? esc(m.name) : ""}" placeholder="Напр. Борщ" autocomplete="off"></label>
    <label class="field"><span>Ціна</span><input id="dPrice" type="number" inputmode="decimal" min="0" step="0.01" value="${m ? m.price : ""}" placeholder="0"></label>
    <label class="field"><span>ПДВ (BTW)</span><select id="dVat">
      <option value="6"${dvat === 6 ? " selected" : ""}>6% (C) — їжа, безалкогольне</option>
      <option value="21"${dvat === 21 ? " selected" : ""}>21% (A) — алкоголь</option>
    </select></label>
    <label class="field"><span>Категорія</span><input id="dCat" type="text" list="catList" value="${m ? esc(m.category || "") : ""}" placeholder="Напр. Кухня" autocomplete="off"><datalist id="catList">${datalist}</datalist></label>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Скасувати</button>
      <button class="btn btn-primary" onclick="saveDish('${id || ""}')">Зберегти</button>
    </div>`);
  setTimeout(() => $("#dName")?.focus(), 50);
}
function saveDish(id) {
  const name = ($("#dName").value || "").trim();
  const price = Math.max(0, parseFloat($("#dPrice").value) || 0);
  const category = ($("#dCat").value || "").trim() || "Інше";
  const vat = parseInt($("#dVat").value) === 21 ? 21 : 6;
  if (!name) { toast("Введіть назву"); return; }
  if (id) {
    const m = state.menu.find(x => x.id === id);
    if (m) { m.name = name; m.price = price; m.category = category; m.vat = vat; }
  } else {
    state.menu.push({ id: uid(), name, price, category, vat });
  }
  save();
  closeModal();
  render();
}
function deleteDish(id) {
  const m = state.menu.find(x => x.id === id);
  if (!m) return;
  openModal(`
    <div class="modal-head"><h2>Видалити страву?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">«${esc(m.name)}» буде видалено з меню. Вже додані в замовлення позиції залишаться.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Скасувати</button>
      <button class="btn btn-danger" onclick="doDeleteDish('${id}')">Видалити</button>
    </div>`);
}
function doDeleteDish(id) {
  state.menu = state.menu.filter(x => x.id !== id);
  save();
  closeModal();
  render();
}

// ====== VIEW: HISTORY ======
function dayLabel(key) {
  const today = localDateKey(new Date().toISOString());
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  if (key === today) return "Сьогодні";
  if (key === localDateKey(yd.toISOString())) return "Вчора";
  const [Y, M, D] = key.split("-");
  const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  return `${parseInt(D)} ${months[parseInt(M) - 1]} ${Y}`;
}
function histItemHtml(h) {
  const qty = (h.items || []).reduce((n, i) => n + i.qty, 0);
  const t = new Date(h.closedAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  return `
    <button class="card hist-item" onclick="showHistReceipt('${h.id}')">
      <div class="hist-info">
        <div class="hist-name">${esc(h.tableName)}</div>
        <div class="hist-meta muted">${icon("clock", 13, "dim")} ${t} · ${qty} ${plural(qty, "позиція", "позиції", "позицій")} · ${esc(h.pay || "Card")}</div>
      </div>
      <div class="hist-sum">${money(h.total)}</div>
      <span class="hist-chev">${icon("chevronRight", 18, "dim")}</span>
    </button>`;
}
function viewHistory() {
  const list = [...state.history].sort((a, b) => String(b.closedAt).localeCompare(String(a.closedAt)));
  if (!list.length) {
    return `
    <header class="topbar">
      <div class="topbar-title">${icon("history", 22)} Історія</div>
      <button class="icon-btn" onclick="showDayReport()" aria-label="Звіт за день">${icon("report", 20)}</button>
    </header>
    <div class="page">${emptyState("history", "Історія порожня", "Сюди потрапляють закриті (сплачені) чеки.", "", "")}</div>`;
  }
  // группировка по дням (новые дни сверху)
  const groups = []; const idx = {};
  list.forEach(h => {
    const k = localDateKey(h.closedAt);
    if (!(k in idx)) { idx[k] = groups.length; groups.push({ key: k, items: [] }); }
    groups[idx[k]].items.push(h);
  });
  const body = groups.map(g => {
    const dayTotal = g.items.reduce((s, h) => s + h.total, 0);
    return `
      <div class="hist-day">
        <span>${dayLabel(g.key)}</span>
        <span>${money(dayTotal)} · ${g.items.length} ${plural(g.items.length, "чек", "чеки", "чеків")}</span>
      </div>
      ${g.items.map(histItemHtml).join("")}`;
  }).join("");

  return `
    <header class="topbar">
      <div class="topbar-title">${icon("history", 22)} Історія</div>
      <button class="icon-btn" onclick="showDayReport()" aria-label="Звіт за день">${icon("report", 20)}</button>
      <button class="icon-btn danger" onclick="confirmClearHistory()" aria-label="Очистити">${icon("trash", 20)}</button>
    </header>
    <div class="page">
      <div class="hist-summary card">${icon("wallet", 18)} Усього за весь час: <b>${money(list.reduce((s, h) => s + h.total, 0))}</b> · ${list.length} ${plural(list.length, "чек", "чеки", "чеків")}</div>
      <div class="list-gap">${body}</div>
    </div>`;
}
function showHistReceipt(id, pay) {
  const h = state.history.find(x => x.id === id);
  if (!h) return;
  pay = pay || "Card";
  h.fiscal = { ...genFiscal(), ...(h.fiscal || {}) }; // дозаполнить старые чеки
  save();
  openModal(receiptHtml(h, pay) +
    payToggleHtml(`showHistReceipt('${id}', '%P')`, pay) + `
    <div class="modal-actions column receipt-actions">
      <button class="btn btn-primary btn-block" onclick="printHistToPrinter('${id}','${pay}')">${icon("print", 20)} Друк на принтер</button>
      <button class="btn btn-block" onclick="printReceipt()">Друк через браузер</button>
      <button class="btn btn-block" onclick="closeModal()">Закрити</button>
    </div>`);
}
function confirmClearHistory() {
  openModal(`
    <div class="modal-head"><h2>Очистити історію?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <p class="modal-text">Усі збережені чеки буде видалено. Цю дію не можна скасувати.</p>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Скасувати</button>
      <button class="btn btn-danger" onclick="clearHistory()">Очистити</button>
    </div>`);
}
function clearHistory() {
  state.history = [];
  save();
  closeModal();
  render();
  toast("Історію очищено");
}

// ====== VIEW: SETTINGS ======
function viewSettings() {
  const s = state.settings;
  return `
    <header class="topbar"><div class="topbar-title">${icon("settings", 22)} Налаштування</div></header>
    <div class="page">
      <div class="card settings-card">
        <label class="field"><span>Назва закладу</span><input id="setName" type="text" value="${esc(s.restaurant)}"></label>
        <label class="field"><span>Адреса</span><input id="setAddr" type="text" value="${esc(s.address)}" placeholder="напр. Oude Koornmarkt 44A"></label>
        <label class="field"><span>Місто / індекс</span><input id="setCity" type="text" value="${esc(s.city || "")}" placeholder="напр. 2000 Antwerpen"></label>
        <label class="field"><span>BTW-номер (ПДВ)</span><input id="setVat" type="text" value="${esc(s.vatNumber || "")}" placeholder="напр. BE1026823291"></label>
        <label class="field"><span>Телефон</span><input id="setPhone" type="text" value="${esc(s.phone)}" placeholder="необов'язково"></label>
        <label class="field"><span>Bediend door (офіціант, для чека)</span><input id="setServer" type="text" value="${esc(s.server || "")}" placeholder="необов'язково"></label>
        <label class="field"><span>Валюта</span><input id="setCur" type="text" maxlength="6" value="${esc(s.currency)}"></label>
        <button class="btn btn-primary btn-block" onclick="saveSettings()">${icon("check", 18)} Зберегти</button>
      </div>
      <div class="card settings-card" style="margin-top:12px">
        <div style="font-weight:800">${icon("print", 18)} Принтер (Wi-Fi)</div>
        <label class="field"><span>IP-адреса принтера Epson</span><input id="setPrinterIp" type="text" inputmode="decimal" value="${esc(s.printerIp || "")}" placeholder="напр. 192.168.1.50"></label>
        <button class="btn btn-block" onclick="saveSettings()">${icon("check", 18)} Зберегти IP</button>
        <button class="btn btn-primary btn-block" onclick="testPrinter()">${icon("print", 18)} Тест друку</button>
        <div class="muted" style="font-size:13px">Принтер Epson TM-m30III має бути в тій самій Wi-Fi, що й iPad. <b>Перший раз:</b> відкрийте <b>https://[IP принтера]</b> у Safari і натисніть «Все одно відкрити», щоб довірити принтер — інакше друк блокується захистом.</div>
      </div>
      <div class="card settings-card" style="margin-top:12px">
        <div style="font-weight:800">Резервна копія</div>
        <div class="muted" style="font-size:13px;margin-top:-6px">Дані зберігаються лише на цьому пристрої. Регулярно завантажуйте копію — щоб не втратити меню й історію та переносити на інший планшет.</div>
        <button class="btn btn-block" onclick="exportBackup()">${icon("download", 18)} Завантажити копію (.json)</button>
        <button class="btn btn-block" onclick="importBackup()">${icon("upload", 18)} Відновити з файлу</button>
      </div>
      <div class="muted footnote">Застосунок працює офлайн. Дані зберігаються локально на цьому пристрої. Ширина чека&nbsp;— 80&nbsp;мм.</div>
    </div>`;
}
function saveSettings() {
  const s = state.settings;
  s.restaurant = ($("#setName").value || "").trim() || "Vyshnia House";
  s.address = ($("#setAddr").value || "").trim();
  s.city = ($("#setCity").value || "").trim();
  s.vatNumber = ($("#setVat").value || "").trim();
  s.phone = ($("#setPhone").value || "").trim();
  s.server = ($("#setServer").value || "").trim();
  { const ip = $("#setPrinterIp"); if (ip) s.printerIp = (ip.value || "").trim(); }
  s.currency = ($("#setCur").value || "").trim() || "€";
  save();
  toast("Налаштування збережено");
  render();
}

// ====== BACKUP / RESTORE ======
function exportBackup() {
  try {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const d = new Date(), p = x => String(x).padStart(2, "0");
    const a = document.createElement("a");
    a.href = url;
    a.download = `vyshnia-kasa-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast("Резервну копію завантажено");
  } catch { toast("Не вдалося створити копію"); }
}
let pendingBackup = null;
function importBackup() {
  const inp = document.createElement("input");
  inp.type = "file"; inp.accept = "application/json,.json";
  inp.addEventListener("change", () => {
    const file = inp.files && inp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); }
      catch { toast("Не вдалося прочитати файл"); return; }
      if (!parsed || typeof parsed !== "object" || (!parsed.menu && !parsed.history && !parsed.tables)) {
        toast("Невірний файл копії"); return;
      }
      pendingBackup = parsed;
      const cnt = (parsed.menu || []).length, hist = (parsed.history || []).length;
      openModal(`
        <div class="modal-head"><h2>Відновити з копії?</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
        <p class="modal-text">Поточні дані буде <b>замінено</b> даними з файлу:<br>меню — ${cnt} позицій, історія — ${hist} чеків.</p>
        <div class="modal-actions">
          <button class="btn" onclick="closeModal()">Скасувати</button>
          <button class="btn btn-primary" onclick="applyBackup()">Відновити</button>
        </div>`);
    };
    reader.readAsText(file);
  });
  inp.click();
}
function applyBackup() {
  if (!pendingBackup) return closeModal();
  state = {
    ...structuredClone(DEFAULT_STATE),
    ...pendingBackup,
    settings: { ...DEFAULT_STATE.settings, ...(pendingBackup.settings || {}) },
  };
  pendingBackup = null;
  save();
  closeModal();
  go("tables");
  render();
  toast("Дані відновлено з копії");
}

// ====== DAILY REPORT (Z) ======
function localDateKey(iso) {
  const d = new Date(iso), p = x => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function showDayReport(dateStr) {
  dateStr = dateStr || localDateKey(new Date().toISOString());
  openModal(`
    <div class="modal-head"><h2>Денний звіт (Z)</h2><button class="icon-btn" onclick="closeModal()">${icon("x", 20)}</button></div>
    <label class="field"><span>Дата</span><input type="date" id="repDate" value="${dateStr}" onchange="showDayReport(this.value)"></label>
    ${dayReportSheet(dateStr)}
    <div class="modal-actions column receipt-actions">
      <button class="btn btn-primary btn-block" onclick="printReportToPrinter('${dateStr}')">${icon("print", 20)} Друк на принтер</button>
      <button class="btn btn-block" onclick="printReceipt()">Друк через браузер</button>
      <button class="btn btn-block" onclick="closeModal()">Закрити</button>
    </div>`);
}
function dayReportSheet(dateStr) {
  const s = state.settings;
  const entries = state.history.filter(h => localDateKey(h.closedAt) === dateStr);
  const r2 = n => Math.round(n * 100) / 100;
  let total = 0; const payAgg = { Card: 0, Cash: 0 }; const groups = {};
  entries.forEach(h => {
    total += h.total;
    payAgg[h.pay === "Cash" ? "Cash" : "Card"] += h.total;
    (h.items || []).forEach(i => { const r = i.vat ?? 6; groups[r] = (groups[r] || 0) + i.price * i.qty; });
  });
  const rates = Object.keys(groups).map(Number).sort((a, b) => b - a);
  let tV = 0, tE = 0, tI = 0;
  const vatRows = rates.map(r => {
    const incl = r2(groups[r]), excl = r2(incl / (1 + r / 100)), vat = r2(incl - excl);
    tV += vat; tE += excl; tI += incl;
    return `<div class="r-vat"><span>${vatLetter(r)} ${r}%</span><span>${euro(vat)}</span><span>${euro(excl)}</span><span>${euro(incl)}</span></div>`;
  }).join("");
  const [y, m, d] = dateStr.split("-");
  return `
  <div class="receipt-print" id="receiptSheet">
    <div class="r-bar">Z-RAPPORT</div>
    <div class="r-head">
      <div class="r-store">${esc(s.restaurant || "")}</div>
      <div class="r-sub">${d}.${m}.${y}</div>
    </div>
    <div class="r-rule"></div>
    <div class="r-grandrow"><span>Чеків / Tickets</span><span>${entries.length}</span></div>
    <div class="r-grandrow"><span>Виручка / Omzet</span><span>${euro(total)}</span></div>
    <div class="r-rule"></div>
    <div class="r-mrow"><span>Card</span><span>${euro(payAgg.Card)}</span></div>
    <div class="r-mrow"><span>Cash</span><span>${euro(payAgg.Cash)}</span></div>
    <div class="r-rule"></div>
    <div class="r-vat r-vathead"><span>BTW%</span><span>BTW:</span><span>Excl.:</span><span>Incl.:</span></div>
    ${vatRows || `<div class="r-sub">—</div>`}
    <div class="r-rule"></div>
    <div class="r-vat r-vattot"><span>Totaal:</span><span>${euro(tV)}</span><span>${euro(tE)}</span><span>${euro(tI)}</span></div>
    <div class="r-foot">Z-rapport • ${esc(s.server || "")}</div>
  </div>`;
}

// expose for inline handlers
Object.assign(window, {
  go, addTable, saveNewTable, renameTable, saveRenameTable, changeQty,
  confirmCloseTable, closeTable, openDishPicker, filterDishes, addDish,
  showReceipt, printReceipt, editDish, saveDish, deleteDish, doDeleteDish,
  showHistReceipt, confirmClearHistory, clearHistory, saveSettings, closeModal,
  exportBackup, importBackup, applyBackup, showDayReport,
  printReceiptToPrinter, printHistToPrinter, printReportToPrinter, testPrinter,
  state, save, render, toast,
});

// ====== BOOT ======
document.getElementById("modalBg").addEventListener("click", e => { if (e.target.id === "modalBg") closeModal(); });
render();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
