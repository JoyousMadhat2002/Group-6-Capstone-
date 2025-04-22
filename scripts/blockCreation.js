import { categoryColors, blockCategory } from "./blockConfiguration.js";
import { getBlockDropdownList, getBlockProperties, getCategoryByBlockID, createBlockLabel } from "./blockProperties.js";
import { toggleCategory, addBlockInteractivity, clearDropHighlights, toggleDropdownVisibility } from "./blockUI.js";

let blockCounter = 0;
let horizontalContainerCounter = 0;
let verticalContainerCounter = 0;
export let userVariables = [];
let isPythonView = false;
let dropdownBlockCounter = 0;

// ==========================
// 3. Block Management Functions
// ==========================

export function createCategoryButtons(blockCategory) {
    for (const categoryName of Object.keys(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);
        if (categoryContainer) {
            categoryContainer.innerHTML = "";

            const categoryHeader = categoryContainer.parentElement.querySelector(".category-header");
            if (categoryHeader) {
                const newHeader = categoryHeader.cloneNode(true);
                categoryHeader.replaceWith(newHeader);
            }
        }
    }

    for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);

        if (!categoryContainer) {
            console.warn(`No container found for category: ${categoryName}`);
            continue;
        }

        const categoryHeader = categoryContainer.parentElement.querySelector(".category-header");
        const color = categoryColors[categoryName] || "#cccccc";

        categoryHeader.style.backgroundColor = color;
        categoryHeader.addEventListener("click", function (event) {
            event.stopPropagation();
            toggleCategory(categoryName);
        });

        categoryData.elements.forEach((element) => {
            if ((element.blockID === "variableBlock") && userVariables.length === 0) {
                return;
            }

            const button = document.createElement("button");
            button.id = `${element.blockID}Button`;
            button.name = element.name;
            button.innerText = `${element.name}`;

            if (element.blockID === "varDeclOps") {
                button.style.backgroundColor = "#cccccc";
            } else if (element.blockID === "logicalBlock") {
                button.style.backgroundColor = categoryColors.boolean;
            } else {
                button.style.backgroundColor = color;
            }

            button.title = element.description;
            button.onclick = function () {
                newBlock(element.blockID);
            };

            categoryContainer.appendChild(button);
        });
    }
}

export function refreshCategoryButtons() {
    for (const categoryName of Object.keys(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);
        if (categoryContainer) {
            categoryContainer.innerHTML = "";
        }
    }
    createCategoryButtons(blockCategory);
}

let defaultContainer = null;

export function setDefaultContainer(container) {
    defaultContainer = container;
}

export function newBlock(blockID, customContainer = null) {
    const container = customContainer || defaultContainer || document.getElementById("box-container");
    if (!container) {
        console.warn("No container available for block creation");
        return null;
    }
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    newBlock.id = "box_" + ++blockCounter;
    newBlock.dataset.blockID = blockID;
    newBlock.dataset.horizontalContainerCount = "0";
    newBlock.dataset.verticalContainerCount = "0";
    newBlock.dataset.blockDepth = (Number(container.getAttribute("data-blockDepth")) || 0) + 1;

    const { blockCategoryColor, childElement } = getBlockProperties(blockID);
    newBlock.style.backgroundColor = blockID === "logicalBlock" ? categoryColors.boolean : blockCategoryColor;

    createBlockLabel(newBlock, blockID);

    if (blockID === "mathBlock" || blockID === "comparisonBlock" || blockID === "logicalBlock" || blockID === "varOps") {
        handleMathOrComparisonOrVariableBlock(newBlock, blockID);
    } else if (blockID === "if" || blockID === "for" || blockID === "while") {
        handleControlBlock(newBlock, blockID);
    } else if (blockID === "mathText") {
        createInputBlock(newBlock, "0", "math-input", "blockValue", blockID);
    } else if (blockID === "printText") {
        createInputBlock(newBlock, "Enter Text", "text-input", "blockValue", blockID);
    } else if (blockID === "varDeclOps") {
        handleVariableDeclarationBlock(newBlock);
    } else if (blockID === "variableBlock") {
        handleVariableBlock(newBlock);
    } else if (blockID === "arithmeticOps" || blockID === "comparisonOps" || blockID === "logicalOps") {
        handleOperatorBlock(newBlock, blockID);
    } else if (blockID === "print") {
        handlePrintBlock(newBlock, blockID);
    } else if (blockID === "movement" || blockID === "turn" || blockID === "speed" || blockID === "goto" || 
               blockID === "pendown" || blockID === "penup" || blockID === "color" || blockID === "setCoordinates" || 
               blockID === "pause") {
        handleTurtleBlocks(newBlock, blockID);
    } else if (blockID === "mathConstants" || blockID === "roundAbs" || blockID === "basicArithmetic" || 
               blockID === "logExp" || blockID === "trigFunctions") {
        handleMathFunctionBlock(newBlock, blockID);
    } else if (blockID === "range") {
        handleRangeBlock(newBlock);
    } else if (blockID === 'random') {
        handleRandomBlock(newBlock, blockID);
    } else {
        handleDefaultBlock(newBlock, blockID);
    }

    if (blockID !== "varDeclOps") {
        appendChildElement(newBlock, childElement);
        container.appendChild(newBlock);
        addBlockInteractivity(newBlock);
        updateLineNumbers();
    }
    return newBlock.id;
}

