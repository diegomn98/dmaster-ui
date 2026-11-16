import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmChipSetComponent } from './chip-set.component';
import { DmChipComponent } from './chip.component';
import { DmChipSetSelection } from './chip.types';

@Component({
  imports: [DmChipSetComponent, DmChipComponent],
  template: `
    <dm-chip-set
      [selection]="mode()"
      [(value)]="value"
      [(values)]="values"
      [disabled]="disabled()"
      ariaLabel="Filters"
    >
      <dm-chip selectable value="a">A</dm-chip>
      <dm-chip selectable value="b">B</dm-chip>
      <dm-chip selectable value="c">C</dm-chip>
    </dm-chip-set>
  `,
})
class HostComponent {
  readonly mode = signal<DmChipSetSelection>('multiple');
  readonly disabled = signal(false);
  value: unknown = null;
  values: unknown[] = [];
}

describe('DmChipSetComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  function create(mode: DmChipSetSelection = 'multiple'): void {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.mode.set(mode);
    fixture.detectChanges();
  }

  function bodies(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-chip__body'));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders as a group with an accessible label', () => {
    create();
    const set: HTMLElement = fixture.nativeElement.querySelector('dm-chip-set');
    expect(set.getAttribute('role')).toBe('group');
    expect(set.getAttribute('aria-label')).toBe('Filters');
  });

  it('multiple mode toggles membership in [(values)]', () => {
    create('multiple');
    const [a, , c] = bodies();

    a.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['a']);
    expect(a.getAttribute('aria-pressed')).toBe('true');

    c.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['a', 'c']);

    a.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.values).toEqual(['c']);
    expect(a.getAttribute('aria-pressed')).toBe('false');
  });

  it('single mode is exclusive and toggles off on re-click', () => {
    create('single');
    const [a, b] = bodies();

    a.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('a');

    b.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('b');
    expect(a.getAttribute('aria-pressed')).toBe('false');

    b.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeNull();
  });

  it('roving tabindex: only one chip is the tab stop', () => {
    create('multiple');
    // Nothing selected → the first chip is the single tab stop.
    expect(bodies().map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    bodies()[1].click();
    fixture.detectChanges();
    // Selected chip becomes the tab stop.
    expect(bodies().map((b) => b.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
  });

  it('ArrowRight moves focus to the next chip', () => {
    create('multiple');
    const [a, b] = bodies();
    a.focus();
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(b);
  });

  it('disables every chip when the set is disabled', () => {
    create('multiple');
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(bodies().every((b) => b.disabled)).toBe(true);
  });
});
