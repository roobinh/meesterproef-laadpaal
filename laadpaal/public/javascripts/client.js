console.log("client.js loaded.");

const complaintForm = document.querySelector(".complaintForm");
const complaintButtons = document.querySelectorAll(".option");
const selectedComplaint = document.querySelector(".selectedComplaint");
const subtitle = document.querySelector(".subtitle");

const myStorage = window.localStorage;

if (complaintButtons) {
    complaintButtons.forEach(complaintButton => {
        complaintButton.addEventListener("click", e => {
            e.preventDefault();

            const targetElement = selectedComplaint;
            const movingElement = e.srcElement;
            const sentenceStart = e.srcElement.innerHTML;

            createSentence(targetElement, sentenceStart);
            slideElementOut(complaintButtons, movingElement);
        });
    });
}

function moveElement(targetElement, movingElement) {
    targetElement.appendChild(movingElement);
    movingElement.classList.remove("option");
}

function createSentence(targetElement, sentenceStart) {
    targetElement.innerHTML = sentenceStart;
}

function slideElementOut(complaintButtons, movingElement) {
    complaintButtons.forEach(complaintButton => {
        const chosenType = movingElement.innerHTML;
        if (complaintButton.innerHTML != chosenType) {
            complaintButton.classList.add("slideOut");
            setTimeout(function() {
                addNextAnswers(chosenType);
            }, 500);
        }
    });
}

function addNextAnswers(chosenType) {
    let newChild;
    if (chosenType == "De laadpaal...") {
        newChild = `
    <button class="complaintButton option slideIn">...is uit/defect.</button>
    <button class="complaintButton option slideIn">...is te lang bezet.</button>
    <button class="complaintButton option slideIn">...is niet te bereiken.</button>
    <button class="complaintButton option slideIn">...kabel is kapot.</button>
    <button class="complaintButton option slideIn">...is bezet door een niet elektrische auto.</button>`;
    } else if (chosenType == "De parkeerplek...") {
        newChild = `
    <button class="complaintButton option slideIn">...is te lang bezet.</button>
    <button class="complaintButton option slideIn">...is niet te bereiken.</button>
    <button class="complaintButton option slideIn">...is bezet door een niet elektrische auto.</button>`;
    } else if (chosenType == "Mijn pasje...") {
        newChild = `
    <button class="complaintButton option slideIn">...werkt niet.</button>
    <button class="complaintButton option slideIn">...is kapot.</button>
    <button class="complaintButton option slideIn">...heb ik niet bij me.</button>`;
    }

    complaintForm.innerHTML = newChild;
    const newComplaintButtons = document.querySelectorAll(".option");

    addEventListeners(newComplaintButtons);
    removeAnimation(newComplaintButtons);
}

function removeAnimation(newComplaintButtons) {
    setTimeout(function() {
        newComplaintButtons.forEach(newComplaintButton => {
            newComplaintButton.classList.remove("slideIn");
        });
    }, 1000);
}

function addEventListeners(newComplaintButtons) {
    newComplaintButtons.forEach(newComplaintButton => {
        newComplaintButton.addEventListener("click", e => {
            e.preventDefault();

            const sentenceStart = selectedComplaint.innerHTML;
            const movingElement = e.srcElement;

            const sentenceEnd = e.srcElement.innerHTML;
            e.srcElement.remove();

            completeSentence(sentenceStart, sentenceEnd);
            slideSecondQuestionsOut(newComplaintButtons, movingElement);
        });
    });
}

function slideSecondQuestionsOut(complaintButtons, movingElement) {
    complaintButtons.forEach(complaintButton => {
        const chosenType = movingElement.innerHTML;
        if (complaintButton.innerHTML != chosenType) {
            complaintButton.classList.add("slideOut");
            setTimeout(function() {
                slideFormIn();
            }, 500);
        }
    });
}

function completeSentence(sentenceStart, sentenceEnd) {
    let firstPart = sentenceStart;
    let secondPart = sentenceEnd;

    let fullSentence = [];

    fullSentence.push(firstPart.substring(0, firstPart.length - 3));
    fullSentence.push(secondPart.substring(3, secondPart.length));

    selectedComplaint.innerHTML = fullSentence.join(" ");
    myStorage.setItem("type", fullSentence.join(" "));
}

function slideFormIn() {
    newChild = `
    <label class="fotoButton slideIn" for="file-upload">FOTO TOEVOEGEN</label>

    <input class="invisible" id="file-upload" name="image" type="file" class="slideIn" onchange="readURL(this)" accept="image/jpeg">
    <img id="uploadImg" class="slideIn" src="#" alt="your image" style="display: none"/>

    <textarea name="description" class="textarea slideIn" placeholder="Voeg een beschrijving toe" required></textarea>
    <input name="type" type="checkbox" class="invisible" value="${myStorage.getItem(
      "type"
    )}" checked></input>
      
    
    <div class="buttonWrapper">
       <button class="button formButtonRight  slideIn" type="submit">GA VERDER</button>
    </div>
    `;
    subtitle.innerHTML = "Voeg eventueel een foto of beschrijving toe";
    complaintForm.innerHTML = newChild;
}

function readURL(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        let uploadImg = document.querySelector("#uploadImg");

        reader.onload = function(e) {
            uploadImg.setAttribute("src", e.target.result);
            uploadImg.setAttribute("style", "display: block");
            // .attr('src', e.target.result)
            // .width(150)
            // .height(200);
        };
        

        reader.readAsDataURL(input.files[0]);
    }
}