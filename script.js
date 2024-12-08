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