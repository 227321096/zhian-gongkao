const questions = [
  {
    type: "资料分析",
    text: "某市 2025 年一季度公共服务支出为 128 亿元，同比增长 12.5%。若保持同等增速，2026 年一季度约为多少亿元？",
    options: ["139.4", "144.0", "151.2", "160.0"],
    answer: 1,
    explain: "128 x (1 + 12.5%) = 144，所以选 B。",
  },
  {
    type: "判断推理",
    text: "所有认真复盘的人都会提升正确率，小林认真复盘，因此可以推出什么？",
    options: ["小林一定上岸", "小林会提升正确率", "复盘没有意义", "正确率只由题量决定"],
    answer: 1,
    explain: "这是充分条件推理：认真复盘 -> 提升正确率，小林满足前件，可推出后件。",
  },
  {
    type: "言语理解",
    text: "填入句中最恰当的一项：长期学习需要稳定节奏，不能只靠一时的____。",
    options: ["兴起", "冲动", "爆发", "幻想"],
    answer: 2,
    explain: "语境强调短期高强度与长期稳定节奏的对比，“爆发”最贴切。",
  },
];

let currentQuestion = 0;
let answered = false;
let correctCount = 0;
let answeredCount = 0;
let savedCount = 38;

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 2,
      },
    });
  }
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
}

function renderQuestion() {
  const question = questions[currentQuestion];
  answered = false;
  document.getElementById("question-index").textContent = `${currentQuestion + 1} / ${questions.length}`;
  document.getElementById("question-type").textContent = question.type;
  document.getElementById("question-text").textContent = question.text;
  document.getElementById("answer-panel").hidden = true;
  document.getElementById("mark-wrong").classList.remove("is-marked");

  const optionList = document.getElementById("option-list");
  optionList.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.type = "button";
    button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><span>${option}</span>`;
    button.addEventListener("click", () => chooseOption(index));
    optionList.appendChild(button);
  });
}

function chooseOption(index) {
  if (answered) return;

  const question = questions[currentQuestion];
  const buttons = document.querySelectorAll(".option-btn");
  const isCorrect = index === question.answer;
  answered = true;
  answeredCount += 1;
  if (isCorrect) correctCount += 1;

  buttons.forEach((button, optionIndex) => {
    if (optionIndex === question.answer) button.classList.add("correct");
    if (optionIndex === index && !isCorrect) button.classList.add("wrong");
  });

  document.getElementById("answer-panel").hidden = false;
  document.getElementById("answer-result").textContent = isCorrect ? "答对了" : "还差一点";
  document.getElementById("answer-explain").textContent = question.explain;
  updateStats();
}

function updateStats() {
  const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 76;
  document.getElementById("accuracy-label").textContent = `${accuracy}%`;
  document.getElementById("question-count").textContent = (2418 + answeredCount).toLocaleString("zh-CN");
  document.getElementById("saved-count").textContent = savedCount;

  const checkedTasks = document.querySelectorAll(".task-check:checked").length;
  const totalTasks = document.querySelectorAll(".task-check").length;
  const progress = 50 + Math.round((checkedTasks / totalTasks) * 40);
  document.getElementById("progress-label").textContent = `${progress}%`;
  document.querySelector(".ring-fill").style.strokeDashoffset = `${301.59 * (1 - progress / 100)}`;
}

window.addEventListener("DOMContentLoaded", () => {
  refreshIcons();
  renderQuestion();
  updateStats();

  document.querySelectorAll(".tab-bar button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.tab));
  });

  document.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.openView));
  });

  document.querySelectorAll(".task-check").forEach((checkbox) => {
    checkbox.addEventListener("change", updateStats);
  });

  document.getElementById("next-question").addEventListener("click", () => {
    currentQuestion = (currentQuestion + 1) % questions.length;
    renderQuestion();
  });

  document.getElementById("mark-wrong").addEventListener("click", (event) => {
    savedCount += 1;
    event.currentTarget.classList.add("is-marked");
    updateStats();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
});
