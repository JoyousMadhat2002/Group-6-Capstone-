import { categoryColors, blockCategory } from "./scripts/blockConfiguration.js";
import { getBlockDropdownList, getBlockProperties, getCategoryByBlockID, createBlockLabel } from "./scripts/blockProperties.js";

let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;
let isPythonView = false;
let userVariables = [];
let clickEvent = new Event('click');

// ==========================
// 3. Block Management Functions
// ==========================

// Function to dynamically create buttons and assign background colors to categories
function createCategoryButtons(blockCategory) {
  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    const categoryContainer = document.getElementById(categoryName);

    // Check if the category container exists
    if (!categoryContainer) {
      console.warn(`No container found for category: ${categoryName}`);
      continue;
    }

    // Apply the background color to the category header
    const categoryHeader =
      categoryContainer.parentElement.querySelector(".category-header");
    const color = categoryColors[categoryName] || "#cccccc";

    // Set default color for Variable Declaration block
    if (categoryName === "Variable Declaration") {
      categoryHeader.style.backgroundColor = "#cccccc";
    } else {
      categoryHeader.style.backgroundColor = color;
    }

    // Add the onclick event listener to the category header
    categoryHeader.addEventListener("click", function () {
      toggleCategory(categoryName);
    });

    // Iterate through each element in the category
    categoryData.elements.forEach((element) => {
      // Skip creating Variable Operations and Variable Blocks if no variables exist
      if (
        (element.blockID === "varOps" || element.blockID === "variableBlock") &&
        userVariables.length === 0
      ) {
        return; // Skip this element
      }

      const button = document.createElement("button");
      button.id = `${element.blockID}Button`;
      button.name = element.name;
      button.innerText = `${element.name}`;

      // Apply category color to the button
      // Set default color for Variable Declaration block buttons
      if (element.blockID === "varDeclOps") {
        button.style.backgroundColor = "#cccccc";
      } else {
        button.style.backgroundColor = color;
      }

      // Add the description to the button's title attribute
      button.title = element.description; // Tooltip text showing description

      // Add an onclick handler to call newBlock
      button.onclick = function () {
        // Call the newBlock function with the appropriate parameters
        newBlock(element.blockID);
      };

      // Append the button to the category container
      categoryContainer.appendChild(button);
    });
  }
}
// Call the function to create the buttons
createCategoryButtons(blockCategory);

function refreshCategoryButtons() {
  // Clear all category containers
  for (const categoryName of Object.keys(blockCategory)) {
    const categoryContainer = document.getElementById(categoryName);
    if (categoryContainer) {
      categoryContainer.innerHTML = ""; // Clear the container
    }
  }

  // Recreate the buttons
  createCategoryButtons(blockCategory);
}

function newBlock(blockID) {
  if (isPythonView) {
    console.warn("Cannot create a new block in Python view.");
    return; // Exit the function early
  }

  const container = document.getElementById("box-container");
  const newBlock = document.createElement("div");
  newBlock.classList.add("box");
  newBlock.id = "box_" + ++blockCounter; // Increment block counter and set ID
  newBlock.dataset.blockID = blockID; // Store the blockID in the dataset

  // Calculate and set the depth
  const parentDepth = Number(container.getAttribute("data-blockDepth")) || 0;
  newBlock.dataset.blockDepth = parentDepth + 1; // Parent depth + 1 for the new block

  // Set block properties
  const { blockCategoryColor, childElement } = getBlockProperties(blockID);
  newBlock.style.backgroundColor = blockCategoryColor; // Apply the category color

  createBlockLabel(newBlock, blockID);

  if (blockID === "mathBlock" || blockID === "comparisonBlock") {
    handleMathOrComparisonBlock(newBlock, blockID); // Pass blockID here
  } else if (["if", "while", "for"].includes(blockID)) {
    handleControlBlock(newBlock, blockID);
  } else if (blockID === "mathText") {
    createInputBlock(newBlock, "0", "math-input", "blockValue", blockID);
  } else if (blockID === "printText") {
    createInputBlock(
      newBlock,
      "Enter Text",
      "text-input",
      "blockValue",
      blockID
    );
  } else if (blockID === "varDeclOps") {
    handleVariableDeclarationBlock(newBlock); // Handle variable declaration block
  } else if (blockID === "varOps") {
    handleVariableOperationBlock(newBlock); // Handle variable operation block
  } else if (blockID === "variableBlock") {
    handleVariableBlock(newBlock); // Handle variable block
  } else if (
    blockID === "arithmeticOps" ||
    blockID === "comparisonOps" ||
    blockID === "logicalOps"
  ) {
    handleOperatorBlock(newBlock, blockID); // Handle operator blocks
  } else {
    handleDefaultBlock(newBlock, blockID); // Handle default block
  }

  if (blockID !== "varDeclOps") {
    appendChildElement(newBlock, childElement);
    container.appendChild(newBlock);
    addBlockInteractivity(newBlock);
    updateLineNumbers();
  }
  return newBlock.id;
}

// Function to remove a block by its ID
function removeBlock(blockId) {
  const block = document.getElementById(blockId);
  if (block) {
    block.remove(); // Remove the block from the DOM
    updateLineNumbers(); // Update line numbers after removal
  }
}

