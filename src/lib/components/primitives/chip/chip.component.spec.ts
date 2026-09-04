import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReducedMotionService } from '../../../core/services/reduced-motion.service';
import { DmChipSetComponent } from './chip-set.component';
import { DmChipComponent } from './chip.component';
import { CHIP_DEFAULTS } from './chip.tokens';

@Component({
  imports: [DmChipComponent],
  template: `
    <dm-chip selectable>Filter label</dm-chip>
    <dm-chip clickable><span dm-chip-leading class="lead">+</span>Action label</dm-chip>
    <dm-chip removable>Tag label</dm-chip>
  `,
})
class ProjectionHostComponent {}

@Component({
  imports: [DmChipComponent, DmChipSetComponent],
  template: `
    <dm-chip-set ariaLabel="Tags">
      @for (tag of tags(); track tag) {
        <dm-chip removable>{{ tag }}</dm-chip>
      }
    </dm-chip-set>
  `,
})
class LiveSetHostComponent {
  readonly tags = signal(['a', 'b']);
}

describe('DmChipComponent motion', () => {
  function hosts(fixture: ComponentFixture<LiveSetHostComponent>): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-chip'));
  }

  // jsdom has no AnimationEvent; the component only reads `animationName`.
  function animationEnd(animationName: string): Event {
    return Object.assign(new Event('animationend'), { animationName });
  }

  it('animates in only the chips added after the set has rendered', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReducedMotionService, useValue: { reducedMotion: () => false } },
      ],
    });
    const fixture = TestBed.createComponent(LiveSetHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    // Initial render: still.
    expect(hosts(fixture).map((h) => h.getAttribute('data-entering'))).toEqual([null, null]);

    fixture.componentInstance.tags.update((t) => [...t, 'c']);
    fixture.detectChanges();
    const [a, b, c] = hosts(fixture);
    expect([a, b].map((h) => h.getAttribute('data-entering'))).toEqual([null, null]);
    expect(c.getAttribute('data-entering')).toBe('true');

    // The entrance flag clears when its keyframe finishes. Emulated encapsulation
    // PREFIXES the keyframe name — the component matches the tail.
    c.dispatchEvent(animationEnd('_ngcontent-ng-c1_dm-chip-in'));
    fixture.detectChanges();
    expect(c.getAttribute('data-entering')).toBeNull();
  });

  it('never animates in under reduced motion', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReducedMotionService, useValue: { reducedMotion: () => true } },
      ],
    });
    const fixture = TestBed.createComponent(LiveSetHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.tags.update((t) => [...t, 'c']);
    fixture.detectChanges();
    expect(hosts(fixture)[2].getAttribute('data-entering')).toBeNull();
  });

  it('collapses before emitting (removed): measures its width, then emits on animationend', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReducedMotionService, useValue: { reducedMotion: () => false } },
      ],
    });
    const fixture = TestBed.createComponent(DmChipComponent);
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const removed = vi.fn();
    fixture.componentInstance.removed.subscribe(removed);

    host.querySelector<HTMLButtonElement>('.dm-chip__remove')!.click();
    fixture.detectChanges();

    expect(host.getAttribute('data-removing')).toBe('true');
    expect(host.style.getPropertyValue('--dm-chip-w')).toMatch(/px$/);
    expect(removed).not.toHaveBeenCalled();

    // An unrelated animation ending on the host must not emit.
    host.dispatchEvent(animationEnd('_ngcontent-ng-c1_dm-chip-in'));
    expect(removed).not.toHaveBeenCalled();
    host.dispatchEvent(animationEnd('_ngcontent-ng-c1_dm-chip-collapse'));
    expect(removed).toHaveBeenCalledTimes(1);
  });
});

describe('DmChipComponent projection', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  // Regression: two literal <ng-content> slots in the @if/@else bodies left the
  // interactive (button) branch empty — content is projected into ONE slot.
  it('projects label and leading slot into both the button and the span body', () => {
    const fixture = TestBed.createComponent(ProjectionHostComponent);
    fixture.detectChanges();
    const bodies = Array.from(
      fixture.nativeElement.querySelectorAll('.dm-chip__body') as NodeListOf<HTMLElement>,
    );

    expect(bodies.map((b) => b.tagName)).toEqual(['BUTTON', 'BUTTON', 'SPAN']);
    expect(bodies[0].textContent?.trim()).toBe('Filter label');
    expect(bodies[1].textContent?.replace(/\s+/g, '')).toBe('+Actionlabel');
    expect(bodies[1].querySelector('.dm-chip__leading .lead')).not.toBeNull();
    expect(bodies[2].textContent?.trim()).toBe('Tag label');
  });
});

