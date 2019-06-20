const hrefArr = window.location.href.split('/');
const href = hrefArr[hrefArr.length - 1];

if (href == "home" || href == "create") {
    document.querySelector('.backArrow').setAttribute('style', 'display: none');
}

document.querySelector('.backArrow').addEventListener("click", function () {
    back();
})

function back() {
    switch (href) {
        case "reports":
            window.history.back();
            break;
        case "myreports":
            window.history.back();
            break;
        case "create":
            previousOption();
            break;
        default:
            window.history.back();
            break;
    }
    if (href == 'reports') {
    }
}