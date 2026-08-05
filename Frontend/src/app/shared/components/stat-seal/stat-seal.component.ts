import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Small circular "seal" badge used for headline stats
 * (e.g. total exams, average score) on both dashboards.
 */
@Component({
  selector: 'app-stat-seal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seal">
      <svg viewBox="0 0 104 104">
        <circle cx="52" cy="52" r="48" fill="none" stroke="var(--line, #d7dee8)" stroke-width="2" />
        <circle cx="52" cy="52" r="48" fill="none" [attr.stroke]="color()" stroke-width="2" stroke-dasharray="4 3" />
      </svg>
      <div class="seal-num">
        <b>{{ value() }}</b>
        <span>{{ label() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .seal {
        width: 104px;
        height: 104px;
        position: relative;
        flex-shrink: 0;
      }
      .seal svg {
        width: 100%;
        height: 100%;
      }
      .seal-num {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      .seal-num b {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 20px;
        font-weight: 600;
        color: var(--ink, #14213d);
      }
      .seal-num span {
        font-size: 9px;
        color: var(--slate, #5b6b82);
        margin-top: 2px;
        max-width: 70px;
        line-height: 1.2;
      }
    `,
  ],
})
export class StatSealComponent {
  value = input.required<string | number>();
  label = input.required<string>();
  color = input<string>('#c89b3c');
}
