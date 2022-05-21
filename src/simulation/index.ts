import { NODE_RADIUS } from "./constants";
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
            force_constant: 3000000,
            drag: 0.01,
            node_period: 0.002,
            bounds,
            ...config,
        };
    }

    update(dt: number) {
        // Spawn new projectiles
        this.nodes.forEach((node) => {
            if (node.type !== "source") return;
            node.lapsed = (node.lapsed ?? 0) + dt;

            while (node.lapsed > this.config.node_period) {
                const distance = NODE_RADIUS * (1 - Math.random() * 0.5 - 0.5);
                const position = add(node.position, getRandomVector2(distance));
                this.projectiles.push({
                    position,
                    previous: position,
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
                    return scale(unit(difference), Math.min(5000, strength) * polarity);
                })
                .reduce(add, ZERO);

            const drag = scale(unit(projectile.velocity), -this.config.drag * Math.pow(norm(projectile.velocity), 2));

            projectile.velocity = add(projectile.velocity, scale(add(force, drag), dt));
            projectile.previous = projectile.position;
            projectile.position = add(projectile.position, scale(projectile.velocity, dt));

            if (
                this.nodes.some(
                    (node) => node.type === "sink" && norm(subtract(node.position, projectile.position)) < NODE_RADIUS
                ) ||
                Math.abs(projectile.position.x) > this.config.bounds.x ||
                Math.abs(projectile.position.y) > this.config.bounds.y
            )
                deletions.push(idx);
        });

        // Removals after the physics loop
        this.projectiles = this.projectiles.filter((_, idx) => !deletions.includes(idx));
    }

    updateNodePosition(id: string, position: Vector2) {
        const node = this.nodes.find((node) => node.id === id);
        if (!node) {
            console.warn(`Node "${id}" not found`);
            return;
        }

        node.position = position;
    }
}
