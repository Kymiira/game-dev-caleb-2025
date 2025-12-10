import { gameEntity } from "./gameEntity.js";

export class Ground extends GameEntity {
    constructor(elementId) {
        super(elementId);
    }
    resolveCollision(player) {
        if (!player.intersects(this)) return;

        const prevBottom = player.bottom - player.vy;
        const prevTop = player.top - player.vy;

        const playerWasAbove = prevBottom <= this.top;

        if (playerWasAbove) {
            player.setPosition(player.left, this.top - player.height);
            player.vy = 0;
            player.grounded = true;
        }
    }
}