export function updateLineNumbers() {
    const codeLinesContainer = document.querySelector(".code-lines");
    if (!codeLinesContainer) return;
    
    const blocks = document.querySelectorAll("#box-container .box");
    codeLinesContainer.innerHTML = "";
    let lineNumberCounter = 1;

    blocks.forEach((block, index) => {
        const parentBlock = block.parentElement.closest(".box");
        const isInsideHorizontal = block.parentElement.classList.contains("child-box-container-horizontal");
        const isInsideVertical = block.parentElement.classList.contains("child-box-container");

        if (parentBlock && (!isInsideHorizontal || !isInsideVertical)) {
            return;
        }

        const blockHeight = block.offsetHeight;
        const lineNumber = document.createElement("div");
        lineNumber.classList.add("code-line");
        lineNumber.style.height = `${blockHeight}px`;
        lineNumber.textContent = lineNumberCounter++;
        codeLinesContainer.appendChild(lineNumber);
    });
}

// ==========================
// 4. Handling Different Block Types
// ==========================

function handleDefaultBlock(block, blockID) {
    const blockName = blockCategory[getCategoryByBlockID(blockID)].elements.find(
        (element) => element.blockID === blockID
    ).name;

    const blockLabel = document.createElement("span");
    blockLabel.textContent = `${blockName}`;
    block.appendChild(blockLabel);
}

function handleRandomBlock(block, blockID) {
    const randomLabel = document.createElement("span");
    randomLabel.textContent = "Random";
    block.appendChild(randomLabel);

    const dropdown = createOperatorDropdown(blockID, block);
    block.appendChild(dropdown);

    const childContainer = createChildBoxHorizontal(block.id, blockID);
    block.appendChild(childContainer);

    dropdown.addEventListener("change", function() {
        block.dataset.blockOperator = dropdown.value;
    });
}

function handlePrintBlock(newBlock, blockID) {
    const printLabel = document.createElement("span");
    printLabel.textContent = "Print:";
    newBlock.appendChild(printLabel);
    
    const childContainer = createChildBoxHorizontal(newBlock.id, blockID);
    newBlock.appendChild(childContainer);
}

function handleTurtleBlocks(block, blockID) {
    const turtlePrefix = document.createElement("span");
    if (blockID === "movement") {
        turtlePrefix.textContent = "Move ";
    } else if (blockID === "turn") {
        turtlePrefix.textContent = "Turn ";
    } else if (blockID === "speed") {
        turtlePrefix.textContent = "Set speed to";
    } else if (blockID === "goto") {
        turtlePrefix.textContent = "Go to";
    } else if (blockID === "color") {
        turtlePrefix.textContent = "Set color to";
    } else if (blockID === "jumpto") {
        turtlePrefix.textContent = "Jump to";
    } else if (blockID === "pendown") {
        turtlePrefix.textContent = "Pen Down";
    } else if (blockID === "penup") {
        turtlePrefix.textContent = "Pen Up";
    } else if (blockID === "setCoordinates") {
        turtlePrefix.textContent = "";
    } else if (blockID === "pause") {
        turtlePrefix.textContent = "Pause for";
    }

    block.appendChild(turtlePrefix);

    if (blockID === "movement" || blockID === "turn" || blockID === "setCoordinates") {
        const dropdown = createOperatorDropdown(blockID, block);
        block.appendChild(dropdown);
    }

    if (blockID === "goto") {
        const childContainerX = createChildBoxHorizontal(block.id, blockID);
        block.appendChild(childContainerX);

        const childContainerY = createChildBoxHorizontal(block.id, blockID);
        block.appendChild(childContainerY);
    } else if (blockID != "penup" && blockID != "pendown") {
        const childContainer = createChildBoxHorizontal(block.id, blockID);
        block.appendChild(childContainer);
    }
}

