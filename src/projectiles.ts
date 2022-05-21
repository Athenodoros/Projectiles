import { add, getRandomVector2, norm, scale, subtract, unit, Vector2, ZERO } from "./maths";
import { Node, Projectile } from "./types";

const FORCE_CONSTANT = 3000000;
const DRAG_CONSTANT = 0.01;
const NODE_PERIOD = 0.002;

export class ProjectileSimulation {
    public list: Projectile[];
    public bounds: Vector2;

    constructor(bounds: Vector2) {
        this.list = [];
        this.bounds = bounds;
    }

    update(dt: number, nodes: Node[]) {
        // Spawn new projectiles
        nodes.forEach((node) => {
            if (node.type !== "source") return;
            node.lapsed = (node.lapsed ?? 0) + dt;

            if (node.lapsed > 100 * NODE_PERIOD) node.lapsed = 100 * NODE_PERIOD;
            while (node.lapsed > NODE_PERIOD) {
                const distance = node.radius * (1 - Math.random() * 0.5 - 0.5);
                const position = add(node.position, getRandomVector2(distance));
                this.list.push({
                    position,
                    previous: position,
                    velocity: ZERO,
                });

                node.lapsed -= NODE_PERIOD;
            }
        });

        // Physics update for projectiles
        const deletions: number[] = [];
        this.list.forEach((projectile, idx) => {
            const force = nodes
                .map((node) => {
                    const difference = subtract(node.position, projectile.position);
                    const strength = FORCE_CONSTANT / Math.pow(norm(difference), 2);
                    const polarity = node.type === "sink" ? 1 : -1;
                    return scale(unit(difference), Math.min(3000, strength) * polarity);
                })
                .reduce(add, ZERO);

            const drag = scale(unit(projectile.velocity), -DRAG_CONSTANT * Math.pow(norm(projectile.velocity), 2));

            projectile.velocity = add(projectile.velocity, scale(add(force, drag), dt));
            projectile.previous = projectile.position;
            projectile.position = add(projectile.position, scale(projectile.velocity, dt));

            if (
                nodes.some(
                    (node) =>
                        node.type === "sink" && norm(subtract(node.position, projectile.position)) < node.radius * 0.8
                ) ||
                Math.abs(projectile.position.x) > this.bounds.x / 1.5 ||
                Math.abs(projectile.position.y) > this.bounds.y / 1.5
            )
                deletions.push(idx);
        });

        // Removals after the physics loop
        this.list = this.list.filter((_, idx) => !deletions.includes(idx));
    }
}
