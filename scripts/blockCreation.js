import { categoryColors, blockCategory } from "./blockConfiguration.js";
import { getBlockDropdownList, getBlockProperties, getCategoryByBlockID, createBlockLabel } from "./blockProperties.js";
import { toggleCategory, addBlockInteractivity, clearDropHighlights, toggleDropdownVisibility } from "./blockUI.js";

let blockCounter = 0;
export let userVariables = [];
let isPythonView = false;



// ==========================
// 3. Block Management Functions
// ==========================

// Function to dynamically create buttons and assign background colors to categories
export function createCategoryButtons(blockCategory) {
    // Clear all existing category buttons and their event listeners
    for (const categoryName of Object.keys(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);
        if (categoryContainer) {
            // Remove all child elements (buttons) from the category container
            categoryContainer.innerHTML = "";

            // Remove event listeners from the category header
            const categoryHeader = categoryContainer.parentElement.querySelector(".category-header");
            if (categoryHeader) {
                // Clone the category header to remove all event listeners
                const newHeader = categoryHeader.cloneNode(true);
                categoryHeader.replaceWith(newHeader);
            }
        }
    }

    // Create new category buttons
    for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);

        if (!categoryContainer) {
            console.warn(`No container found for category: ${categoryName}`);
            continue;
        }

        const categoryHeader = categoryContainer.parentElement.querySelector(".category-header");
        const color = categoryColors[categoryName] || "#cccccc";

        // Apply the background color to the category header
        categoryHeader.style.backgroundColor = color;

        // Add the onclick event listener to the category header
        categoryHeader.addEventListener("click", function (event) {
            event.stopPropagation(); // Stop event propagation
            toggleCategory(categoryName);
        });

        // Iterate through each element in the category and create buttons
        categoryData.elements.forEach((element) => {
            // Skip creating Variable Operations and Variable Blocks if no variables exist
            if (
                (element.blockID === "variableBlock") &&
                userVariables.length === 0
            ) {
                return; // Skip this element
            }

            const button = document.createElement("button");
            button.id = `${element.blockID}Button`;
            button.name = element.name;
            button.innerText = `${element.name}`;

            // Apply category color to the button
            if (element.blockID === "varDeclOps") {
                button.style.backgroundColor = "#cccccc";
            } else {
                button.style.backgroundColor = color;
            }

            // Add the description to the button's title attribute
            button.title = element.description;

            // Add an onclick handler to call newBlock
            button.onclick = function () {
                newBlock(element.blockID);
            };

            // Append the button to the category container
            categoryContainer.appendChild(button);
        });
    }
}

export function refreshCategoryButtons() {
    // Clear all category containers
    for (const categoryName of Object.keys(blockCategory)) {
        const categoryContainer = document.getElementById(categoryName);
        if (categoryContainer) {
            categoryContainer.innerHTML = "";
        }
    }

    console.log("Refreshing category buttons...");

    // Recreate the buttons
    createCategoryButtons(blockCategory);
}

