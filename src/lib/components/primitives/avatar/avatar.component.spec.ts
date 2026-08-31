import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmAvatarFallbackDirective } from './avatar-fallback.directive';
import { DmAvatarComponent } from './avatar.component';
import { AVATAR_DEFAULTS } from './avatar.tokens';

@Component({
  imports: [DmAvatarComponent, DmAvatarFallbackDirective],
  template: `
    <dm-avatar [src]="src()" [initials]="initials()">
      <svg dmAvatarFallback class="custom-fallback" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h16" />
      </svg>
    </dm-avatar>
  `,
})
class FallbackHostComponent {
  readonly src = signal<string | null>(null);
  readonly initials = signal('');
}

describe('DmAvatarComponent', () => {
  let fixture: ComponentFixture<DmAvatarComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmAvatarComponent);
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders the generic icon when there is no src nor initials', () => {
    createComponent();

    expect(host().querySelector('.dm-avatar__icon')).toBeTruthy();
    // No alt and no initials → nothing to name it, so the fallback is decorative:
    // no img role (a nameless role="img" would trip role-img-alt).
    expect(host().getAttribute('role')).toBeNull();
    expect(host().getAttribute('aria-label')).toBeNull();
    expect(host().style.width).toBe('2.5rem');
  });

  it('renders initials with an accessible label', () => {
    createComponent();
    fixture.componentRef.setInput('initials', 'DM');
    fixture.componentRef.setInput('alt', 'Diego Maestro');
    fixture.detectChanges();

    expect(host().querySelector('.dm-avatar__initials')?.textContent?.trim()).toBe('DM');
    expect(host().getAttribute('aria-label')).toBe('Diego Maestro');
  });

  it('renders the image when src is set', () => {
    createComponent();
    fixture.componentRef.setInput('src', '/avatar.png');
    fixture.componentRef.setInput('alt', 'Diego');
    fixture.detectChanges();

    const img = host().querySelector<HTMLImageElement>('.dm-avatar__img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('alt')).toBe('Diego');
    expect(host().getAttribute('role')).toBeNull();
  });

  it('falls back to initials when the image fails, and retries on src change', () => {
    createComponent();
    fixture.componentRef.setInput('src', '/broken.png');
    fixture.componentRef.setInput('initials', 'DM');
    fixture.detectChanges();

    host().querySelector('.dm-avatar__img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(host().querySelector('.dm-avatar__img')).toBeNull();
    expect(host().querySelector('.dm-avatar__initials')).toBeTruthy();

    fixture.componentRef.setInput('src', '/other.png');
    fixture.detectChanges();
    expect(host().querySelector('.dm-avatar__img')).toBeTruthy();
  });

  it('maps named sizes and accepts numeric pixel sizes', () => {
    createComponent();
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    expect(host().style.width).toBe('3rem');

    fixture.componentRef.setInput('size', 64);
    fixture.detectChanges();
    expect(host().style.width).toBe('64px');
    expect(host().style.fontSize).toBe('24px');
  });

  it('honors defaults injected via AVATAR_DEFAULTS', () => {
    TestBed.overrideProvider(AVATAR_DEFAULTS, {
      useValue: { size: 'sm', shape: 'square', color: 'success' },
    });
    createComponent();

    expect(host().style.width).toBe('2rem');
    expect(host().getAttribute('data-shape')).toBe('square');
    expect(host().getAttribute('data-color')).toBe('success');
  });

  it('reflects the color input as data-color', () => {
    createComponent();
    fixture.componentRef.setInput('color', 'danger');
    fixture.detectChanges();
    expect(host().getAttribute('data-color')).toBe('danger');
  });

  it('a projected [dmAvatarFallback] replaces the generic icon', () => {
    const hostFixture = TestBed.createComponent(FallbackHostComponent);
    hostFixture.detectChanges();

    const avatar: HTMLElement = hostFixture.nativeElement.querySelector('dm-avatar');
    expect(avatar.querySelector('.custom-fallback')).toBeTruthy();
    expect(avatar.querySelector('.dm-avatar__icon')).toBeNull();
  });

  it('initials and image still win over the custom fallback', () => {
    const hostFixture = TestBed.createComponent(FallbackHostComponent);
    hostFixture.componentInstance.initials.set('DM');
    hostFixture.detectChanges();

    const avatar: HTMLElement = hostFixture.nativeElement.querySelector('dm-avatar');
    expect(avatar.querySelector('.dm-avatar__initials')).toBeTruthy();
    expect(avatar.querySelector('.custom-fallback')).toBeNull();

    hostFixture.componentInstance.src.set('/avatar.png');
    hostFixture.detectChanges();
    expect(avatar.querySelector('.dm-avatar__img')).toBeTruthy();
    expect(avatar.querySelector('.custom-fallback')).toBeNull();
  });
});
