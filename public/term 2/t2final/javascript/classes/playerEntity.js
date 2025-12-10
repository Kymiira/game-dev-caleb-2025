import { gameEntity } from "./gameEntity.js";

export class Player extends GameEntity {
    constructor(elementId) {
        super(elementId);

        this.vx = 0;
        this.vy = 0;

        this.speed = 3;
        this.jumpForce = 12;
        this.gravity = 0.6;
        this.friction = 0.8;
        this.maxSpeed = 7;

        this.grounded = false;

        this.keys = {};

        window.addEventListener("keydown", (e) => { this.keys[e.code] = true;}
    } // unfinished
}