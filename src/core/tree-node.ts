import { makeSVG } from '../utils'
import type { Node } from '../type'

export class TreeNode {
	id!: number | string
  name?: string
  level!: number
  children?: Array<Node>
  line1!: number
  line2!: number
  marginSize!: number

  xStart!: number                      		// x 坐标
  yStart!: number                    			// y 坐标

	direction: 'horizontal' | 'vertical' = 'horizontal';               // 文字排列方向  horizontal:水平   vertical:垂直
	treeDirection: 'horizontal' | 'vertical' = 'horizontal';           // 方向  horizontal:水平   vertical:垂直

	nodeText: string[] = [];                // 节点主文本 有换行的情况，需要分段显示
	width!: number                          // 节点最终宽度
	height!: number                         // 节点最终高度
	middle!: number
	verticalMiddle!: number
	close?: boolean

	prevNode?: Node;                        // 前一个兄弟节点
	parentNode?: Node;                      // 父节点
  toolsHandle?: () => void;

  constructor(props: any = {}) {
    for (const k in props) (this as any)[k] = props[k]
  }

  // 设置节点文本
  setNodeText() {
    console.log(this.nodeText)
  }

  // 节点矩形框
  createRect() {
		return makeSVG('rect')
  }

  // 节点文字
  createText() {
		return makeSVG('g')
  }

  // 节点操作按钮
  createTools() {
		return makeSVG('text')
  }

  // 父子节点连接线
  createLine() {
		return makeSVG('g')
	}
}