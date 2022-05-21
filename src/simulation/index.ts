import { add, getRandomVector2, norm, scale, subtract, unit, Vector2, ZERO } from "./maths";
import { Node, Projectile, SimulationConfig } from "./types";

export class Simulation {
    public nodes: Node[];
    public projectiles: Projectile[];
    public config: SimulationConfig;

    constructor(nodes: Node[], bounds: Vector2, config?: Partial<Exclude<SimulationConfig, "node_radius">>) {
        this.nodes = nodes;
        this.projectiles = [];
        this.config = {
            force_constant: 5000000,
            drag: 0.01,
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
                    position: add(node.position, getRandomVector2(20)),
                    velocity: ZERO,
                });

                node.lapsed -= this.config.node_period;
            }
        });

        // Physics update for projectiles
        const deletions: number[] = [];
        this.projectiles.forEach((projectile, idx) => {
            const force = this.nodes
                .map((node) => {
                    const difference = subtract(node.position, projectile.position);
                    const strength = this.config.force_constant / Math.pow(norm(difference), 2);
                    const polarity = node.type === "sink" ? 1 : -1;
                    return scale(unit(difference), Math.min(1000, strength) * polarity);
                })
                .reduce(add, ZERO);

            const drag = scale(unit(projectile.velocity), -this.config.drag * Math.pow(norm(projectile.velocity), 2));

            projectile.velocity = add(projectile.velocity, scale(add(force, drag), dt));
            const update = add(projectile.position, scale(projectile.velocity, dt));

            if (
                this.nodes.some((node) => norm(subtract(node.position, update)) < 20) ||
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
