/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/
let blockCounter = 0;



function newBlock(s) {
    stringText = s;
    const button = document.getElementById("createBlocksButton"); //default text
    const container = document.getElementById("box-container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    container.appendChild(newBlock);
    newBlock.append(stringText);

    newBlock.draggable = true;

    blockCounter++;
    newBlock.id = "box_" + blockCounter;

    newBlock.addEventListener("dragstart", dragStart);
    newBlock.addEventListener("dragover", dragOver);
    newBlock.addEventListener("drop", drop);

}

let dragged;

function dragStart(event) {
    dragged = event.target;
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function drop(event) {
    event.preventDefault();

    if (event.target.className === "box") {
        event.target.parentNode.insertBefore(dragged, event.target.nextSibling);
    } else {
        event.target.parentNode.appendChild(dragged);
    }
}

const boxes = document.querySelectorAll(".box");
boxes.forEach(box => {
    box.addEventListener("dragstart", dragStart);
    box.addEventListener("dragover", dragOver);
    box.addEventListener("drop", drop);
});


const t = document.getElementById("pythontext"); // creating const for element to pull from
ptext = t.value; // initializing variable.

// test function for storing textarea input as variable
function StoreBlob(){
    ptext = t.value;
    ptext = ptext.toString();
}

// test function for sending stored state to blob to read into textarea
function PullBlob(){
    const blob = new Blob([ptext], { type: 'text/plain' })
    blob.text().then(text => {
    t.value = text; // sends contents of blob to textarea
});

    // t.value = ptext; // less useful way to store information
}

function toggleView() {
    var x = document.getElementById("python-code-result");
    var y = document.getElementById("box-container");
    if (x.style.display === "none") {
        x.style.display = "block";
        y.style.display = "none"
    } else {
        x.style.display = "none";
        y.style.display = "block"
    }
}