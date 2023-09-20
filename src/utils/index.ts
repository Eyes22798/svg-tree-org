import type { Data, Node } from '../type'

export const transformData2Tree = (data: Array<Data>): Array<Data> => {
  let treeData = JSON.parse(JSON.stringify(data)) as Array<Data>
  const findChild = (rootEl: Data) => {
    const a = treeData.filter((v: Data) => v.parent_id === rootEl.id)
    if (rootEl.id === 0) { // marker first root node
      a[0].first = true
    }
    const b = treeData.filter((v: Data) => v.parent_id !== rootEl.id)
    treeData = b
    rootEl.children = a
    const level = isNaN(rootEl?.level ?? 0) ? 1 : (Number(rootEl.level) + 1)
    for (const v of rootEl?.children ?? []) {
      v.level = level
      findChild(v)
    }
  }

  const top = { id: 0, level: 0 } as unknown as Data
	findChild(top)
  treeData = top.children || []

  treeData.forEach((item) => {
    if (!item.first) {
      findFirstLeafNode([item])
    }
  })

  return treeData
}

export function findLastNode(tree: Array<Data>) {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null; // 如果树为空或不是数组，返回 null
  }

  const lastNode = tree[tree.length - 1]; // 获取数组的最后一个元素

  if (lastNode.children && lastNode.children.length > 0) {
    // 如果最后一个元素有子节点，递归查找子节点中的最后一个元素
    findLastNode(lastNode.children);
  } else {
    lastNode.lastLeafNode = true
  }
}

export function findFirstLeafNode(tree: Array<Data>): Data | null {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null; // 如果树为空或不是数组，返回 null
  }

  for (const node of tree) {
    if (!node.children || node.children.length === 0) {
      // 如果节点没有子节点，即为叶子节点
      return node;
    } else {
      // 如果节点有子节点，递归查找子节点中的第一个叶子节点
      const firstLeaf = findFirstLeafNode(node.children);
      if (firstLeaf) {
        firstLeaf.firstLeafNode = true
        return firstLeaf; // 返回第一个叶子节点
      }
    }
  }

  return null; // 如果树中没有叶子节点，返回 null
}

export const findTreeNode = (id: string | number, tree: Array<Node>): Node | null => {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null
  }

  for (const node of tree) {
    if (node.id === id) {
      return node
    }
    if (node.children && node.children.length > 0) {
      const current = findTreeNode(id, node.children)
      if (current) return current
    }
  }

  return null
}

export const uuid = () => {
  const s = [] as Array<any | number | bigint>;
  const hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid;
}

export const makeSVG = (tag: string, attrs: Record<string, string | number> = {}) => {
  const ns = 'http://www.w3.org/2000/svg', xlinkns = 'http://www.w3.org/1999/xlink';
  const el = document.createElementNS(ns, tag);
  
  if (tag === 'svg') {
    el.setAttribute('xmlns:xlink', xlinkns);
    el.setAttribute('draggable', 'true');
  }
  // 动态插入 svg 子元素
  for (const k in attrs) {
    k === 'xlink:href' ? el.setAttributeNS(xlinkns, k, attrs[k] as string) : el.setAttribute(k, attrs[k] as string);
  }

  return el
}
