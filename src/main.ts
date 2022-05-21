import { Renderer } from "./rendering";
import { Simulation } from "./simulation";
import "./style.css";

const renderer = new Renderer();

// Set up simulation
const simulation = new Simulation(
    [
        { position: { x: renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { position: { x: -renderer.VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { position: { x: 0, y: -renderer.VIEWPORT.y * 0.25 }, type: "sink" },
        { position: { x: 0, y: renderer.VIEWPORT.y * 0.25 }, type: "sink" },
    ],
    renderer.VIEWPORT
);

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
        simulation.projectiles.map(({ position }) => position)
    );

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);

(window as any).renderer = renderer;
(window as any).simulation = simulation;
