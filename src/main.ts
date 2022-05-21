import { NodeSimulation, Simulations } from "./nodes";
import { ProjectileSimulation } from "./projectiles";
import { addInteractivityToRenderer, Renderer } from "./renderer";
import "./style.css";

const renderer = new Renderer();

// Set up simulation
let nodeSimulationIndex = 0;
let nodes: NodeSimulation = new Simulations[nodeSimulationIndex](renderer.VIEWPORT);
const projectiles = new ProjectileSimulation(renderer.VIEWPORT);

// Interactivity
addInteractivityToRenderer(renderer, nodes, projectiles);
document.onkeydown = (event) => {
    if (event.code === "KeyC") {
        projectiles.list = [];
        renderer.clear();
    }
    if (event.code === "ArrowRight") {
        nodeSimulationIndex = Math.min(Simulations.length, nodeSimulationIndex + 1);
        nodes = new Simulations[nodeSimulationIndex](renderer.VIEWPORT);
        projectiles.list = [];
        renderer.clear();
    }
    if (event.code === "ArrowLeft") {
        nodeSimulationIndex = Math.max(0, nodeSimulationIndex - 1);
        nodes = new Simulations[nodeSimulationIndex](renderer.VIEWPORT);
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
