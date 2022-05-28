import { setInteractivityListeners } from "./interactivity";
import { NodeSimulation, Simulations } from "./nodes";
import { ProjectileSimulation } from "./projectiles";
import { Renderer } from "./renderer";
import "./style.css";

const renderer = new Renderer();

// Set up simulation
let nodeSimulationIndex = 0;
let nodes: NodeSimulation = new Simulations[nodeSimulationIndex](renderer.VIEWPORT);
const projectiles = new ProjectileSimulation(renderer.VIEWPORT);

// Pause State
let paused = true;
const togglePauseState = () => (paused = !paused);
const getPauseState = () => paused;

// Interactivity
const changeNodeSimulation = (index: number) => {
    nodeSimulationIndex = index;
    nodes = new Simulations[index](renderer.VIEWPORT);
    renderer.updateCanvasFrame(0, nodes.list, projectiles.list);
    setInteractivityListeners(renderer, nodes, getPauseState, togglePauseState, changeStageNumber, clearProjectileView);
    clearProjectileView();
};
const changeStageNumber = (type: "increase" | "decrease") => {
    if (type === "increase" && nodeSimulationIndex < Simulations.length - 1)
        changeNodeSimulation(nodeSimulationIndex + 1);
    if (type === "decrease" && nodeSimulationIndex > 0) changeNodeSimulation(nodeSimulationIndex - 1);
};
const clearProjectileView = () => ((projectiles.list = []), renderer.clear());
setInteractivityListeners(renderer, nodes, getPauseState, togglePauseState, changeStageNumber, clearProjectileView);

// Display Loop
let previous = -1;
const getAnimationFrame = (timestamp: number) => {
    // Update Time-Tracking
    if (previous < 0) previous = timestamp;

    const dt = (timestamp - previous) / 1000;
    previous = timestamp;

    if (!paused) {
        // Run Simulation
        nodes.update(dt);
        projectiles.update(dt, nodes.list);

        // Update Display
        renderer.updateCanvasFrame(dt, nodes.list, projectiles.list);
    }

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);

// Debugging
(window as any).renderer = renderer;
(window as any).simulation = projectiles;
