// THIS FILE STORES ALL OF MY CLASSES FROM DIFFERENT FILES.

export class myVehicle {
	constructor(speed) {
		this.speed = speed;
	}

	drive() {
		console.log(`the Vehicle is driving at $${this.speed} km/h. `);
	}
}
export class myCar {
	constructor(speed) {
		this.speed = speed;
	}

	drive() {
		console.log(`The Vehicle is driving at $${this.speed} km/h. `);
	}
}
