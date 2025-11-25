/* App logic — v1.3.4 */
const CONFIG_DEFAULT = {
  webhook_url: "https://hook.eu1.make.com/25pmcwrlyx8qbgd34n2vf0fxpnfyuekl"
};

const EVENT_TYPES = [
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
  employees: []
};

const $ = (s, el=document) => el.querySelector(s);

function setYear(){
  const y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();
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
      { id: "005" },{ id: "012" },{ id: "019" },{ id: "047" },{ id: "053" },
      { id: "056" },{ id: "061" },{ id: "062" },{ id: "070" },{ id: "077" },
      { id: "082" },{ id: "102" },{ id: "103" }
    ];
  }
}

function fillSelects(){
  const empSel = $("#employee_id");
  state.employees.forEach(emp => {
    const opt = document.createElement("option");
    opt.value = emp.id;
    opt.textContent = emp.id;
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
  if(d && !d.value) d.valueAsDate = new Date();
  $("#presence-form").addEventListener("submit", onSubmit);
  $("#btn-reset").addEventListener("click", () => $("#presence-form").reset());
  $("#full_day").addEventListener("change", onFullDayToggle);
  $("#event_type").addEventListener("change", onTypeChange);
  onFullDayToggle();
  onTypeChange();
}

function onFullDayToggle(){
  const full = $("#full_day").checked;
  const hours = $("#hours");
  const hint = $("#hours-hint");
  hours.disabled = full;
  hours.parentElement.style.opacity = full ? 0.5 : 1;
  hint.style.display = full ? "block" : "none";
  if(full) hours.value = "";
}

function onTypeChange(){
  const type = $("#event_type").value;
  const isMalattia = type === "Malattia";
  const isFerie = type === "Ferie";

  // Malattia: certificato
  const certField = $("#cert-field");
  const certInput = $("#medical_cert_number");
  certField.style.display = isMalattia ? "block" : "none";
  certInput.required = isMalattia;
  if(!isMalattia) certInput.value = "";

  // Ferie: range date obbligatorio
  const ferieWrap = $("#ferie-range");
  const ferieStart = $("#ferie_start");
  const ferieEnd = $("#ferie_end");
  ferieWrap.style.display = isFerie ? "block" : "none";
  ferieStart.required = isFerie;
  ferieEnd.required = isFerie;
  if(!isFerie){ ferieStart.value = ""; ferieEnd.value = ""; }
}

function serializeForm(form){
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.full_day = !!fd.get("full_day");
  if(data.hours) data.hours = parseFloat(data.hours);
  data.sent_at = new Date().toISOString();
  data._hp = fd.get("website");
  return data;
}

function validateBusinessRules(data){
  if(data.event_type === "Ferie"){
    if(!data.ferie_start || !data.ferie_end) return "Per le ferie è obbligatorio indicare data di inizio e fine.";
    if(data.ferie_start > data.ferie_end) return "Il periodo ferie non è valido: la data di inizio non può essere successiva alla data di fine.";
  }
  return "";
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
  const msg = $("#form-msg");
  msg.textContent = "";

  if($("#website").value) return;

  if(!form.checkValidity()){
    msg.textContent = "Controlla i campi obbligatori.";
    return;
  }

  const data = serializeForm(form);
  const ruleError = validateBusinessRules(data);
  if(ruleError){
    msg.textContent = ruleError;
    return;
  }

  const payload = {
    source: "portieri-presenze-webapp",
    version: "1.3.4",
    employee_id: data.employee_id,
    event_date: data.event_date,
    event_type: data.event_type,
    full_day: data.full_day,
    hours: data.hours ?? null,
    medical_cert_number: data.medical_cert_number || "",
    ferie_start: data.ferie_start || "",
    ferie_end: data.ferie_end || "",
    notes: data.notes || "",
    sent_at: data.sent_at
  };

  msg.textContent = "Invio in corso...";

  try {
    await postJSON(state.config.webhook_url, payload);
    msg.textContent = "✅ Richiesta inviata con successo.";
    form.reset();
    const d = $("#event_date"); if(d) d.valueAsDate = new Date();
    $("#full_day").checked = true; onFullDayToggle();
    onTypeChange();
  } catch (e) {
    try {
      fallbackFormPOST(state.config.webhook_url, payload);
      msg.textContent = "⚠️ Invio effettuato con metodo alternativo (aperto in nuova scheda).";
    } catch(err) {
      msg.textContent = "❌ Errore nell'invio. Riprova più tardi.";
    }
  }
}

(async function main(){
  setYear();
  await loadConfig();
  await loadEmployees();
  fillSelects();
  initForm();
})();