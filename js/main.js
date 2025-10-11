// Dark/Light mode toggle
const toggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');


if (currentTheme) {
document.documentElement.setAttribute('data-theme', currentTheme);
}


toggleBtn.addEventListener('click', () => {
const theme = document.documentElement.getAttribute('data-theme');
const newTheme = theme === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', newTheme);
localStorage.setItem('theme', newTheme);
});