// Function to update the line numbers based on the number of blocks
function updateLineNumbers() {
  const codeLinesContainer = document.querySelector(".code-lines");
  const blocks = document.querySelectorAll("#box-container .box");

  // Clear existing line numbers
  codeLinesContainer.innerHTML = "";

  // Create new line numbers based on the number of blocks
  const totalLines = blocks.length + 1; // +1 for the extra empty line at the bottom
  for (let i = 1; i <= totalLines; i++) {
    const lineNumber = document.createElement("div");
    lineNumber.classList.add("code-line");
    if (i === totalLines) {
      // This is the extra empty line at the bottom
      lineNumber.textContent = i;
    } else {
      lineNumber.textContent = i; // Line numbers start from 1
    }
    codeLinesContainer.appendChild(lineNumber);
  }
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

function handleOperatorBlock(block, blockID) {
  const blockName = blockCategory[getCategoryByBlockID(blockID)].elements.find(
    (element) => element.blockID === blockID
  ).name;

  const blockLabel = document.createElement("span");
  blockLabel.textContent = `${blockName}`;
  block.appendChild(blockLabel);

  // Create and append the dropdown list
  const dropdown = createOperatorDropdown(blockID);
  block.appendChild(dropdown);
}

function handleMathOrComparisonBlock(block, blockID) {
  const horizontalContainers = [1, 2, 3].map(() => {
    const container = document.createElement("div");
    container.classList.add("childBox-Container-Horizontal");
    return container;
  });

  // Input 1
  const input1 = createInputField(
    "0",
    "math-comparison-input",
    "block-1-value",
    blockID
  );
  horizontalContainers[0].appendChild(input1);

  // Operator Dropdown
  const operatorDropdown = createOperatorDropdown(blockID); // Pass blockID here
  operatorDropdown.dataset.dropdownType = "operator";
  horizontalContainers[1].appendChild(operatorDropdown);

  // Input 2
  const input2 = createInputField(
    "0",
    "math-comparison-input",
    "block-2-value",
    blockID
  );
  horizontalContainers[2].appendChild(input2);

  // Append containers to the block
  horizontalContainers.forEach((container) => block.appendChild(container));

  // Update data attributes
  operatorDropdown.addEventListener("change", function () {
    block.dataset.blockOperator = operatorDropdown.value;
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

  if (blockID === "for") {
    const extraTopChildBox = createChildBoxHorizontal(block.id, blockID);
    const extraTopLabel = document.createElement("span");
    extraTopLabel.classList.add("block-top-label");
    extraTopLabel.textContent = "Range:";
    block.appendChild(extraTopLabel);
    block.appendChild(extraTopChildBox);
  }
}

function handleVariableOperationBlock(block) {
  const container = document.createElement("div");
  container.classList.add("childBox-Container-Horizontal");

  // Variable Dropdown
  const variableDropdown = document.createElement("select");
  variableDropdown.classList.add("block-dropdown");
  variableDropdown.setAttribute("data-type", "variable"); // Add this line
  userVariables.forEach((varName) => {
    const option = document.createElement("option");
    option.value = varName;
    option.textContent = varName;
    variableDropdown.appendChild(option);
  });

  variableDropdown.addEventListener("change", function () {
    block.dataset.block1Value = variableDropdown.value;
  });

  container.appendChild(variableDropdown);

  // Operator Dropdown
  const operatorDropdown = createOperatorDropdown("varOps");
  operatorDropdown.dataset.dropdownType = "operator";
  container.appendChild(operatorDropdown);

  // Value Input
  const valueInput = createInputField(
    "0",
    "math-comparison-input",
    "block2Value",
    "varOps"
  );
  container.appendChild(valueInput);

  block.appendChild(container);

  // Update data attributes
  operatorDropdown.addEventListener("change", function () {
    block.dataset.blockOperator = operatorDropdown.value;
  });

  valueInput.addEventListener("input", function () {
    block.dataset.block2Value = valueInput.value.trim();
  });
}

function handleVariableBlock(block) {
  const container = document.createElement("div");
  container.classList.add("childBox-Container-Horizontal");

  // Variable Dropdown
  const variableDropdown = document.createElement("select");
  variableDropdown.classList.add("block-dropdown");
  variableDropdown.setAttribute("data-type", "variable"); // Add this line
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

// ==========================
// 5. Create Functions
// ==========================

function createInputField(placeholder, className, dataKey, blockID) {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.classList.add(className);

  input.addEventListener("input", function () {
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
  });

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

function createBlockTypeDropdown(blockTypes) {
  const dropdown = document.createElement("select");
  dropdown.classList.add("block-dropdown");

  blockTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    dropdown.appendChild(option);
  });

  dropdown.value = blockTypes[0];
  dropdown.addEventListener("change", function () {
    const block = dropdown.closest(".box");
    block.dataset.selected = dropdown.value; // Add data-selected attribute
  });

  return dropdown;
}

function createChildBoxHorizontal(parentID, parentBlockID) {
  const childBox = document.createElement("div");
  childBox.classList.add("child-box-container-horizontal");
  childBox.dataset.parentID = parentID;
  childBox.dataset.parentBlockID = parentBlockID;
  return childBox;
}

function createInputBlock(block, placeholder, className, dataKey, blockID) {
  const inputField = createInputField(placeholder, className, dataKey, blockID);
  block.appendChild(inputField);
}

// ==========================
// 6. Child Block Functions
// ==========================

function addDepthInfo(block) {
  const depthInfo = document.createElement("span");
  depthInfo.classList.add("block-depth-info");
  depthInfo.textContent = ` Depth: ${block.dataset.blockDepth}`;
  block.appendChild(depthInfo);
}

function appendChildElement(block, childElement) {
  if (childElement === "block") {
    const childBox = document.createElement("div");
    childBox.classList.add("child-box-container");
    childBox.dataset.parentID = block.id;
    childBox.dataset.parentBlockID = block.dataset.blockID;


    childBox.dataset.blockDepth = parseInt(block.dataset.blockDepth) + 1;

    // Set initial if-elif-else-id to 0 for the first block
    if (!block.dataset.ifElifElseId) {
      block.dataset.ifElifElseId = 0;
    }

    childBox.dataset.ifElifElseId = block.dataset.ifElifElseId;

    block.appendChild(childBox);

    if (block.dataset.blockID === "if") {
      // Add the elif-else section with the plusIcon
      const elifElseDiv = document.createElement("div");
      elifElseDiv.classList.add("elif-else");
      const plusIcon = document.createElement("i");
      plusIcon.classList.add("fa-solid", "fa-plus");
      elifElseDiv.appendChild(plusIcon);
      block.appendChild(elifElseDiv);

      // Call the function to set up the dropdown menu and its functionality
      setupDropdownMenu(plusIcon, block, elifElseDiv);
    }
  }
}

function setupDropdownMenu(plusIcon, block, elifElseDiv) {
  // Create the dropdown menu
  const dropdown = document.createElement("div");
  dropdown.classList.add("dropdown-menu");
  dropdown.style.display = "none"; // Hide the dropdown by default

  // Create the menu items
  const elseIfOption = document.createElement("div");
  elseIfOption.textContent = "else if";
  elseIfOption.classList.add("dropdown-item");
  dropdown.appendChild(elseIfOption);

  const elseOption = document.createElement("div");
  elseOption.textContent = "else";
  elseOption.classList.add("dropdown-item");
  dropdown.appendChild(elseOption);

  // Add dropdown to the block
  block.appendChild(dropdown);

  // Toggle dropdown visibility when the plus icon is clicked
  plusIcon.addEventListener("click", function () {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  });

  // Add click events to the options
  elseIfOption.addEventListener("click", function () {
    // Insert the text 'else if:' in a span
    const elseIfSpan = document.createElement("span");
    elseIfSpan.textContent = "else if:";
    block.appendChild(elseIfSpan);

    // Remove the previous plus sign before adding a new child block
    elifElseDiv.removeChild(plusIcon); // Remove the plus sign

    // Increment the if-elif-else-id and create the horizontal child box
    block.dataset.ifElifElseId = parseInt(block.dataset.ifElifElseId) + 1;

    // Call createChildBoxHorizontal before the normal child box
    const horizontalChildBox = createChildBoxHorizontal(block.id, block.dataset.blockID);
    block.appendChild(horizontalChildBox);

    // Call appendChildElement again to add a child block
    appendChildElement(block, "block");

    // Close dropdown
    dropdown.style.display = "none";
  });

  elseOption.addEventListener("click", function () {
    // Insert the text 'else:' in a span
    const elseSpan = document.createElement("span");
    elseSpan.textContent = "else:";
    block.appendChild(elseSpan);

    // Remove the previous plus sign before adding a new child block
    elifElseDiv.removeChild(plusIcon); // Remove the plus sign

    // Increment the if-elif-else-id for else block
    block.dataset.ifElifElseId = parseInt(block.dataset.ifElifElseId) + 1;

    // Call appendChildElement again to add a child block
    appendChildElement(block, "block");

    // Close dropdown
    dropdown.style.display = "none";
  });
}





// ==========================
// 7. Update Functions
// ==========================

function updateVariableAttributes(block, selectedVariable) {
  const existingAttributes = block.querySelectorAll(".variable-attribute");
  existingAttributes.forEach((attr) => attr.remove());

  updateVariableValueInBlock(block, selectedVariable);
}

function updateOperatorAttributes(block, selectedOperator) {
  const operatorLabel = document.createElement("span");
  operatorLabel.classList.add("operator-attribute");
  operatorLabel.textContent = `Operator: ${selectedOperator}`;

  const existingOperatorLabel = block.querySelector(".operator-attribute");
  if (existingOperatorLabel) {
    existingOperatorLabel.remove();
  }

  block.appendChild(operatorLabel);
}

// May not be needed anymore (look at calculateDepth() function)
function updateDepth(block, targetBlock, depthChange) {
  const currentDepth = parseInt(block.dataset.blockDepth) || 0;
  const newDepth = currentDepth + depthChange;
  block.dataset.blockDepth = newDepth; // Update depth attribute

  // Update depth display in the block's label
  const depthInfo = block.querySelector(".block-depth-info");
  if (depthInfo) {
    depthInfo.textContent = ` Depth: ${newDepth}`;
  }
}

// ==========================
// 8. UI and Interactivity
// ==========================

// Function to toggle between showing and hiding block categories
function toggleCategory(categoryId) {
  const allCategories = document.querySelectorAll(".category-blocks");
  allCategories.forEach((category) => {
    if (category.id === categoryId) {
      category.classList.toggle("hidden"); // Toggle visibility of the clicked category
    } else {
      category.classList.add("hidden"); // Hide all other categories
    }
  });
}

// Function to add interactivity to blocks
function addBlockInteractivity(block) {
  block.draggable = true;
  block.addEventListener("dragstart", dragStart);
  block.addEventListener("dragover", dragOver);
  block.addEventListener("drop", drop);
  block.addEventListener("click", selectBlock);
}

// Event handler for starting a drag event on a block
function dragStart(event) {
  dragged = event.target.closest(".box");
  console.log("dragStart: ", dragged);
  if (dragged) {
    event.dataTransfer.effectAllowed = "move"; // Allow movement
  }
}

// Event handler for dragging over a block
function dragOver(event) {
  event.preventDefault();

  const targetBlock = event.target.closest(".box");
  if (!targetBlock || targetBlock === dragged) return;

  clearDropHighlights(); // Clear previous highlights

  const childContainers = targetBlock.querySelectorAll(
      ".child-box-container, .child-box-container-horizontal"
  );

  let closestContainer = null;
  let smallestDistance = Infinity;

  childContainers.forEach((container) => {
      if (dragged.contains(container)) return; // Prevent dragging into its own child container

      const containerRect = container.getBoundingClientRect();
      const distance = Math.abs(event.clientY - containerRect.top);

      // Find the closest container based on distance (even if it's not empty)
      if (distance < smallestDistance) {
          smallestDistance = distance;
          closestContainer = container;
      }
  });

  if (closestContainer) {
      closestContainer.classList.add("highlight-inside");
  }
}



// Event handler for handling the drop action
function drop(event) {
  event.preventDefault();

  if (!dragged) return;

  const highlightedContainer = document.querySelector(".highlight-inside");
  if (highlightedContainer) {
      highlightedContainer.appendChild(dragged); // Drop into the highlighted container
  } else {
      const targetBlock = event.target.closest(".box");
      if (!targetBlock || targetBlock === dragged) return;

      if (targetBlock.classList.contains("drop-above")) {
          targetBlock.parentNode.insertBefore(dragged, targetBlock);
      } else if (targetBlock.classList.contains("drop-below")) {
          targetBlock.parentNode.insertBefore(dragged, targetBlock.nextSibling);
      }
  }

  // Recalculate and update the block's depth
  const newDepth = calculateDepth(dragged);
  dragged.dataset.blockDepth = newDepth;

  // Update the depth for all nested blocks
  updateNestedDepths(dragged);

  //test function to show depth (remove later)
  //showDepth(dragged);

  clearDropHighlights();
  dragged = null;
}


//test function to show depth
function showDepth(block) {
  const depthLabel = block.querySelector(".block-depth-info");
  if (!depthLabel) {
      const label = document.createElement("span");
      label.classList.add("block-depth-info");
      block.appendChild(label);
  }
  block.querySelector(".block-depth-info").textContent = `Depth: ${block.dataset.blockDepth}`;
}

// Function to update the depth of all nested blocks
function updateNestedDepths(block) {
  const newDepth = calculateDepth(block);
  block.dataset.blockDepth = newDepth;

  const childBlocks = block.querySelectorAll(".box");
  childBlocks.forEach((childBlock) => {
      updateNestedDepths(childBlock);  // Recursively update depth for each child block
  });
}

// Event handler for ending a drag event
function dragEnd() {
  clearDropHighlights(); // Clear all highlights
  dragged = null; // Reset dragged block
}

// Function to clear all drop highlights
function clearDropHighlights() {
  document.querySelectorAll(".drop-above, .drop-below, .highlight-inside")
      .forEach((block) => {
          block.classList.remove("drop-above", "drop-below", "highlight-inside");
      });
}

// Function to calculate the depth of a block
function calculateDepth(block) {
  let depth = 0;
  let parent = block.closest(".child-box-container, .child-box-container-horizontal");

  while (parent) {
      depth++;
      parent = parent.parentElement.closest(".child-box-container, .child-box-container-horizontal");
  }

  return depth;
}

// Event handler for selecting a block when clicked
function selectBlock(event) {
  const targetBlock = event.target.closest(".box");

  if (!targetBlock) return; // Exit if no block is found

  // Clear previous selection if any
  if (highlightedBlock) {
    highlightedBlock.classList.remove("selected");
  }

  // Highlight the clicked block
  highlightedBlock = targetBlock;
  highlightedBlock.classList.add("selected");

  event.stopPropagation(); // Prevent click event from propagating
}

function updateUserVariableDropdowns() {
  const dropdowns = document.querySelectorAll(
    ".block-dropdown[data-type='variable']"
  );
  dropdowns.forEach((dropdown) => {
    dropdown.innerHTML = ""; // Clear existing options
    userVariables.forEach((varName) => {
      const option = document.createElement("option");
      option.value = varName;
      option.textContent = varName;
      dropdown.appendChild(option);
    });
  });
}

// ==========================
// 9. Python Code Conversion
// ==========================

function blockToText(pc) {
  //pythontext.value = ""; // Clear the text area
  
  let parentContainer = document.getElementById(pc);
  
  
  let blockChildElements = parentContainer.querySelectorAll("*");

  // set all depth to 0
  for(let i = 0; i < blockChildElements.length; i++){
    blockChildElements[i].dataset.blockDepth = 0;
  }


  // iterate through every element and recalculate depth
  for(let i = 0; i < blockChildElements.length; i++){
    let curBlock = blockChildElements[i];

    
    
      if(curBlock.parentElement.dataset.blockID == "if" || curBlock.parentElement.dataset.blockID == "for" || curBlock.parentElement.dataset.blockID == "when"){
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);
    }
    else if(curBlock.parentElement.className == "child-box-container" || curBlock.parentElement.className == "block-code-result"){
      if(curBlock.dataset.blockID == "comparisonBlock" || curBlock.className == "block-dropdown" || curBlock.dataset.blockID == "mathText"){
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);

      }
      else{
        curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth) + 1;
      }
      
      
    }
    else{
      curBlock.dataset.blockDepth = parseInt(curBlock.parentElement.dataset.blockDepth);
    }

  } // end of depth recalculation

  let tDepth = 0;
  // let colonC = 0;

  for(let i = 0; i < blockChildElements.length; i++){
    let curBlock = blockChildElements[i];
    
    
    // else{
    //   tDepth = curBlock.dataset.blockDepth;
    // }
    
    if(curBlock.dataset.blockID == "if" || curBlock.dataset.blockID == "for" || curBlock.dataset.blockID == "while"){
      // colonC = 1;
      // tDepth += 1;
      // if(curBlock.dataset.blockDepth != tDepth || curBlock.dataset.blockDepth){
      //   pythontext.value += ":\n";
      // }
      if(tDepth != 0){
        pythontext.value += ":\n";
      }

      for(let d = 0 ; d < (curBlock.dataset.blockDepth-1);d++){
        pythontext.value += "    ";
      }
      pythontext.value += `${curBlock.dataset.blockID}`;
      tDepth = curBlock.dataset.blockDepth;
    }
    else if(curBlock.innerText == "else if:" || curBlock.innerText == "else:"){
      pythontext.value += ":\n";
      for(let d = 0 ; d < (curBlock.dataset.blockDepth-1);d++){
        pythontext.value += " ";
      }
      if(curBlock.innerText == "else if:"){
        pythontext.value += "else if";
        // colonC = 1;
        tDepth = curBlock.dataset.blockDepth;
      }
      else if( curBlock.innerText == "else:"){
      pythontext.value += `${curBlock.innerText}` + "\n";
    }
   
    }
  if(curBlock.className == "block-dropdown"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      pythontext.value += "   "
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
    
  }

  if(curBlock.className == "text-input"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
  }
  if(curBlock.className == "math-input"){
    if(curBlock.dataset.blockDepth > tDepth){
      pythontext.value += ":\n";
      tDepth = curBlock.dataset.blockDepth;
    }
    pythontext.value += " " + `${curBlock.value}`;
  }
  
  
}
} // END OF BBT()


