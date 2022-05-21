import { distance } from "./maths";
import { ProjectileSimulation } from "./projectiles";
import { Renderer } from "./renderer";
import "./style.css";
import { Node } from "./types";

const renderer = new Renderer();

// Set up simulation
const nodes: Node[] = [
    { position: { x: renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source", radius: 20 },
    { position: { x: -renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source", radius: 20 },
    { position: { x: 0, y: -renderer.VIEWPORT.y * 0.25 }, type: "sink", radius: 20 },
    { position: { x: 0, y: renderer.VIEWPORT.y * 0.25 }, type: "sink", radius: 20 },
];
const projectiles = new ProjectileSimulation(renderer.VIEWPORT);

// Interactivity
let selection: { node: number; x: number; y: number; moved: boolean } | null = null;
const getNodeAtPoint = (x: number, y: number) => {
    const index = nodes.findIndex((node) => distance(node.position, { x, y }) < node.radius);
    return index < 0 ? { index: undefined, nodex: undefined } : { index, node: nodes[index] };
};
renderer.onMouseDown = (x, y, event) => {
    const { index, node } = getNodeAtPoint(x, y);

    if (event.button === 0) {
        if (node) {
            selection = { node: index, x: x - node.position.x, y: y - node.position.y, moved: false };
            renderer.canvas.style.cursor = "grabbing";
        }
    } else if (event.button === 2) {
        if (node) {
            nodes.slice(index, 1);
            renderer.canvas.style.cursor = "auto";
        } else {
            nodes.push({ type: "source", position: { x, y }, radius: 20 });
            renderer.canvas.style.cursor = "pointer";
        }
    }
};
renderer.onMouseUp = (x, y) => {
    if (selection && !selection.moved) {
        nodes[selection.node].type = nodes[selection.node].type === "sink" ? "source" : "sink";
    }

    selection = null;
    renderer.canvas.style.cursor = getNodeAtPoint(x, y).node ? "pointer" : "default";
};
renderer.onMouseLeave = () => {
    selection = null;
    renderer.canvas.style.cursor = "pointer";
};
renderer.onMouseMove = (x, y) => {
    if (!selection) {
        renderer.canvas.style.cursor = getNodeAtPoint(x, y).node ? "pointer" : "default";
        return;
    }

    selection.moved = true;
    nodes[selection.node].position = { x: x - selection.x, y: y - selection.y };
};
document.onkeydown = (event) => {
    if (event.code === "KeyC") {
        projectiles.list = [];
        renderer.clear();
    }
};

// Display Loop
let previous = -1;
const getAnimationFrame = (timestamp: number) => {
    // Update Time-Tracking
    if (previous < 0) {
        previous = timestamp;
    }
    const dt = (timestamp - previous) / 1000;
    previous = timestamp;

    // Run Simulation
    projectiles.update(dt, nodes);

    // Update Display
    renderer.updateCanvasFrame(dt, nodes, projectiles.list);

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);

// Debugging
(window as any).renderer = renderer;
(window as any).simulation = projectiles;
