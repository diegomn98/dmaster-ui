import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { DmOtpComponent } from './otp.component';
import { OTP_DEFAULTS } from './otp.tokens';
import { DmOtpMode } from './otp.types';

@Component({
  imports: [DmOtpComponent],
  template: `
    <dm-otp
      [length]="length()"
      [mode]="mode()"
      [(value)]="value"
      [disabled]="disabled()"
      (completed)="onCompleted($event)"
      ariaLabel="Code"
    />
  `,
})
class HostComponent {
  readonly length = signal(4);
  readonly mode = signal<DmOtpMode>('numeric');
  readonly value = signal('');
  readonly disabled = signal(false);
  completedWith: string | null = null;
  onCompleted(v: string): void {
    this.completedWith = v;
  }
}

describe('DmOtpComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function create(): void {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  }

  function cells(): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.dm-otp__cell'));
  }

  function type(index: number, char: string): void {
    const input = cells()[index];
    input.value = char;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders `length` cells as a labelled group', () => {
    create();
    const groupEl: HTMLElement = fixture.nativeElement.querySelector('dm-otp');

    expect(cells().length).toBe(4);
    expect(groupEl.getAttribute('role')).toBe('group');
    expect(cells()[0].getAttribute('aria-label')).toBe('Code 1 of 4');
    expect(cells()[0].getAttribute('inputmode')).toBe('numeric');
  });

  it('fills a cell and advances focus', () => {
    create();
    type(0, '1');

    expect(host.value()).toBe('1');
    expect(document.activeElement).toBe(cells()[1]);
  });

  it('rejects characters outside the mode', () => {
    create();
    type(0, 'a');

    expect(host.value()).toBe('');
    expect(cells()[0].value).toBe('');
  });

  it('accepts letters in alphanumeric mode', () => {
    create();
    host.mode.set('alphanumeric');
    fixture.detectChanges();
    type(0, 'a');

    expect(host.value()).toBe('a');
  });

  it('emits completed once every cell is filled', () => {
    create();
    type(0, '1');
    type(1, '2');
    type(2, '3');
    expect(host.completedWith).toBeNull();
    type(3, '4');

    expect(host.value()).toBe('1234');
    expect(host.completedWith).toBe('1234');
  });

  it('clears the current cell on Backspace, then steps back', () => {
    create();
    type(0, '1');
    type(1, '2');

    // cell 2 is focused and empty → Backspace clears cell 1 and moves back
    cells()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe('1');
    expect(document.activeElement).toBe(cells()[1]);

    // now cell 1 has '2'? no — after previous, value is '1', cell1 empty.
    // Backspace on a filled cell clears just that cell.
    type(1, '9');
    cells()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()).toBe('1');
  });

  it('preserves cell positions when a middle cell is cleared', () => {
    create();
    type(0, '1');
    type(1, '2');
    type(2, '3');
    type(3, '4');

    // Delete the middle cell — the rest must NOT shift left.
    cells()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
    fixture.detectChanges();

    expect(cells()[0].value).toBe('1');
    expect(cells()[1].value).toBe('');
    expect(cells()[2].value).toBe('3');
    expect(cells()[3].value).toBe('4');
  });

  it('moves focus with arrow keys', () => {
    create();
    cells()[0].focus();
    cells()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(cells()[1]);

    cells()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(cells()[0]);
  });

  it('distributes a pasted code across the cells', () => {
    create();
    const paste = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', {
      value: { getData: () => '123456' },
    });
    cells()[0].dispatchEvent(paste);
    fixture.detectChanges();

    // length is 4 → only the first 4 chars land
    expect(host.value()).toBe('1234');
  });

  it('reflects an external value write into the cells', () => {
    create();
    host.value.set('12');
    fixture.detectChanges();

    expect(cells()[0].value).toBe('1');
    expect(cells()[1].value).toBe('2');
    expect(cells()[2].value).toBe('');
  });

  it('disables every cell', () => {
    create();
    host.disabled.set(true);
    fixture.detectChanges();

    expect(cells().every((c) => c.disabled)).toBe(true);
  });

  it('reflects the variant on the host', () => {
    @Component({
      imports: [DmOtpComponent],
      template: `<dm-otp [length]="4" variant="bordered" ariaLabel="Code" />`,
    })
    class VariantHost {}

    const f = TestBed.createComponent(VariantHost);
    f.detectChanges();
    expect(f.nativeElement.querySelector('dm-otp').getAttribute('data-variant')).toBe('bordered');
  });

  it('renders a separator after every `groupSize` cells, never trailing', () => {
    @Component({
      imports: [DmOtpComponent],
      template: `<dm-otp [length]="6" [groupSize]="3" ariaLabel="Code" />`,
    })
    class SepHost {}

    const f = TestBed.createComponent(SepHost);
    f.detectChanges();
    const seps = f.nativeElement.querySelectorAll('.dm-otp__sep');
    // 6 cells / groups of 3 → exactly one separator (after cell 3, none at the end)
    expect(seps.length).toBe(1);
    expect(seps[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('masks filled cells when `mask` is set', () => {
    @Component({
      imports: [DmOtpComponent],
      template: `<dm-otp [length]="3" mask ariaLabel="PIN" />`,
    })
    class MaskHost {}

    const f = TestBed.createComponent(MaskHost);
    f.detectChanges();
    const first: HTMLInputElement = f.nativeElement.querySelector('.dm-otp__cell');
    expect(first.type).toBe('password');
  });

  it('honors defaults injected via OTP_DEFAULTS', () => {
    TestBed.overrideProvider(OTP_DEFAULTS, {
      useValue: { length: 8, mode: 'alphanumeric', color: 'primary', size: 'lg' },
    });

    @Component({
      imports: [DmOtpComponent],
      template: `<dm-otp ariaLabel="Code" />`,
    })
    class DefaultsHost {}

    const f = TestBed.createComponent(DefaultsHost);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('.dm-otp__cell').length).toBe(8);
    expect(f.nativeElement.querySelector('dm-otp').getAttribute('data-size')).toBe('lg');
  });

  it('integrates with Reactive Forms via CVA', () => {
    @Component({
      imports: [DmOtpComponent, ReactiveFormsModule],
      template: `<dm-otp [formControl]="control" [length]="4" ariaLabel="Code" />`,
    })
    class FormHost {
      readonly control = new FormControl('99');
    }

    const f = TestBed.createComponent(FormHost);
    f.detectChanges();
    const items: HTMLInputElement[] = Array.from(f.nativeElement.querySelectorAll('.dm-otp__cell'));
    expect(items[0].value).toBe('9');
    expect(items[1].value).toBe('9');

    items[2].value = '5';
    items[2].dispatchEvent(new Event('input', { bubbles: true }));
    f.detectChanges();
    expect(f.componentInstance.control.value).toBe('995');
  });
});
