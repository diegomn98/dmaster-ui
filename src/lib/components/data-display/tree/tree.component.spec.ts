import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTreeComponent } from './tree.component';
import { TREE_DEFAULTS } from './tree.tokens';
import { DmTreeNode } from './tree.types';

const NODES: DmTreeNode[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    children: [
      { id: 'apple', label: 'Apple' },
      { id: 'banana', label: 'Banana' },
    ],
  },
  {
    id: 'veggies',
    label: 'Vegetables',
    children: [{ id: 'carrot', label: 'Carrot' }],
  },
  { id: 'grain', label: 'Grain', disabled: true },
];

describe('DmTreeComponent', () => {
  let fixture: ComponentFixture<DmTreeComponent>;

  function create(overrides: Record<string, unknown> = {}): void {
    fixture = TestBed.createComponent(DmTreeComponent);
    fixture.componentRef.setInput('nodes', overrides['nodes'] ?? NODES);
    for (const [key, value] of Object.entries(overrides)) {
      if (key === 'nodes') continue;
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
  }

  const tree = (): HTMLElement => fixture.nativeElement.querySelector('[role="tree"]');
  const items = (): HTMLElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]'));
  const itemById = (id: string): HTMLElement =>
    items().find((el) => el.getAttribute('data-id') === id) as HTMLElement;
  const rowOf = (id: string): HTMLElement =>
    itemById(id).querySelector('.dm-tree__row') as HTMLElement;
  const activeId = (): string | null =>
    (document.activeElement as HTMLElement)?.getAttribute('data-id') ?? null;

  function key(k: string): void {
    tree().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('renders the roots with tree/treeitem roles and ARIA metadata, collapsed by default', () => {
    create();

    expect(tree().getAttribute('role')).toBe('tree');
    // Only the three roots are rendered while everything is collapsed.
    expect(items().length).toBe(3);

    const fruits = itemById('fruits');
    expect(fruits.getAttribute('aria-level')).toBe('1');
    expect(fruits.getAttribute('aria-setsize')).toBe('3');
    expect(fruits.getAttribute('aria-posinset')).toBe('1');
    expect(fruits.getAttribute('aria-expanded')).toBe('false');

    // Leaf nodes get no aria-expanded.
    expect(itemById('grain').getAttribute('aria-expanded')).toBeNull();
  });

  it('renders children inside a role="group" with the correct level when expanded', () => {
    create({ expandedIds: ['fruits'] });

    const group = tree().querySelector('[role="group"]');
    expect(group).not.toBeNull();
    // 3 roots + apple + banana (children of the expanded "fruits").
    expect(items().length).toBe(5);

    const apple = itemById('apple');
    expect(apple.getAttribute('aria-level')).toBe('2');
    expect(apple.getAttribute('aria-posinset')).toBe('1');
    expect(apple.getAttribute('aria-setsize')).toBe('2');
  });

  it('expands and collapses via chevron click and emits nodeToggle', () => {
    create();
    const toggled: string[] = [];
    fixture.componentInstance.nodeToggle.subscribe((n) => toggled.push(n.id));

    rowOf('fruits').querySelector<HTMLElement>('.dm-tree__chevron')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.expandedIds()).toEqual(['fruits']);
    expect(itemById('fruits').getAttribute('aria-expanded')).toBe('true');
    expect(itemById('apple')).toBeTruthy();
    expect(toggled).toEqual(['fruits']);

    rowOf('fruits').querySelector<HTMLElement>('.dm-tree__chevron')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expandedIds()).toEqual([]);
  });

  it('expands with ArrowRight, moves into children, and collapses with ArrowLeft', () => {
    create();

    // Active node defaults to the first visible node (fruits).
    key('ArrowRight'); // expands fruits
    fixture.detectChanges();
    expect(itemById('fruits').getAttribute('aria-expanded')).toBe('true');

    key('ArrowRight'); // moves focus to first child (apple)
    expect(activeId()).toBe('apple');

    key('ArrowLeft'); // apple is a leaf -> moves to parent
    expect(activeId()).toBe('fruits');

    key('ArrowLeft'); // fruits is expanded -> collapses
    fixture.detectChanges();
    expect(itemById('fruits').getAttribute('aria-expanded')).toBe('false');
  });

  it('moves focus with ArrowUp/Down and Home/End over the visible nodes', () => {
    create({ expandedIds: ['fruits', 'veggies'] });
    // Visible order: fruits, apple, banana, veggies, carrot, grain
    itemById('fruits').focus();

    key('ArrowDown');
    expect(activeId()).toBe('apple');
    key('ArrowDown');
    expect(activeId()).toBe('banana');
    key('ArrowUp');
    expect(activeId()).toBe('apple');
    key('End');
    expect(activeId()).toBe('grain');
    key('Home');
    expect(activeId()).toBe('fruits');
  });

  it('supports single selection (replaces the previous node) and emits nodeSelect', () => {
    create({ expandedIds: ['fruits'] });
    const selected: string[] = [];
    fixture.componentInstance.nodeSelect.subscribe((n) => selected.push(n.id));

    rowOf('apple').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['apple']);
    expect(itemById('apple').getAttribute('aria-selected')).toBe('true');

    rowOf('banana').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['banana']);
    expect(itemById('apple').getAttribute('aria-selected')).toBe('false');
    expect(selected).toEqual(['apple', 'banana']);
  });

  it('supports multiple selection with aria-multiselectable', () => {
    create({ selectionMode: 'multiple', expandedIds: ['fruits'] });
    expect(tree().getAttribute('aria-multiselectable')).toBe('true');

    rowOf('apple').click();
    rowOf('banana').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['apple', 'banana']);

    rowOf('apple').click(); // toggles off
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual(['banana']);
  });

  it('never selects a disabled node (click or keyboard)', () => {
    create();

    rowOf('grain').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([]);
    expect(itemById('grain').getAttribute('aria-disabled')).toBe('true');
    expect(itemById('grain').getAttribute('aria-selected')).toBe('false');

    itemById('grain').focus();
    key('Enter');
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedIds()).toEqual([]);
  });

  it('omits aria-selected and aria-multiselectable when selection is off', () => {
    create({ selectionMode: 'none' });

    expect(tree().getAttribute('aria-multiselectable')).toBeNull();
    expect(itemById('fruits').getAttribute('aria-selected')).toBeNull();
  });

  it('keeps a single tab stop (roving tabindex)', () => {
    create({ expandedIds: ['fruits'] });
    const tabbable = items().filter((el) => el.getAttribute('tabindex') === '0');
    expect(tabbable.length).toBe(1);
    expect(tabbable[0].getAttribute('data-id')).toBe('fruits');
  });

  it('exposes expandAll()/collapseAll()', () => {
    create();

    fixture.componentInstance.expandAll();
    fixture.detectChanges();
    expect(fixture.componentInstance.expandedIds().sort()).toEqual(['fruits', 'veggies']);
    // Every descendant is now rendered.
    expect(items().length).toBe(6);

    fixture.componentInstance.collapseAll();
    fixture.detectChanges();
    expect(fixture.componentInstance.expandedIds()).toEqual([]);
    expect(items().length).toBe(3);
  });

  it('expands every expandable sibling with the "*" shortcut', () => {
    create();
    itemById('fruits').focus();

    key('*');
    fixture.detectChanges();
    expect(fixture.componentInstance.expandedIds().sort()).toEqual(['fruits', 'veggies']);
  });

  it('honors defaults injected via TREE_DEFAULTS', () => {
    TestBed.overrideProvider(TREE_DEFAULTS, {
      useValue: { selectionMode: 'multiple', expandOnSelect: true, showGuides: true },
    });
    create();

    expect(tree().getAttribute('aria-multiselectable')).toBe('true');
    expect(tree().getAttribute('data-guides')).toBe('');
  });
});
