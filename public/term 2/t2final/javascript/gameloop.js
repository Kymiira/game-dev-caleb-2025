function gameLoop() {
    const player = document.getElementById('myPlayer');
    let step = keys['shift'] ? 10 : 5
    let x = parseInt(player.style.left)
    let y = parseInt(player.style.top)

    if (keys['w']) y -= step
    if (keys['s']) y += step
    if (keys['a']) x -= step
    if (keys['d']) x += step

    x = Math.max(0, Math.min(window.innerWidth - 100, x))
    y = Math.max(0, Math.min(window.innerWidth - 80, y))

    player.style.left = x + 'px'
    player.style.top = y + 'px'

    myCheckHit()

    requestAnimationFrame(gameLoop)
}
requestAnimationFrame(gameLoop)