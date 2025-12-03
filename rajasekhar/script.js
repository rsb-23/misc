async function loadStories(fileName) {
  const response = await fetch(fileName);
  const records = await response.json();

  const storyList = document.getElementById("storyList");
  const template = document.querySelector("template");

  Object.entries(records).forEach(([id, item]) => {
    if (item.description.length === 0) return;

    const storyItem = template.content.cloneNode(true);
    ytLink = storyItem.querySelector("h3 a");
    ytLink.textContent = item.title;
    ytLink.href = "https://youtu.be/" + item.id;

    const story = item.description
      .map((p) => (Array.isArray(p) ? `<ul>${p.map((li) => `<li>${li}</li>`).join("")}</ul>` : `<p>${p}</p>`))
      .join("");
    storyItem.querySelector("details").insertAdjacentHTML("beforeend", story);

    storyList.appendChild(storyItem);
  });
}
loadStories("video_data.json");
