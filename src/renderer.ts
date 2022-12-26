import { Vector2 } from "./maths";
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
        const getLocalPosition = (event: MouseEvent) => ({
            x: event.clientX - this.VIEWPORT.x / 2,
            y: event.clientY - this.VIEWPORT.y / 2,
        });
        const handleTouchesChange = (event: TouchEvent) => {
            event.preventDefault();
            this.onTouchesChange(getLocalTouchArray(event.targetTouches, this.VIEWPORT));
        };
        this.nodeCanvas.onmousedown = (event) => this.onMouseDown(getLocalPosition(event), event);
        this.nodeCanvas.onmousemove = (event) => this.onMouseMove(getLocalPosition(event));
        this.nodeCanvas.onmouseup = (event) => this.onMouseUp(getLocalPosition(event));
        this.nodeCanvas.onmouseleave = () => this.onMouseLeave();
        this.nodeCanvas.oncontextmenu = () => false;
        this.nodeCanvas.ontouchstart = handleTouchesChange;
        this.nodeCanvas.ontouchmove = handleTouchesChange;
        this.nodeCanvas.ontouchend = handleTouchesChange;
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
        const alpha = 1 - Math.pow(0.01, dt);

        // Fade background
        this.projectileCtx.fillStyle = BACKGROUND;
        this.projectileCtx.globalAlpha = alpha;
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

            const gradient = this.projectileCtx.createLinearGradient(
                previous.x + this.VIEWPORT.x / 2,
                previous.y + this.VIEWPORT.y / 2,
                position.x + this.VIEWPORT.x / 2,
                position.y + this.VIEWPORT.y / 2
            );
            gradient.addColorStop(1, WHITE);
            gradient.addColorStop(0, interpolateColours(WHITE, BACKGROUND, alpha));
            this.projectileCtx.strokeStyle = gradient;

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

    onMouseDown(_position: Vector2, _event: MouseEvent) {}
    onMouseMove(_position: Vector2) {}
    onMouseUp(_position: Vector2) {}
    onMouseLeave() {}
    onTouchesChange(_descriptions: TouchDescription[]) {}
}

export interface TouchDescription {
    id: number;
    x: number;
    y: number;
}
const getLocalTouchArray = (touches: TouchList, viewport: Vector2) => {
    const result: TouchDescription[] = [];
    for (let i = 0; i < touches.length; i++) {
        result.push({
            id: touches[i].identifier,
            x: touches[i].clientX - viewport.x / 2,
            y: touches[i].clientY - viewport.y / 2,
        });
    }
    return result;
};

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

const interpolateColours = (from: string, to: string, transparency: number) => {
    const [r1, g1, b1] = parseRGB(from);
    const [r2, g2, b2] = parseRGB(to);
    return (
        "#" +
        Math.round(r2 * transparency + r1 * (1 - transparency)).toString(16) +
        Math.round(g2 * transparency + g1 * (1 - transparency)).toString(16) +
        Math.round(b2 * transparency + b1 * (1 - transparency)).toString(16)
    );
};

const parseRGB = (colour: string) => {
    const [_, a, b, c, d, e, f] = colour;
    return [parseInt(a + b, 16), parseInt(c + d, 16), parseInt(e + f, 16)] as [number, number, number];
};