// Function to convert text programming to block programming
function textToBlock(container) {
  let text = pythontext.value;
  if(container == "box-container"){
    document.getElementById(container).innerHTML = ""; // Clear block container
  }

  let lines = text.split("\n"); // Separate lines for parsing
 
  let depthBuilder = ["box-container"]; // counting preceeding zeros for depth
  
  for (let i = 0; i < lines.length; i++) {
    let currDepth = 0;
    let linecount = 0;
    for (let j = 0; j < lines[i].length; j++){
      
      if(lines[i][j] ==  " "){
        linecount++;
      }
      else{
        break;
      }
    }
  

    // setting currDepth based on number of indentations
    
    if (linecount < 1){
      console.log(linecount);
      console.log(currDepth);
      currDepth = 1;
      
      
    }
    else {
      console.log(linecount);
      console.log(currDepth);
      currDepth = (linecount/4) + 1;
    }

    lines[i] = lines[i].trim(); // trimming text line for whitespace

    // Line deleting colon for statements
    if(lines[i][lines[i].length -1] == ':'){
      lines[i] = lines[i].substring(0, lines[i].length -1);
    }

    let tokens = lines[i].split(" "); // splitting string into tokens

    // logic to build blocks
    if (tokens != ""){
      
      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for" || tokens[1] == "if"){
        
        
        
        console.log(`${tokens[0]}` + " statement");
        let nbCons;
        let nbRef;
        let elseChild;
        
        // Logic for else if blocks
        if(tokens[1] == "if"){
          let tempIf = document.getElementById(depthBuilder[currDepth]);
          tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
          let elDrops = tempIf.querySelectorAll(".dropdown-item");
          elDrops[0].dispatchEvent(clickEvent);

          // let elseRef = document.getElementById(depthBuilder[currDepth]).getAttribute('data-if-elif-else-id');
          // console.log(elseRef);
          let elseRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container");
          for(let k = 0; k < elseRef.length; k++){
            if(elseRef[k].getAttribute("data-if-elif-else-id") == "1"){
              elseChild = elseRef[k];
            }
          }
          let horRef = document.getElementById(depthBuilder[currDepth]).querySelectorAll(".child-box-container-horizontal");
          console.log(horRef[horRef.length -1]);
          nbRef = horRef[horRef.length -1];
          blockBuilder(tokens, nbRef);
        }
        else{
        nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        nbRef = document.getElementById(nbCons); // created reference to newblock
        depthBuilder[currDepth] = nbRef.id; // put block reference into depth array
        nbRef.dataset.blockDepth = currDepth; // update depth of block
        console.log(depthBuilder);
        

        if(depthBuilder[currDepth-1] != "box-container"){
          if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") == "1"){
            console.log("PARENT IS AN ELSE")
            let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
            parentBlock[parentBlock.length-1].append(document.getElementById(nbCons));
          }
          else{
          let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
          parentBlock.append(document.getElementById(nbCons));
          
          }
        }
        blockBuilder(tokens, nbRef.querySelector(".child-box-container-horizontal"))
        }
        let j = 1

      }

      else if(tokens[0] == "else" && tokens.length == 1){
        let tempIf = document.getElementById(depthBuilder[currDepth]);
        tempIf.querySelector(".fa-solid").dispatchEvent(clickEvent);
        let elDrops = tempIf.querySelectorAll(".dropdown-item");
        console.log(elDrops);
        elDrops[1].dispatchEvent(clickEvent);

      }
              
      

      // building CONTINUE and BREAK
      else if(tokens[0] == "continue" || tokens[0] == "break"){
        console.log(tokens[0]);
        let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        nbRef.dataset.blockDepth = currDepth;
        depthBuilder[currDepth] = nbRef;
        console.log(depthBuilder);

        if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") > "0"){
          console.log("PARENT IS AN ELSE")
          let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
          parentBlock[parentBlock.length-1].append(document.getElementById(nbCons));
        }
        else{
        let parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
        parentBlock.append(document.getElementById(nbCons));
        }
      }

      else{
        let parentBlock;
        if(document.getElementById(depthBuilder[currDepth-1]).getAttribute("data-if-elif-else-id") > "0"){
          console.log("PARENT IS AN ELSE")
          let nbRef = document.getElementById(depthBuilder[currDepth-1]).querySelectorAll(".child-box-container");
          parentBlock = nbRef[nbRef.length-1];
        }
        else{
          parentBlock = document.getElementById(depthBuilder[currDepth-1]).querySelector(".child-box-container");
        }

        
        
        blockBuilder(tokens, parentBlock);
        console.log("END OF ALL ELSE");
      }

    }
  }
    
  } // END OF TTB()

  function blockBuilder(arr, container){
    let oArray = arr;
    let rmBlock = [];
    let retArray = [];
    let arrCount =0;
    let block_T;
    for(let i = 0; i < oArray.length;i++){
      
    

      if(oArray[i] == "or" || oArray[i] == "||" || oArray[i] == "and" || oArray[i] == "&&" || oArray[i] == "not"){
        let nbCons = newBlock("logicalOps"); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock
        rmBlock.push(document.getElementById(nbCons));
        nbRef.querySelector(".block-dropdown").value = oArray[i]  


        if(oArray[i-1] >= "0" && oArray[i-1] <= "9"){
          let tempNb = newBlock("mathText");
          let tempRef = document.getElementById(tempNb);
          let mathInput = tempRef.querySelector(".math-input") 
          mathInput.value = oArray[i-1];
          tempRef.dataset.blockValue = oArray[i-1];
  
          retArray[arrCount-1].append(tempRef);
        }
        else{
          let nbComp = newBlock("printText");
          let elText = document.getElementById(nbComp);
          elText.querySelector(".text-input").value += oArray[i-1];
          compElems[0].append(elText);
        }
        

  
      }

      else if(oArray[i] == "=" || oArray[i] == "+=" || oArray[i] == "-=" || oArray[i] == "*=" || oArray[i] == "/="){
        if(!userVariables.includes(oArray[i-1])){
          userVariables.push(oArray[i-1]);
        }
        
        console.log("IT EQUALS");
        let nbComp = newBlock("varOps");
        let nbRef = document.getElementById(nbComp);
        let nbHz = nbRef.querySelector(".childBox-Container-Horizontal")
        console.log('nbHz: ' + `${nbHz}`);
        console.log('nbHz MCI: ' + `${nbHz.querySelector(".math-comparison-input")}`);
        console.log(nbHz.childNodes[1]);
        nbHz.childNodes[1].value = oArray[i];

        retArray[arrCount] = nbHz;
        arrCount++;

        rmBlock.push(nbRef);

      }

      else if(oArray[i] == "in"){
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i-1] + " ";
        elText.querySelector(".text-input").value += oArray[i] + " ";
        elText.querySelector(".text-input").value += oArray[i+1];
        rmBlock.push(elText);
      }
      else if(i < oArray.length-1){
      if(oArray[i] == "==" || oArray[i] == "!=" || oArray[i]  == ">=" || oArray[i]  == "<=" || oArray[i]  == "<" || oArray[i]  == ">"){
        block_T = "comparisonBlock";
      }
      else if(oArray[i] == "+" || oArray[i] == "-" || oArray[i]  == "*" || oArray[i]  == "/" || oArray[i]  == "%" || oArray[i]  == "**" || oArray[i]  == "//"){
        block_T = "mathBlock";
      }
      else{
        block_T = "";
        continue;
      }
      let nbComp = newBlock(block_T);
      let compElems = document.getElementById(nbComp).querySelectorAll(".childBox-Container-Horizontal");


      if(block_T == "comparisonBlock"){
        console.log("HELLLLLLLOOOOOO");
        rmBlock.push(document.getElementById(nbComp));

      }
      if(oArray[i-1] >= "0" && oArray[i-1] <= "9"){
        let tempNb = newBlock("mathText");
        let tempRef = document.getElementById(tempNb);
        let mathInput = tempRef.querySelector(".math-input") 
        mathInput.value = oArray[i-1];
        tempRef.dataset.blockValue = oArray[i-1];

        compElems[0].appendChild(tempRef);
      }
      else{
        let nbComp = newBlock("printText");
        let elText = document.getElementById(nbComp);
        elText.querySelector(".text-input").value += oArray[i-1];
        compElems[0].append(elText);
      }
            
      let elDrop = compElems[1].querySelector(".block-dropdown");
      elDrop.value = oArray[i];

      
      
      console.log('i: ' + `${i}`);

      retArray[arrCount] = compElems[2];
      if(retArray.length > 1){
        retArray[arrCount-1].append(document.getElementById(nbComp));
      }

      
      arrCount++;
      //rmBlock = document.getElementById(nbComp);
      console.log(retArray);
      

    }

    else if(i==oArray.length-1){
      if(oArray[i] >= "0" && oArray[i] <= "9"){
        let nbComp = newBlock("mathText");
        let nbRef = document.getElementById(nbComp);
        let mathInput = nbRef.querySelector(".math-input") 
        mathInput.value = oArray[i];
        nbRef.dataset.blockValue = oArray[i];

        retArray[arrCount-1].appendChild(nbRef);

      }
    }

    } // end for loop over array of tokens

    console.log('return array: ');
    console.log(rmBlock);
    for(let i = 0; i < rmBlock.length; i++){
      container.appendChild(rmBlock[i]);
    }
  } // end blockBuilder()



