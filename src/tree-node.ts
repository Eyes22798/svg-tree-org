import { makeSVG } from './utils'
import type { Node } from './type'

const lineColor = '#4ec2ff';               // 线条颜色
const lineWidth = 2;                       // 线条宽度
const collapseSize = 6;                    // 折叠点圆圈尺寸

const fontSize = 13;                       // 节点文本字号
const paddingSize = 5;                     // 一个节点的padding值
const marginSize = 40;                     // 一个节点的右边距
const line1 = 30;                          //  父子节点间距（上方）
const line2 = 80;                          //  父子节点间距（下方）
const maxWidth = 200;                      // 节点矩形框最大宽度
const maxHeight = 200;                     // 节点矩形框最大高度
const lineHeight = 10;                     // 文字行间距
const letterSpacing = 3;                   // 文字字符间距
const toolsHeight = 30

export class TreeNode {
	id!: number | string
  name?: string
  level!: number
  children?: Array<Node>
  line1 = line1
  line2 = line2
  marginSize = marginSize

  xStart!: number                      		// x 坐标
  yStart!: number                    			// y 坐标

	direction: 'horizontal' | 'vertical' = 'horizontal';               // 文字排列方向  horizontal:水平   vertical:垂直
	treeDirection: 'horizontal' | 'vertical' = 'horizontal';           // 方向  horizontal:水平   vertical:垂直

	nodeText: string[] = [];                // 节点主文本 有换行的情况，需要分段显示
	width!: number                          // 节点最终宽度
	height!: number                         // 节点最终高度
	middle!: number
	verticalMiddle!: number

	prevNode?: Node;                        // 前一个兄弟节点
	parentNode?: Node;                      // 父节点
  toolsHandle?: () => void;

  constructor(props: any = {}) {
    for (let k in props) (this as any)[k] = props[k]

    this.setNodeText()
  }

  // 设置节点文本
  setNodeText() {
    if (!this.name) return

		let name = `${this.name}`

		let nodeText: string[] = []
    let w, h
    const isHor = this.direction === 'horizontal' // 文字水平排列

		let compareLength = name.length
		let maxWords = ((isHor ? maxWidth : maxHeight) - paddingSize) / (fontSize + letterSpacing) - 1  // 一行或一竖最多可显示字数

		if (compareLength > maxWords) {
			let lines = Math.ceil(compareLength / maxWords)
			if (isHor) {
				w = maxWidth
				h = lines * (fontSize + lineHeight) + paddingSize + fontSize
			} else {
				w = lines * (fontSize + lineHeight) + paddingSize + fontSize
				h = maxHeight
			}

			nodeText = []
			let func = (str: string) => {
				if (!str) return
				nodeText.push(str.substring(0, maxWords))
				func(str.substring(maxWords))
			}
			func(name)
		} else {
			if (isHor) {
				w = paddingSize + (fontSize + letterSpacing) * compareLength
				h = paddingSize + fontSize + lineHeight + fontSize
			} else {
				w = paddingSize + fontSize + lineHeight + fontSize
				h = paddingSize + (fontSize + letterSpacing) * compareLength
			}
			nodeText = [name]
		}


		if (w < 90) w = 90               // 按钮宽度预留

		this.width = w
		this.height = h + toolsHeight   // 此处的fontSize 表示负责人一横数据高度
		this.nodeText = nodeText
  }

  // 节点矩形框
  createRect() {
    this.middle = this.xStart + this.width / 2   // 中间位置
		this.verticalMiddle = this.yStart + this.height / 2
		return makeSVG('rect', {
			x: this.xStart,
			y: this.yStart,
			width: this.width,
			height: this.height,
			rx: 5,
			class: 'node-rect',
			fill: 'white',
			stroke: lineColor,
			'stroke-width': lineWidth,
		})
  }

  // 节点文字
  createText() {
    let startY = this.yStart + paddingSize + fontSize
		let startX = this.xStart + fontSize
		let textGroup = makeSVG('g',)

		let setAttrs = (i: number): Record<string, string | number> => {
			return this.direction === 'horizontal' ?
				{
					x: startX,
					y: startY + (fontSize + lineHeight) * i,
				} :
				{
					x: startX + (fontSize + letterSpacing + 10) * i,
					y: startY,
					transform: `rotate(90, ${startX + (fontSize + letterSpacing + 10) * i}, ${startY})`,
					rotate: '-90',
				}
		}

		if (this.nodeText.length === 1) {
			let text = makeSVG('text', {
				fill: 'black',
				stroke: 'none',
				'font-size': fontSize,
				'letter-spacing': letterSpacing,
				'text-anchor': 'middle',
				'dominant-baseline': "middle",
				x: this.middle,
				y: startY
			})
			text.innerHTML = this.nodeText[0]
			textGroup.appendChild(text)
		} else {
			for (let i in this.nodeText) {
				let text = makeSVG('text', {
					fill: 'black',
					stroke: 'none',
					'font-size': fontSize,
					'letter-spacing': letterSpacing,
					...setAttrs(Number(i))
				})
				text.innerHTML = this.nodeText[i]
				textGroup.appendChild(text)
			}
		}

		return textGroup
  }

