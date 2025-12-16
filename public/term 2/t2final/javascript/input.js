console.log("input.js loaded")
const keys = {}

document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true
})

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false
})

document.addEventListener('keydown', (event) => {
    if (['w','a','s','d','shift'].includes(event.key.toLowerCase())) {
        event.preventDefault()
    }
})