
const GITHUB_OWNER = "opiumsex";
const GITHUB_REPO = "akerhizzex";
const API_BASE = (folder) =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folder}`;

let currentTab = 'assemblies';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab')[['assemblies','redesigns','about'].indexOf(tab)].classList.add('active');
  loadContent();
}

async function fetchPosts(folder) {
  const res = await fetch(API_BASE(folder));
  const items = await res.json();
  const posts = await Promise.all(items.map(async (item) => {
    if (item.type !== 'dir') return null;
    const filesRes = await fetch(`${API_BASE(folder)}/${item.name}`);
    const files = await filesRes.json();
    const getFile = (name) => files.find(f => f.name === name)?.download_url;
    const [zag, post] = await Promise.all([
      fetch(getFile("zag.txt")).then(r => r.text()),
      fetch(getFile("post.txt")).then(r => r.text())
    ]);
    const banner = getFile("banner.png");
    const zip = files.find(f => f.name.endsWith(".zip"))?.download_url;
    return { title: zag.trim(), description: post.trim(), banner, download: zip };
  }));
  return posts.filter(Boolean);
}

async function loadContent() {
  const app = document.getElementById("app");
  app.innerHTML = "";
  if (currentTab === "about") {
    app.innerHTML = `
      <div style="text-align:center">
        <a class="button" href="https://t.me/your_team_channel">Telegram</a>
        <a class="button" href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}">GitHub</a>
      </div>
      <p style="margin-top: 20px">
        Это приложение команды Akermansex Team. Здесь вы можете найти сборки и редизайны, доступные для скачивания.
      </p>`;
    return;
  }

  const folder = currentTab === "assemblies" ? "assembly" : "redesigns";
  const posts = await fetchPosts(folder);
  const searchInput = document.createElement("input");
  searchInput.className = "search";
  searchInput.placeholder = "Поиск...";
  app.appendChild(searchInput);

  const postsContainer = document.createElement("div");
  app.appendChild(postsContainer);

  const render = (list) => {
    postsContainer.innerHTML = "";
    list.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <img src="${post.banner}" alt="">
        <h2>${post.title}</h2>
        <p>${post.description}</p>
        <a href="${post.download}" download class="button">Скачать</a>
      `;
      postsContainer.appendChild(div);
    });
  };

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    render(posts.filter(p => p.title.toLowerCase().includes(q)));
  });

  render(posts);
}

document.addEventListener("DOMContentLoaded", () => {
  loadContent();
});