function toggleView() {
  var x = document.getElementById("python-code-result");
  var y = document.getElementById("box-container");
  var toggleButton = document.getElementById("toggleButton");

  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.display = "block";
    toggleButton.textContent = "Python";
    isPythonView = false; // Switch to Block view
  } else {
    x.style.display = "block";
    y.style.display = "none";
    toggleButton.textContent = "Block";
    isPythonView = true; // Switch to Python view
  }
}

// ==========================
// 10. Code Execution
// ==========================

// Function to run the Python code
function runCode() {
  console.log("test: code running");
  var prog = document.getElementById("pythontext").value; // Python code input
  var mypre = document.getElementById("output"); // Output area
  mypre.innerHTML = ""; // Clear previous output

  Sk.pre = "output";
  console.log(Sk);
  Sk.configure({ output: outf, read: builtinRead });
  (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";

  //KEEP INDENTS AS IS FOR PYTHON CODE; DO NOT CHANGE turtleSetupCode
  var turtleSetupCode = `
import turtle
t = turtle.Turtle()
t.shape("turtle")
t.color("green")
t.setheading(90)
  `;

  var cleanedProg = prog.trimStart();
  console.log("user code:", prog);
  var fullProg = turtleSetupCode + "\n" + cleanedProg;
  console.log("Combined code:", fullProg);

  var myPromise = Sk.misceval.asyncToPromise(function () {
    return Sk.importMainWithBody("<stdin>", false, fullProg, true);
  });
  myPromise.then(
    function (mod) {
      console.log("success");
    },
    function (err) {
      console.log(err.toString());
    });
}

// Function to handle the output of the Python code
function outf(text) {
  var mypre = document.getElementById("output");
  mypre.innerHTML += text.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
}

// Function to read built-in files
function builtinRead(x) {
  if (
    Sk.builtinFiles === undefined ||
    Sk.builtinFiles["files"][x] === undefined
  )
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

function updateVariableValueInBlock(block, selectedVariable) {
  const existingValueAttribute = block.querySelector(
    ".variable-value-attribute"
  );
  if (existingValueAttribute) {
    existingValueAttribute.remove();
  }
}


// ==========================
// 11. Event Listeners
// ==========================

function setupKeydownListener() {
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      runCode();
    }
  });
}


