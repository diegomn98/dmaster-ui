import { OverlayContainer } from '@angular/cdk/overlay';
import {
  ApplicationRef,
  Component,
  provideZonelessChangeDetection,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmColorPickerComponent } from './color-picker.component';
import { provideColorPickerDefaults } from './color-picker.tokens';

@Component({
  imports: [DmColorPickerComponent, ReactiveFormsModule],
  template: `<dm-color-picker label="Brand" [formControl]="control" />`,
})
class FormHostComponent {
  readonly control = new FormControl<string | null>(null);
}

describe('DmColorPickerComponent', () => {
  let overlayContainer: OverlayContainer;

  function create(): ComponentFixture<DmColorPickerComponent> {
    const fixture = TestBed.createComponent(DmColorPickerComponent);
    fixture.detectChanges();
    return fixture;
  }

  function trigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-color-picker__trigger');
  }

  function panel(): HTMLElement | null {
    return overlayContainer.getContainerElement().querySelector('.dm-color-picker__panel');
  }

  function query<T extends HTMLElement>(selector: string): T | null {
    return overlayContainer.getContainerElement().querySelector<T>(selector);
  }

  async function flush(fixture: ComponentFixture<unknown>): Promise<void> {
    fixture.detectChanges();
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.getContainerElement().remove();
  });

  it('renders the placeholder when empty', () => {
    const fixture = TestBed.createComponent(DmColorPickerComponent);
    fixture.componentRef.setInput('placeholder', 'Pick a color');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('Pick a color');
  });

  it('writeValue parses a hex and shows it in the trigger', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#ff0000');
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('#ff0000');
    expect(fixture.componentInstance.value()).toBe('#ff0000');
  });

  it('opens and closes on trigger click', () => {
    const fixture = create();
    expect(panel()).toBeNull();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('clicking a swatch sets the value and keeps the panel open', () => {
    const fixture = create();
    fixture.componentRef.setInput('swatches', ['#17c964', '#0072f5']);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const swatch = query<HTMLButtonElement>('.dm-color-picker__swatch');
    swatch!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('#17c964');
    expect(panel()).not.toBeNull();
  });

  it('commits a valid hex from the hex field', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    const input = query<HTMLInputElement>('.dm-color-picker__hex-input')!;
    input.value = '#0072f5';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('#0072f5');
  });

  it('reverts an invalid hex to the current value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#ff0000');
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const input = query<HTMLInputElement>('.dm-color-picker__hex-input')!;
    input.value = 'nonsense';
    input.dispatchEvent(new Event('input'));
    // Flush the intermediate state (as a real browser does between keystroke
    // and blur) so the binding records the invalid excursion before the revert.
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('#ff0000');
    expect(input.value).toBe('#ff0000');
  });

  it('hue arrow keys change the value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#ff0000');
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const hue = query<HTMLElement>('.dm-color-picker__slider--hue')!;
    hue.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).not.toBe('#ff0000');
  });

  it('saturation/value arrow keys change the value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#808080');
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    const sv = query<HTMLElement>('.dm-color-picker__sv')!;
    sv.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).not.toBe('#808080');
  });

  it('showAlpha adds the alpha rail and emits an 8-digit hex', () => {
    const fixture = create();
    fixture.componentRef.setInput('showAlpha', true);
    fixture.componentInstance.writeValue('#ff0000');
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('#ff0000ff');
    trigger(fixture).click();
    fixture.detectChanges();
    expect(query('.dm-color-picker__slider--alpha')).not.toBeNull();
  });

  it('clears via the clear button', () => {
    const fixture = create();
    fixture.componentRef.setInput('clearable', true);
    fixture.componentInstance.writeValue('#ff0000');
    fixture.detectChanges();
    const clear = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '.dm-color-picker__clear',
    );
    expect(clear).not.toBeNull();
    clear!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBeNull();
  });

  it('does not open when disabled', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
    expect(trigger(fixture).disabled).toBe(true);
  });

  it('wires ARIA attributes on the trigger', () => {
    const fixture = create();
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('error', 'Required');
    fixture.detectChanges();
    const btn = trigger(fixture);
    expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
    expect(btn.getAttribute('aria-required')).toBe('true');
    expect(btn.getAttribute('aria-invalid')).toBe('true');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('exposes the panel as a dialog and the SV plane as a slider', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panel()?.getAttribute('role')).toBe('dialog');
    const sv = query<HTMLElement>('.dm-color-picker__sv')!;
    expect(sv.getAttribute('role')).toBe('slider');
    expect(sv.getAttribute('aria-valuetext')).toContain('Saturation');
  });

  it('applies injected defaults', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideColorPickerDefaults({ variant: 'bordered', showAlpha: true }),
      ],
    });
    overlayContainer = TestBed.inject(OverlayContainer);
    const fixture = create();
    expect(trigger(fixture).getAttribute('data-variant')).toBe('bordered');
    expect(fixture.componentInstance.showAlpha()).toBe(true);
  });

  it('binds to a reactive FormControl', async () => {
    const fixture = TestBed.createComponent(FormHostComponent);
    await flush(fixture);
    fixture.componentInstance.control.setValue('#0072f5');
    await flush(fixture);
    expect(trigger(fixture).textContent).toContain('#0072f5');
  });
});
