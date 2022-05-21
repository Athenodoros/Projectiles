import { NODE_RADIUS } from "../simulation/constants";
import { Vector2 } from "../simulation/maths";

const BACKGROUND = "#0a091a";
const WHITE = "#e0e7ff";

export class Renderer {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public VIEWPORT: Vector2;
    public dpr: number;

    constructor() {
        // Set up canvas and draw context
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d")!;
        this.VIEWPORT = { x: window.innerWidth, y: innerHeight };

        // Set up scaling
        this.dpr = window.devicePixelRatio || 1;
        this.updateCanvasSizes();

        // Scaling on Window Resize
        window.onresize = () => this.resizeCanvas();

        // Event Handlers
        const getLocalX = (event: MouseEvent) => event.clientX - this.VIEWPORT.x / 2;
        const getLocalY = (event: MouseEvent) => event.clientY - this.VIEWPORT.y / 2;
        this.canvas.onclick = (event) => this.onClick(getLocalX(event), getLocalY(event), event);
        this.canvas.onmousedown = (event) => this.onMouseDown(getLocalX(event), getLocalY(event), event);
        this.canvas.onmousemove = (event) => this.onMouseMove(getLocalX(event), getLocalY(event));
        this.canvas.onmouseup = (event) => this.onMouseUp(getLocalX(event), getLocalY(event));
        this.canvas.onmouseleave = () => this.onMouseLeave();
        this.canvas.oncontextmenu = () => false;
    }

    private updateCanvasSizes() {
        this.canvas.width = this.VIEWPORT.x * this.dpr;
        this.canvas.height = this.VIEWPORT.y * this.dpr;
        this.canvas.style.width = this.VIEWPORT.x + "px";
        this.canvas.style.height = this.VIEWPORT.y + "px";
        this.ctx.scale(this.dpr, this.dpr);
    }

    private resizeCanvas() {
        this.VIEWPORT.x = window.innerWidth;
        this.VIEWPORT.y = window.innerHeight;

        // Cache everything on temporary canvas
        const copy_canvas = document.createElement("canvas");
        const copy_ctx = copy_canvas.getContext("2d")!;
        copy_canvas.width = this.canvas.width;
        copy_canvas.height = this.canvas.height;
        copy_ctx.scale(1 / this.dpr, 1 / this.dpr);
        copy_ctx.drawImage(this.canvas, 0, 0);

        this.updateCanvasSizes();
        this.ctx.drawImage(copy_canvas, 0, 0);
    }

    updateCanvasFrame(dt: number, nodes: Vector2[], projectiles: { position: Vector2; previous: Vector2 }[]) {
        // Fade background
        this.ctx.fillStyle = BACKGROUND;
        this.ctx.globalAlpha = 1 - Math.pow(0.01, dt);
        this.ctx.rect(0, 0, this.VIEWPORT.x, this.VIEWPORT.y);
        this.ctx.fill();

        // Draw components
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = WHITE;
        this.ctx.strokeStyle = WHITE;

        this.ctx.lineWidth = 4;
        projectiles.forEach(({ position, previous }) => {
            this.ctx.beginPath();
            this.ctx.arc(position.x + this.VIEWPORT.x / 2, position.y + this.VIEWPORT.y / 2, 2, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.beginPath();
            this.ctx.moveTo(previous.x + this.VIEWPORT.x / 2, previous.y + this.VIEWPORT.y / 2);
            this.ctx.lineTo(position.x + this.VIEWPORT.x / 2, position.y + this.VIEWPORT.y / 2);
            this.ctx.stroke();
        });

        this.ctx.lineWidth = 0.5;
        nodes.forEach((position) => {
            // Background
            this.ctx.fillStyle = BACKGROUND;
            this.ctx.beginPath();
            this.ctx.arc(
                position.x + this.VIEWPORT.x / 2,
                position.y + this.VIEWPORT.y / 2,
                NODE_RADIUS,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
            this.ctx.closePath();

            this.ctx.fillStyle = WHITE;

            // Inner Circle
            this.ctx.beginPath();
            this.ctx.arc(position.x + this.VIEWPORT.x / 2, position.y + this.VIEWPORT.y / 2, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.closePath();

            // Outer Ring
            this.ctx.beginPath();
            this.ctx.arc(
                position.x + this.VIEWPORT.x / 2,
                position.y + this.VIEWPORT.y / 2,
                NODE_RADIUS,
                0,
                2 * Math.PI
            );
            this.ctx.stroke();
            this.ctx.closePath();
        });
    }

    onClick(_x: number, _y: number, _event: MouseEvent) {}
    onMouseDown(_x: number, _y: number, _event: MouseEvent) {}
    onMouseMove(_x: number, _y: number) {}
    onMouseUp(_x: number, _y: number) {}
    onMouseLeave() {}
}
