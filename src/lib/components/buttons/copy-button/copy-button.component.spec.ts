import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmCopyButtonComponent } from './copy-button.component';
import { COPY_BUTTON_DEFAULTS } from './copy-button.tokens';
import { DmCopyToClipboardDirective } from './copy-to-clipboard.directive';

/** Install a fake async Clipboard API and return the writeText spy. */
function mockClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

@Component({
  imports: [DmCopyButtonComponent],
  template: `
    <dm-copy-button
      [value]="value()"
      [color]="color()"
      [variant]="variant()"
      [size]="size()"
      [resetDelay]="resetDelay()"
      [ariaLabel]="ariaLabel()"
      [copyLabel]="copyLabel()"
      (copied)="onCopied($event)"
      (copyError)="onError($event)"
    />
  `,
})
class HostComponent {
  readonly value = signal('dm_a1B2c3D4e5');
  readonly color = signal<'default' | 'primary'>('default');
  readonly variant = signal<'flat' | 'bordered'>('flat');
  readonly size = signal<'sm' | 'md'>('md');
  readonly resetDelay = signal(2000);
  readonly ariaLabel = signal('Copy API key');
  readonly copyLabel = signal('');
  readonly copiedText = signal<string | null>(null);
  readonly error = signal<unknown>(null);
  onCopied(text: string) {
    this.copiedText.set(text);
  }
  onError(err: unknown) {
    this.error.set(err);
  }
}

describe('DmCopyButtonComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let writeText: ReturnType<typeof mockClipboard>;

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.dm-button');
  }

  async function create() {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    writeText = mockClipboard();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders an icon-only copy button by default', async () => {
    await create();
    expect(button()).toBeTruthy();
    // Copy glyph shown, no visible text label.
    expect(fixture.nativeElement.querySelector('.dm-copy-button__icon svg')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.dm-copy-button__text')).toBeNull();
    expect(button().getAttribute('aria-label')).toBe('Copy API key');
  });

  it('forwards color / variant / size to the inner dm-button', async () => {
    await create();
    host.color.set('primary');
    host.variant.set('bordered');
    host.size.set('sm');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(button().getAttribute('data-color')).toBe('primary');
    expect(button().getAttribute('data-variant')).toBe('bordered');
    expect(button().getAttribute('data-size')).toBe('sm');
  });

  it('copies the value on click, emits (copied) and flips to the check glyph', async () => {
    await create();
    button().click();
    await flush();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('dm_a1B2c3D4e5');
    expect(host.copiedText()).toBe('dm_a1B2c3D4e5');
    // The check path replaces the copy glyph.
    const path = fixture.nativeElement.querySelector('.dm-copy-button__icon svg path');
    expect(path.getAttribute('d')).toContain('M20 6');
  });

  it('reverts to the copy glyph after resetDelay', async () => {
    await create();
    host.resetDelay.set(10);
    fixture.detectChanges();
    await fixture.whenStable();
    button().click();
    await flush();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.dm-copy-button__icon svg path').getAttribute('d'),
    ).toContain('M20 6');

    await new Promise((r) => setTimeout(r, 20));
    fixture.detectChanges();
    // Back to the copy (rect) glyph.
    expect(fixture.nativeElement.querySelector('.dm-copy-button__icon svg rect')).toBeTruthy();
  });

  it('emits (copyError) when the clipboard write rejects', async () => {
    writeText = mockClipboard(() => Promise.reject(new Error('denied')));
    // No secure-context fallback in the test document.
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    await create();
    button().click();
    await flush();
    fixture.detectChanges();

    expect(host.copiedText()).toBeNull();
    expect(host.error()).toBeInstanceOf(Error);
  });

  it('reads injectable defaults from COPY_BUTTON_DEFAULTS', async () => {
    @Component({
      imports: [DmCopyButtonComponent],
      // No appearance inputs bound → the component falls back to the token defaults.
      template: `<dm-copy-button value="x" ariaLabel="Copy" />`,
    })
    class BareHost {}

    TestBed.overrideProvider(COPY_BUTTON_DEFAULTS, {
      useValue: {
        color: 'primary',
        variant: 'bordered',
        radius: 'full',
        size: 'lg',
        resetDelay: 500,
      },
    });
    const bare = TestBed.createComponent(BareHost);
    bare.detectChanges();
    await bare.whenStable();
    const btn: HTMLButtonElement = bare.nativeElement.querySelector('.dm-button');
    expect(btn.getAttribute('data-color')).toBe('primary');
    expect(btn.getAttribute('data-variant')).toBe('bordered');
    expect(btn.getAttribute('data-size')).toBe('lg');
  });
});

describe('DmCopyToClipboardDirective', () => {
  @Component({
    imports: [DmCopyToClipboardDirective],
    template: `
      <button
        type="button"
        [dmCopyToClipboard]="value()"
        [resetDelay]="10"
        #cp="dmCopyToClipboard"
        (copied)="copied.set($event)"
        (copyError)="error.set($event)"
      >
        {{ cp.isCopied() ? 'Copied' : 'Copy' }}
      </button>
    `,
  })
  class DirHost {
    readonly value = signal('hello');
    readonly copied = signal<string | null>(null);
    readonly error = signal<unknown>(null);
  }

  let fixture: ComponentFixture<DirHost>;
  let host: DirHost;

  beforeEach(() => {
    mockClipboard();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    fixture = TestBed.createComponent(DirHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('copies on click, toggles isCopied and emits (copied)', async () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(btn.textContent?.trim()).toBe('Copy');

    btn.click();
    await flush();
    fixture.detectChanges();

    expect(host.copied()).toBe('hello');
    expect(btn.textContent?.trim()).toBe('Copied');

    await new Promise((r) => setTimeout(r, 20));
    fixture.detectChanges();
    expect(btn.textContent?.trim()).toBe('Copy');
  });
});
