import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DmIconComponent } from './icon.component';
import { DmIconRegistry } from './icon.registry';
import { provideDmasterIcons } from './icon.tokens';

const STAR = '<svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 .5-5 5 1 7-6-4z"/></svg>';
const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21 3 12a5 5 0 0 1 9-3 5 5 0 0 1 9 3z"/></svg>';

describe('DmIconComponent', () => {
  let fixture: ComponentFixture<DmIconComponent>;
  let host: HTMLElement;

  function setup(providers: unknown[] = []): void {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ...(providers as [])],
    });
    fixture = TestBed.createComponent(DmIconComponent);
    host = fixture.nativeElement as HTMLElement;
  }

  it('renders a registered icon by name', () => {
    setup([provideDmasterIcons({ star: STAR })]);
    fixture.componentRef.setInput('name', 'star');
    fixture.detectChanges();

    const slot = host.querySelector('.dm-icon__svg');
    expect(slot).not.toBeNull();
    expect(slot!.querySelector('svg')).not.toBeNull();
  });

  it('renders nothing from the registry for an unknown name (projects instead)', () => {
    setup([provideDmasterIcons({ star: STAR })]);
    fixture.componentRef.setInput('name', 'does-not-exist');
    fixture.detectChanges();

    expect(host.querySelector('.dm-icon__svg')).toBeNull();
  });

  it('merges multiple provided sets (later wins)', () => {
    setup([provideDmasterIcons({ star: STAR }), provideDmasterIcons({ heart: HEART })]);
    const registry = TestBed.inject(DmIconRegistry);

    expect(registry.get('star')).not.toBeNull();
    expect(registry.get('heart')).not.toBeNull();
    expect(registry.names()).toEqual(['heart', 'star']);
  });

  it('registers an icon at runtime', () => {
    setup();
    const registry = TestBed.inject(DmIconRegistry);
    expect(registry.get('bolt')).toBeNull();

    registry.register('bolt', STAR);
    expect(registry.get('bolt')).not.toBeNull();
  });

  it('resolves named and custom sizes onto the host box', () => {
    setup();
    fixture.detectChanges();
    expect(host.style.width).toBe('1.5rem'); // md default

    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    expect(host.style.width).toBe('1rem');
    expect(host.style.height).toBe('1rem');

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host.style.width).toBe('2rem');

    fixture.componentRef.setInput('size', 20);
    fixture.detectChanges();
    expect(host.style.width).toBe('20px');

    fixture.componentRef.setInput('size', '1em');
    fixture.detectChanges();
    expect(host.style.width).toBe('1em');
  });

  it('resolves color: semantic tokens to CSS vars, everything else verbatim', () => {
    setup();
    fixture.detectChanges();
    expect(host.style.color).toBe('');

    fixture.componentRef.setInput('color', 'primary');
    fixture.detectChanges();
    expect(host.style.color).toBe('var(--dm-primary)');

    fixture.componentRef.setInput('color', 'rgb(139, 92, 246)');
    fixture.detectChanges();
    expect(host.style.color).toBe('rgb(139, 92, 246)');
  });

  it('maps font-mode inputs to the variable-font axes and family', () => {
    setup();
    fixture.componentRef.setInput('fill', true);
    fixture.componentRef.setInput('weight', 600);
    fixture.componentRef.setInput('family', 'rounded');
    fixture.detectChanges();

    expect(host.style.getPropertyValue('--dm-icon-fill')).toBe('1');
    expect(host.style.getPropertyValue('--dm-icon-weight')).toBe('600');
    expect(host.getAttribute('data-family')).toBe('rounded');
  });

  it('reflects spin as a data attribute', () => {
    setup();
    fixture.detectChanges();
    expect(host.hasAttribute('data-spin')).toBe(false);

    fixture.componentRef.setInput('spin', true);
    fixture.detectChanges();
    expect(host.hasAttribute('data-spin')).toBe(true);
  });

  it('is decorative without a label and labelled with one', () => {
    setup();
    fixture.detectChanges();
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.getAttribute('role')).toBeNull();

    fixture.componentRef.setInput('label', 'Favourite');
    fixture.detectChanges();
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Favourite');
  });
});
