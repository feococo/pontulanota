const CODES = {
  b: 1.0,
  "b-": 0.75,
  r: 0.5,
  "r-": 0.25,
  x: 0.0,
};

const modeInputs = Array.from(document.querySelectorAll('input[name="modo"]'));
const totalLabel = document.getElementById("totalLabel");
const totalInput = document.getElementById("totalInput");
const entradaLabel = document.getElementById("entradaLabel");
const entradaAlumno = document.getElementById("entradaAlumno");
const codigoLegend = document.getElementById("codigoLegend");
const resultado = document.getElementById("resultado");
const historial = document.getElementById("historial");
const alumnoLabel = document.getElementById("alumnoLabel");
const modoActivo = document.getElementById("modoActivo");
const helpText = document.getElementById("helpText");
const toggleRedondeo = document.getElementById("toggleRedondeo");
const btnIniciar = document.getElementById("btnIniciar");
const btnCalcular = document.getElementById("btnCalcular");
const btnReiniciar = document.getElementById("btnReiniciar");

let state = {
  started: false,
  mode: "preguntas",
  total: 0,
  alumno: 1,
};

function getMode() {
  return modeInputs.find((r) => r.checked)?.value || "preguntas";
}

function isAppleMobileDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function allowGlobalShortcuts() {
  return !isAppleMobileDevice();
}

function focusEntradaAlumno() {
  entradaAlumno.focus();
}

function setUiByMode() {
  const mode = getMode();
  state.mode = mode;
  if (mode === "preguntas") {
    totalLabel.textContent = "Total de preguntas";
    entradaLabel.textContent = "Aciertos del alumno";
    entradaAlumno.setAttribute("inputmode", "numeric");
    entradaAlumno.setAttribute("autocomplete", "off");
    entradaAlumno.placeholder = "Ejemplo: 17";
    modoActivo.textContent = "Modo: Preguntas";
    codigoLegend.hidden = true;
    codigoLegend.style.display = "none";
    if (!state.started) {
      helpText.innerHTML = "Ingresa el número de respuestas correctas";
    }
  } else {
    totalLabel.textContent = "Total de ejercicios";
    entradaLabel.textContent = "Código del alumno (sin comas)";
    entradaAlumno.setAttribute("inputmode", "text");
    entradaAlumno.setAttribute("autocomplete", "off");
    entradaAlumno.placeholder = "Ejemplo: bb-rx";
    modoActivo.textContent = "Modo: Ejercicios";
    codigoLegend.hidden = false;
    codigoLegend.style.display = "flex";
    if (!state.started) {
      helpText.innerHTML =
        'En ejercicios escribe un código sin comas, por ejemplo: <code>bb-rx</code>';
    }
  }
}

function tokenizeCode(input) {
  const txt = input.trim().toLowerCase().replaceAll(" ", "");
  const out = [];
  let i = 0;
  while (i < txt.length) {
    const c = txt[i];
    if ((c === "b" || c === "r") && txt[i + 1] === "-") {
      out.push(`${c}-`);
      i += 2;
    } else if (c === "b" || c === "r" || c === "x") {
      out.push(c);
      i += 1;
    } else {
      return null;
    }
  }
  return out;
}

function resetSession() {
  state.started = false;
  state.total = 0;
  state.alumno = 1;
  alumnoLabel.textContent = "Alumno 1";
  resultado.textContent = "";
  historial.innerHTML = "";
  entradaAlumno.value = "";
}

function alertMsg(msg) {
  window.alert(msg);
}

function formatCodigo(raw) {
  const tokens = tokenizeCode(raw);
  if (!tokens) {
    return raw.trim();
  }
  return tokens.join(" ");
}

function getNotaClass(nota) {
  return nota >= 5 ? "pass" : "fail";
}

function getRedondeo(nota) {
  return (Math.round(nota * 2) / 2).toFixed(1);
}

function renderResultado(nota, notaTxt, raw) {
  const notaClass = getNotaClass(nota);
  const redondeoTxt = getRedondeo(nota);
  resultado.classList.remove("pass", "fail");
  resultado.classList.add(notaClass);

  if (state.mode === "ejercicios") {
    resultado.innerHTML =
      `<span class="result-label">Nota alumno ${state.alumno}:</span>` +
      `<span class="result-score ${notaClass}">${notaTxt}</span>` +
      `<span class="result-code-label rounding-group">Redondeo:</span>` +
      `<span class="result-code ${notaClass} rounding-group">${redondeoTxt}</span>`;
    return;
  }

  resultado.innerHTML =
    `<span class="result-label">Nota del alumno ${state.alumno}:</span>` +
    `<span class="result-score ${notaClass}">${notaTxt}</span>` +
    `<span class="result-code-label rounding-group">Redondeo:</span>` +
    `<span class="result-code ${notaClass} rounding-group">${redondeoTxt}</span>`;
}

