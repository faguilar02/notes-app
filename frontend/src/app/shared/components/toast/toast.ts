import { Component, input } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (show()) {
    <div
      [class]="getToastClass()"
      class="fixed bottom-6 right-6 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 min-w-80 z-50"
    >
      <span [innerHTML]="getIcon()"></span>
      <div>
        <p class="font-semibold">{{ title() }}</p>
        <p class="text-sm opacity-90">{{ message() }}</p>
      </div>
    </div>
    }
  `,
})
export class ToastComponent {
  show = input.required<boolean>();
  type = input<ToastType>('success');
  title = input.required<string>();
  message = input.required<string>();

  getToastClass(): string {
    const baseClass = '';
    switch (this.type()) {
      case 'success':
        return baseClass + 'bg-green-500';
      case 'error':
        return baseClass + 'bg-red-500';
      case 'info':
        return baseClass + 'bg-blue-500';
      default:
        return baseClass + 'bg-green-500';
    }
  }

  getIcon(): string {
    switch (this.type()) {
      case 'success':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>';
      case 'error':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17L12 13.41L8.41 17L7 15.59L10.59 12L7 8.41L8.41 7L12 10.59L15.59 7L17 8.41L13.41 12z"/></svg>';
      case 'info':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>';
      default:
        return '';
    }
  }
}
