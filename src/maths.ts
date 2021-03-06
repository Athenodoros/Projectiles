export interface Vector2 {
    x: number;
    y: number;
}

export const getRandomVector2 = (magnitude: number) => {
    const orientation = Math.random() * Math.PI * 2;
    return {
        y: magnitude * Math.cos(orientation),
        x: magnitude * Math.sin(orientation),
    };
};

export const ZERO = { x: 0, y: 0 };

export const scale = ({ x, y }: Vector2, r: number) => ({ x: x * r, y: y * r });
export const add = (a: Vector2, b: Vector2) => ({ x: a.x + b.x, y: a.y + b.y });
export const subtract = (a: Vector2, b: Vector2) => ({ x: a.x - b.x, y: a.y - b.y });
export const norm = ({ x, y }: Vector2) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
export const unit = ({ x, y }: Vector2) => {
    const length = norm({ x, y });
    return length ? { x: x / length, y: y / length } : ZERO;
};
export const distance = (a: Vector2, b: Vector2) => norm(subtract(a, b));
