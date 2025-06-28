const GITHUB_OWNER = "opiumsex";
const GITHUB_REPO = "akerhizzex";
const BRANCH = "main"; // Укажи нужную ветку

const API_BASE = folder =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folder}?ref=${BRANCH}`;

let currentTab = 'assemblies';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab')[['assemblies','redesigns','about'].indexOf(tab)].classList.add('active');
  loadContent();
}

async function fetchPosts(folder) {
  try {
    const res = await fetch(API_BASE(folder));
    if (!res.ok) throw new Error(res.status);
    const items = await res.json();
    const posts = await Promise.all(items.map(async item => {
      if (item.type !== 'dir') return null;
      const res2 = await fetch(`${API_BASE(folder)}/${item.name}`);
      if (!res2.ok) return null;
      const files = await res2.json();
      const get = name => files.find(f => f.name === name)?.download_url;
      const [zag, post] = await Promise.all([
        fetch(get("zag.txt")).then(r => r.ok ? r.text() : ""),
        fetch(get("post.txt")).then(r => r.ok ? r.text() : "")
      ]);
      const banner = get("banner.png");
      const zip = files.find(f => f.name.endsWith(".zip"))?.download_url;
      return banner && zip ? {
        title: zag.trim(),
        description: post.trim(),
        banner,
        download: zip
      } : null;
    }));
    return posts.filter(p => p);
  } catch(err) {
    console.error("Ошибка загрузки:", err);
    return [];
  }
}

async function loadContent(){
  const app = document.getElementById("app");
  app.innerHTML = "<p>Загрузка...</p>";

  if (currentTab === "about") {
    app.innerHTML = `
      <div style="text-align:center">
        <a class="button" href="https://t.me/your_team_channel">Telegram</a>
        <a class="button" href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}">GitHub</a>
      </div><p style="margin-top:20px">
      Это приложение команды Akermansex Team. Здесь вы можете найти сборки и редизайны, доступные для скачивания.</p>`;
    return;
  }

  const folder = currentTab === "assemblies" ? "assembly" : "redesigns";
  const posts = await fetchPosts(folder);
  app.innerHTML = "";

  const input = document.createElement("input");
  input.className = "search";
  input.placeholder = "Поиск...";
  app.appendChild(input);

  const container = document.createElement("div");
  app.appendChild(container);

  function render(list){
    container.innerHTML = "";
    if (list.length === 0) {
      container.innerHTML = "<p>Постов не найдено.</p>";
      return;
    }
    list.forEach(p => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <img src="${p.banner}" alt="Banner">
        <h2>${p.title}</h2>
        <p>${p.description}</p>
        <a href="${p.download}" download class="button">Скачать</a>`;
      container.appendChild(div);
    });
  }

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    render(posts.filter(p => p.title.toLowerCase().includes(q)));
  });

  render(posts);
}

document.addEventListener("DOMContentLoaded", () => {
  loadContent();
  document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {}); // чтобы клики точно работают
  });
});