function setupClearHighlightsOnClickListener() {
  // event listener for clearing highlights when clicking 
  // (fixes glitch with highlights not clearing properly after dragging and dropping)
  document.addEventListener("click", function () {
    clearDropHighlights();
  });
}

function setupDOMContentLoadedListener() {
  document.addEventListener("DOMContentLoaded", function () {
    runCode();
  });
}

function setupLoginButtonListener() {
  const loginButton = document.getElementById("loginButton");
  loginButton.addEventListener("click", function () {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");

    if (username === "user" && password === "password") {
      localStorage.setItem("loggedIn", "true");
      alert("Login successful!");
    } else {
      alert("Invalid credentials");
    }
  });
}

function setupSaveButtonListener() {
  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function () {
    const pythonCode = document.getElementById("pythontext").value;
    localStorage.setItem("savedCode", pythonCode);
    alert("Code saved locally!");
  });
}

function setupButtonFunctionalityListeners() {
  document.querySelector('[name="btt"]').addEventListener("click", function(){
    pythontext.value = ""; // Clear the text area
    blockToText("box-container");
  });
  document.querySelector('[name="ttb"]').addEventListener("click", function(){
    textToBlock("box-container");
  });
  document.getElementById("toggleButton").addEventListener("click", toggleView);
}

// ==========================
// 12. Additional Features (Resizing Columns, Dragging, etc.)
// ==========================

