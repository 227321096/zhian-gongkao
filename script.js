const STORAGE_KEY = "zhian-gongkao-state-v1";

const questions = [
  {
    id: "data-01",
    type: "资料分析",
    text: "某市 2025 年一季度公共服务支出为 128 亿元，同比增长 12.5%。若保持同等增速，2026 年一季度约为多少亿元？",
    options: ["139.4", "144.0", "151.2", "160.0"],
    answer: 1,
    explain: "128 x (1 + 12.5%) = 144，所以选 B。",
  },
  {
    id: "logic-01",
    type: "判断推理",
    text: "所有认真复盘的人都会提升正确率，小林认真复盘，因此可以推出什么？",
    options: ["小林一定上岸", "小林会提升正确率", "复盘没有意义", "正确率只由题量决定"],
    answer: 1,
    explain: "这是充分条件推理：认真复盘 -> 提升正确率，小林满足前件，可推出后件。",
  },
  {
    id: "verbal-01",
    type: "言语理解",
    text: "填入句中最恰当的一项：长期学习需要稳定节奏，不能只靠一时的____。",
    options: ["兴起", "冲动", "爆发", "幻想"],
    answer: 2,
    explain: "语境强调短期高强度与长期稳定节奏的对比，“爆发”最贴切。",
  },
  {
    id: "data-02",
    type: "资料分析",
    text: "某资料显示，A 类岗位报名人数 2400 人，计划招录 80 人，竞争比约为多少？",
    options: ["20:1", "24:1", "30:1", "36:1"],
    answer: 2,
    explain: "竞争比 = 报名人数 / 招录人数 = 2400 / 80 = 30，所以选 C。",
  },
  {
    id: "logic-02",
    type: "判断推理",
    text: "如果加强基层治理，就能提升公共服务效率。某地公共服务效率未提升，可以推出什么？",
    options: ["该地没有加强基层治理", "该地一定减少投入", "基层治理没有价值", "效率提升与治理无关"],
    answer: 0,
    explain: "命题为：加强基层治理 -> 提升效率。否定后件，可以推出否定前件。",
  },
];

const defaultState = {
  currentQuestionId: "data-01",
  activeFilter: "all",
  answeredCount: 0,
  correctCount: 0,
  wrongIds: [],
  savedIds: [],
  completedTaskIndexes: [1],
  history: {},
};

let state = loadState();
let deferredInstallPrompt = null;
let toastTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...saved };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 2,
      },
    });
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function setView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewName);
  });

  document.querySelectorAll(".tab-bar button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === viewName);
  });

  const titles = {
    home: "上岸计划",
    practice: "智能题库",
    courses: "系统课",
    profile: "我的",
  };
  document.getElementById("screen-title").textContent = titles[viewName];
  document.querySelector(".content").scrollTo({ top: 0, behavior: "smooth" });
}

function filteredQuestions() {
  if (state.activeFilter === "all") return questions;
  return questions.filter((question) => question.type === state.activeFilter);
}

function currentQuestion() {
  const filtered = filteredQuestions();
  return (
    filtered.find((question) => question.id === state.currentQuestionId) ||
    filtered[0] ||
    questions[0]
  );
}

function syncTaskChecks() {
  document.querySelectorAll(".task-check").forEach((checkbox, index) => {
    checkbox.checked = state.completedTaskIndexes.includes(index);
  });
}