function handleOperatorBlock(block, blockID) {
    const blockName = blockCategory[getCategoryByBlockID(blockID)].elements.find(
        (element) => element.blockID === blockID
    ).name;

    const dropdown = createOperatorDropdown(blockID, block);
    block.appendChild(dropdown);
}

function handleMathFunctionBlock(block, blockID) {
    const mathPrefix = document.createElement("span");
    mathPrefix.textContent = "math.";
    block.appendChild(mathPrefix);

    const dropdown = createOperatorDropdown(blockID, block);
    block.appendChild(dropdown);
    
    if (blockID != "mathConstants") {
        const childContainer = createChildBoxHorizontal(block.id, blockID);
        block.appendChild(childContainer);
    }
}

function handleMathOrComparisonOrVariableBlock(block, blockID) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");
    container.dataset.parentId = block.id;
    container.dataset.operatorCount = "1";

    // Left container
    const leftContainer = createChildBoxHorizontal(block.id, blockID);
    leftContainer.dataset.containerIndex = "0";
    leftContainer.dataset.parentId = block.id;
    container.appendChild(leftContainer);

    // Operator dropdown
    const operatorDropdown = createOperatorDropdown(blockID, block);
    operatorDropdown.dataset.dropdownType = "operator";
    operatorDropdown.dataset.operatorIndex = "0";
    operatorDropdown.dataset.parentId = block.id;
    container.appendChild(operatorDropdown);

    // Right container
    const rightContainer = createChildBoxHorizontal(block.id, blockID);
    rightContainer.dataset.containerIndex = "0";
    rightContainer.dataset.parentId = block.id;
    container.appendChild(rightContainer);

    // Add controls for expandable blocks
    if (blockID === "logicalBlock" || blockID === "mathBlock" || blockID === "comparisonBlock") {
        const plusMinusDiv = document.createElement("div");
        plusMinusDiv.classList.add("plus-minus");
        plusMinusDiv.dataset.parentId = block.id;

        const plusIcon = document.createElement("i");
        plusIcon.classList.add("fa-solid", "fa-plus");
        plusIcon.addEventListener("click", () => {
            addComparisonComponent(block, container);
        });
        plusMinusDiv.appendChild(plusIcon);

        const minusIcon = document.createElement("i");
        minusIcon.classList.add("fa-solid", "fa-minus");
        minusIcon.style.display = "none";
        minusIcon.addEventListener("click", () => {
            removeComparisonComponent(block, container);
        });
        plusMinusDiv.appendChild(minusIcon);

        container.appendChild(plusMinusDiv);
    }

    block.appendChild(container);
    operatorDropdown.addEventListener("change", () => updateOperatorAttributes(container));
}

function updateOperatorAttributes(container) {
    if (!container) return;

    const parentBlock = container.closest(".box");
    if (!parentBlock) return;

    const dropdowns = container.querySelectorAll('.block-dropdown[data-parent-id="' + parentBlock.id + '"]');
    const containers = container.querySelectorAll('.child-box-container-horizontal[data-parent-id="' + parentBlock.id + '"]');
    
    dropdowns.forEach((dropdown, index) => {
        dropdown.dataset.operatorIndex = index.toString();
        if (index === 0) {
            parentBlock.dataset.blockOperator = dropdown.value;
        } else {
            parentBlock.dataset[`blockOperator${index}`] = dropdown.value;
        }
    });
    
    containers.forEach((cont, index) => {
        cont.dataset.containerIndex = index.toString();
    });
}

