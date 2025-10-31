/* App logic — v1.1 */
const CONFIG_DEFAULT = {
  webhook_url: "https://hook.eu1.make.com/r9caag2tefs1qt1m5c5peqirhyureo2j"
};

const EVENT_TYPES = [
  "Presenza",
  "Ferie",
  "Permesso",
  "Permesso 104",
  "Malattia",
  "Assenza non retribuita",
  "Straordinario",
  "Recupero",
  "Formazione"
];

const state = {
  config: { ...CONFIG_DEFAULT },
  employees: [],
  recent: JSON.parse(localStorage.getItem("recent_submissions") || "[]")
};

const $ = (s, el=document) => el.querySelector(s);

function setYear(){
  $("#year").textContent = new Date().getFullYear();
}

async function loadConfig(){
  try {
    const res = await fetch("./config.json", { cache: "no-store" });
    if(res.ok) state.config = { ...CONFIG_DEFAULT, ...(await res.json()) };
  } catch(e) {}
}

async function loadEmployees(){
  try {
    const res = await fetch("./employees.json", { cache: "no-store" });
    if(!res.ok) throw 0;
    state.employees = await res.json();
  } catch(e) {
    state.employees = [
      { id: "DIP001", name: "Mario Rossi" },
      { id: "DIP002", name: "Luisa Bianchi" },
      { id: "DIP003", name: "Paolo Verdi" }
    ];
  }
}

function fillSelects(){
  const empSel = $("#employee_id");
  state.employees.forEach(emp => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.id; // Mostra solo codice
    opt.dataset.name = emp.name || "";
    empSel.appendChild(opt);
  });
  const typeSel = $("#event_type");
  EVENT_TYPES.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSel.appendChild(opt);
  });
}

function initForm(){
  const d = $("#event_date");
  d.valueAsDate = new Date();
  document.getElementById("presence-form").addEventListener("submit", onSubmit);
  document.getElementById("btn-reset").addEventListener("click", () => document.getElementById("presence-form").reset());
  document.getElementById("btn-export").addEventListener("click", exportCSV);
  document.getElementById("btn-open-settings").addEventListener("click", () => document.getElementById("settings-modal").showModal());
  document.getElementById("btn-save-settings").addEventListener("click", saveSettings);
  document.getElementById("full_day").addEventListener("change", onFullDayToggle);
  onFullDayToggle();
  renderRecent();
}

function onFullDayToggle(){
  const full = document.getElementById("full_day").checked;
  const st = document.getElementById("start_time");
  const et = document.getElementById("end_time");
  st.disabled = full; et.disabled = full;
  if(full) { st.value = ""; et.value = ""; }
}

function pushRecent(entry){
  const rec = [entry, ...state.recent].slice(0, 100);
  state.recent = rec;
  localStorage.setItem("recent_submissions", JSON.stringify(rec));
  renderRecent();
}

function renderRecent(){
  const tbody = document.querySelector("#recent-table tbody");
  tbody.innerHTML = "";
  state.recent.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.event_date}</td>
      <td>${r.employee_id}</td>
      <td>${r.event_type}</td>
      <td>${r.hours ?? ""}</td>
      <td>${r.notes ?? ""}</td>
      <td><span class="badge ${r.status==='OK'?'ok': r.status==='ERR'?'err':'pending'}">${r.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function saveSettings(ev){
  ev.preventDefault();
  const url = document.getElementById("webhook_url").value.trim();
  if(url) state.config.webhook_url = url;
  document.getElementById("settings-modal").close();
}

function serializeForm(form){
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.full_day = !!fd.get("full_day");
  if(data.hours) data.hours = parseFloat(data.hours);
  data.sent_at = new Date().toISOString();
  data._hp = fd.get("website"); // honeypot
  return data;
}

async function postJSON(url, payload){
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "cors"
  });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function fallbackFormPOST(url, payload){
  const form = document.createElement("form");
  form.action = url;
  form.method = "POST";
  form.target = "_blank";
  form.style.display = "none";
  const inp = document.createElement("input");
  inp.type = "hidden";
  inp.name = "payload";
  inp.value = JSON.stringify(payload);
  form.appendChild(inp);
  document.body.appendChild(form);
  form.submit();
  setTimeout(() => form.remove(), 1000);
}

async function onSubmit(ev){
  ev.preventDefault();
  const form = ev.currentTarget;
  const msg = document.getElementById("form-msg");
  msg.textContent = "";

  if(document.getElementById("website").value) return;

  if(!form.checkValidity()){
    msg.textContent = "Controlla i campi obbligatori.";
    return;
  }

  const data = serializeForm(form);
  const payload = {
    source: "portieri-presenze-webapp",
    version: "1.1.0",
    employee_id: data.employee_id,
    event_date: data.event_date,
    event_type: data.event_type,
    full_day: data.full_day,
    start_time: data.start_time || "",
    end_time: data.end_time || "",
    hours: data.hours ?? null,
    notes: data.notes || "",
    sent_at: data.sent_at
  };

  msg.textContent = "Invio in corso...";
  const recentEntry = {
    event_date: payload.event_date,
    employee_id: payload.employee_id,
    event_type: payload.event_type,
    hours: payload.hours,
    notes: payload.notes,
    status: "pending"
  };
  pushRecent(recentEntry);

  try {
    await postJSON(state.config.webhook_url, payload);
    msg.textContent = "✅ Segnalazione inviata con successo.";
    recentEntry.status = "OK";
    pushRecent(recentEntry);
    form.reset();
    document.getElementById("event_date").valueAsDate = new Date();
    document.getElementById("full_day").checked = true; onFullDayToggle();
  } catch (e) {
    try {
      fallbackFormPOST(state.config.webhook_url, payload);
      msg.textContent = "⚠️ Invio effettuato con metodo alternativo (aperto in nuova scheda).";
      recentEntry.status = "OK";
      pushRecent(recentEntry);
    } catch(err) {
      msg.textContent = "❌ Errore nell'invio. Riprova più tardi.";
      recentEntry.status = "ERR";
      pushRecent(recentEntry);
    }
  }
}

function exportCSV(){
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const rows = state.recent.filter(r => (r.event_date || "").startsWith(`${yyyy}-${mm}`));
  const header = ["Data","Codice","Tipo","Ore","Note","Esito"];
  const lines = [header.join(";")];
  rows.forEach(r => {
    lines.push([r.event_date, r.employee_id, r.event_type, r.hours ?? "", (r.notes ?? "").replace(/\n/g," "), r.status].join(";"));
  });
  const blob = new Blob([lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `presenze_${yyyy}-${mm}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

(async function main(){
  setYear();
  await loadConfig();
  await loadEmployees();
  fillSelects();
  initForm();
  document.getElementById("webhook_url").value = state.config.webhook_url || "";
})();