function renderQuestion() {
  const filtered = filteredQuestions();
  const question = currentQuestion();
  state.currentQuestionId = question.id;
  const position = filtered.findIndex((item) => item.id === question.id) + 1;
  const history = state.history[question.id];

  document.getElementById("practice-title").textContent =
    state.activeFilter === "all" ? "智能混合练习" : `${state.activeFilter}专项`;
  document.getElementById("question-index").textContent = `${position} / ${filtered.length}`;
  document.getElementById("question-type").textContent = question.type;
  document.getElementById("question-text").textContent = question.text;
  document.getElementById("answer-panel").hidden = !history;
  document.getElementById("answer-result").textContent = history?.correct ? "答对了" : "还差一点";
  document.getElementById("answer-explain").textContent = question.explain;

  const optionList = document.getElementById("option-list");
  optionList.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.type = "button";
    button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><span>${option}</span>`;
    if (history) {
      if (index === question.answer) button.classList.add("correct");
      if (index === history.selected && !history.correct) button.classList.add("wrong");
    }
    button.addEventListener("click", () => chooseOption(index));
    optionList.appendChild(button);
  });

  renderMarkButton();
  updateStats();
  saveState();
}

function chooseOption(index) {
  const question = currentQuestion();
  if (state.history[question.id]) {
    showToast("这道题已经作答，可点下一题继续");
    return;
  }

  const correct = index === question.answer;
  state.history[question.id] = { selected: index, correct };
  state.answeredCount += 1;
  if (correct) {
    state.correctCount += 1;
  } else if (!state.wrongIds.includes(question.id)) {
    state.wrongIds.unshift(question.id);
  }

  renderQuestion();
  showToast(correct ? "答对了，节奏不错" : "已加入错题复盘");
}

function renderMarkButton() {
  const question = currentQuestion();
  const markButton = document.getElementById("mark-wrong");
  const isSaved = state.savedIds.includes(question.id);
  markButton.classList.toggle("is-marked", isSaved);
  document.getElementById("mark-label").textContent = isSaved ? "已收藏" : "收藏";
}

function updateStats() {
  const accuracy = state.answeredCount
    ? Math.round((state.correctCount / state.answeredCount) * 100)
    : 76;
  const checkedTasks = state.completedTaskIndexes.length;
  const totalTasks = document.querySelectorAll(".task-check").length;
  const progress = 42 + Math.round((checkedTasks / totalTasks) * 42) + Math.min(10, state.answeredCount * 2);

  document.getElementById("accuracy-label").textContent = `${accuracy}%`;
  document.getElementById("question-count").textContent = (2418 + state.answeredCount).toLocaleString("zh-CN");
  document.getElementById("wrong-count").textContent = 126 + state.wrongIds.length;
  document.getElementById("saved-count").textContent = 38 + state.savedIds.length;
  document.getElementById("session-label").textContent = `${state.answeredCount} 题`;
  document.getElementById("session-correct").textContent = state.correctCount;
  document.getElementById("session-wrong").textContent = state.wrongIds.length;
  document.getElementById("progress-label").textContent = `${Math.min(96, progress)}%`;
  document.querySelector(".ring-fill").style.strokeDashoffset = `${301.59 * (1 - Math.min(96, progress) / 100)}`;
  document.getElementById("hero-copy").textContent =
    state.wrongIds.length > 0
      ? `今天还有 ${state.wrongIds.length} 道错题待复盘，补上这一口就很稳。`
      : "距离省考还有 86 天，保持节奏就会看见岸。";
  renderReviewList();
}

function renderReviewList() {
  const list = document.getElementById("review-list");
  if (!list) return;

  const wrongQuestions = state.wrongIds
    .map((id) => questions.find((question) => question.id === id))
    .filter(Boolean)
    .slice(0, 3);

  if (!wrongQuestions.length) {
    list.innerHTML = `<p class="review-empty">目前没有新增错题。做错时这里会自动生成复盘清单。</p>`;
    return;
  }

  list.innerHTML = wrongQuestions
    .map(
      (question) => `
        <button class="review-item" data-review-id="${question.id}">
          <span>
            <strong>${question.type}</strong>
            <span>${question.text.slice(0, 30)}...</span>
          </span>
          <i data-lucide="chevron-right"></i>
        </button>
      `,
    )
    .join("");

  document.querySelectorAll("[data-review-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentQuestionId = button.dataset.reviewId;
      state.activeFilter = "all";
      saveState();
      syncFilterButtons();
      renderQuestion();
      setView("practice");
    });
  });
  refreshIcons();
}

function syncFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.activeFilter);
  });
}

function nextQuestion() {
  const filtered = filteredQuestions();
  const currentIndex = filtered.findIndex((item) => item.id === currentQuestion().id);
  const next = filtered[(currentIndex + 1) % filtered.length];
  state.currentQuestionId = next.id;
  renderQuestion();
}

function resetSession() {
  state = {
    ...state,
    answeredCount: 0,
    correctCount: 0,
    wrongIds: [],
    savedIds: [],
    history: {},
  };
  saveState();
  renderQuestion();
  showToast("本轮练习已重置");
}

function setupInstallPrompt() {
  const installStrip = document.getElementById("install-strip");
  const installAction = document.getElementById("install-action");
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;

  if (!isStandalone) installStrip.hidden = false;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installStrip.hidden = false;
  });

  installAction.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installStrip.hidden = true;
      return;
    }
    showToast("iPhone 用 Safari 分享按钮添加到主屏幕");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  syncTaskChecks();
  syncFilterButtons();
  refreshIcons();
  renderQuestion();
  setupInstallPrompt();

  document.querySelectorAll(".tab-bar button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.tab));
  });

  document.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.openView));
  });

  document.querySelectorAll(".task-check").forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked && !state.completedTaskIndexes.includes(index)) {
        state.completedTaskIndexes.push(index);
      }
      if (!checkbox.checked) {
        state.completedTaskIndexes = state.completedTaskIndexes.filter((item) => item !== index);
      }
      saveState();
      updateStats();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      state.currentQuestionId = filteredQuestions()[0].id;
      syncFilterButtons();
      renderQuestion();
    });
  });

  document.getElementById("next-question").addEventListener("click", nextQuestion);
  document.getElementById("reset-session").addEventListener("click", resetSession);

  document.getElementById("mark-wrong").addEventListener("click", () => {
    const question = currentQuestion();
    if (state.savedIds.includes(question.id)) {
      state.savedIds = state.savedIds.filter((id) => id !== question.id);
      showToast("已取消收藏");
    } else {
      state.savedIds.unshift(question.id);
      showToast("已加入收藏题");
    }
    saveState();
    renderMarkButton();
    updateStats();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
});
