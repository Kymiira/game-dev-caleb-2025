console.log("input.js loaded")
const keys = {}

document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true
    console.log("keydown detected")
})

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = true
    console.log("keyup detected")
})

document.addEventListener('keydown', (e) => {
    if (['w','a','s','d'].includes(e.key)) {
        e.preventDefault()
        console.log("scroll prevent detected")
    }
})