export interface Data {
    id: string | number;
    name?: string;
    parent_id?: string | number;
    level?: number;
    children?: Array<Data>;
    first?: boolean;
    lastLeafNode?: boolean;
    firstLeafNode?: boolean;
}
export interface Node extends Data {
    line1: number;
    line2: number;
    marginSize: number;
    rootNodesep: number;
    xStart: number;
    yStart: number;
    direction: 'horizontal' | 'vertical';
    treeDirection: 'horizontal' | 'vertical';
    nodeText: Array<string>;
    width: number;
    height: number;
    middle: number;
    verticalMiddle: number;
    lineColor: string;
    lineDasharray: string;
    prevNode?: Node;
    nextNode?: Node;
    parentNode?: Node;
    children?: Array<Node>;
    level: number;
    close?: boolean;
    toolsHandle?: () => void;
    setNodeText: () => void;
    createRect: () => SVGElement;
    createText: () => SVGElement;
    createTools: () => SVGElement;
    createLine: () => SVGElement;
}
export interface LinkNode {
    source: string | number;
    target: string | number;
    lineColor?: string;
    offset?: Array<number>;
}
export interface DrawT {
    hasCreated?: boolean;
    data: Array<Data>;
    direction: 'horizontal' | 'vertical';
    $box: HTMLElement | Element | null;
    $svg?: SVGElement;
    toolsHandle?: () => void;
}
//# sourceMappingURL=type.d.ts.map