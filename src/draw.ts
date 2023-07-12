 import type { Data, DrawT, Node } from './type'
 import { makeSVG } from './utils/index'
 import { TreeNode } from './tree-node'
 
 export class Draw {
  hasCreated = false;                       // 是否已经绘制过
	data!: Array<Data>;                       // 要绘制的数据
	direction: 'horizontal' | 'vertical' = 'horizontal'		              // 架构图方向

	$box!: HTMLElement;                       // 生成的svg要填充到的 dom元素
	$svg!: SVGElement;                        // 生成的svg元素

  constructor(options: DrawT = {}) {
    if (options.data) this.setData(options.data)
		if (options.$box) this.$box = options.$box
		if (options.toolsHandle) this.toolsHandle = options.toolsHandle
		if (options.direction) this.direction = options.direction
  }

  setData(tableData: Array<Data>) {
    if (!tableData || tableData.length === 0) {
			this.data = []
			return
		}
		this.data = JSON.parse(JSON.stringify(tableData))  // 深拷贝原始数据
  }

  toolsHandle() {

  }

  // 画图
  create() {
    if (!this.data || this.data.length <= 0) return

		//  if (this.hasCreated) return;  // 避免重复创建
		//  this.hasCreated = true

		this.$box.innerHTML = ''
		this.$svg = makeSVG('svg')

		this.setAxis()
		this.createSvg(this.data as unknown as Array<Node>)

		this.$box.append(this.$svg)
		//  滚动到中心位置
		//  box.scrollTo(svgWidth / 2 - box.offsetWidth / 2, 0)
  }

  // 设置节点坐标
  setAxis() {
    let levelXStart: Record<number, number> = {},  // 寻找同级节点的离当前线最近的x坐标，防止节点重叠
			levelYStart: Record<number, number> = {},
			xStart = 100,
			svgWidth = 0,
			svgHeight = 0
		let yStart = this.direction === 'vertical' ? 100 : 0

    let func = (arr: Array<Node>, parent?: Node) => {
			if (!arr || arr.length <= 0) return

			let y = parent ? (parent.yStart + parent.line1 + parent.line2 + parent.height) : 0  // line1 line2 参见 node.js
			let x = parent ? (parent.xStart + parent.line1 + parent.line2 + parent.width) : 0  // line1 line2 参见 node.js

			arr.forEach((v: TreeNode, i) => {
				v.treeDirection = this.direction
				let node = new TreeNode(v)
				node.yStart = y
				if (this.direction === 'vertical') node.xStart = x
				node.parentNode = parent
				node.prevNode = arr[i - 1]
				node.toolsHandle = this.toolsHandle  // 操作按钮
				arr[i] = node

				if (levelXStart[v.level] > xStart) xStart = levelXStart[v.level]
				if (levelYStart[v.level] > yStart) yStart = levelYStart[v.level]

				if (node.children && node.children.length) {
					let minXStart = xStart
					let minYStart = yStart
					func(node.children, node)

					let end = node.children[node.children.length - 1], first = node.children[0]

					let nowXStart = (end.xStart + end.width - first.xStart - node.width) / 2 + first.xStart
					let nowYStart = (end.yStart + end.height - first.yStart - node.height) / 2 + first.yStart

					let nowLimit = this.direction === 'vertical' ? nowYStart < minYStart : nowXStart < minXStart
					if (nowLimit) { // 可能有重叠块，重新计算一下位置
						let num = this.direction === 'vertical' ? (minYStart - nowYStart) : (minXStart - nowXStart)
						let resetAxis = (childs: Array<Node>) => {
							for (let v of childs) {
								if (this.direction === 'vertical') {
									v.yStart += num
									let x = v.yStart + v.height + v.marginSize
									if (levelYStart[v.level] < x) levelYStart[v.level] = x
								}
								if (this.direction === 'horizontal') {
									v.xStart += num
									let x = v.xStart + v.width + v.marginSize
									if (levelXStart[v.level] < x) levelXStart[v.level] = x
								}
								
								if (v.children && v.children.length) resetAxis(v.children)
							}
						}
						resetAxis(node.children)

						if (this.direction === 'vertical') {
							yStart = minYStart
						} else {
							xStart = nowXStart
						}
					} else {
						if (this.direction === 'vertical') {
							yStart = nowYStart
						} else {
							xStart = nowXStart
						}
					}
					if (this.direction === 'vertical') {
						node.yStart = yStart
						if (arr[i + 1]) yStart += node.height + node.marginSize
					} else {
						node.xStart = xStart
						if (arr[i + 1]) xStart += node.width + node.marginSize
					}
				} else {
					if (this.direction === 'vertical') {
						node.yStart = yStart
						yStart += node.height + node.marginSize
					} else {
						node.xStart = xStart
						xStart += node.width + node.marginSize
					}
				}
				if (this.direction === 'vertical') {
					levelYStart[v.level] = yStart
				} else {
					levelXStart[v.level] = xStart
				}
			})

			// 画布大小设置
			if (y > svgHeight) svgHeight = y
			if (x > svgWidth && this.direction === 'vertical') svgWidth = x
			if (xStart > svgWidth) svgWidth = xStart
			if (yStart > svgHeight && this.direction === 'vertical') svgHeight = yStart
		}

    func(this.data as unknown as Array<Node>)

		// console.log(this.data)

		this.$svg.setAttribute('width', String(svgWidth + 300))
		this.$svg.setAttribute('height', String(svgHeight + 300))
  }

  // 生成各节点实例
  createSvg(arr: Array<Node>, parentDiv?: SVGElement) {
    if (!arr || arr.length <= 0) return []

		for (let v of arr) {
			let g = makeSVG('g', {
				collapse: 'yes',
				id: `level-${v.level}-${v.id}`
			})

			// 节点矩形框
			g.appendChild(v.createRect())

			// 节点文本
			g.appendChild(v.createText())

			// 操作：新增、编辑、删除
			g.appendChild(v.createTools())

			let hasChild = v.children && v.children.length > 0
			if (hasChild) this.createSvg(v.children ?? [], g)

			// 节点与父节点的连线
			if (parentDiv || hasChild) g.appendChild(v.createLine())

			let top = parentDiv || this.$svg
			top.appendChild(g)
		}
  }
 }