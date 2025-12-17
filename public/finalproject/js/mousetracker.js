let hudMX = document.getElementById('mouseX')
let hudMY = document.getElementById('mouseY')

function trackMousePos(event) {
    const clientX = event.clientX
    const clientY = event.clientY

    hudMX.textContent = clientX
    hudMY.textContent = clientY
}
document.addEventListener('mousemove', trackMousePos);