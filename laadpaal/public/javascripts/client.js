console.log('client.js loaded.')
const complaintForm = document.querySelector(".complaintForm")
const complaintButtons = document.querySelectorAll(".complaintButton")
const selectedComplaint = document.querySelector(".selectedComplaint")

if (complaintButtons) {
    complaintButtons.forEach(complaintButton => {
        complaintButton.addEventListener("click", e => {
            e.preventDefault()

            const targetElement = selectedComplaint
            const movingElement = e.srcElement

            moveElement(targetElement, movingElement)
            transitionElement(complaintButtons, movingElement)

            console.log(targetElement, movingElement)
        })
    })
}

function moveElement(targetElement, movingElement) {
    targetElement.appendChild(movingElement);
    console.log(movingElement)
}

function transitionElement(complaintButtons, movingElement) {
    complaintButtons.forEach(complaintButton => {
        const chosenType = movingElement.innerHTML
        if (complaintButton.innerHTML != chosenType) {
            complaintButton.classList.add("slideRight")
            setTimeout(function () {
                addNextAnswers(chosenType)
            }, 500);
        }

    })

}

function addNextAnswers(chosenType) {

    let newChild
    if (chosenType == "De laadpaal...") {
        newChild = `
    <button class="complaintButton slideLeft">...is uit.</button>
    <button class="complaintButton slideLeft">...is defect.</button>
    <button class="complaintButton slideLeft">...is te lang bezet.</button>
    <button class="complaintButton slideLeft">...is niet te bereiken.</button>
    <button class="complaintButton slideLeft">...is bezet door een niet elektrische.</button>`
    } else if (chosenType == "De parkeerplek...") {
        newChild = `
    <button class="complaintButton slideLeft">...is te lang bezet.</button>
    <button class="complaintButton slideLeft">...is niet te bereiken.</button>
    <button class="complaintButton slideLeft">...is bezet door een niet elektrische.</button>`
    } else if (chosenType == "Mijn pasje...") {
        newChild = `
    <button class="complaintButton slideLeft">...werkt niet.</button>
    <button class="complaintButton slideLeft">...is kapot.</button>
    <button class="complaintButton slideLeft">...heb ik niet bij me.</button>`
    }

    complaintForm.innerHTML = newChild
}