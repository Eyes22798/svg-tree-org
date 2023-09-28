import type { Data, Node } from '../type';
export declare const transformData2Tree: (data: Array<Data>) => Array<Data>;
export declare function findLastNode(tree: Array<Data>): null | undefined;
export declare function findFirstLeafNode(tree: Array<Data>): Data | null;
export declare const findTreeNode: (id: string | number, tree: Array<Node>) => Node | null;
export declare const uuid: () => string;
export declare const makeSVG: (tag: string, attrs?: Record<string, string | number>) => SVGElement;
//# sourceMappingURL=index.d.ts.map