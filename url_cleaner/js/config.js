const trackerGroups = {
  "utm_*": ["utm_id", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"],
  "fbclid*": ["fbclid", "fb_action_ids", "fb_action_types", "fb_source", "fb_ref"],
  "gclid*": ["gclid", "gclsrc"],
  "_ga*": ["_ga", "_gac", "_gat", "_gid"],
  "mc_*": ["mc_cid", "mc_eid"],
  "gad_*": ["gad_campaignid", "gad_source"],
  singles: ["msclkid", "igshid", "twclid", "at_campaign", "at_medium", "_x_ads_", "_x_ns_", "rcm"],
};

function getGroup(key) {
  for (const [group, params] of Object.entries(trackerGroups)) {
    const matchedParam = params.find((p) => key.startsWith(p));
    if (matchedParam) {
      if (group !== "singles") {
        return group;
      }
      return `${matchedParam}*`;
    }
  }
  return null;
}
