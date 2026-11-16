import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmEmptyStateComponent } from './empty-state.component';
import { EMPTY_STATE_DEFAULTS } from './empty-state.tokens';

describe('DmEmptyStateComponent', () => {
  let fixture: ComponentFixture<DmEmptyStateComponent>;

  function createComponent(): void {
    fixture = TestBed.createComponent(DmEmptyStateComponent);
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

  it('renders the built-in glyph and the md size by default', () => {
    createComponent();

    expect(host().getAttribute('data-size')).toBe('md');
    expect(host().querySelector('.dm-empty-state__media--default svg')).toBeTruthy();
  });

  it('hides the icon area from assistive technology', () => {
    createComponent();

    const media = host().querySelector('.dm-empty-state__media--default');
    expect(media?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders title and description from inputs', () => {
    createComponent();
    fixture.componentRef.setInput('title', 'No results');
    fixture.componentRef.setInput('description', 'Try a different search.');
    fixture.detectChanges();

    expect(host().querySelector('.dm-empty-state__title')?.textContent).toContain('No results');
    expect(host().querySelector('.dm-empty-state__description')?.textContent).toContain(
      'Try a different search.',
    );
  });

  it('renders neither text node when the inputs are absent', () => {
    createComponent();

    expect(host().querySelector('.dm-empty-state__title')).toBeNull();
    expect(host().querySelector('.dm-empty-state__description')).toBeNull();
  });

  it('removes the whole icon area with hideIcon', () => {
    createComponent();
    fixture.componentRef.setInput('hideIcon', true);
    fixture.detectChanges();

    expect(host().querySelector('.dm-empty-state__media')).toBeNull();
  });

  it('reflects size as a data attribute', () => {
    createComponent();
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    expect(host().getAttribute('data-size')).toBe('lg');
  });

  it('honors defaults injected via EMPTY_STATE_DEFAULTS', () => {
    TestBed.overrideProvider(EMPTY_STATE_DEFAULTS, { useValue: { size: 'sm' } });
    createComponent();

    expect(host().getAttribute('data-size')).toBe('sm');
  });

  it('projects a custom icon into the custom media slot', () => {
    @Component({
      imports: [DmEmptyStateComponent],
      template: `
        <dm-empty-state title="No results">
          <svg dmEmptyStateIcon data-testid="custom-icon" viewBox="0 0 24 24"></svg>
        </dm-empty-state>
      `,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const custom = hostFixture.nativeElement.querySelector(
      '.dm-empty-state__media--custom [data-testid="custom-icon"]',
    );
    expect(custom).toBeTruthy();
  });

  it('projects actions into the actions slot', () => {
    @Component({
      imports: [DmEmptyStateComponent],
      template: `
        <dm-empty-state title="No projects">
          <button data-testid="cta" type="button">New project</button>
        </dm-empty-state>
      `,
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    const cta = hostFixture.nativeElement.querySelector(
      '.dm-empty-state__actions [data-testid="cta"]',
    );
    expect(cta).toBeTruthy();
  });
});