export function newBlock(blockID) {
    const container = document.getElementById("box-container");
    const newBlock = document.createElement("div");
    newBlock.classList.add("box");
    newBlock.id = "box_" + ++blockCounter;
    newBlock.dataset.blockID = blockID;

    // Calculate and set the depth
    const parentDepth = Number(container.getAttribute("data-blockDepth")) || 0;
    newBlock.dataset.blockDepth = parentDepth + 1; // Parent depth + 1 for the new block

    // Set block properties
    const { blockCategoryColor, childElement } = getBlockProperties(blockID);
    newBlock.style.backgroundColor = blockCategoryColor;

    createBlockLabel(newBlock, blockID);

    // Handle different block types
    if (
        blockID === "mathBlock" ||
        blockID === "comparisonBlock" ||
        blockID === "varOps"
    ) {
        handleMathOrComparisonOrVariableBlock(newBlock, blockID);
    } else if (
        blockID === "if" ||
        blockID === "for" ||
        blockID === "while"
    ) {
        handleControlBlock(newBlock, blockID);
    } else if (blockID === "mathText") {
        createInputBlock(newBlock, "0", "math-input", "blockValue", blockID);
    } else if (blockID === "printText") {
        createInputBlock(newBlock, "Enter Text", "text-input", "blockValue", blockID);
    } else if (blockID === "varDeclOps") {
        handleVariableDeclarationBlock(newBlock);
    } else if (blockID === "variableBlock") {
        handleVariableBlock(newBlock);
    } else if (
        blockID === "arithmeticOps" ||
        blockID === "comparisonOps" ||
        blockID === "logicalOps"
    ) {
        handleOperatorBlock(newBlock, blockID);
    } else if (blockID === "print") {
        handlePrintBlock(newBlock, blockID);
    } else if (
        blockID === "movement" ||
        blockID === "turn" ||
        blockID === "speed" ||
        blockID === "goto" ||
        blockID === "pendown" ||
        blockID === "penup" ||
        blockID === "color" ||
        blockID === "setCoordinates" ||
        blockID === "pause"
    ) {
        handleTurtleBlocks(newBlock, blockID);
    } else if (
        blockID === "mathConstants" ||
        blockID === "roundingTruncation" ||
        blockID === "absSign" ||
        blockID === "numberTheory" ||
        blockID === "sumProd" ||
        blockID === "floatManipulation" ||
        blockID === "comparisonValidation" ||
        blockID === "remainderDivision" ||
        blockID === "logExpFunctions" ||
        blockID === "trigFunctions" ||
        blockID === "hyperbolicFunctions" ||
        blockID === "specialFunctions"
    ) {
        handleMathFunctionBlock(newBlock, blockID);
    } else if (blockID === "range") {
        handleRangeBlock(newBlock);
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


// Function to update the line numbers based on the number of blocks
export function updateLineNumbers() {
    const codeLinesContainer = document.querySelector(".code-lines");
    const blocks = document.querySelectorAll("#box-container .box");

    // Clear existing line numbers
    codeLinesContainer.innerHTML = "";

    // Create new line numbers based on the number of blocks
    let lineNumberCounter = 1;

    blocks.forEach((block, index) => {
        const lineNumber = document.createElement("div");
        lineNumber.classList.add("code-line");

        // Check if the block is inside another block and not inside a child-box-container-horizontal
        const parentBlock = block.parentElement.closest(".box");
        const isInsideHorizontal = block.parentElement.classList.contains("child-box-container-horizontal");
        const isInsideVertical = block.parentElement.classList.contains("child-box-container");

        if (parentBlock && (!isInsideHorizontal || !isInsideVertical)) {
            // Skip adding a line number for this block
            return;
        }

        // Get only the base block height, ignoring dropdowns
        const blockHeight = block.offsetHeight;

        // Set the height of the code line to match the block's base height
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

function handlePrintBlock(newBlock, blockID) {
    const printLabel = document.createElement("span");
    printLabel.textContent = "print";
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
        const dropdown = createOperatorDropdown(blockID);
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

    // Create and append the dropdown list
    const dropdown = createOperatorDropdown(blockID);
    block.appendChild(dropdown);
}

function handleMathFunctionBlock(block, blockID) {
    const mathPrefix = document.createElement("span");
    mathPrefix.textContent = "math.";
    block.appendChild(mathPrefix);

    const dropdown = createOperatorDropdown(blockID);
    block.appendChild(dropdown);
    if (blockID != "mathConstants") {
        // Add a horizontal child block for the value input
        const childContainer = createChildBoxHorizontal(block.id, blockID);
        block.appendChild(childContainer);
    }
}

function handleMathOrComparisonOrVariableBlock(block, blockID) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");

    // Create the left-hand side container for the variable or math/comparison block
    const leftContainer = createChildBoxHorizontal(block.id, blockID);
    container.appendChild(leftContainer);

    // Create and append the operator dropdown
    const operatorDropdown = createOperatorDropdown(blockID);
    operatorDropdown.dataset.dropdownType = "operator";
    container.appendChild(operatorDropdown);

    // Create the right-hand side container for the value block
    const rightContainer = createChildBoxHorizontal(block.id, blockID);
    container.appendChild(rightContainer);

    block.appendChild(container);

    // Update data attributes based on changes in the operator dropdown
    operatorDropdown.addEventListener("change", function () {
        block.dataset.blockOperator = operatorDropdown.value;
    });

    // Handle changes in the left-hand side container (variable or math/comparison block)
    leftContainer.addEventListener("change", function () {
        const leftBlock = leftContainer.querySelector(".box");
        if (leftBlock) {
            block.dataset.block1Value = leftBlock.dataset.blockValue || "";
        }
    });

    // Handle changes in the right-hand side container (value block)
    rightContainer.addEventListener("change", function () {
        const rightBlock = rightContainer.querySelector(".box");
        if (rightBlock) {
            block.dataset.block2Value = rightBlock.dataset.blockValue || "";
        }
    });
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
    // Get the modal and input elements
    const modal = document.getElementById("variableModal");
    const variableNameInput = document.getElementById("variableNameInput");
    const submitButton = document.getElementById("submitVariable");
    const cancelButton = document.getElementById("cancelVariable");
    const closeButton = document.querySelector(".close");

    // Show the modal
    modal.style.display = "block";

    // Function to close the modal
    const closeModal = () => {
        modal.style.display = "none";
        variableNameInput.value = ""; // Clear the input field
    };

    // Handle the submit button click
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

    // Handle the cancel button click
    cancelButton.onclick = closeModal;

    // Handle the close button click
    closeButton.onclick = closeModal;

    // Close the modal if the user clicks outside of it
    window.onclick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };
}

function handleVariableBlock(block) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");

    // Variable Dropdown
    const variableDropdown = document.createElement("select");
    variableDropdown.classList.add("block-dropdown");
    variableDropdown.setAttribute("data-type", "variable");
    userVariables.forEach((varName) => {
        const option = document.createElement("option");
        option.value = varName;
        option.textContent = varName;
        variableDropdown.appendChild(option);
    });

    variableDropdown.value = "---"; // Default value
    variableDropdown.addEventListener("change", function () {
        block.dataset.blockValue = variableDropdown.value;
    });

    container.appendChild(variableDropdown);
    block.appendChild(container);
}

function handleElseIfOption(block, elifElseDiv, dropdown, plusIcon) {
    if (elifElseDiv.children.length === 1 && elifElseDiv.contains(plusIcon)) {
        elifElseDiv.remove(); // Remove the plus icon container if it exists
    }

    // Create the new "else if" block
    const newElifElseDiv = createElifElseDiv("elif");
    const elseIfSpan = createSpan("else if:");
    newElifElseDiv.appendChild(elseIfSpan);

    const horizontalChildBox = createChildBoxHorizontal(block.id, block.dataset.blockID);
    newElifElseDiv.appendChild(horizontalChildBox);

    // Append the new "else if" block to the parent block
    block.appendChild(newElifElseDiv);
    appendChildElement(block, "block");

    // Move the "else" block and plus icon to the end
    const elseBlock = block.querySelector('.elif-else[data-elif-else-type="else"]');
    const plusIconDiv = block.querySelector('.elif-else[data-elif-else-type="plus"]');

    if (elseBlock) {
        block.appendChild(elseBlock);
    }
    if (plusIconDiv) {
        block.appendChild(plusIconDiv);
    } else {
        // If the plus icon doesn't exist, create it and append it to the end
        const newPlusIcon = createPlusIcon();
        const newElifElseDivForPlus = createElifElseDiv("plus");
        newElifElseDivForPlus.appendChild(newPlusIcon);
        block.appendChild(newElifElseDivForPlus);

        // Set up the dropdown menu for the new plus icon
        setupDropdownMenu(newPlusIcon, block, newElifElseDivForPlus);
    }

    // Reset and update the IDs for all elif-else blocks
    resetAndUpdateElifElseIds(block);
    updateLineNumbers();

    // Increment the "else if" counter
    block.dataset.elseIfCount = parseInt(block.dataset.elseIfCount || 0) + 1;

    dropdown.remove();
    dropdown.style.display = "none";
}

function handleElseOption(block, elifElseDiv, dropdown, plusIcon) {
    if (elifElseDiv.children.length === 1 && elifElseDiv.contains(plusIcon)) {
        elifElseDiv.remove(); // Remove the plus icon container if it exists
    }

    // Create the new "else" block
    const newElifElseDiv = createElifElseDiv("else");
    const elseSpan = createSpan("else:");
    newElifElseDiv.appendChild(elseSpan);

    // Append the new "else" block to the parent block
    block.appendChild(newElifElseDiv);
    appendChildElement(block, "block");

    // Move the plus icon to the end
    const plusIconDiv = block.querySelector('.elif-else[data-elif-else-type="plus"]');
    if (plusIconDiv) {
        block.appendChild(plusIconDiv); // Move the plus icon to the end
    } else {
        // If the plus icon doesn't exist, create it and append it to the end
        const newPlusIcon = createPlusIcon();
        const newElifElseDivForPlus = createElifElseDiv("plus");
        newElifElseDivForPlus.appendChild(newPlusIcon);
        block.appendChild(newElifElseDivForPlus);

        // Set up the dropdown menu for the new plus icon
        setupDropdownMenu(newPlusIcon, block, newElifElseDivForPlus);
    }

    // Reset and update the IDs for all elif-else blocks
    resetAndUpdateElifElseIds(block);

    // Increment the "else" counter
    block.dataset.elseCount = parseInt(block.dataset.elseCount || 0) + 1;

    dropdown.remove(); // Remove the dropdown menu
    dropdown.style.display = "none";
}

function handleRangeBlock(block) {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");

    // Create the left-hand side container for the range block
    const leftContainer = createChildBoxHorizontal(block.id, block.dataset.blockID);
    container.appendChild(leftContainer);

    // text
    const inRangeText = document.createElement("span");
    inRangeText.textContent = "in range";
    container.appendChild(inRangeText);

    // Create the right-hand side container for the value block
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
        // Use a textarea for text blocks to allow newlines
        input = document.createElement("textarea");
        input.rows = 1; // Start with one row
        input.placeholder = placeholder;
        input.addEventListener("input", () => {
            // Adjust the number of rows based on the content
            input.style.height = "auto";
            input.style.height = `${input.scrollHeight}px`;

            // Update the data-block-value with newlines
            const block = input.closest(".box");
            block.dataset[dataKey] = input.value.replace(/\n/g, "\\n");
        });
    } else {
        // Use an input for other blocks (e.g., math blocks)
        input = document.createElement("input");
        input.type = "text";
        input.placeholder = placeholder;

        // Function to adjust the width of the input field (for non-textarea inputs)
        const adjustInputWidth = () => {
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.whiteSpace = "pre";
            tempSpan.style.fontFamily = getComputedStyle(input).fontFamily;
            tempSpan.style.fontSize = getComputedStyle(input).fontSize;
            tempSpan.textContent = input.value || input.placeholder;
            document.body.appendChild(tempSpan);
            const width = tempSpan.offsetWidth + 10; // Add some padding
            document.body.removeChild(tempSpan);
            input.style.width = `${width}px`;
        };

        // Adjust width on input (for non-textarea inputs)
        input.addEventListener("input", () => {
            const block = input.closest(".box");
            const value = input.value.trim();

            // Validate input based on block type
            if (blockID === "mathText" || blockID === "mathBlock") {
                // Only allow numbers for Math blocks
                if (/^-?\d*\.?\d*$/.test(value)) {
                    block.dataset[dataKey] = value;
                } else {
                    input.value = block.dataset[dataKey] || "";
                }
            } else {
                // Allow any input for non-Math blocks
                block.dataset[dataKey] = value;
            }

            // Adjust the input width dynamically (for non-textarea inputs)
            adjustInputWidth();
        });

        // Adjust width initially (for non-textarea inputs)
        adjustInputWidth();
    }

    input.classList.add(className);
    return input;
}

function createOperatorDropdown(blockID) {
    const dropdown = document.createElement("select");
    dropdown.classList.add("block-dropdown");

    const operatorOptions = getBlockDropdownList(blockID); // Fetch operators based on blockID
    operatorOptions.forEach((op) => {
        const option = document.createElement("option");
        option.value = op;
        option.textContent = op;
        dropdown.appendChild(option);
    });

    dropdown.value = "---"; // Default value
    dropdown.addEventListener("change", function () {
        const block = dropdown.closest(".box");
        block.dataset.blockOperator = dropdown.value;
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
        const childBox = document.createElement("div");
        childBox.classList.add("child-box-container");
        childBox.dataset.parentID = block.id;
        childBox.dataset.parentBlockID = block.dataset.blockID;

        childBox.dataset.blockDepth = parseInt(block.dataset.blockDepth) + 1;

        // Append the child-box-container to the appropriate parent
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

                // Set up the dropdown menu for the plus icon
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
    return childBox;
}

// ==========================
// 7. Update Functions
// ==========================

function resetAndUpdateElifElseIds(block) {
    // Get all elif-else blocks within the parent block
    const elifElseBlocks = block.querySelectorAll('.elif-else[data-elif-else-type="if"], .elif-else[data-elif-else-type="elif"], .elif-else[data-elif-else-type="else"]');

    // Reset and update the IDs sequentially
    elifElseBlocks.forEach((elifElseBlock, index) => {
        elifElseBlock.dataset.ifElifElseId = index + 1; // Set the ID for elif-else elements
    });
}

function updateUserVariableDropdowns() {
    const dropdowns = document.querySelectorAll(".block-dropdown[data-type='variable']");
    dropdowns.forEach((dropdown) => {
        dropdown.innerHTML = ""; // Clear existing options

        // Add the default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "---";
        defaultOption.textContent = "---";
        dropdown.appendChild(defaultOption);

        // Add options for each variable
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

    // Initialize counters for else if and else blocks using the block's dataset
    if (!block.dataset.elseIfCount) block.dataset.elseIfCount = 0;
    if (!block.dataset.elseCount) block.dataset.elseCount = 0;

    // Function to update the dropdown options
    const updateDropdownOptions = () => {
        dropdown.innerHTML = "";

        const elseIfOption = createDropdownOption("else if", () =>
            handleElseIfOption(block, elifElseDiv, dropdown, plusIcon)
        );
        dropdown.appendChild(elseIfOption);

        // Add the "else" option only if there is no else block yet
        if (block.dataset.elseCount === "0") {
            const elseOption = createDropdownOption("else", () =>
                handleElseOption(block, elifElseDiv, dropdown, plusIcon)
            );
            dropdown.appendChild(elseOption);
        }
    };

    // Update dropdown options every time the dropdown is opened
    plusIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        updateDropdownOptions();
        toggleDropdownVisibility(dropdown);
        setTimeout(() => updateLineNumbers(), 0);
        console.log("Dropdown opened");
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
        // Switch to Python view
        x.classList.remove("hidden");
        y.classList.add("hidden");
        toggleButton.textContent = "Block";
        isPythonView = true;

        // Hide the code container and handle1
        if (codeContainer) codeContainer.style.display = "none";
        if (handle1) handle1.style.display = "none";
    } else {
        // Switch to Block view
        x.classList.add("hidden");
        y.classList.remove("hidden");
        toggleButton.textContent = "Python";
        isPythonView = false;

        // Show the code container and handle1
        if (codeContainer) codeContainer.style.display = "flex";
        if (handle1) handle1.style.display = "block";
    }
}


export {
    clearDropHighlights,
    isPythonView
}