function addComparisonComponent(parentBlock, container) {
    if (!container || container.dataset.parentId !== parentBlock.id) return;

    const plusMinusDiv = container.querySelector('.plus-minus[data-parent-id="' + parentBlock.id + '"]');
    if (!plusMinusDiv) return;

    // Get and increment the operator count for this container
    const operatorCount = parseInt(container.dataset.operatorCount || "1");
    const newIndex = operatorCount;
    container.dataset.operatorCount = (operatorCount + 1).toString();

    // Create new operator dropdown
    const newOperatorDropdown = createOperatorDropdown(parentBlock.dataset.blockID, parentBlock);
    newOperatorDropdown.dataset.dropdownType = "operator";
    newOperatorDropdown.dataset.operatorIndex = newIndex.toString();
    newOperatorDropdown.dataset.parentId = parentBlock.id;
    newOperatorDropdown.addEventListener("change", () => updateOperatorAttributes(container));

    // Create new right container
    const newRightContainer = createChildBoxHorizontal(parentBlock.id, parentBlock.dataset.blockID);
    newRightContainer.dataset.containerIndex = newIndex.toString();
    newRightContainer.dataset.parentId = parentBlock.id;

    // Insert new components
    try {
        container.insertBefore(newOperatorDropdown, plusMinusDiv);
        container.insertBefore(newRightContainer, plusMinusDiv);
    } catch (error) {
        console.error("Insertion error:", error);
        return;
    }

    // Show minus icon
    const minusIcon = plusMinusDiv.querySelector(".fa-minus");
    if (minusIcon) minusIcon.style.display = "inline-block";

    updateOperatorAttributes(container);
    updateLineNumbers();
}

function removeComparisonComponent(parentBlock, container) {
    if (!container || container.dataset.parentId !== parentBlock.id) return;

    const dropdowns = container.querySelectorAll('.block-dropdown[data-parent-id="' + parentBlock.id + '"]');
    const containers = container.querySelectorAll('.child-box-container-horizontal[data-parent-id="' + parentBlock.id + '"]');
    const plusMinusDiv = container.querySelector('.plus-minus[data-parent-id="' + parentBlock.id + '"]');
    
    if (dropdowns.length <= 1 || !plusMinusDiv) return;

    // Decrement the operator count
    const currentCount = parseInt(container.dataset.operatorCount || "1");
    container.dataset.operatorCount = Math.max(1, currentCount - 1).toString();

    // Remove last components
    const lastDropdown = dropdowns[dropdowns.length - 1];
    const lastContainer = containers[containers.length - 1];
    
    if (lastDropdown && lastDropdown !== dropdowns[0]) {
        container.removeChild(lastDropdown);
        delete parentBlock.dataset[`blockOperator${dropdowns.length - 1}`];
    }
    
    if (lastContainer && lastContainer !== containers[0]) {
        container.removeChild(lastContainer);
    }
    
    // Hide minus icon if only one component remains
    if (dropdowns.length <= 2) {
        const minusIcon = plusMinusDiv.querySelector(".fa-minus");
        if (minusIcon) minusIcon.style.display = "none";
    }
    
    updateOperatorAttributes(container);
    updateLineNumbers();
}

function handleControlBlock(block, blockID) {
    if (blockID === "if") {
        handleIfBlock(block, blockID);
    } else if (blockID === "for" || blockID === "while") {
        handleLoopBlocks(block, blockID);
    }
}

function handleIfBlock(block, blockID) {
    const topChildBox = createChildBoxHorizontal(block.id, blockID);
    const topLabel = document.createElement("span");
    topLabel.classList.add("block-top-label");
    topLabel.textContent = `${blockID.charAt(0).toUpperCase() + blockID.slice(1)}:`;
    block.appendChild(topLabel);
    block.appendChild(topChildBox);
    addBlockInteractivity(block);
    updateLineNumbers();
}

function handleLoopBlocks(block, blockID) {
    const topChildBox = createChildBoxHorizontal(block.id, blockID);
    const topLabel = document.createElement("span");
    topLabel.classList.add("block-top-label");
    topLabel.textContent = `${blockID.charAt(0).toUpperCase() + blockID.slice(1)}:`;
    block.appendChild(topLabel);
    block.appendChild(topChildBox);
}

