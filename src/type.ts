export interface Data {
  id: string | number
  name?: string
  parent_id?: string | number
  level?: number
  children?: Array<Data>
  first?: boolean
  lastLeafNode?: boolean
  firstLeafNode?: boolean
}

export interface Node extends Data {
  line1: number
  line2: number
  marginSize: number
  rootNodesep: number

  xStart: number
  yStart: number 

	direction: 'horizontal' | 'vertical'                // 文字排列方向  horizontal:水平   vertical:垂直
	treeDirection: 'horizontal' | 'vertical'            // 方向  horizontal:水平   vertical:垂直

	nodeText: Array<string>                             // 节点主文本 有换行的情况，需要分段显示
	width: number                                       // 节点最终宽度
	height: number                                      // 节点最终高度
	middle: number
	verticalMiddle: number
  lineColor: string                                   // 节点前方path颜色
  lineDasharray: string

	prevNode?: Node                                     // 前一个兄弟节点
  nextNode?: Node
	parentNode?: Node
  children?: Array<Node>
  level: number
  close?: boolean

  toolsHandle?: () => void
  setNodeText: () => void
  createRect: () => SVGElement
  createText: () => SVGElement
  createTools: () => SVGElement
  createLine: () => SVGElement
}

export interface LinkNode {
  source: string | number
  target: string | number
  lineColor?: string
  offset?: Array<number>
}

export interface DrawT {
  hasCreated?: boolean
  data: Array<Data>
  direction: 'horizontal' | 'vertical'
  $box: HTMLElement | Element | null
  $svg?: SVGElement
  toolsHandle?: () => void
}