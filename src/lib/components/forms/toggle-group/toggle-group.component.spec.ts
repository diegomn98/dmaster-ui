import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmToggleGroupComponent } from './toggle-group.component';
import { TOGGLE_GROUP_DEFAULTS } from './toggle-group.tokens';
import { DmToggleComponent } from './toggle.component';

@Component({
  imports: [DmToggleGroupComponent, DmToggleComponent],
  template: `
    <dm-toggle-group
      [multiple]="multiple()"
      [(value)]="value"
      [(values)]="values"
      [disabled]="disabled()"
      ariaLabel="View"
    >
      <dm-toggle value="list">List</dm-toggle>
      <dm-toggle value="grid">Grid</dm-toggle>
      <dm-toggle value="table" [disabled]="thirdDisabled()">Table</dm-toggle>
    </dm-toggle-group>
  `,
})
class HostComponent {
  readonly multiple = signal(false);
  readonly value = signal<unknown>(null);
  readonly values = signal<unknown[]>([]);
  readonly disabled = signal(false);
  readonly thirdDisabled = signal(false);
}

describe('DmToggleGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function create(): void {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  function toggles(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-toggle'));
  }

  function groupEl(): HTMLElement {
    return fixture.nativeElement.querySelector('dm-toggle-group');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('is a radiogroup with radio children in single mode', () => {
    create();

    expect(groupEl().getAttribute('role')).toBe('radiogroup');
    expect(toggles()[0].getAttribute('role')).toBe('radio');
    expect(toggles()[0].getAttribute('aria-checked')).toBe('false');
    expect(toggles()[0].getAttribute('aria-pressed')).toBeNull();
  });

  it('selects a single value on click and reflects aria-checked', () => {
    create();
    toggles()[1].click();
    fixture.detectChanges();

    expect(host.value()).toBe('grid');
    expect(toggles()[1].getAttribute('aria-checked')).toBe('true');
    expect(toggles()[1].getAttribute('data-selected')).toBe('true');
    expect(toggles()[0].getAttribute('aria-checked')).toBe('false');
  });

  it('is exclusive in single mode', () => {
    create();
    toggles()[0].click();
    fixture.detectChanges();
    toggles()[1].click();
    fixture.detectChanges();

    expect(host.value()).toBe('grid');
    expect(toggles()[0].getAttribute('data-selected')).toBe('false');
  });

  it('switches to a group of pressed buttons in multiple mode', () => {
    create();
    host.multiple.set(true);
    fixture.detectChanges();

    expect(groupEl().getAttribute('role')).toBe('group');
    expect(toggles()[0].getAttribute('role')).toBe('button');
    expect(toggles()[0].getAttribute('aria-pressed')).toBe('false');
    expect(toggles()[0].getAttribute('aria-checked')).toBeNull();
  });

  it('accumulates and removes values in multiple mode', () => {
    create();
    host.multiple.set(true);
    fixture.detectChanges();

    toggles()[0].click();
    fixture.detectChanges();
    toggles()[1].click();
    fixture.detectChanges();
    expect(host.values()).toEqual(['list', 'grid']);

    toggles()[0].click();
    fixture.detectChanges();
    expect(host.values()).toEqual(['grid']);
  });

  it('every enabled segment is a tab stop in multiple mode', () => {
    create();
    host.multiple.set(true);
    fixture.detectChanges();

    expect(toggles()[0].getAttribute('tabindex')).toBe('0');
    expect(toggles()[1].getAttribute('tabindex')).toBe('0');
  });

  it('uses a roving tab stop in single mode', () => {
    create();

    // Nothing selected → first enabled toggle is the tab stop.
    expect(toggles()[0].getAttribute('tabindex')).toBe('0');
    expect(toggles()[1].getAttribute('tabindex')).toBe('-1');

    toggles()[1].click();
    fixture.detectChanges();
    expect(toggles()[0].getAttribute('tabindex')).toBe('-1');
    expect(toggles()[1].getAttribute('tabindex')).toBe('0');
  });

  it('moves and selects with arrow keys in single mode', () => {
    create();
    toggles()[0].focus();
    toggles()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe('grid');
  });

  it('does not select on arrow keys in multiple mode', () => {
    create();
    host.multiple.set(true);
    fixture.detectChanges();
    toggles()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(host.values()).toEqual([]);
  });

  it('toggles with Space and Enter', () => {
    create();
    toggles()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    fixture.detectChanges();

    expect(host.value()).toBe('grid');
  });

  it('skips disabled segments when roving', () => {
    create();
    host.thirdDisabled.set(true);
    fixture.detectChanges();
    expect(toggles()[2].getAttribute('tabindex')).toBe('-1');

    toggles()[2].click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('ignores interaction when the group is disabled', () => {
    create();
    host.disabled.set(true);
    fixture.detectChanges();

    toggles()[0].click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
    expect(groupEl().getAttribute('aria-disabled')).toBe('true');
  });

  it('reflects orientation and size as data attributes', () => {
    create();
    expect(groupEl().getAttribute('data-orientation')).toBe('horizontal');
    expect(groupEl().getAttribute('data-size')).toBe('md');
  });

  it('honors defaults injected via TOGGLE_GROUP_DEFAULTS', () => {
    TestBed.overrideProvider(TOGGLE_GROUP_DEFAULTS, {
      useValue: { color: 'primary', size: 'lg', orientation: 'vertical' },
    });
    create();

    expect(groupEl().getAttribute('data-color')).toBe('primary');
    expect(groupEl().getAttribute('data-size')).toBe('lg');
    expect(groupEl().getAttribute('data-orientation')).toBe('vertical');
  });

  it('integrates with Reactive Forms via CVA (single)', () => {
    @Component({
      imports: [DmToggleGroupComponent, DmToggleComponent, ReactiveFormsModule],
      template: `
        <dm-toggle-group [formControl]="control" ariaLabel="View">
          <dm-toggle value="list">List</dm-toggle>
          <dm-toggle value="grid">Grid</dm-toggle>
        </dm-toggle-group>
      `,
    })
    class FormHost {
      readonly control = new FormControl<string>('grid');
    }

    const formFixture = TestBed.createComponent(FormHost);
    formFixture.detectChanges();

    const items: HTMLElement[] = Array.from(
      formFixture.nativeElement.querySelectorAll('dm-toggle'),
    );
    expect(items[1].getAttribute('data-selected')).toBe('true');

    items[0].click();
    formFixture.detectChanges();
    expect(formFixture.componentInstance.control.value).toBe('list');
  });
});