function setupColumnResizing() {
  let isDragging = false;
  let currentSpacer = null;
  let startX = 0;
  let startWidthCol1 = 0;
  let startWidthCol2 = 0;
  let startWidthCol3 = 0;

  const MIN_WIDTH1 = 100;
  const MIN_WIDTH2 = 200;

  const spacer1 = document.querySelector(".handle1");
  const spacer2 = document.querySelector(".handle2");
  const col1 = document.querySelector(".code-container");
  const col2 = document.querySelector(".result-container");
  const col3 = document.querySelector(".output-graph");

  function startDrag(event, spacer) {
    isDragging = true;
    currentSpacer = spacer;
    startX = event.clientX;
    startWidthCol1 = col1.offsetWidth;
    startWidthCol2 = col2.offsetWidth;
    startWidthCol3 = col3.offsetWidth;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", stopDrag);
  }

  function onDrag(event) {
    if (!isDragging || !currentSpacer) return;

    const deltaX = event.clientX - startX;

    if (currentSpacer === spacer1) {
      const newWidthCol1 = startWidthCol1 + deltaX;
      const newWidthCol2 = startWidthCol2 - deltaX;

      if (newWidthCol1 < MIN_WIDTH1 || newWidthCol2 < MIN_WIDTH2) return;

      col1.style.flexBasis = `${newWidthCol1}px`;
      col2.style.flexBasis = `${newWidthCol2}px`;
    } else if (currentSpacer === spacer2) {
      const newWidthCol2 = startWidthCol2 + deltaX;
      const newWidthCol3 = startWidthCol3 - deltaX;

      if (newWidthCol2 < MIN_WIDTH2 || newWidthCol3 < MIN_WIDTH1) return;

      col2.style.flexBasis = `${newWidthCol2}px`;
      col3.style.flexBasis = `${newWidthCol3}px`;
    }
  }

  function stopDrag() {
    isDragging = false;
    currentSpacer = null;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", stopDrag);
  }

  spacer1.addEventListener("mousedown", (e) => startDrag(e, spacer1));
  spacer2.addEventListener("mousedown", (e) => startDrag(e, spacer2));
}

