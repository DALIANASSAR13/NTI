import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-container">
      <h1>Account Settings</h1>
    </div>
  `,
  styles: [`
    .settings-container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    h1 {
      margin-top: 0;
      color: #343a40;
    }
  `]
})
export class SettingsComponent {}
