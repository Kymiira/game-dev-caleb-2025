const keys = {}

document.addEventListener('keydown', (event) => {
    keys[event.key.toLowerCase()] = true
})

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = true
})

document.addEventListener('keydown', (e) => {
    if (['w','a','s','d'].includes(e.key)) {
        e.preventDefault()
    }
})