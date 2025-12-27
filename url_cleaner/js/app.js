// Service worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

const inp = document.getElementById("input");
const out = document.getElementById("output");
const decodeCheck = document.getElementById("decode");
const keepExtraText = document.getElementById("keep-text");
const keepFragment = document.getElementById("keep-fragment");
const toast = document.getElementById("toast");

let state;

function updateCleanUrl() {
  const cleaned = buildUrl(state, decodeCheck.checked);
  const u = new URL(cleaned);

  document.querySelector("span.scheme").textContent = u.protocol + "//";
  document.querySelector("span.host").textContent = u.host;
  document.querySelector("span.path").textContent = u.pathname;
  document.querySelector("span.query").textContent = u.search;
  document.querySelector("span.hash").textContent = u.hash;

  document.querySelector("span#prefix").textContent = keepExtraText.checked ? state.prefix : "";
  document.querySelector("span#suffix").textContent = keepExtraText.checked ? state.suffix : "";
}

function addCheckbox(param, id, label, checked) {
  paramCheck = param.querySelector("input");
  paramCheck.id = id;
  paramCheck.checked = checked;

  paramLabel = param.querySelector("label");
  paramLabel.for = id;
  paramLabel.textContent = label;
}

function render() {
  if (!(Object.keys(state.params).length || state.fragment)) {
    return;
  }
  allParams = document.querySelector(".params");
  allParams.innerHTML = "";
  allParams.removeAttribute("hidden");

  const template = document.querySelector("template").content.childNodes[1];

  // Render individual params not in groups
  Object.entries(state.params).forEach(([k, v]) => {
    if (!v.group) {
      param = template.cloneNode(true);
      id = `p_${k}`;

      addCheckbox(param, id, `${k}=${v.value}`, v.checked);
      allParams.appendChild(param);
    }
  });

  // Render groups
  Object.entries(state.groups).forEach(([group, data]) => {
    param = template.cloneNode(true);
    param.classList.add("group");
    id = `g_${group}`;

    addCheckbox(param, id, `${group} (${data.params.length})`, data.checked);
    allParams.appendChild(param);
  });
}

function copy() {
  var cleanUrl = document.querySelector(".cleaned").textContent;
  navigator.clipboard.writeText(cleanUrl);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function init() {
  let inputText = inp.value.trim();

  if (!inputText) {
    state = { params: {}, fragment: "", groups: {} };
    updateCleanUrl();
    return;
  }
  let parsedData = parseUrl(inputText);
  let errorBox = document.querySelector("#error-box");
  if (parsedData.success) {
    state = parsedData.state;
    state.fragmentChecked = keepFragment.checked;
    updateCleanUrl();
    render();
    errorBox.hidden = true;
  } else {
    errorBox.textContent = parsedData.error;
    errorBox.removeAttribute("hidden");
  }
}

decodeCheck.addEventListener("change", () => {
  if (Object.keys(state.params).length || state.fragment) {
    updateCleanUrl();
  }
});
keepExtraText.addEventListener("change", () => {
  if (inp.value.trim()) {
    updateCleanUrl();
  }
});
keepFragment.addEventListener("change", () => {
  state.fragmentChecked = keepFragment.checked;
  updateCleanUrl();
});

out.addEventListener("change", (e) => {
  if (e.target.type === "checkbox") {
    if (e.target.id === "p_fragment") {
      state.fragmentChecked = e.target.checked;
    } else if (e.target.id.startsWith("g_")) {
      const group = e.target.id.replace("g_", "");
      state.groups[group].checked = e.target.checked;
      state.groups[group].params.forEach((k) => {
        state.params[k].checked = e.target.checked;
      });
    } else {
      const key = e.target.id.replace("p_", "");
      state.params[key].checked = e.target.checked;
    }
    updateCleanUrl();
  }
});

document.addEventListener("DOMContentLoaded", init);
inp.addEventListener("input", init);
