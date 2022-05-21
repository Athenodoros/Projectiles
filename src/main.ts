import { NodeSimulation, Simulations } from "./nodes";
import { ProjectileSimulation } from "./projectiles";
import { addListenersToRenderer, Renderer } from "./renderer";
import "./style.css";

const renderer = new Renderer();

// Set up simulation
let nodeSimulationIndex = 0;
let nodes: NodeSimulation = new Simulations[nodeSimulationIndex](renderer.VIEWPORT);
const projectiles = new ProjectileSimulation(renderer.VIEWPORT);

// Interactivity
addListenersToRenderer(renderer, nodes);
const clearProjectileView = () => {
    projectiles.list = [];
    renderer.clear();
};
const updateNodeSimulation = (index: number) => {
    nodeSimulationIndex = index;
    nodes = new Simulations[index](renderer.VIEWPORT);
    addListenersToRenderer(renderer, nodes);
    clearProjectileView();
};
document.onkeydown = (event) => {
    if (event.code === "KeyC") clearProjectileView();
    if (event.code === "ArrowRight" && nodeSimulationIndex < Simulations.length - 1)
        updateNodeSimulation(nodeSimulationIndex + 1);

    if (event.code === "ArrowLeft" && nodeSimulationIndex > 0) updateNodeSimulation(nodeSimulationIndex - 1);
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
    nodes.update(dt);
    projectiles.update(dt, nodes.list);

    // Update Display
    renderer.updateCanvasFrame(dt, nodes.list, projectiles.list);

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);

// Debugging
(window as any).renderer = renderer;
(window as any).simulation = projectiles;
