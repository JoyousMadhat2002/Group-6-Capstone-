




/* 
newBlock(s, id) takes the name string from the button and creates a new element.
The new element is added to the "container" in the Result-Container section.
*/
function newBlock(s) {
    stringText = s;
    const button = document.getElementById("createBlocksButton"); //default text
    const container = document.getElementById("container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    container.appendChild(newBlock);
    newBlock.append(stringText);

}