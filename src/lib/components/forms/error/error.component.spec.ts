import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmErrorComponent } from './error.component';
import { provideErrorDefaults } from './error.tokens';

@Component({
  imports: [DmErrorComponent],
  template: `<dm-error>Email is required</dm-error>`,
})
class HostComponent {}

@Component({
  imports: [DmErrorComponent],
  template: `<dm-error><svg class="my-icon"></svg>Email is required</dm-error>`,
})
class HostWithIconComponent {}

describe('DmErrorComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  });

  function createDirect(): ComponentFixture<DmErrorComponent> {
    const fixture = TestBed.createComponent(DmErrorComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('projects the message text', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('dm-error');
    expect(host.textContent).toContain('Email is required');
  });

  it('is announced as an alert', () => {
    const fixture = createDirect();
    expect((fixture.nativeElement as HTMLElement).getAttribute('role')).toBe('alert');
  });

  it('carries no icon of its own — projects arbitrary content, icon included', () => {
    const fixture = TestBed.createComponent(HostWithIconComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector('dm-error');
    expect(host.querySelector('svg.my-icon')).not.toBeNull();
    expect(host.textContent).toContain('Email is required');
  });

  it('reflects the size on the host', () => {
    const fixture = createDirect();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.getAttribute('data-size')).toBe('sm');
    fixture.componentRef.setInput('size', 'md');
    fixture.detectChanges();
    expect(el.getAttribute('data-size')).toBe('md');
  });

  it('honors injected defaults', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideErrorDefaults({ size: 'md' })],
    });
    const fixture = TestBed.createComponent(DmErrorComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).getAttribute('data-size')).toBe('md');
  });
});