function handleVariableDeclarationBlock(block) {
    const modal = document.getElementById("variableModal");
    const variableNameInput = document.getElementById("variableNameInput");
    const submitButton = document.getElementById("submitVariable");
    const cancelButton = document.getElementById("cancelVariable");
    const closeButton = document.querySelector(".close");

    modal.style.display = "block";

    const closeModal = () => {
        modal.style.display = "none";
        variableNameInput.value = "";
    };

    submitButton.onclick = () => {
        const variableName = variableNameInput.value.trim();
        if (variableName) {
            if (!userVariables.includes(variableName)) {
                userVariables.push(variableName);
                updateUserVariableDropdowns();
                refreshCategoryButtons();
            }
            closeModal();
        }
    };

    cancelButton.onclick = closeModal;
    closeButton.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}

function handleVariableBlock(block) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");

    const variableDropdown = document.createElement("select");
    variableDropdown.classList.add("block-dropdown");
    variableDropdown.setAttribute("data-type", "variable");
    variableDropdown.setAttribute("data-parent-id", block.id);
    
    userVariables.forEach((varName) => {
        const option = document.createElement("option");
        option.value = varName;
        option.textContent = varName;
        variableDropdown.appendChild(option);
    });

    variableDropdown.value = "---";
    variableDropdown.addEventListener("change", function () {
        block.dataset.blockValue = variableDropdown.value;
    });

    container.appendChild(variableDropdown);
    block.appendChild(container);
}

function handleElseIfOption(block, elifElseDiv, dropdown, plusIcon) {
    if (elifElseDiv.children.length === 1 && elifElseDiv.contains(plusIcon)) {
        elifElseDiv.remove();
    }

    const newElifElseDiv = createElifElseDiv("elif");
    const elseIfSpan = createSpan("else if:");
    newElifElseDiv.appendChild(elseIfSpan);

    const horizontalChildBox = createChildBoxHorizontal(block.id, block.dataset.blockID);
    newElifElseDiv.appendChild(horizontalChildBox);

    block.appendChild(newElifElseDiv);
    appendChildElement(block, "block");

    const elseBlock = block.querySelector('.elif-else[data-elif-else-type="else"]');
    const plusIconDiv = block.querySelector('.elif-else[data-elif-else-type="plus"]');

    if (elseBlock) {
        block.appendChild(elseBlock);
    }
    if (plusIconDiv) {
        block.appendChild(plusIconDiv);
    } else {
        const newPlusIcon = createPlusIcon();
        const newElifElseDivForPlus = createElifElseDiv("plus");
        newElifElseDivForPlus.appendChild(newPlusIcon);
        block.appendChild(newElifElseDivForPlus);
        setupDropdownMenu(newPlusIcon, block, newElifElseDivForPlus);
    }

    resetAndUpdateElifElseIds(block);
    updateLineNumbers();
    block.dataset.elseIfCount = parseInt(block.dataset.elseIfCount || 0) + 1;
    dropdown.remove();
    dropdown.style.display = "none";
}

function handleElseOption(block, elifElseDiv, dropdown, plusIcon) {
    if (elifElseDiv.children.length === 1 && elifElseDiv.contains(plusIcon)) {
        elifElseDiv.remove();
    }

    const newElifElseDiv = createElifElseDiv("else");
    const elseSpan = createSpan("else:");
    newElifElseDiv.appendChild(elseSpan);

    block.appendChild(newElifElseDiv);
    appendChildElement(block, "block");

    const plusIconDiv = block.querySelector('.elif-else[data-elif-else-type="plus"]');
    if (plusIconDiv) {
        block.appendChild(plusIconDiv);
    } else {
        const newPlusIcon = createPlusIcon();
        const newElifElseDivForPlus = createElifElseDiv("plus");
        newElifElseDivForPlus.appendChild(newPlusIcon);
        block.appendChild(newElifElseDivForPlus);
        setupDropdownMenu(newPlusIcon, block, newElifElseDivForPlus);
    }

    resetAndUpdateElifElseIds(block);
    block.dataset.elseCount = parseInt(block.dataset.elseCount || 0) + 1;
    dropdown.remove();
    dropdown.style.display = "none";
}

function handleRangeBlock(block) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");

    const leftContainer = createChildBoxHorizontal(block.id, block.dataset.blockID);
    container.appendChild(leftContainer);

    const inRangeText = document.createElement("span");
    inRangeText.textContent = "in range";
    container.appendChild(inRangeText);

    const rightContainer = createChildBoxHorizontal(block.id, block.dataset.blockID);
    container.appendChild(rightContainer);

    block.appendChild(container);
}

