export type SpanTreeNode = {
  readonly name: string;
  readonly children?: readonly SpanTreeNode[];
};

const HEALTH_PROBE_TREE: readonly SpanTreeNode[] = [
  {
    name: "edge.request",
    children: [{ name: "api.handler" }],
  },
];

const PROBE_SPAN_TREES: Readonly<Record<string, readonly SpanTreeNode[]>> = {
  "/api/health": HEALTH_PROBE_TREE,
};

export const probeSpanTree = (route: string): readonly SpanTreeNode[] | null =>
  PROBE_SPAN_TREES[route] ?? null;

const formatLine = (node: SpanTreeNode, depth: number, isLast: boolean): string => {
  if (depth === 0) {
    return node.name;
  }

  const indent = "    ".repeat(depth - 1);
  const branch = isLast ? "└── " : "├── ";

  return `${indent}${branch}${node.name}`;
};

const flattenNode = (
  node: SpanTreeNode,
  depth: number,
  isLast: boolean,
): readonly string[] => {
  const children = node.children ?? [];

  return [
    formatLine(node, depth, isLast),
    ...children.flatMap((child, index) =>
      flattenNode(child, depth + 1, index === children.length - 1),
    ),
  ];
};

export const formatSpanTree = (nodes: readonly SpanTreeNode[]): readonly string[] =>
  nodes.flatMap((node, index) => flattenNode(node, 0, index === nodes.length - 1));
