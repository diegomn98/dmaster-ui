import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmTreeNodeDirective } from './tree-node.directive';
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

  it('renders the default row as chevron/spacer + label only (icon is data, not rendered)', () => {
    const withIcons: DmTreeNode[] = [
      {
        id: 'docs',
        label: 'Docs',
        icon: 'folder',
        children: [{ id: 'guide', label: 'guide.md', icon: 'file' }],
      },
    ];
    create({ nodes: withIcons, expandedIds: ['docs'] });

    // `icon` is data for a dmTreeNode template — the default row never renders it.
    expect(fixture.nativeElement.querySelector('.dm-tree__icon')).toBeNull();
    expect(rowOf('docs').querySelector('.dm-tree__label')!.textContent!.trim()).toBe('Docs');
    // Exactly two children: the chevron (parent) / spacer (leaf) plus the label.
    expect(rowOf('docs').children.length).toBe(2);
    expect(rowOf('guide').querySelector('.dm-tree__spacer')).not.toBeNull();
    expect(rowOf('guide').children.length).toBe(2);
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

describe('DmTreeComponent with a custom node template (dmTreeNode)', () => {
  @Component({
    imports: [DmTreeComponent, DmTreeNodeDirective],
    template: `
      <dm-tree
        [nodes]="nodes"
        [(selectedIds)]="selected"
        [(expandedIds)]="expanded"
        ariaLabel="Files"
      >
        <ng-template
          dmTreeNode
          let-node
          let-level="level"
          let-expanded="expanded"
          let-selected="selected"
        >
          <span
            class="custom-node"
            [attr.data-icon]="node.icon ?? null"
            [attr.data-level]="level"
            [attr.data-expanded]="expanded"
            [attr.data-selected]="selected"
          >
            {{ node.label }}
          </span>
        </ng-template>
      </dm-tree>
    `,
  })
  class TemplatedHostComponent {
    readonly nodes: DmTreeNode[] = [
      {
        id: 'fruits',
        label: 'Fruits',
        icon: 'basket',
        children: [
          { id: 'apple', label: 'Apple', icon: 'apple' },
          { id: 'banana', label: 'Banana' },
        ],
      },
      { id: 'grain', label: 'Grain' },
    ];
    readonly selected = signal<string[]>([]);
    readonly expanded = signal<string[]>(['fruits']);
  }

  let host: ComponentFixture<TemplatedHostComponent>;

  const items = (): HTMLElement[] =>
    Array.from(host.nativeElement.querySelectorAll('[role="treeitem"]'));
  const itemById = (id: string): HTMLElement =>
    items().find((el) => el.getAttribute('data-id') === id) as HTMLElement;
  const rowOf = (id: string): HTMLElement =>
    itemById(id).querySelector('.dm-tree__row') as HTMLElement;
  const customIn = (id: string): HTMLElement =>
    rowOf(id).querySelector('.custom-node') as HTMLElement;

  function key(k: string): void {
    host.nativeElement
      .querySelector('[role="tree"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    host = TestBed.createComponent(TemplatedHostComponent);
    host.detectChanges();
  });

  it('renders the template for every visible row with node/level/expanded/selected context', () => {
    // fruits (expanded) + apple + banana + grain.
    expect(items().length).toBe(4);
    expect(host.nativeElement.querySelectorAll('.custom-node').length).toBe(4);
    // The default label markup is fully replaced.
    expect(host.nativeElement.querySelector('.dm-tree__label')).toBeNull();

    const fruits = customIn('fruits');
    expect(fruits.textContent!.trim()).toBe('Fruits');
    expect(fruits.getAttribute('data-icon')).toBe('basket');
    expect(fruits.getAttribute('data-level')).toBe('1');
    expect(fruits.getAttribute('data-expanded')).toBe('true');
    expect(fruits.getAttribute('data-selected')).toBe('false');

    const apple = customIn('apple');
    expect(apple.getAttribute('data-level')).toBe('2');
    // Leaf nodes always report expanded: false.
    expect(apple.getAttribute('data-expanded')).toBe('false');
  });

  it('keeps the chevron/spacer and the treeitem ARIA around the template', () => {
    expect(rowOf('fruits').querySelector('.dm-tree__chevron')).not.toBeNull();
    expect(rowOf('banana').querySelector('.dm-tree__spacer')).not.toBeNull();

    const fruits = itemById('fruits');
    expect(fruits.getAttribute('aria-level')).toBe('1');
    expect(fruits.getAttribute('aria-expanded')).toBe('true');
    expect(fruits.getAttribute('aria-selected')).toBe('false');
  });

  it('keeps selection and chevron expansion working through a templated row', () => {
    rowOf('apple').click();
    host.detectChanges();
    expect(host.componentInstance.selected()).toEqual(['apple']);
    expect(itemById('apple').getAttribute('aria-selected')).toBe('true');
    expect(customIn('apple').getAttribute('data-selected')).toBe('true');

    rowOf('fruits').querySelector<HTMLElement>('.dm-tree__chevron')!.click();
    host.detectChanges();
    expect(host.componentInstance.expanded()).toEqual([]);
    expect(customIn('fruits').getAttribute('data-expanded')).toBe('false');
  });

  it('keeps the keyboard model working with a templated row', () => {
    itemById('fruits').focus();

    key('ArrowDown');
    expect((document.activeElement as HTMLElement).getAttribute('data-id')).toBe('apple');

    key('Enter');
    host.detectChanges();
    expect(host.componentInstance.selected()).toEqual(['apple']);

    key('ArrowLeft'); // apple is a leaf -> focus moves to the parent
    expect((document.activeElement as HTMLElement).getAttribute('data-id')).toBe('fruits');
  });
});
