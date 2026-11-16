import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DmStepIndicatorDirective } from './step-indicator.directive';
import { DmStepComponent } from './step.component';
import { DmStepperComponent } from './stepper.component';
import { STEPPER_DEFAULTS } from './stepper.tokens';

@Component({
  imports: [DmStepperComponent, DmStepComponent],
  template: `
    <dm-stepper
      [(activeStep)]="active"
      [orientation]="orientation()"
      [linear]="linear()"
      (completed)="completedCount = completedCount + 1"
      ariaLabel="Checkout"
    >
      <dm-step label="Account" [completed]="firstDone()">Panel 1</dm-step>
      <dm-step label="Shipping" [error]="shippingError()">Panel 2</dm-step>
      <dm-step label="Payment" [disabled]="paymentDisabled()">Panel 3</dm-step>
    </dm-stepper>
  `,
})
class HostComponent {
  readonly active = signal(0);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly linear = signal(false);
  readonly firstDone = signal(false);
  readonly shippingError = signal(false);
  readonly paymentDisabled = signal(false);
  completedCount = 0;
}

describe('DmStepperComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  function stepper(): HTMLElement {
    return fixture.nativeElement.querySelector('dm-stepper');
  }

  function steps(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('dm-step'));
  }

  function headers(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-step__header'));
  }

  function panels(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-step__panel'));
  }

  function fireKey(el: HTMLElement, key: string): void {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('emits (completed) when next() runs on the last reachable step', () => {
    const cmp = fixture.debugElement.query(By.directive(DmStepperComponent))
      .componentInstance as DmStepperComponent;

    // Advancing from a middle step just moves on — no completion.
    cmp.next();
    fixture.detectChanges();
    expect(fixture.componentInstance.completedCount).toBe(0);

    // On the last step, next() finishes the flow.
    fixture.componentInstance.active.set(2);
    fixture.detectChanges();
    cmp.next();
    fixture.detectChanges();
    expect(fixture.componentInstance.completedCount).toBe(1);
  });

  it('renders the first step active by default with the right ARIA wiring', () => {
    // `group` (not `list`): a list can't carry an accessible name, a group can.
    expect(stepper().getAttribute('role')).toBe('group');
    expect(stepper().getAttribute('aria-label')).toBe('Checkout');
    expect(stepper().getAttribute('data-orientation')).toBe('horizontal');

    // Steps carry no list-item role; the header <button> is the semantic unit.
    expect(steps()[0].getAttribute('role')).toBeNull();
    expect(headers()[0].getAttribute('aria-current')).toBe('step');
    expect(headers()[1].getAttribute('aria-current')).toBeNull();

    // Header ↔ panel wiring.
    expect(headers()[0].getAttribute('aria-controls')).toBe(panels()[0].getAttribute('id'));
    expect(panels()[0].getAttribute('aria-labelledby')).toBe(headers()[0].getAttribute('id'));
    expect(panels()[0].getAttribute('role')).toBe('region');

    // Only the active panel is visible.
    expect(panels()[0].hasAttribute('hidden')).toBe(false);
    expect(panels()[1].hasAttribute('hidden')).toBe(true);
    expect(panels()[2].hasAttribute('hidden')).toBe(true);

    // Numbers on upcoming steps.
    expect(headers()[1].textContent).toContain('2');
  });

  it('activates a step on click and propagates via two-way binding', () => {
    headers()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active()).toBe(1);
    expect(headers()[0].getAttribute('aria-current')).toBeNull();
    expect(headers()[1].getAttribute('aria-current')).toBe('step');
    expect(panels()[0].hasAttribute('hidden')).toBe(true);
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
  });

  it('reflects external activeStep changes back into the DOM', () => {
    fixture.componentInstance.active.set(1);
    fixture.detectChanges();

    expect(headers()[1].getAttribute('aria-current')).toBe('step');
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
  });

  it('renders the completed state with a check glyph', () => {
    fixture.componentInstance.firstDone.set(true);
    // Move off step 0 so it reads as completed, not active.
    fixture.componentInstance.active.set(1);
    fixture.detectChanges();

    expect(steps()[0].getAttribute('data-state')).toBe('completed');
    expect(headers()[0].querySelector('.dm-step__glyph')).not.toBeNull();
    // The number is replaced by the glyph.
    expect(headers()[0].querySelector('.dm-step__number')).toBeNull();
  });

  it('renders the error state with a warning glyph and danger data-state', () => {
    fixture.componentInstance.shippingError.set(true);
    fixture.detectChanges();

    expect(steps()[1].getAttribute('data-state')).toBe('error');
    expect(headers()[1].querySelector('.dm-step__glyph')).not.toBeNull();
  });

  it('does not activate a disabled step via click or keyboard', () => {
    fixture.componentInstance.paymentDisabled.set(true);
    fixture.detectChanges();

    expect(headers()[2].disabled).toBe(true);
    expect(steps()[2].getAttribute('data-state')).toBe('disabled');

    headers()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(0);

    fireKey(headers()[2], 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(0);
  });

  it('blocks jumping ahead past an incomplete step in linear mode', () => {
    fixture.componentInstance.linear.set(true);
    fixture.detectChanges();

    // Step 0 not completed → step 2 is unreachable.
    headers()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(0);
    expect(headers()[2].getAttribute('aria-disabled')).toBe('true');

    // Completing step 0 still leaves step 1 incomplete, so step 2 stays locked.
    fixture.componentInstance.firstDone.set(true);
    fixture.detectChanges();
    headers()[2].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(0);

    // But the immediately-next step (1) becomes reachable.
    headers()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(1);

    // Going back is always allowed.
    headers()[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(0);
  });

  it('moves focus between headers with arrow keys (horizontal)', () => {
    headers()[0].focus();
    fireKey(headers()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(document.activeElement).toBe(headers()[1]);

    fireKey(headers()[1], 'ArrowLeft');
    fixture.detectChanges();
    expect(document.activeElement).toBe(headers()[0]);
  });

  it('uses ArrowUp/ArrowDown when vertical and reflects orientation on the host', () => {
    fixture.componentInstance.orientation.set('vertical');
    fixture.detectChanges();

    expect(stepper().getAttribute('data-orientation')).toBe('vertical');
    expect(steps()[0].getAttribute('data-orientation')).toBe('vertical');

    headers()[0].focus();
    fireKey(headers()[0], 'ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(headers()[1]);
  });

  it('activates the focused step on Enter and Space', () => {
    fireKey(headers()[1], 'Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(1);

    fireKey(headers()[2], ' ');
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe(2);
  });

  it('honors defaults injected via STEPPER_DEFAULTS', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: STEPPER_DEFAULTS,
          useValue: { orientation: 'vertical', color: 'success', size: 'lg' },
        },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    // The host binds orientation explicitly, so assert on color + size which it leaves default.
    fixture.detectChanges();

    expect(stepper().getAttribute('data-color')).toBe('success');
    expect(stepper().getAttribute('data-size')).toBe('lg');
  });

  it('renders the built-in number indicators when no dmStepIndicator is projected', () => {
    // Default-unchanged guard for the custom-indicator API.
    expect(fixture.nativeElement.querySelectorAll('.dm-step__number').length).toBe(3);
    expect(fixture.nativeElement.querySelector('.custom-ind')).toBeNull();
  });
});

describe('DmStepperComponent with a custom dmStepIndicator template', () => {
  @Component({
    imports: [DmStepperComponent, DmStepComponent, DmStepIndicatorDirective],
    template: `
      <dm-stepper [(activeStep)]="active" ariaLabel="Wizard">
        <ng-template
          dmStepIndicator
          let-index="index"
          let-isActive="active"
          let-completed="completed"
          let-error="error"
        >
          <span
            class="custom-ind"
            [attr.data-active]="isActive"
            [attr.data-completed]="completed"
            [attr.data-error]="error"
            >{{ index }}</span
          >
        </ng-template>
        <dm-step label="One" [completed]="firstDone()">Panel 1</dm-step>
        <dm-step label="Two" [error]="secondError()">Panel 2</dm-step>
        <dm-step label="Three">Panel 3</dm-step>
      </dm-stepper>
    `,
  })
  class IndicatorHostComponent {
    readonly active = signal(0);
    readonly firstDone = signal(false);
    readonly secondError = signal(false);
  }

  let fixture: ComponentFixture<IndicatorHostComponent>;

  function customIndicators(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.custom-ind'));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(IndicatorHostComponent);
    fixture.detectChanges();
  });

  it('replaces the indicator content of every step header with the template', () => {
    const custom = customIndicators();
    expect(custom.length).toBe(3);
    expect(custom.map((el) => el.textContent?.trim())).toEqual(['0', '1', '2']);

    // Built-in glyphs are fully switched off…
    expect(fixture.nativeElement.querySelector('.dm-step__number')).toBeNull();
    expect(fixture.nativeElement.querySelector('.dm-step__glyph')).toBeNull();

    // …while the indicator circle and the header button semantics stay.
    const indicators = fixture.nativeElement.querySelectorAll('.dm-step__indicator');
    expect(indicators.length).toBe(3);
    expect(custom[0].closest('.dm-step__indicator')).toBe(indicators[0]);
    const header = fixture.nativeElement.querySelector('.dm-step__header');
    expect(header.getAttribute('aria-current')).toBe('step');
  });

  it('exposes index / active / completed / error through the template context', () => {
    fixture.componentInstance.firstDone.set(true);
    fixture.componentInstance.secondError.set(true);
    fixture.componentInstance.active.set(1);
    fixture.detectChanges();

    const [first, second, third] = customIndicators();
    expect(first.getAttribute('data-completed')).toBe('true');
    expect(first.getAttribute('data-active')).toBe('false');
    expect(second.getAttribute('data-error')).toBe('true');
    expect(second.getAttribute('data-active')).toBe('true');
    expect(third.getAttribute('data-active')).toBe('false');
    expect(third.getAttribute('data-completed')).toBe('false');
  });
});
