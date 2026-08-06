const fs = require('fs');

const stylesScss = fs.readFileSync('src/styles.scss', 'utf8');

const parts = stylesScss.split('/* --- Dashboard Styles --- */');
const originalStyles = parts[0].trim();
const rest = parts[1];
const dashboardAndForm = rest.split('/* --- Form Styles --- */');
const dashboardStyles = dashboardAndForm[0].replace(/body \{/g, ':host {').trim();
const formStyles = dashboardAndForm[1].replace(/body \{/g, ':host {').trim();

// Restore original files
fs.writeFileSync('src/styles.scss', originalStyles);
fs.writeFileSync('src/app/pages/question-dashboard/question-dashboard.component.scss', dashboardStyles);
fs.writeFileSync('src/app/pages/question-form/question-form.component.scss', formStyles);

// Add the required styles into the empty components using SASS @use or just dumping the CSS
// Wait, dumping the shared classes like .icon-btn and .radio-custom into the empty files is safest.

const sharedDashboardStyles = `
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  svg { width: 16px; height: 16px; }

  &--edit {
    color: #495057;
    &:hover { background: rgba(51, 154, 240, 0.1); color: #339af0; }
  }

  &--delete {
    color: #495057;
    &:hover { background: rgba(255, 107, 107, 0.1); color: #ff6b6b; }
  }

  &--danger-ghost {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: #868e96;

    &:hover { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
  }
}

.card-delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.radio-custom {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #868e96;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;

  &.active {
    border-color: #20c997;
    background: #20c997;
  }

  svg {
    width: 14px;
    height: 14px;
    color: white;
  }
}
`;

fs.writeFileSync('src/app/pages/exam-dashboard/exam-dashboard.scss', dashboardStyles + '\n' + sharedDashboardStyles);
fs.writeFileSync('src/app/pages/exam-details/exam-details.scss', dashboardStyles + '\n' + sharedDashboardStyles);
fs.writeFileSync('src/app/pages/exam-form/exam-form.scss', formStyles + '\n' + sharedDashboardStyles);