  // 节点操作按钮
  createTools() {
    let tools = makeSVG('text', {
			x: this.middle,
			y: this.yStart + this.height - 10,
			fill: 'black',
			class: 'node-tools',
			'font-size': 12,
			'text-anchor': 'middle',
			'dominant-baseline': "middle",
		})

		let createBtn = (type: 'add' | 'edit' | 'del') => {
			let btn = makeSVG('tspan', {
				fill: { 'add': '#4ec2ff', 'edit': '#5fb878', 'del': '#ff5722' }[type],
				class: 'node-tools-item'
			})
			btn.innerHTML = { 'add': '新增 ', 'edit': '编辑 ', 'del': '删除' }[type]
			btn.addEventListener('click', () => {
				// this.toolsHandle && this.toolsHandle(this, type)
			})
			tools.appendChild(btn)
		}

		if (this.level ?? 0 < 6) createBtn('add')   // 最多新增6级
		createBtn('edit')
		if (this.level ?? 0 > 1) createBtn('del')   // 第一级不可删除

		return tools
  }

  // 父子节点连接线
  createLine() {
		let lines = makeSVG('g', {
			close: 'open'  // 折叠节点使用
		})

		let parent = this.parentNode
		if (parent) {
			let startYParent = parent.yStart + parent.height + line1
			let verticalStartParent = this.xStart - line2
			let lineDth = this.treeDirection === 'vertical'
				? `M ${verticalStartParent} ${this.verticalMiddle} L ${this.xStart} ${this.verticalMiddle} z`
				: `M ${this.middle} ${startYParent} L ${this.middle} ${this.yStart} z`

			// 折叠节点上或者下方的竖线：line2      竖线
			lines.appendChild(makeSVG('path', {
				d: lineDth,
				fill: 'none',
				stroke: lineColor,
				'stroke-width': lineWidth,
			}))

			// 折叠节点下方的横线：向左画（第一个节点不需要画）    横线
			// 寻找前一个节点
			// console.log(this.prevNode)
			let prev = this.prevNode
			if (prev) {
				let start = this.treeDirection === 'vertical'
					? `${verticalStartParent} ${prev.verticalMiddle}`
					: `${prev.middle} ${startYParent}`
				let end = this.treeDirection === 'vertical'
					? `${verticalStartParent} ${this.verticalMiddle}`
					: `${this.middle} ${startYParent}`

				let lineChilds = makeSVG('path', {
					d: `M ${start} L ${end} z`,
					stroke: lineColor,
					'stroke-width': lineWidth,
					fill: 'none',
				})
				lines.appendChild(lineChilds)
			}

		}

		if (!this.children || this.children.length <= 0) return lines

		let startY = this.yStart + this.height + line1
		let verticalStartY = this.xStart + this.width + line1
		let linesDth = this.treeDirection === 'vertical'
			? `M ${this.xStart + this.width} ${this.verticalMiddle} L ${verticalStartY} ${this.verticalMiddle} z`
			: `M ${this.middle} ${this.yStart + this.height} L ${this.middle} ${startY} z`

		// 与子节点的第一段连线
		lines.appendChild(makeSVG('path', {
			d: linesDth,
			stroke: lineColor,
			'stroke-width': lineWidth,
			fill: 'none'
		}))

		// 添加一个折叠节点
		let collapse = makeSVG('circle', {
			cx: this.treeDirection === 'vertical' ? verticalStartY : this.middle,
			cy: this.treeDirection === 'vertical' ? this.verticalMiddle : startY,
			r: collapseSize,
			stroke: lineColor,
			fill: 'white',
			'stroke-width': 1,
			style: 'cursor: pointer',
		})
		let iconText = makeSVG('text', {
			x: this.treeDirection === 'vertical' ? verticalStartY : this.middle,
			y: this.treeDirection === 'vertical' ? this.verticalMiddle : startY,
			'font-size': 12,
			fill: lineColor,
			'text-anchor': 'middle',
			'dominant-baseline': "middle",
			style: 'cursor: pointer',
		})
		iconText.innerHTML = '-'

		let clickFunc = function () {
			let close = lines.getAttribute('close') === 'close',
				brother = lines.parentNode?.childNodes

			lines.setAttribute('close', close ? 'open' : 'close')
			iconText.innerHTML = close ? '-' : '+'
			brother?.forEach((v: any) => {
				if (v.tagName === 'g' && v.getAttribute('collapse') === 'yes') v.style.display = close ? '' : 'none'
			})
		}

		collapse.addEventListener('click', clickFunc)
		iconText.addEventListener('click', clickFunc)

		lines.appendChild(collapse)
		lines.appendChild(iconText)
		return lines
	}
}