function buildHistorialItem(nota, notaTxt, raw) {
  const li = document.createElement("li");
  const notaClass = getNotaClass(nota);
  const redondeoTxt = getRedondeo(nota);

  if (state.mode === "ejercicios") {
    const codigo = formatCodigo(raw);
    li.className = "historial-item";
    li.innerHTML =
      `<span class="hist-alumno">Alumno ${state.alumno}</span>` +
      `<span class="hist-nota ${notaClass}">${notaTxt}</span>` +
      `<span class="hist-codigo ${notaClass} rounding-group">Redondeo ${redondeoTxt}</span>` +
      `<span class="hist-codigo">${codigo}</span>`;
    return li;
  }

  li.className = "historial-item";
  li.innerHTML =
    `<span class="hist-alumno">Alumno ${state.alumno}</span>` +
    `<span class="hist-nota ${notaClass}">${notaTxt}</span>` +
    `<span class="hist-codigo ${notaClass} rounding-group">Redondeo ${redondeoTxt}</span>` +
    `<span class="hist-codigo">Respuestas correctas ${raw}</span>`;
  return li;
}

function iniciarSesion() {
  setUiByMode();
  const total = Number.parseInt(totalInput.value.trim(), 10);
  if (!Number.isInteger(total) || total <= 0) {
    alertMsg("Introduce un total válido mayor que 0.");
    return;
  }

  state.started = true;
  state.total = total;
  state.alumno = 1;
  alumnoLabel.textContent = "Alumno 1";
  resultado.textContent = "Sesión iniciada.";
  historial.innerHTML = "";
  entradaAlumno.value = "";
  focusEntradaAlumno();

  if (state.mode === "ejercicios") {
    const valuePer = 10 / state.total;
    helpText.innerHTML =
      `Escala: <code>b</code>=100%, <code>b-</code>=75%, <code>r</code>=50%, ` +
      `<code>r-</code>=25%, <code>x</code>=0%.<br>Cada ejercicio vale ${valuePer.toFixed(2)} puntos.`;
  } else {
    helpText.innerHTML = "Ingresa el número de respuestas correctas";
  }
}

function calcularNota() {
  if (!state.started) {
    alertMsg("Primero pulsa Iniciar corrección.");
    return;
  }

  const raw = entradaAlumno.value.trim();
  if (!raw) {
    alertMsg("Introduce un valor para el alumno.");
    return;
  }

  let nota = 0;

  if (state.mode === "preguntas") {
    const aciertos = Number.parseInt(raw, 10);
    if (!Number.isInteger(aciertos) || aciertos < 0 || aciertos > state.total) {
      alertMsg(`Los aciertos deben ser un entero entre 0 y ${state.total}.`);
      return;
    }
    nota = (aciertos / state.total) * 10;
  } else {
    const codes = tokenizeCode(raw);
    if (!codes) {
      alertMsg("Código inválido. Usa solo: b, b-, r, r-, x.");
      return;
    }
    if (codes.length !== state.total) {
      alertMsg(`Debes introducir exactamente ${state.total} códigos.`);
      return;
    }
    const valuePer = 10 / state.total;
    nota = codes.reduce((sum, c) => sum + valuePer * CODES[c], 0);
  }

  const notaTxt = nota.toFixed(2);
  renderResultado(nota, notaTxt, raw);
  const li = buildHistorialItem(nota, notaTxt, raw);
  historial.prepend(li);

  state.alumno += 1;
  alumnoLabel.textContent = `Alumno ${state.alumno}`;
  entradaAlumno.value = "";
  focusEntradaAlumno();
}

function reiniciarSesion() {
  resetSession();
  setUiByMode();
  helpText.innerHTML = "Ingresa el número de respuestas correctas";
}

btnIniciar.addEventListener("click", () => {
  iniciarSesion();
});

btnCalcular.addEventListener("click", () => {
  calcularNota();
});

btnReiniciar.addEventListener("click", () => {
  reiniciarSesion();
});

toggleRedondeo.addEventListener("change", () => {
  document.body.classList.toggle("hide-rounding", !toggleRedondeo.checked);
});

modeInputs.forEach((r) => {
  r.addEventListener("change", () => {
    setUiByMode();
  });
});

totalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    iniciarSesion();
  }
});

entradaAlumno.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    calcularNota();
  }
});

document.addEventListener("keydown", (event) => {
  if (!allowGlobalShortcuts()) {
    return;
  }
  if (event.altKey && event.key === "1") {
    modeInputs.find((r) => r.value === "preguntas").checked = true;
    setUiByMode();
    return;
  }
  if (event.altKey && event.key === "2") {
    modeInputs.find((r) => r.value === "ejercicios").checked = true;
    setUiByMode();
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") {
    event.preventDefault();
    reiniciarSesion();
  }
});

setUiByMode();
document.body.classList.toggle("hide-rounding", !toggleRedondeo.checked);
