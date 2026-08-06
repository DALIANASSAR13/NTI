const fs = require('fs');

const dashboardScss = fs.readFileSync('src/app/pages/question-dashboard/question-dashboard.component.scss', 'utf8');
const formScss = fs.readFileSync('src/app/pages/question-form/question-form.component.scss', 'utf8');
const stylesScss = fs.readFileSync('src/styles.scss', 'utf8');

// Replace :host { with body {
const cleanDashboard = dashboardScss.replace(/:host\s*{/g, 'body {');
const cleanForm = formScss.replace(/:host\s*{/g, 'body {');

// Append to styles.scss
const newStyles = stylesScss + '\n\n/* --- Dashboard Styles --- */\n' + cleanDashboard + '\n\n/* --- Form Styles --- */\n' + cleanForm;

fs.writeFileSync('src/styles.scss', newStyles);

// Empty the original component SCSS files so they don't conflict or bloat
fs.writeFileSync('src/app/pages/question-dashboard/question-dashboard.component.scss', '');
fs.writeFileSync('src/app/pages/question-form/question-form.component.scss', '');
