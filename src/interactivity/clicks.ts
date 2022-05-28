import { subtract } from "../maths";
import { NodeSimulation } from "../nodes";
import { Renderer } from "../renderer";

let selection: { node: number; x: number; y: number; moved: boolean } | null = null;
export const setClickListenersOnRenderer = (renderer: Renderer, nodes: NodeSimulation) => {
    renderer.onMouseDown = (position, event) => {
        const { index, node } = nodes.getNodeAtPoint(position);

        if (event.button === 0) {
            if (node) {
                selection = { node: index, moved: false, ...subtract(position, node.position) };
                renderer.nodeCanvas.style.cursor = "grabbing";
            }
        } else if (event.button === 2) {
            if (node) {
                nodes.removeNode(index);
                renderer.nodeCanvas.style.cursor = "auto";
            } else {
                nodes.addNode({ type: "source", position, radius: 15 });
                renderer.nodeCanvas.style.cursor = "pointer";
            }
        }
    };
    renderer.onMouseUp = (position) => {
        if (selection && !selection.moved) {
            nodes.flipNodeType(selection.node);
        }

        selection = null;
        renderer.nodeCanvas.style.cursor = nodes.getNodeAtPoint(position).node ? "pointer" : "default";
    };
    renderer.onMouseLeave = () => {
        selection = null;
        renderer.nodeCanvas.style.cursor = "pointer";
    };
    renderer.onMouseMove = (position) => {
        if (!selection) {
            renderer.nodeCanvas.style.cursor = nodes.getNodeAtPoint(position).node ? "pointer" : "default";
            return;
        }

        selection.moved = true;
        nodes.moveNode(selection.node, subtract(position, selection));
    };
};
