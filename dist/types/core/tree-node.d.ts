import type { Node } from '../type';
export declare class TreeNode {
    id: number | string;
    parent_id: number | string;
    first: boolean;
    lastLeafNode?: boolean;
    firstLeafNode?: boolean;
    name?: string;
    level: number;
    children?: Array<Node>;
    line1: number;
    line2: number;
    marginSize: number;
    rootNodesep: number;
    xStart: number;
    yStart: number;
    direction: 'horizontal' | 'vertical';
    treeDirection: 'horizontal' | 'vertical';
    nodeText: string[];
    width: number;
    height: number;
    middle: number;
    verticalMiddle: number;
    lineColor: string;
    lineDasharray: string;
    close?: boolean;
    prevNode?: Node;
    nextNode?: Node;
    parentNode?: Node;
    toolsHandle?: () => void;
    constructor(props?: any);
    setNodeText(): void;
    createRect(): SVGElement;
    createText(): SVGElement;
    createTools(): SVGElement;
    createLine(): SVGElement;
}
//# sourceMappingURL=tree-node.d.ts.map