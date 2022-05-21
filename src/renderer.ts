import { Vector2 } from "./maths";
import { NodeSimulation } from "./nodes";
import { Node, Projectile } from "./types";

const BACKGROUND = "#0a091a";
const WHITE = "#e0e7ff";

export class Renderer {
    public projectileCanvas: HTMLCanvasElement;
    public projectileCtx: CanvasRenderingContext2D;
    public nodeCanvas: HTMLCanvasElement;
    public nodeCtx: CanvasRenderingContext2D;
    public VIEWPORT: Vector2;
    public dpr: number;

    constructor() {
        // Set up canvas and draw context
        this.projectileCanvas = document.getElementById("projectile-canvas") as HTMLCanvasElement;
        this.projectileCtx = this.projectileCanvas.getContext("2d")!;
        this.nodeCanvas = document.getElementById("node-canvas") as HTMLCanvasElement;
        this.nodeCtx = this.nodeCanvas.getContext("2d")!;

        this.VIEWPORT = { x: window.innerWidth, y: innerHeight };

        // Set up scaling
        this.dpr = window.devicePixelRatio || 1;
        this.updateCanvasSizes();
        this.clear();

        // Scaling on Window Resize
        window.onresize = () => this.resizeCanvas();

        // Event Handlers
        const getLocalX = (event: MouseEvent) => event.clientX - this.VIEWPORT.x / 2;
        const getLocalY = (event: MouseEvent) => event.clientY - this.VIEWPORT.y / 2;
        this.nodeCanvas.onclick = (event) => this.onClick(getLocalX(event), getLocalY(event), event);
        this.nodeCanvas.onmousedown = (event) => this.onMouseDown(getLocalX(event), getLocalY(event), event);
        this.nodeCanvas.onmousemove = (event) => this.onMouseMove(getLocalX(event), getLocalY(event));
        this.nodeCanvas.onmouseup = (event) => this.onMouseUp(getLocalX(event), getLocalY(event));
        this.nodeCanvas.onmouseleave = () => this.onMouseLeave();
        this.nodeCanvas.oncontextmenu = () => false;
    }

    private updateCanvasSizes() {
        scaleCanvas(this.projectileCanvas, this.VIEWPORT, this.dpr);
        this.projectileCtx.scale(this.dpr, this.dpr);

        scaleCanvas(this.nodeCanvas, this.VIEWPORT, this.dpr);
        this.nodeCtx.scale(this.dpr, this.dpr);
    }

    private resizeCanvas() {
        this.VIEWPORT.x = window.innerWidth;
        this.VIEWPORT.y = window.innerHeight;

        // Cache everything on temporary canvas
        const copyProjectileCanvas = getCanvasCopy(this.projectileCanvas, this.dpr);
        const copyNodeCanvas = getCanvasCopy(this.projectileCanvas, this.dpr);

        this.updateCanvasSizes();

        this.projectileCtx.drawImage(copyProjectileCanvas, 0, 0);
        this.projectileCtx.drawImage(copyNodeCanvas, 0, 0);
    }

