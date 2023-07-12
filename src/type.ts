export interface TreeNodeT {
  line: number
  line2: number
  marginSize: number

  xStart: number
  yStart: number 

	direction: 'horizontal' | 'vertical';               // 文字排列方向  horizontal:水平   vertical:垂直
	treeDirection: 'horizontal' | 'vertical';           // 方向  horizontal:水平   vertical:垂直

	nodeText: Array<string>                                // 节点主文本 有换行的情况，需要分段显示
	width: number                                       // 节点最终宽度
	height: number                                      // 节点最终高度
	middle: number
	verticalMiddle: number

	prevNode: TreeNodeT                                       // 前一个兄弟节点
	parentNode: TreeNodeT
}


export interface Data {
  id: string | number
  name?: string
  parent_id?: string | number
  level?: number
  children?: Array<Data>
}