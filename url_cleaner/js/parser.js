function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : text;
}

function parseUrl(text, decode) {
  urlText = extractUrl(text);
  const [prefix, suffix] = text.split(urlText);

  try {
    const url = new URL(urlText);
    const state = {
      base: url.origin + url.pathname,
      params: {},
      groups: {},
      fragment: url.hash ? url.hash.slice(1) : "",
      fragmentChecked: false,
      prefix: prefix,
      suffix: suffix,
    };

    url.searchParams.forEach((v, k) => {
      const group = getGroup(k);
      if (group) {
        if (!state.groups[group]) {
          state.groups[group] = { checked: false, params: [] };
        }
        state.groups[group].params.push(k);
      }
      state.params[k] = { value: encodeURIComponent(v), checked: v && !group, group };
    });

    return { success: true, state };
  } catch (e) {
    return { success: false, error: "Invalid URL" };
  }
}

function buildUrl(state, decode) {
  let u = state.base;
  const params = Object.entries(state.params)
    .filter(([_, v]) => v.checked)
    .map(([k, v]) => `${k}=${v.value}`);
  if (params.length) u += "?" + params.join("&");
  if (state.fragment && state.fragmentChecked) u += "#" + state.fragment;
  return decode ? decodeURIComponent(u) : u;
}
