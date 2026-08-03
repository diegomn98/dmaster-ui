import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTooltipDirective } from './tooltip.directive';

@Component({
  imports: [DmTooltipDirective],
  template: '<button dmTooltip="Copy to clipboard" dmTooltipPosition="bottom">Copy</button>',
})
class HostComponent {}

describe('DmTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  function button(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('shows the panel on focus and wires aria-describedby', () => {
    button().dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();

    const panel = overlayContainer.getContainerElement().querySelector('dm-tooltip-panel');
    expect(panel?.textContent).toContain('Copy to clipboard');
    expect(panel?.getAttribute('role')).toBe('tooltip');
    expect(button().getAttribute('aria-describedby')).toBeTruthy();
  });

  it('hides the panel on blur and removes aria-describedby', () => {
    button().dispatchEvent(new Event('focusin', { bubbles: true }));
    fixture.detectChanges();
    button().dispatchEvent(new Event('focusout', { bubbles: true }));
    fixture.detectChanges();

    expect(overlayContainer.getContainerElement().querySelector('dm-tooltip-panel')).toBeNull();
    expect(button().getAttribute('aria-describedby')).toBeNull();
  });
});
