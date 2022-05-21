import { Simulation } from "./simulation";
import "./style.css";

const BACKGROUND = "#0a091a";
const WHITE = "#e0e7ff";

// Set up canvas and draw context
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const VIEWPORT = { x: window.innerWidth, y: innerHeight };

// Set up scaling
const dpr = window.devicePixelRatio || 1;
canvas.width = VIEWPORT.x * dpr;
canvas.height = VIEWPORT.y * dpr;
canvas.style.width = VIEWPORT.x + "px";
canvas.style.height = VIEWPORT.y + "px";
ctx.scale(dpr, dpr);

// Set up initial view
ctx.fillStyle = BACKGROUND;
ctx.rect(0, 0, VIEWPORT.x, VIEWPORT.y);
ctx.fill();

// Set up simulation
const NODE_WIDTH = 20;
const simulation = new Simulation(
    [
        { position: { x: VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { position: { x: -VIEWPORT.x * 0.25, y: 0 }, type: "source" },
        { position: { x: 0, y: -VIEWPORT.y * 0.25 }, type: "sink" },
        { position: { x: 0, y: VIEWPORT.y * 0.25 }, type: "sink" },
    ],
    NODE_WIDTH,
    VIEWPORT
);

// Responsive Sizing
window.onresize = () => {
    if (window.innerWidth > VIEWPORT.x || window.innerHeight > VIEWPORT.y) {
        VIEWPORT.x = window.innerWidth;
        VIEWPORT.y = window.innerHeight;

        // Cache everything on temporary canvas
        const copy_canvas = document.createElement("canvas");
        const copy_ctx = copy_canvas.getContext("2d")!;
        copy_canvas.width = canvas.width;
        copy_canvas.height = canvas.height;
        copy_ctx.scale(1 / dpr, 1 / dpr);
        copy_ctx.drawImage(canvas, 0, 0);

        canvas.width = VIEWPORT.x * dpr;
        canvas.height = VIEWPORT.y * dpr;
        canvas.style.width = VIEWPORT.x + "px";
        canvas.style.height = VIEWPORT.y + "px";
        ctx.scale(dpr, dpr);
        ctx.drawImage(copy_canvas, 0, 0);
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
    simulation.update(dt);

    // Update Display
    ctx.fillStyle = BACKGROUND;
    ctx.globalAlpha = 1 - Math.pow(0.01, dt);
    ctx.rect(0, 0, VIEWPORT.x, VIEWPORT.y);
    ctx.fill();

    ctx.lineWidth = 0.5;
    ctx.fillStyle = WHITE;
    ctx.strokeStyle = WHITE;
    ctx.globalAlpha = 1;
    simulation.nodes.forEach(({ position }) => {
        ctx.beginPath();
        ctx.arc(position.x + VIEWPORT.x / 2, position.y + VIEWPORT.y / 2, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(position.x + VIEWPORT.x / 2, position.y + VIEWPORT.y / 2, NODE_WIDTH, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
    });
    simulation.projectiles.forEach(({ position }) => {
        ctx.beginPath();
        ctx.arc(position.x + VIEWPORT.x / 2, position.y + VIEWPORT.y / 2, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    });

    // Re-Enter Loop
    window.requestAnimationFrame(getAnimationFrame);
};

window.requestAnimationFrame(getAnimationFrame);
