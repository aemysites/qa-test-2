/**
 * breadcrumb — the source `np-box` trail: a row of links, the last item is the current page.
 *
 * Authoring (one cell): a bulleted list, one item per step — linked items are ancestors,
 * the last item (usually unlinked) is the current page. A list is one editable unit (EW5).
 * Fallback for off-pipeline content: link paragraphs / plain paragraphs, one per step —
 * each moved into its own list item.
 */

function collectItems(block) {
  const list = block.querySelector('ul, ol');
  if (list) return { list, items: [...list.children] };
  const fresh = document.createElement('ul');
  const nodes = [...block.querySelectorAll(':scope > div > div > *')];
  nodes.forEach((node) => {
    const li = document.createElement('li');
    li.append(node);
    fresh.append(li);
  });
  return { list: fresh, items: [...fresh.children] };
}

export default function decorate(block) {
  const { list, items } = collectItems(block);
  if (!items.length) {
    block.closest('.section')?.classList.add('breadcrumb-empty');
    return;
  }
  list.classList.add('cmp-breadcrumb__list');
  items.forEach((li, i) => {
    li.classList.add('item');
    const link = li.querySelector('a');
    if (link) link.classList.add('cmp-breadcrumb__item-link');
    if (i === items.length - 1) {
      li.classList.add('active');
      li.setAttribute('aria-current', 'page');
    }
  });

  const box = document.createElement('section');
  box.className = 'np-box';
  const nav = document.createElement('nav');
  nav.className = 'breadcrumb-nav container';
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(list);
  box.append(nav);
  block.replaceChildren(box);
}
