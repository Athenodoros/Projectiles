import { distance, subtract, Vector2 } from "../maths";
import { NodeSimulation } from "../nodes";
import { Renderer, TouchDescription } from "../renderer";

interface NodeTouch {
    type: "node";
    initial: Vector2;
    node: number;
    relative: Vector2;
    callback?: number;
}
interface ScreenTouch {
    type: "screen";
    initial: Vector2;
    latest: Vector2;
    callback?: number;
}
interface OrphanedTouch {
    type: "orphaned";
    initial: Vector2;
}
let touches: Record<number, NodeTouch | ScreenTouch | OrphanedTouch> = {};
let lastTouchEnd: { time: number; positions: Vector2[] } | undefined = undefined;

export const setTouchListenersOnRenderer = (
    renderer: Renderer,
    nodes: NodeSimulation,
    togglePauseState: () => void,
    changeStageNumber: (type: "increase" | "decrease") => void
) => {
    renderer.onTouchesChange = (descriptions: TouchDescription[]) => {
        const update: typeof touches = {};

        descriptions.forEach(({ id, ...position }) => {
            let previous = touches[id];

            if (previous === undefined) {
                const node = nodes.getNodeAtPoint(position);
                const common = {
                    initial: position,
                    callback: setTimeout(() => {
                        const touch = touches[id];
                        if (!touch) return;

                        if (touch.type === "screen") {
                            nodes.addNode({ type: "source", position: touch.initial, radius: 15 });
                        }
                        if (touch.type === "node") {
                            nodes.removeNode(touch.node);
                        }

                        touches[id] = { type: "orphaned", initial: touch.initial };
                    }, 500),
                };
                previous =
                    node.index === undefined
                        ? {
                              type: "screen",
                              latest: position,
                              ...common,
                          }
                        : {
                              type: "node",
                              node: node.index,
                              relative: subtract(position, node.node.position),
                              ...common,
                          };
            }

            // Update for movements
            if (previous.type === "node") {
                nodes.moveNode(previous.node, subtract(position, previous.relative));
            }
            if (previous.type === "screen") {
                previous.latest = position;
            }

            // Clear timeouts if holds have moved
            if (previous.type !== "orphaned" && distance(position, previous.initial) > 20) {
                if (previous.callback !== undefined) {
                    clearTimeout(previous.callback);
                    previous.callback = undefined;
                }
            }

            update[id] = previous;
        });

        // Touch ends
        const finished = Object.keys(touches).filter((id) => update[Number(id)] === undefined);
        const time = new Date().valueOf();
        let shouldTogglePauseState = false;
        finished.forEach((id) => {
            const previous = touches[Number(id)];

            // Check for screen changes
            if (previous.type === "screen" && previous.initial.x > previous.latest.x + 100) {
                changeStageNumber("increase");
            } else if (previous.type === "screen" && previous.initial.x < previous.latest.x - 100) {
                changeStageNumber("decrease");
            }

            // Check for node reversals
            else if (previous.type === "node" && previous.callback !== undefined) {
                nodes.flipNodeType(previous.node);
            }

            // Check for pause
            else if (
                lastTouchEnd &&
                time - lastTouchEnd.time <= 1000 &&
                lastTouchEnd.positions.some((prev) => distance(prev, previous.initial) < 20)
            ) {
                shouldTogglePauseState = true;
            }

            // Remove callbacks
            if (previous.type !== "orphaned" && previous.callback !== undefined) clearTimeout(previous.callback);
        });
        if (shouldTogglePauseState) togglePauseState();
        if (finished.length) {
            lastTouchEnd = {
                time,
                positions: finished.map((id) => touches[Number(id)].initial),
            };
        }

        touches = update;
    };
};
