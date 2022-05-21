import { Renderer } from "./rendering";
import { Simulation } from "./simulation";
import { NODE_RADIUS } from "./simulation/constants";
import { distance } from "./simulation/maths";
import "./style.css";

const renderer = new Renderer();

// Set up simulation
const simulation = new Simulation(
    [
        { id: "source1", position: { x: renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { id: "source2", position: { x: -renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { id: "sink1", position: { x: 0, y: -renderer.VIEWPORT.y * 0.25 }, type: "sink" },
        { id: "sink2", position: { x: 0, y: renderer.VIEWPORT.y * 0.25 }, type: "sink" },
    ],
    renderer.VIEWPORT
);

// Interactivity
let selection: { node: string; x: number; y: number } | null = null;
renderer.onMouseDown = (x, y) => {
    const node = simulation.nodes.find((node) => distance(node.position, { x, y }) < NODE_RADIUS);
    if (node) selection = { node: node.id, x: x - node.position.x, y: y - node.position.y };
};
renderer.onMouseUp = () => (selection = null);
renderer.onMouseLeave = () => (selection = null);
renderer.onMouseMove = (x, y) => {
    if (!selection) return;

    simulation.updateNodePosition(selection.node, { x: x - selection.x, y: y - selection.y });
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
    simulation.update(dt);

    // Update Display
    renderer.updateCanvasFrame(
        dt,
        simulation.nodes.map(({ position }) => position),
        simulation.projectiles
    );

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);

// Debugging
(window as any).renderer = renderer;
(window as any).simulation = simulation;
