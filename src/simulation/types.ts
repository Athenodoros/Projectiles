import { Vector2 } from "./maths";

export interface Node {
    type: "source" | "sink";
    position: Vector2;
    lapsed?: number;
}

export interface Projectile {
    position: Vector2;
    previous: Vector2;
    velocity: Vector2;
}

export interface SimulationConfig {
    force_constant: number;
    drag: number;
    node_period: number;
    bounds: Vector2;
}
