import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmAlertComponent } from './alert.component';
import { ALERT_DEFAULTS } from './alert.tokens';
import { DmAlertColor, DmAlertVariant } from './alert.types';

@Component({
  imports: [DmAlertComponent],
  template: `
    <dm-alert title="Heads up" description="Something happened">
      <p class="body-copy">Projected body</p>
      <button dmAlertAction class="undo">Undo</button>
    </dm-alert>
  `,
})
class ProjectionHostComponent {}

describe('DmAlertComponent', () => {
  let fixture: ComponentFixture<DmAlertComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmAlertComponent);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  function iconMarkup(): string | null {
    return host().querySelector('.dm-alert__icon')?.innerHTML ?? null;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders with role="alert" and the default color/variant', () => {
    createComponent();

    expect(host().getAttribute('role')).toBe('alert');
    expect(host().getAttribute('data-color')).toBe('default');
    expect(host().getAttribute('data-variant')).toBe('flat');
  });

  it('renders the title', () => {
    createComponent();
    fixture.componentRef.setInput('title', 'Payment received');
    fixture.detectChanges();

    expect(host().querySelector('.dm-alert__title')?.textContent).toContain('Payment received');
  });

  it('renders the description', () => {
    createComponent();
    fixture.componentRef.setInput('description', 'We emailed the receipt.');
    fixture.detectChanges();

    expect(host().querySelector('.dm-alert__description')?.textContent).toContain(
      'We emailed the receipt.',
    );
  });

  it('omits the title and description nodes when the inputs are not set', () => {
    createComponent();

    expect(host().querySelector('.dm-alert__title')).toBeNull();
    expect(host().querySelector('.dm-alert__description')).toBeNull();
  });

  it('projects free body content into the content area', () => {
    const hostFixture = TestBed.createComponent(ProjectionHostComponent);
    hostFixture.detectChanges();

    const content = hostFixture.nativeElement.querySelector('.dm-alert__content');
    expect(content?.querySelector('.body-copy')?.textContent).toContain('Projected body');
  });

  it('renders the description before the projected body', () => {
    const hostFixture = TestBed.createComponent(ProjectionHostComponent);
    hostFixture.detectChanges();

    const content: HTMLElement = hostFixture.nativeElement.querySelector('.dm-alert__content');
    const children = Array.from(content.children);
    const descriptionIndex = children.findIndex((el) =>
      el.classList.contains('dm-alert__description'),
    );
    const bodyIndex = children.findIndex((el) => el.classList.contains('body-copy'));

    expect(descriptionIndex).toBeGreaterThan(-1);
    expect(bodyIndex).toBeGreaterThan(-1);
    expect(descriptionIndex).toBeLessThan(bodyIndex);
  });

  it('projects [dmAlertAction] content into the action slot', () => {
    const hostFixture = TestBed.createComponent(ProjectionHostComponent);
    hostFixture.detectChanges();

    const action = hostFixture.nativeElement.querySelector('.dm-alert__action');
    expect(action?.querySelector('.undo')?.textContent).toContain('Undo');
    const content = hostFixture.nativeElement.querySelector('.dm-alert__content');
    expect(content?.querySelector('.undo')).toBeNull();
  });

  it('reflects each color as data-color', () => {
    createComponent();
    const colors: DmAlertColor[] = [
      'default',
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
    ];

    for (const color of colors) {
      fixture.componentRef.setInput('color', color);
      fixture.detectChanges();
      expect(host().getAttribute('data-color')).toBe(color);
    }
  });

  it('reflects each variant as data-variant', () => {
    createComponent();
    const variants: DmAlertVariant[] = ['flat', 'faded', 'solid', 'bordered'];

    for (const variant of variants) {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      expect(host().getAttribute('data-variant')).toBe(variant);
    }
  });

  it('shows a decorative icon by default', () => {
    createComponent();

    const icon = host().querySelector('.dm-alert__icon');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.querySelector('svg')).toBeTruthy();
  });

  it('renders a distinct icon per tone and shares info across neutral colors', () => {
    createComponent();

    const markupFor = (color: DmAlertColor): string | null => {
      fixture.componentRef.setInput('color', color);
      fixture.detectChanges();
      return iconMarkup();
    };

    const info = markupFor('default');
    expect(
      new Set([info, markupFor('success'), markupFor('warning'), markupFor('danger')]).size,
    ).toBe(4);
    expect(markupFor('primary')).toBe(info);
    expect(markupFor('secondary')).toBe(info);
  });

  it('hideIcon removes the icon', () => {
    createComponent();
    fixture.componentRef.setInput('hideIcon', true);
    fixture.detectChanges();

    expect(host().querySelector('.dm-alert__icon')).toBeNull();
  });

  it('shows no dismiss button by default', () => {
    createComponent();

    expect(host().querySelector('.dm-alert__close')).toBeNull();
  });

  it('shows the dismiss button with the default label when dismissible', () => {
    createComponent();
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    const close = host().querySelector('.dm-alert__close');
    expect(close).toBeTruthy();
    expect(close?.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('hides itself and emits `closed` when dismissed', () => {
    createComponent();
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    const onClosed = vi.fn();
    fixture.componentInstance.closed.subscribe(onClosed);
    host().querySelector<HTMLButtonElement>('.dm-alert__close')?.click();
    fixture.detectChanges();

    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(host().classList.contains('dm-alert--hidden')).toBe(true);
  });

  it('dismissLabel input overrides the default label', () => {
    createComponent();
    fixture.componentRef.setInput('dismissible', true);
    fixture.componentRef.setInput('dismissLabel', 'Cerrar');
    fixture.detectChanges();

    expect(host().querySelector('.dm-alert__close')?.getAttribute('aria-label')).toBe('Cerrar');
  });

  it('honors defaults injected via ALERT_DEFAULTS', () => {
    TestBed.overrideProvider(ALERT_DEFAULTS, {
      useValue: { color: 'danger', variant: 'bordered', dismissLabel: 'Fermer' },
    });
    createComponent();
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    expect(host().getAttribute('data-color')).toBe('danger');
    expect(host().getAttribute('data-variant')).toBe('bordered');
    expect(host().querySelector('.dm-alert__close')?.getAttribute('aria-label')).toBe('Fermer');
  });
});
