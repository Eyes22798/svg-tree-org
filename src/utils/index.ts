import type { Data, Node } from '../type'

export const transformData2Tree = (data: Array<Data>): Array<Data> => {
  let treeData = JSON.parse(JSON.stringify(data))
  const findChild = (rootEl: Data) => {
    const a = treeData.filter((v: Data) => v.parent_id === rootEl.id)
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

  return treeData
}

export const findTreeNode = (id: string | number, tree: Array<Node>): Node | undefined => {
  let node: Node | undefined  = undefined
  const findNode = (id: string | number, tree: Array<Node>) => {
    node = tree.find((item) => item.id === id)
    if (node || tree.length === 0) return
    for (const v of tree) {
      findNode(id, v.children ?? [])
    }
  }
  findNode(id, tree)
  return node
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
