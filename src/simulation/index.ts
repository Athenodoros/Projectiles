import { add, getRandomVector2, length, norm, scale, subtract, Vector2, ZERO } from "./maths";
import { Node, Projectile, SimulationConfig } from "./types";

export class Simulation {
    public nodes: Node[];
    public projectiles: Projectile[];
    public config: SimulationConfig;

    constructor(
        nodes: Node[],
        node_radius: number,
        bounds: Vector2,
        config?: Partial<Exclude<SimulationConfig, "node_radius">>
    ) {
        this.nodes = nodes;
        this.projectiles = [];
        this.config = {
            force_constant: 20000000,
            node_radius,
            drag: 0.0002,
            node_period: 0.002,
            bounds,
            ...config,
        };
    }

    public update(dt: number) {
        // Spawn new projectiles
        this.nodes.forEach((node) => {
            if (node.type !== "source") return;
            node.lapsed = (node.lapsed ?? 0) + dt;

            while (node.lapsed > this.config.node_period) {
                this.projectiles.push({
                    position: add(node.position, getRandomVector2(this.config.node_radius)),
                    velocity: ZERO,
                });

                node.lapsed -= this.config.node_period;
            }
        });

        // Physics update for projectiles
        const deletions: number[] = [];
        this.projectiles.forEach((projectile, idx) => {
            const dragged = scale(
                projectile.velocity,
                1 - this.config.drag * dt * Math.pow(length(projectile.velocity), 2)
            );
            const acceleration = this.nodes
                .map((node) => {
                    const difference = subtract(node.position, projectile.position);
                    const strength = this.config.force_constant / Math.pow(length(difference), 2);
                    const polarity = node.type === "sink" ? 1 : -1;
                    return scale(norm(difference), strength * polarity);
                })
                .reduce(add, ZERO);

            projectile.velocity = add(dragged, scale(acceleration, dt));
            const update = add(projectile.position, scale(projectile.velocity, dt));

            if (
                this.nodes.some((node) => length(subtract(node.position, update)) < this.config.node_radius) ||
                Math.abs(update.x) > this.config.bounds.x ||
                Math.abs(update.y) > this.config.bounds.y
            )
                deletions.push(idx);

            projectile.position = update;
        });

        // Removals after the physics loop
        this.projectiles = this.projectiles.filter((_, idx) => !deletions.includes(idx));
    }
}
