import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmButtonComponent } from '../button';
import { DmButtonGroupComponent } from './button-group.component';
import { BUTTON_GROUP_DEFAULTS } from './button-group.tokens';

@Component({
  imports: [DmButtonGroupComponent, DmButtonComponent],
  template: `
    <dm-button-group
      [orientation]="orientation()"
      [fullWidth]="fullWidth()"
      [ariaLabel]="label()"
      [color]="color()"
      [size]="size()"
      [variant]="variant()"
      [disabled]="disabled()"
    >
      <dm-button>One</dm-button>
      <dm-button color="danger">Two</dm-button>
      <dm-button>Three</dm-button>
    </dm-button-group>
  `,
})
class HostComponent {
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly fullWidth = signal(false);
  readonly label = signal('Actions');
  readonly color = signal<'primary' | undefined>(undefined);
  readonly size = signal<'sm' | undefined>(undefined);
  readonly variant = signal<'flat' | undefined>(undefined);
  readonly disabled = signal(false);
}

describe('DmButtonGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function group(): HTMLElement {
    return fixture.nativeElement.querySelector('dm-button-group');
  }

  function innerButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-button .dm-button'));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is a labelled group by default (horizontal)', () => {
    expect(group().getAttribute('role')).toBe('group');
    expect(group().getAttribute('aria-label')).toBe('Actions');
    expect(group().getAttribute('data-orientation')).toBe('horizontal');
    expect(group().classList.contains('dm-button-group')).toBe(true);
  });

  it('projects its buttons', () => {
    expect(group().querySelectorAll('dm-button').length).toBe(3);
  });

  it('reflects orientation and fullWidth as data attributes', () => {
    host.orientation.set('vertical');
    host.fullWidth.set(true);
    fixture.detectChanges();
    expect(group().getAttribute('data-orientation')).toBe('vertical');
    expect(group().getAttribute('data-full-width')).toBe('true');
  });

  it('buttons fall back to their own defaults outside any cascade', () => {
    // No group-level appearance set → the button defaults apply (primary/solid/md).
    expect(innerButtons()[0].getAttribute('data-color')).toBe('primary');
    expect(innerButtons()[0].getAttribute('data-variant')).toBe('solid');
    expect(innerButtons()[0].getAttribute('data-size')).toBe('md');
  });

  it('cascades group color / size / variant to every button', () => {
    host.color.set('primary');
    host.size.set('sm');
    host.variant.set('flat');
    fixture.detectChanges();

    expect(innerButtons()[0].getAttribute('data-color')).toBe('primary');
    expect(innerButtons()[0].getAttribute('data-size')).toBe('sm');
    expect(innerButtons()[0].getAttribute('data-variant')).toBe('flat');
    expect(innerButtons()[2].getAttribute('data-color')).toBe('primary');
  });

  it("a button's own input wins over the group cascade", () => {
    host.color.set('primary');
    fixture.detectChanges();

    // The second button declares color="danger" explicitly.
    expect(innerButtons()[1].getAttribute('data-color')).toBe('danger');
  });

  it('group disabled disables every button', () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(innerButtons().every((b) => b.disabled)).toBe(true);
    expect(group().getAttribute('aria-disabled')).toBe('true');
  });

  it('drops aria-label when empty', () => {
    host.label.set('');
    fixture.detectChanges();
    expect(group().getAttribute('aria-label')).toBeNull();
  });

  it('honors defaults injected via BUTTON_GROUP_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: BUTTON_GROUP_DEFAULTS, useValue: { orientation: 'vertical' } },
      ],
    });
    const bare = TestBed.createComponent(DmButtonGroupComponent);
    bare.detectChanges();
    expect(bare.nativeElement.getAttribute('data-orientation')).toBe('vertical');
  });
});