describe('DmChipComponent', () => {
  let fixture: ComponentFixture<DmChipComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmChipComponent);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  function body(): HTMLElement | null {
    return host().querySelector('.dm-chip__body');
  }

  function removeBtn(): HTMLButtonElement | null {
    return host().querySelector('.dm-chip__remove');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        // Immediate-emit path for removal (no exit animation to wait on).
        { provide: ReducedMotionService, useValue: { reducedMotion: () => true } },
      ],
    });
  });

  it('renders default/flat/md/full, non-interactive by default', () => {
    createComponent();

    expect(host().getAttribute('data-color')).toBe('default');
    expect(host().getAttribute('data-variant')).toBe('flat');
    expect(host().getAttribute('data-size')).toBe('md');
    expect(host().getAttribute('data-radius')).toBe('full');
    // Not selectable/clickable/removable → the body is a span, no buttons.
    expect(host().querySelector('button')).toBeNull();
    expect(body()?.tagName).toBe('SPAN');
  });

  it('reflects color, variant, size and radius', () => {
    createComponent();
    fixture.componentRef.setInput('color', 'primary');
    fixture.componentRef.setInput('variant', 'solid');
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('radius', 'md');
    fixture.detectChanges();

    expect(host().getAttribute('data-color')).toBe('primary');
    expect(host().getAttribute('data-variant')).toBe('solid');
    expect(host().getAttribute('data-size')).toBe('lg');
    expect(host().getAttribute('data-radius')).toBe('md');
  });

  it('honors defaults injected via CHIP_DEFAULTS', () => {
    TestBed.overrideProvider(CHIP_DEFAULTS, {
      useValue: { color: 'danger', variant: 'bordered', size: 'sm', radius: 'md' },
    });
    createComponent();

    expect(host().getAttribute('data-color')).toBe('danger');
    expect(host().getAttribute('data-variant')).toBe('bordered');
    expect(host().getAttribute('data-size')).toBe('sm');
  });

  it('renders a toggle button when selectable and reflects aria-pressed', () => {
    createComponent();
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();

    const btn = body() as HTMLButtonElement;
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('aria-pressed')).toBe('false');
    expect(host().hasAttribute('data-interactive')).toBe(true);

    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(host().getAttribute('data-selected')).toBe('true');
    expect(host().querySelector('.dm-chip__check')).toBeTruthy();
  });

  it('two-way binds [(selected)] on toggle', () => {
    createComponent();
    fixture.componentRef.setInput('selectable', true);
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(false);

    (body() as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(true);

    (body() as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(false);
  });

  it('emits (chipClick) for a clickable action chip', () => {
    createComponent();
    fixture.componentRef.setInput('clickable', true);
    let clicks = 0;
    fixture.componentInstance.chipClick.subscribe(() => clicks++);
    fixture.detectChanges();

    (body() as HTMLButtonElement).click();
    expect(clicks).toBe(1);
  });

  it('renders a remove button and emits (removed) on click', () => {
    createComponent();
    fixture.componentRef.setInput('removable', true);
    let removed = 0;
    fixture.componentInstance.removed.subscribe(() => removed++);
    fixture.detectChanges();

    expect(removeBtn()).toBeTruthy();
    removeBtn()!.click();
    expect(removed).toBe(1);
  });

  it('removes on Delete / Backspace when the body is focused (interactive + removable)', () => {
    createComponent();
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('removable', true);
    let removed = 0;
    fixture.componentInstance.removed.subscribe(() => removed++);
    fixture.detectChanges();

    body()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    expect(removed).toBe(1);
  });

  it('does not act when disabled', () => {
    createComponent();
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('disabled', true);
    let removed = 0;
    fixture.componentInstance.removed.subscribe(() => removed++);
    fixture.detectChanges();

    expect(host().getAttribute('data-disabled')).toBe('true');
    expect((body() as HTMLButtonElement).disabled).toBe(true);
    expect(removeBtn()!.disabled).toBe(true);
    // Disabled native buttons don't dispatch click; nothing should fire.
    (body() as HTMLButtonElement).click();
    removeBtn()!.click();
    expect(removed).toBe(0);
    expect(fixture.componentInstance.selected()).toBe(false);
    expect(fixture.componentInstance.isFocusable()).toBe(false);
  });

  it('exposes a remove label on the remove button', () => {
    createComponent();
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('removeLabel', 'Remove Angular');
    fixture.detectChanges();

    expect(removeBtn()!.getAttribute('aria-label')).toBe('Remove Angular');
  });
});