    updateCanvasFrame(dt: number, nodes: Node[], projectiles: Projectile[]) {
        // Fade background
        this.projectileCtx.fillStyle = BACKGROUND;
        this.projectileCtx.globalAlpha = 1 - Math.pow(0.01, dt);
        this.projectileCtx.rect(0, 0, this.VIEWPORT.x, this.VIEWPORT.y);
        this.projectileCtx.fill();

        // Draw components
        this.projectileCtx.globalAlpha = 1;
        this.projectileCtx.fillStyle = WHITE;
        this.projectileCtx.strokeStyle = WHITE;

        this.projectileCtx.lineWidth = 4;
        projectiles.forEach(({ position, previous }) => {
            this.projectileCtx.beginPath();
            this.projectileCtx.arc(
                position.x + this.VIEWPORT.x / 2,
                position.y + this.VIEWPORT.y / 2,
                2,
                0,
                2 * Math.PI
            );
            this.projectileCtx.fill();
            this.projectileCtx.closePath();

            this.projectileCtx.beginPath();
            this.projectileCtx.moveTo(previous.x + this.VIEWPORT.x / 2, previous.y + this.VIEWPORT.y / 2);
            this.projectileCtx.lineTo(position.x + this.VIEWPORT.x / 2, position.y + this.VIEWPORT.y / 2);
            this.projectileCtx.stroke();
        });

        this.nodeCtx.clearRect(0, 0, this.nodeCanvas.width, this.nodeCanvas.height);
        this.nodeCtx.fillStyle = BACKGROUND;
        this.nodeCtx.strokeStyle = WHITE;
        nodes.forEach((node) => {
            // Background
            this.nodeCtx.beginPath();
            this.nodeCtx.arc(
                node.position.x + this.VIEWPORT.x / 2,
                node.position.y + this.VIEWPORT.y / 2,
                node.radius,
                0,
                2 * Math.PI
            );
            this.nodeCtx.fill();
            this.nodeCtx.closePath();

            // Outer Ring
            this.nodeCtx.lineWidth = 0.5;
            this.nodeCtx.beginPath();
            this.nodeCtx.arc(
                node.position.x + this.VIEWPORT.x / 2,
                node.position.y + this.VIEWPORT.y / 2,
                node.radius,
                0,
                2 * Math.PI
            );
            this.nodeCtx.stroke();
            this.nodeCtx.closePath();

            // Inner Detail
            this.nodeCtx.beginPath();
            this.nodeCtx.lineWidth = 4;
            this.nodeCtx.moveTo(node.position.x + this.VIEWPORT.x / 2 - 6, node.position.y + this.VIEWPORT.y / 2);
            this.nodeCtx.lineTo(node.position.x + this.VIEWPORT.x / 2 + 6, node.position.y + this.VIEWPORT.y / 2);
            if (node.type === "source") {
                this.nodeCtx.moveTo(node.position.x + this.VIEWPORT.x / 2, node.position.y + this.VIEWPORT.y / 2 + 6);
                this.nodeCtx.lineTo(node.position.x + this.VIEWPORT.x / 2, node.position.y + this.VIEWPORT.y / 2 - 6);
            }
            this.nodeCtx.stroke();
            this.nodeCtx.closePath();
        });
    }

    clear() {
        this.projectileCtx.fillStyle = BACKGROUND;
        this.projectileCtx.globalAlpha = 1;
        this.projectileCtx.rect(0, 0, this.VIEWPORT.x, this.VIEWPORT.y);
        this.projectileCtx.fill();
    }

    onClick(_x: number, _y: number, _event: MouseEvent) {}
    onMouseDown(_x: number, _y: number, _event: MouseEvent) {}
    onMouseMove(_x: number, _y: number) {}
    onMouseUp(_x: number, _y: number) {}
    onMouseLeave() {}
}

const scaleCanvas = (canvas: HTMLCanvasElement, viewport: Vector2, dpr: number) => {
    canvas.width = viewport.x * dpr;
    canvas.height = viewport.y * dpr;
    canvas.style.width = viewport.x + "px";
    canvas.style.height = viewport.y + "px";
};
const getCanvasCopy = (canvas: HTMLCanvasElement, dpr: number) => {
    const copy_canvas = document.createElement("canvas");
    const copy_ctx = copy_canvas.getContext("2d")!;
    copy_canvas.width = canvas.width;
    copy_canvas.height = canvas.height;
    copy_ctx.scale(1 / dpr, 1 / dpr);
    copy_ctx.drawImage(canvas, 0, 0);
    return copy_canvas;
};

let selection: { node: number; x: number; y: number; moved: boolean } | null = null;
export const addListenersToRenderer = (renderer: Renderer, nodes: NodeSimulation) => {
    renderer.onMouseDown = (x, y, event) => {
        const { index, node } = nodes.getNodeAtPoint({ x, y });

        if (event.button === 0) {
            if (node) {
                selection = { node: index, x: x - node.position.x, y: y - node.position.y, moved: false };
                renderer.nodeCanvas.style.cursor = "grabbing";
            }
        } else if (event.button === 2) {
            if (node) {
                nodes.removeNode(index);
                renderer.nodeCanvas.style.cursor = "auto";
            } else {
                nodes.addNode({ type: "source", position: { x, y }, radius: 20 });
                renderer.nodeCanvas.style.cursor = "pointer";
            }
        }
    };
    renderer.onMouseUp = (x, y) => {
        if (selection && !selection.moved) {
            nodes.flipNodeType(selection.node);
        }

        selection = null;
        renderer.nodeCanvas.style.cursor = nodes.getNodeAtPoint({ x, y }).node ? "pointer" : "default";
    };
    renderer.onMouseLeave = () => {
        selection = null;
        renderer.nodeCanvas.style.cursor = "pointer";
    };
    renderer.onMouseMove = (x, y) => {
        if (!selection) {
            renderer.nodeCanvas.style.cursor = nodes.getNodeAtPoint({ x, y }).node ? "pointer" : "default";
            return;
        }

        selection.moved = true;
        nodes.moveNode(selection.node, { x: x - selection.x, y: y - selection.y });
    };
};