function setupDraggableBlocks() {
  document.querySelectorAll(".box").forEach((box) => {
    box.draggable = true;
    box.addEventListener("dragstart", dragStart);
    box.addEventListener("dragover", dragOver);
    box.addEventListener("drop", drop);
    box.addEventListener("dragend", dragEnd);
  });

  // Prevent category buttons from closing the menu
  document.querySelectorAll(".category-blocks button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  });

  // Handle block deletion when dragging over the left-side container
  const codeContainer = document.querySelector(".code-container");
  codeContainer.addEventListener("dragover", function (event) {
    event.preventDefault();
  });

  codeContainer.addEventListener("drop", function (event) {
    event.preventDefault();
    if (dragged) {
      dragged.remove();
      dragged = null;
      updateLineNumbers();
    }
  });

  // Remove drop target highlight when dragging leaves a block
  document.addEventListener("dragleave", function (event) {
    const targetBlock = event.target.closest(".box");
    if (targetBlock) {
      targetBlock.classList.remove("drop-target");
    }
  });

  // Deselect block when clicking outside
  document.addEventListener("click", function (event) {
    if (highlightedBlock && !highlightedBlock.contains(event.target)) {
      highlightedBlock.classList.remove("selected");
      highlightedBlock = null;
    }
  });

  // Delete highlighted block with "Delete" key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && highlightedBlock) {
      highlightedBlock.remove();
      highlightedBlock = null;
      updateLineNumbers();
    }
  });
}

