import { distance, Vector2 } from "./maths";
import { Node } from "./types";

export abstract class NodeSimulation {
    public list: Node[];

    constructor(list: Node[]) {
        this.list = list;
    }

    update(_dt: number) {}

    getNodeAtPoint(point: Vector2) {
        const index = this.list.findIndex((node) => distance(node.position, point) < node.radius);
        return index < 0 ? { index: undefined, nodex: undefined } : { index, node: this.list[index] };
    }
    addNode(node: Node) {
        this.list.push(node);
    }
    removeNode(index: number) {
        this.list.splice(index, 1);
    }
    moveNode(index: number, position: Vector2) {
        this.list[index].position = position;
    }
    flipNodeType(index: number) {
        this.list[index].type = this.list[index].type === "sink" ? "source" : "sink";
    }
}

export class BaseSimulation extends NodeSimulation {
    constructor(bounds: Vector2) {
        super([
            { position: { x: bounds.x * 0.25, y: 0 }, type: "source", radius: 20 },
            { position: { x: -bounds.x * 0.25, y: 0 }, type: "source", radius: 20 },
            { position: { x: 0, y: -bounds.y * 0.25 }, type: "sink", radius: 20 },
            { position: { x: 0, y: bounds.y * 0.25 }, type: "sink", radius: 20 },
        ]);
    }
}

export class BalanceSimulation extends NodeSimulation {
    constructor(bounds: Vector2) {
        super([
            { position: { x: bounds.x * 0.1, y: 0 }, type: "sink", radius: 20 },
            { position: { x: -bounds.x * 0.1, y: 0 }, type: "sink", radius: 20 },
            { position: { x: bounds.x * 0.05, y: 0 }, type: "source", radius: 20 },
            { position: { x: -bounds.x * 0.05, y: 0 }, type: "source", radius: 20 },
        ]);
    }
}

export class MovingTriangleSimulation extends NodeSimulation {
    dimension: number;
    time = 0;
    originals: [number, Node][];

    constructor(bounds: Vector2) {
        const dimension = Math.min(bounds.x, bounds.y) / 3;

        const sources: Node[] = [...Array(3)].map((_, i) => ({
            position: {
                x: dimension * Math.sin(((Math.PI * 2) / 3) * i),
                y: dimension * Math.cos(((Math.PI * 2) / 3) * i),
            },
            type: "source",
            radius: 20,
        }));

        super([...sources, { position: { x: 0, y: 0 }, type: "sink", radius: 20 }]);

        this.dimension = dimension;
        this.originals = sources.map((node, idx) => [idx, node]);
    }

    update(dt: number): void {
        this.time += dt;
        this.originals.forEach(([idx, node]) => {
            node.position = {
                x: this.dimension * Math.sin(((Math.PI * 2) / 3) * idx + this.time * 1.5),
                y: this.dimension * Math.cos(((Math.PI * 2) / 3) * idx + this.time * 1.5),
            };
        });
    }

    removeNode(index: number): void {
        this.originals = this.originals.filter(([_, node]) => node !== this.list[index]);
        super.removeNode(index);
    }
    moveNode(index: number, position: Vector2): void {
        this.originals = this.originals.filter(([_, node]) => node !== this.list[index]);
        super.moveNode(index, position);
    }
}

export class MovingOscillatorSimulation extends NodeSimulation {
    time = 0;
    sinks: ["left" | "right", Node][];
    bounds: Vector2;

    constructor(bounds: Vector2) {
        const left: Node = { position: { x: -bounds.x * 0.15, y: 0 }, type: "sink", radius: 20 };
        const right: Node = { position: { x: bounds.x * 0.15, y: 0 }, type: "sink", radius: 20 };

        super([left, right, { position: { x: 0, y: 0 }, type: "source", radius: 20 }]);

        this.sinks = [
            ["left", left],
            ["right", right],
        ];
        this.bounds = bounds;
    }

    update(dt: number): void {
        this.time += dt;
        this.sinks.forEach(([position, node]) => {
            node.position = {
                x: this.bounds.x * 0.15 * (position === "left" ? -1 : 1),
                y: this.bounds.y * 0.25 * Math.sin(this.time * 1.5 * (position === "left" ? -1 : 1)),
            };
        });
    }

    removeNode(index: number): void {
        this.sinks = this.sinks.filter(([_, node]) => node !== this.list[index]);
        super.removeNode(index);
    }
    moveNode(index: number, position: Vector2): void {
        this.sinks = this.sinks.filter(([_, node]) => node !== this.list[index]);
        super.moveNode(index, position);
    }
}

export const Simulations = [BaseSimulation, BalanceSimulation, MovingOscillatorSimulation, MovingTriangleSimulation];