// ==========================
// 5. Create Functions
// ==========================

function createInputField(placeholder, className, dataKey, blockID) {
    let input;

    if (blockID === "printText") {
        input = document.createElement("textarea");
        input.rows = 1;
        input.placeholder = placeholder;
        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height = `${input.scrollHeight}px`;
            const block = input.closest(".box");
            block.dataset[dataKey] = input.value.replace(/\n/g, "\\n");
        });
    } else {
        input = document.createElement("input");
        input.type = "text";
        input.placeholder = placeholder;

        const adjustInputWidth = () => {
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.whiteSpace = "pre";
            tempSpan.style.fontFamily = getComputedStyle(input).fontFamily;
            tempSpan.style.fontSize = getComputedStyle(input).fontSize;
            tempSpan.textContent = input.value || input.placeholder;
            document.body.appendChild(tempSpan);
            const width = tempSpan.offsetWidth + 10;
            document.body.removeChild(tempSpan);
            input.style.width = `${width}px`;
        };

        input.addEventListener("input", () => {
            const block = input.closest(".box");
            const value = input.value.trim();

            if (blockID === "mathText" || blockID === "mathBlock") {
                if (/^-?\d*\.?\d*$/.test(value)) {
                    block.dataset[dataKey] = value;
                } else {
                    input.value = block.dataset[dataKey] || "";
                }
            } else {
                block.dataset[dataKey] = value;
            }
            adjustInputWidth();
        });
        adjustInputWidth();
    }

    input.classList.add(className);
    return input;
}

function createOperatorDropdown(blockID, parentBlock = null) {
    const dropdown = document.createElement("select");
    dropdown.classList.add("block-dropdown");
    dropdown.setAttribute("data-dropdown-type", "operator");
    
    if (parentBlock) {
        dropdown.setAttribute("data-parent-id", parentBlock.id);
    }

    const operatorOptions = getBlockDropdownList(blockID);
    operatorOptions.forEach((op) => {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op;
        dropdown.appendChild(option);
    });

    dropdown.value = "---";
    dropdown.addEventListener("change", function () {
        const block = dropdown.closest(".box");
        if (block) {
            block.dataset.blockOperator = dropdown.value;
        }
    });

    return dropdown;
}

function createInputBlock(block, placeholder, className, dataKey, blockID) {
    const inputField = createInputField(placeholder, className, dataKey, blockID);
    block.appendChild(inputField);
}

function createDropdownMenu() {
    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown-menu");
    dropdown.style.display = "none";
    return dropdown;
}

function createDropdownOption(text, onClickHandler) {
    const option = document.createElement("div");
    option.textContent = text;
    option.classList.add("dropdown-item");
    option.addEventListener("click", onClickHandler);
    return option;
}

function createElifElseDiv(type) {
    const div = document.createElement("div");
    div.classList.add("elif-else");
    div.setAttribute("data-elif-else-type", type);
    return div;
}

function createSpan(text) {
    const span = document.createElement("span");
    span.textContent = text;
    return span;
}

function createPlusIcon() {
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-plus");
    return icon;
}

// ==========================
// 6. Child Block Functions
// ==========================

function appendChildElement(block, childElement) {
    if (childElement === "block") {
        const childBox = createChildBoxVertical(block.id, block.dataset.blockID);
        childBox.dataset.blockDepth = parseInt(block.dataset.blockDepth) + 1;

        if (block.dataset.blockID === "if") {
            const elifElseDiv = block.querySelector(".elif-else:last-child");
            if (elifElseDiv) {
                elifElseDiv.appendChild(childBox);
            } else {
                block.appendChild(childBox);
            }
        } else {
            block.appendChild(childBox);
        }

        if (block.dataset.blockID === "if") {
            const existingElifElseDiv = block.querySelector(".elif-else");
            if (!existingElifElseDiv) {
                const elifElseDiv = document.createElement("div");
                elifElseDiv.classList.add("elif-else");
                const plusIcon = document.createElement("i");
                plusIcon.classList.add("fa-solid", "fa-plus");
                elifElseDiv.appendChild(plusIcon);
                block.appendChild(elifElseDiv);
                setupDropdownMenu(plusIcon, block, elifElseDiv);
            }
        }
    }
}