// ==========================
// 13. Miscellaneous Code
// ==========================

/*
function initializeMiscellaneous() {
  const pythonTextarea = document.getElementById("pythontext");
  ptext = pythonTextarea.value;

  const blockContainer = document.getElementById("box-container");

  let isRunning = false;

  document.getElementById("output").style.whiteSpace = "pre-wrap";
}
*/
// ==========================
// Main Initialization Function
// ==========================

function initializeApp() {
  setupKeydownListener();
  setupDOMContentLoadedListener();
  setupLoginButtonListener();
  setupSaveButtonListener();
  setupButtonFunctionalityListeners();
  setupColumnResizing();
  setupDraggableBlocks();
  setupClearHighlightsOnClickListener();
  //initializeMiscellaneous();
}

// Call the main initialization function
initializeApp();

/* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
// Run Code button logic for swapping between Run/Stop
function toggleRunButton() {
    const button = document.getElementById("run-code-btn");
    const icon = button.querySelector("i");

    if (button.classList.contains("stop")) {
        button.classList.remove("stop");
        button.style.backgroundColor = "green"; // Change to green
        icon.className = "icon-play"; // Change icon to play
        button.setAttribute("data-tooltip", "Run Program (Ctrl+Enter)"); // Update tooltip
        stopCode();
        isRunning = false; // Update running state
    } else {
        button.classList.add("stop");
        button.style.backgroundColor = "red"; // Change to red
        icon.className = "icon-stop"; // Change icon to stop
        button.setAttribute("data-tooltip", "Stop Program (Ctrl+Enter)"); // Update tooltip
        runCode();
        isRunning = true; // Update running state
    }
}
*/

/* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
// placeholder function: stop code
function stopCode() {
    isRunning = false; // reset flag

    // REPLACE BELOW WITH FUTURE IMPLEMENTATION LATER
    console.log("test: code stopped");
}
// Placeholder end
*/
