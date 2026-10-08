const THEME_KEY = "kinutri_theme";

function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY) || "light";

  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  updateThemeButton(theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";

  localStorage.setItem(THEME_KEY, newTheme);
  applyTheme();
}

function updateThemeButton(theme) {
  const buttons = document.querySelectorAll(".theme-toggle");

  buttons.forEach(button => {
    button.textContent = theme === "dark" ? "☀️ Modo claro" : "🌙 Modo escuro";
  });
}

document.addEventListener("DOMContentLoaded", applyTheme);