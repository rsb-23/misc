// Service worker registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

const inp = document.getElementById("og-url");
const out = document.getElementById("new-url");
const decodeCheck = document.getElementById("decode");
const keepExtraText = document.getElementById("keep-text");
const keepFragment = document.getElementById("keep-fragment");
const toast = document.getElementById("toast");
const configModal = document.getElementById("config-modal");
const configBtn = document.getElementById("config-btn");
const closeConfigBtn = document.getElementById("close-config");
const queryHeader = document.getElementById("query-header");
const paramsContainer = document.querySelector(".params");
const clearBtn = document.getElementById("clear-btn");
const actionButtons = document.getElementById("action-buttons");
const openBtn = document.getElementById("open-btn");
const copyBtn = document.getElementById("copy-btn");
const shareBtn = document.getElementById("share-btn");

let queryExpanded = false;

let state;

function getCleanUrl() {
  return document.querySelector(".cleaned").textContent.trim();
}

function updateCleanUrl() {
  const cleaned = buildUrl(state, decodeCheck.checked);
  if (!cleaned) {
    return;
  }
  const u = new URL(cleaned);

  document.querySelector("span.scheme").textContent = u.protocol + "//";
  document.querySelector("span.host").textContent = u.host;
  document.querySelector("span.path").textContent = u.pathname;
  document.querySelector("span.query").textContent = u.search;
  document.querySelector("span.hash").textContent = keepFragment.checked ? u.hash : "";

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
  queryHeader.removeAttribute("hidden");

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

  updateCollapsibleState();
}

function updateCollapsibleState() {
  if (queryExpanded) {
    paramsContainer.removeAttribute("hidden");
    document.querySelector(".collapsible-icon").textContent = "▼";
  } else {
    paramsContainer.setAttribute("hidden", "");
    document.querySelector(".collapsible-icon").textContent = "▶";
  }
}

function toggleCollapsible() {
  queryExpanded = !queryExpanded;
  updateCollapsibleState();
}

function copy() {
  const cleanUrl = getCleanUrl();
  navigator.clipboard.writeText(cleanUrl);
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

openBtn.addEventListener("click", () => {
  const cleanUrl = getCleanUrl();
  if (cleanUrl) {
    window.open(cleanUrl, "_blank");
  }
});

copyBtn.addEventListener("click", copy);

shareBtn.addEventListener("click", async () => {
  const cleanUrl = getCleanUrl();
  if (cleanUrl && navigator.share) {
    try {
      await navigator.share({
        title: "Clean URL",
        url: cleanUrl
      });
    } catch (err) {
      console.log("Share canceled");
    }
  } else {
    copy();
  }
});

function init() {
  inp.value = inp.value.trim();
  let inputText = inp.value;

  if (!inputText) {
    state = { params: {}, fragment: "", groups: {} };
    updateCleanUrl();
    clearBtn.setAttribute("hidden", "");
    actionButtons.setAttribute("hidden", "");
    return;
  }
  clearBtn.removeAttribute("hidden");
  actionButtons.removeAttribute("hidden");
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

clearBtn.addEventListener("click", () => {
  inp.value = "";
  state = { params: {}, fragment: "", groups: {} };
  updateCleanUrl();
  clearBtn.setAttribute("hidden", "");
  document.querySelector(".params").setAttribute("hidden", "");
  queryHeader.setAttribute("hidden", "");
});

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

configBtn.addEventListener("click", () => {
  configModal.setAttribute("data-visible", "true");
});

closeConfigBtn.addEventListener("click", () => {
  configModal.removeAttribute("data-visible");
});

configModal.addEventListener("click", (e) => {
  if (e.target === configModal) {
    configModal.removeAttribute("data-visible");
  }
});

queryHeader.addEventListener("click", toggleCollapsible);

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
