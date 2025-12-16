function myHitOther(my1,my2) {
    let left1 = parseInt(document.getElementById(my1).style.left)
    let right1 = left1 + parseInt(document.getElementById(my1).style.width)
    let top1 = parseInt(document.getElementById(my1).style.top)
    let bottom1 = top1 + parseInt(document.getElementById(my1).style.height)
    let left2 = parseInt(document.getElementById(my2).style.left)
    let right2 = left2 + parseInt(document.getElementById(my2).style.width)
    let top2 = parseInt(document.getElementById(my2).style.top)
    let bottom2 = top2 + parseInt(document.getElementById(my2).style.height)
    return (right1 >= left2) && (bottom1 >= top2) && (left1 <= right2) && (top1 <= bottom2)
}