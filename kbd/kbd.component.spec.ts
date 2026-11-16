import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmKbdComponent } from './kbd.component';
import { KBD_DEFAULTS } from './kbd.tokens';
import { DmKbdKey, DmKbdSize } from './kbd.types';

@Component({
  imports: [DmKbdComponent],
  template: `<dm-kbd [keys]="keys" [size]="size">{{ letter }}</dm-kbd>`,
})
class KbdHostComponent {
  keys: DmKbdKey | DmKbdKey[] | undefined = undefined;
  size: DmKbdSize = 'md';
  letter = '';
}

describe('DmKbdComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  function create(): ComponentFixture<DmKbdComponent> {
    const fixture = TestBed.createComponent(DmKbdComponent);
    fixture.detectChanges();
    return fixture;
  }

  function symbolKeys(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('.dm-kbd__key--symbol'));
  }

  it('renders no symbol keys and defaults to md when given nothing', () => {
    const fixture = create();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('data-size')).toBe('md');
    expect(symbolKeys(host).length).toBe(0);
  });

  it('renders an array of named keys as symbols, in order', () => {
    const fixture = create();
    fixture.componentRef.setInput('keys', ['shift', 'command', 'enter']);
    fixture.detectChanges();

    const rendered = symbolKeys(fixture.nativeElement).map((k) => k.textContent?.trim());
    expect(rendered).toEqual(['⇧', '⌘', '↵']);
  });

  it('accepts a single key as a string', () => {
    const fixture = create();
    fixture.componentRef.setInput('keys', 'escape');
    fixture.detectChanges();

    const keys = symbolKeys(fixture.nativeElement);
    expect(keys.length).toBe(1);
    expect(keys[0].textContent?.trim()).toBe('⎋');
  });

  it('maps each named key to the correct symbol', () => {
    const cases: [DmKbdKey, string][] = [
      ['command', '⌘'],
      ['shift', '⇧'],
      ['enter', '↵'],
      ['escape', '⎋'],
      ['backspace', '⌫'],
      ['up', '↑'],
    ];

    for (const [name, symbol] of cases) {
      const fixture = create();
      fixture.componentRef.setInput('keys', name);
      fixture.detectChanges();
      expect(symbolKeys(fixture.nativeElement)[0].textContent?.trim()).toBe(symbol);
    }
  });

  it('projects literal content into its own key cap', () => {
    const fixture = TestBed.createComponent(KbdHostComponent);
    fixture.componentInstance.letter = 'K';
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('.dm-kbd__key--content');
    expect(content?.textContent?.trim()).toBe('K');
  });

  it('combines a named key with a projected letter (⌘K)', () => {
    const fixture = TestBed.createComponent(KbdHostComponent);
    fixture.componentInstance.keys = 'command';
    fixture.componentInstance.letter = 'K';
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(symbolKeys(host).length).toBe(1);
    expect(symbolKeys(host)[0].textContent?.trim()).toBe('⌘');
    expect(host.querySelector('.dm-kbd__key--content')?.textContent?.trim()).toBe('K');
  });

  it('exposes an accessible aria-label per named key', () => {
    const fixture = create();
    fixture.componentRef.setInput('keys', ['command', 'shift']);
    fixture.detectChanges();

    const keys = symbolKeys(fixture.nativeElement);
    expect(keys[0].getAttribute('aria-label')).toBe('Command');
    expect(keys[1].getAttribute('aria-label')).toBe('Shift');
  });

  it('hides the symbol glyph from assistive tech', () => {
    const fixture = create();
    fixture.componentRef.setInput('keys', 'command');
    fixture.detectChanges();

    const glyph = fixture.nativeElement.querySelector('.dm-kbd__key--symbol span');
    expect(glyph?.getAttribute('aria-hidden')).toBe('true');
  });

  it('reflects the size input on the host', () => {
    const fixture = create();
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).getAttribute('data-size')).toBe('sm');
  });

  it('honors defaults injected via KBD_DEFAULTS', () => {
    TestBed.overrideProvider(KBD_DEFAULTS, { useValue: { size: 'sm' } });
    const fixture = create();

    expect((fixture.nativeElement as HTMLElement).getAttribute('data-size')).toBe('sm');
  });

  it('does not throw with neither keys nor projected content', () => {
    expect(() => {
      const fixture = TestBed.createComponent(KbdHostComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });
});
