export myHumanoid {
    constructor(name, age) {
        this.name = name;
        this.age = parseInt(age);
        this.id = `humanoid-${humanoidCount++}`;
        this.isPromoted = false;
        this.type = this.age < 5 ? "Youngster" : (this.age < 18 ? "Student" : "Adult"); 
    }

    ageUp(profileContainer) {
        const summaryElement = profileContainer.querySelector('.current-action-summary');
        const historyElement = profileContainer.querySelector('.log-history');
        const ageUpBtn = profileContainer.querySelector(`.age-up-button[data-id="${this.id}"]`);
        const popup = profileContainer.querySelector(`#popup-${this.id}`);

        if (this.age >= 50) {
            ageUpBtn.value = "Max Age 50 Reached";
            ageUpBtn.disabled = true;
            
            if (popup) { popup.style.display = 'block'; }
            
            const message = `🛑 <b>${this.name}</b> has reached the maximum demo age of 50!`;
            summaryElement.innerHTML = message;
            console.log(`[ID: ${this.id}] MAX AGE LIMIT HIT (50): ${this.name} retired from simulation.`);
            return this;
        }

        this.age += 1;
        
        const prevMessage = summaryElement.innerHTML;
        if (prevMessage && !prevMessage.includes("Ready to live life!")) {
             historyElement.innerHTML = `<p class="log-entry">${prevMessage}</p>` + historyElement.innerHTML;
        }

        summaryElement.innerHTML = `--- <b>${this.name}</b> is now <b>${this.age}</b>! Awaiting event...`;
        
        console.log(`[ID: ${this.id}] ${this.name} aged up to ${this.age}.`);

        if (this.type === "Youngster" && this.age === 5) {
            const nextClass = new myStudent(this.name, this.age);
            summaryElement.innerHTML = `🎒 <b>${this.name}</b> turned 5 and started elementary school! Evolved to <b>${nextClass.type}</b>.`;
            console.log(`[ID: ${this.id}] AUTO-EVOLUTION: ${this.name} started school at age 5.`);
            return nextClass;
        }
        
        return this.doAgeEvent(summaryElement);
    }
    
    doAgeEvent(summaryElement) {
        const message = `👤 <b>${this.name}</b> had an uneventful year.`;
        summaryElement.innerHTML = message;
        console.log(`[ID: ${this.id}] Event: Uneventful year. Type: ${this.type}`);
        return this;
    }
}
