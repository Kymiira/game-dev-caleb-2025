console.log("gamestate loaded")
let myScore = 3
myScore = Math.max(myScore, 0)

function myCheckHit() {
    document.getElementById('myText01').value = 'Score: ' + myScore

    if (myHitOther('myPlayer', 'myImg02')) {
        document.getElementById('myPlayer').style.left = '20px'
        myScore -= 1
    }

    if (myHitOther('myPlayer', 'myImg03')) {
        document.getElementById('myPlayer').style.left = '20px'
        myScore -= 1
    }

    if (myScore <= 0) {
        requestAnimatioFrame(() location.reload())
        return
    }

    if (myHitOther('myPlayer', 'myImg04')) {
        document.getElementById('myPlayer').style.left = '20px'
        location = 'https://www.google.ca'
    }
}