function createChildBoxHorizontal(parentID, parentBlockID) {
    const childBox = document.createElement("div");
    childBox.classList.add("child-box-container-horizontal");
    childBox.dataset.parentID = parentID;
    childBox.dataset.parentBlockID = parentBlockID;
    
    const parentBlock = document.getElementById(parentID);
    if (parentBlock) {
        const currentCount = parseInt(parentBlock.dataset.horizontalContainerCount) + 1;
        parentBlock.dataset.horizontalContainerCount = currentCount.toString();
        childBox.id = `${parentID}_horizontal_${currentCount}`;
    }
    
    return childBox;
}

function createChildBoxVertical(parentID, parentBlockID) {
    const childBox = document.createElement("div");
    childBox.classList.add("child-box-container");
    childBox.dataset.parentID = parentID;
    childBox.dataset.parentBlockID = parentBlockID;
    
    const parentBlock = document.getElementById(parentID);
    if (parentBlock) {
        const currentCount = parseInt(parentBlock.dataset.verticalContainerCount) + 1;
        parentBlock.dataset.verticalContainerCount = currentCount.toString();
        childBox.id = `${parentID}_vertical_${currentCount}`;
    }
    
    return childBox;
}

// ==========================
// 7. Update Functions
// ==========================

function resetAndUpdateElifElseIds(block) {
    const elifElseBlocks = block.querySelectorAll('.elif-else[data-elif-else-type="if"], .elif-else[data-elif-else-type="elif"], .elif-else[data-elif-else-type="else"]');
    elifElseBlocks.forEach((elifElseBlock, index) => {
        elifElseBlock.dataset.ifElifElseId = index + 1;
    });
}

function updateUserVariableDropdowns() {
    const dropdowns = document.querySelectorAll(".block-dropdown[data-type='variable']");
    dropdowns.forEach((dropdown) => {
        dropdown.innerHTML = "";
        
        const defaultOption = document.createElement("option");
        defaultOption.value = "---";
        defaultOption.textContent = "---";
        dropdown.appendChild(defaultOption);

        userVariables.forEach((varName) => {
            const option = document.createElement("option");
            option.value = varName;
            option.textContent = varName;
            dropdown.appendChild(option);
        });
    });
}

function setupDropdownMenu(plusIcon, block, elifElseDiv) {
    const dropdown = createDropdownMenu();
    block.appendChild(dropdown);

    if (!block.dataset.elseIfCount) block.dataset.elseIfCount = 0;
    if (!block.dataset.elseCount) block.dataset.elseCount = 0;

    const updateDropdownOptions = () => {
        dropdown.innerHTML = "";

        const elseIfOption = createDropdownOption("else if", () =>
            handleElseIfOption(block, elifElseDiv, dropdown, plusIcon)
        );
        dropdown.appendChild(elseIfOption);

        if (block.dataset.elseCount === "0") {
            const elseOption = createDropdownOption("else", () =>
                handleElseOption(block, elifElseDiv, dropdown, plusIcon)
            );
            dropdown.appendChild(elseOption);
        }
    };

    plusIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        updateDropdownOptions();
        toggleDropdownVisibility(dropdown);
        setTimeout(() => updateLineNumbers(), 0);
    });
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            toggleDropdownVisibility(dropdown);
            updateLineNumbers();
        }
    });
}

export function toggleView() {
    var x = document.getElementById("python-code-result");
    var y = document.getElementById("block-container");
    var toggleButton = document.getElementById("toggleButton");
    var codeContainer = document.querySelector(".code-container");
    var handle1 = document.querySelector(".handle1");

    if (x.classList.contains("hidden")) {
        x.classList.remove("hidden");
        y.classList.add("hidden");
        toggleButton.textContent = "Block";
        isPythonView = true;

        if (codeContainer) codeContainer.style.display = "none";
        if (handle1) handle1.style.display = "none";
    } else {
        x.classList.add("hidden");
        y.classList.remove("hidden");
        toggleButton.textContent = "Python";
        isPythonView = false;

        if (codeContainer) codeContainer.style.display = "flex";
        if (handle1) handle1.style.display = "block";
    }
}

export {
    clearDropHighlights,
    isPythonView
}