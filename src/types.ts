import { Vector2 } from "./maths";

export interface Node {
    type: "source" | "sink";
    position: Vector2;
    lapsed?: number;
    radius: number;
}

export interface Projectile {
    position: Vector2;
    previous: Vector2;
    velocity: Vector2;
}
