const foot = document.querySelector("footer");

function closeFooter(element){
    if(foot.classList.contains("hide")){
        foot.classList.remove("hide");
        element.innerHTML = "&#11167"
    } else {
        foot.classList.add("hide");
        element.innerHTML = "&#x2B9D"
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // If not in fullscreen mode, request fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Safari
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE11
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // If already in fullscreen mode, exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    }
}
