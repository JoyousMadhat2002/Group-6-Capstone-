import { categoryColors, blockCategory } from "./scripts/blockConfiguration.js";
import { getBlockDropdownList, getBlockProperties, getCategoryByBlockID, createBlockLabel } from "./scripts/blockProperties.js";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";

// Import Firebase modules correctly
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCteFAmh1TjbbQB0hsbBwcbqwK8mofMO4Y",
    authDomain: "b-coders-database.firebaseapp.com",
    projectId: "b-coders-database",
    storageBucket: "b-coders-database.appspot.com",
    messagingSenderId: "268773123996",
    appId: "1:268773123996:web:fec77ef63557a9c6b50a59",
    measurementId: "G-92LTT20BXB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for Firebase authentication state
onAuthStateChanged(auth, (user) => {
    updateUIAfterLogin(user);
});


let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;
let isPythonView = false;
let userVariables = [];

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

  // Handle different block types
  if (blockID === "mathBlock" || blockID === "comparisonBlock" || blockID === "varOps") {
    handleMathOrComparisonOrVariableBlock(newBlock, blockID);
  } else if (["if", "while", "for"].includes(blockID)) {
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

  if (blockID === "for") {
    const extraTopChildBox = createChildBoxHorizontal(block.id, blockID);
    const extraTopLabel = document.createElement("span");
    extraTopLabel.classList.add("block-top-label");
    extraTopLabel.textContent = "Range:";
    block.appendChild(extraTopLabel);
    block.appendChild(extraTopChildBox);
  }
}

function handleVariableDeclarationBlock(block) {
  const variableName = prompt("Enter a new variable name:");
  if (!variableName) return;

  if (!userVariables.includes(variableName)) {
    userVariables.push(variableName);
    updateUserVariableDropdowns(); // Update dropdowns
    refreshCategoryButtons(); // Refresh the category buttons
  }
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
    block.appendChild(elseBlock); // Move the "else" block to the end
  }
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

  // Increment the "else if" counter
  block.dataset.elseIfCount = parseInt(block.dataset.elseIfCount || 0) + 1;

  dropdown.remove(); // Remove the dropdown menu
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

function resetAndUpdateElifElseIds(block) {
  // Get all elif-else blocks within the parent block
  const elifElseBlocks = block.querySelectorAll('.elif-else[data-elif-else-type="if"], .elif-else[data-elif-else-type="elif"], .elif-else[data-elif-else-type="else"]');

  // Reset and update the IDs sequentially
  elifElseBlocks.forEach((elifElseBlock, index) => {
    elifElseBlock.dataset.ifElifElseId = index + 1; // Set the ID for elif-else elements
  });

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
  if (dragged) {
    event.dataTransfer.effectAllowed = "move"; // Allow movement
    event.dataTransfer.setData("text/plain", dragged.id); // Store the block ID
  }
}

// Event handler for dragging over a block or container
function dragOver(event) {
  event.preventDefault();
  const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal");

  if (!targetBlock || targetBlock === dragged) return;

  // Check if the target container is inside the dragged block
  if (dragged.contains(targetBlock)) {
    return;
  }

  clearDropHighlights(); // Clear previous highlights

  // Highlight the target container or block
  if (targetBlock.classList.contains("child-box-container") || targetBlock.classList.contains("child-box-container-horizontal")) {
    targetBlock.classList.add("highlight-inside");
  } else if (targetBlock.classList.contains("box")) {
    const rect = targetBlock.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;

    if (offsetY < rect.height / 2) {
      targetBlock.classList.add("drop-above");
    } else {
      // Check if the target block is the last block in the container
      const container = targetBlock.parentElement;
      const lastBlock = container.lastElementChild;

      if (targetBlock === lastBlock) {
        // If it's the last block, allow dropping below it
        targetBlock.classList.add("drop-below");
      } else {
        targetBlock.classList.add("drop-below");
      }
    }
  }
}

// Event handler for handling the drop action
function drop(event) {
  event.preventDefault();
  if (!dragged) return;

  const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal");

  if (!targetBlock || targetBlock === dragged) return;

  if (targetBlock.classList.contains("highlight-inside")) {
    // Drop inside a container
    targetBlock.appendChild(dragged);
  } else if (targetBlock.classList.contains("drop-above")) {
    // Drop above a block
    targetBlock.parentNode.insertBefore(dragged, targetBlock);
  } else if (targetBlock.classList.contains("drop-below")) {
    // Drop below a block
    const container = targetBlock.parentElement;
    const lastBlock = container.lastElementChild;

    if (targetBlock === lastBlock) {
      // If the target is the last block, append the dragged block after it
      container.appendChild(dragged);
    } else {
      // Otherwise, insert the dragged block after the target block
      targetBlock.parentNode.insertBefore(dragged, targetBlock.nextSibling);
    }
  }

  // Recalculate and update the block's depth
  const newDepth = calculateDepth(dragged);
  dragged.dataset.blockDepth = newDepth;

  // Update the depth for all nested blocks
  updateNestedDepths(dragged);

  clearDropHighlights();
  dragged = null;
}

// Function to clear all drop highlights
function clearDropHighlights() {
  document.querySelectorAll(".drop-above, .drop-below, .highlight-inside").forEach((block) => {
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

// Function to update the depth of all nested blocks
function updateNestedDepths(block) {
  const newDepth = calculateDepth(block);
  block.dataset.blockDepth = newDepth;

  const childBlocks = block.querySelectorAll(".box");
  childBlocks.forEach((childBlock) => {
    updateNestedDepths(childBlock); // Recursively update depth for each child block
  });
}

// Event handler for ending a drag event
function dragEnd() {
  clearDropHighlights(); // Clear all highlights
  dragged = null; // Reset dragged block
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

function toggleDropdownVisibility(dropdown) {
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
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

    // Always add the "else if" option
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
  plusIcon.addEventListener("click", () => {
    updateDropdownOptions();
    toggleDropdownVisibility(dropdown);
  });
}

// ==========================
// 9. Python Code Conversion
// ==========================

function blockToText(pc) {
  //pythontext.value = ""; // Clear the text area
  
  let parentContainer = document.getElementById(pc);
  
  
  let blockChildElements;
  // section for top half

  // section for bottom half
  if(pc == "box-container"){
  blockChildElements = parentContainer.children; // Get all children/blocks from the box-container
  }
  else{
  blockChildElements = parentContainer.querySelector('.child-box-container').children; // Get all children/blocks from the box-container
  }
  for (let i = 0; i < blockChildElements.length; i++){
    let childID = blockChildElements[i].dataset.blockID;

    for (let j = 0; j < Number(blockChildElements[i].dataset.blockDepth); j++) {
      pythontext.value += "    "; // Add spaces for indentation
    }

    if (childID == "for" ||childID == "if" || childID == "while" ){
      
      pythontext.value += `${childID}\n`;
      let cbc = blockChildElements[i].querySelector('.child-box-container');
      if (cbc.children.length > 0){
        blockToText(blockChildElements[i].id);
      }
      
      
    }

    //logic for adding continue and break to text block
    else if (childID == "continue" ||childID == "break"){
      pythontext.value += `${childID}\n`;
    }

    else{
      pythontext.value += `${childID}\n`;
    }
  }
}


// Function to convert text programming to block programming
function textToBlock(container) {
  let text = pythontext.value;
  if(container == "box-container"){
    document.getElementById(container).innerHTML = ""; // Clear block container
  }

  let lines = text.split("\n"); // Separate lines for parsing
 
  

  

  let depthBuilder = ["box-container"]; // counting preceeding zeros for depth
  let currDepth = 0;
  let linecount = 0;
  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++){
      console.log("line[j]]: " + `${j}`);
      if(lines[i][j] ==  " "){
        linecount++;
      }
      else{
        break;
      }
    }
  

    // setting currDepth based on number of indentations
    
    if (linecount < 1){
      
      currDepth = 1;
      console.log("currDepth: " + `${currDepth}`);
      console.log("linecount: " + `${linecount}`);
      console.log("linecount < 1");
    }
    else {
      currDepth = (linecount/4) + 1;
      console.log("currDepth: " + `${currDepth}`);
      console.log("linecount: " + `${linecount}`);
      console.log("linecount > 1");
    }


    let tokens = lines[i].trim().split(" "); // trimming spaces from front and back of string, then splitting into tokens

    // logic to build blocks
    if (tokens != ""){
      if (tokens[0] == "if" || tokens[0] == "while" || tokens[0] == "for"){
        console.log(`${tokens[0]}` + " statement");
        let nbCons = newBlock(tokens[0]); // newblock construction based on keyword
        let nbRef = document.getElementById(nbCons); // created reference to newblock

        // update depth
        if(true){

        }

        // checking for comparison block operators
        if (tokens[2] == "==" || tokens[2] == "!=" || tokens[2] == ">=" || tokens[2] == "<=" || tokens[2] == "<" || tokens[2] == ">"){
          let nbComp = newBlock("comparisonBlock");
          let compElems = document.getElementById(nbComp).querySelectorAll(".childBox-Container-Horizontal");
          for (let k = 0; k<3;k++){
            if(compElems[k].querySelector(".math-comparison-input")){
              compElems[k].querySelector(".math-comparison-input").value = tokens[k+1];
            }
            compElems[k].dataset.blockValue = tokens[k+1];          
          }
          
          let nbHz = nbRef.querySelector(" .child-box-container-horizontal");
          nbHz.appendChild(document.getElementById(nbComp));
        }
        else if (tokens[2] == "+"){
          let x = 0;
        }

        
      }
      

    }
    linecount = 0;
    
  }

}

function toggleView() {
  var x = document.getElementById("python-code-result");
  var y = document.getElementById("block-container"); // Changed to block-container
  var toggleButton = document.getElementById("toggleButton");

  if (x.classList.contains("hidden")) {
    x.classList.remove("hidden");
    y.classList.add("hidden");
    toggleButton.textContent = "Block";
    isPythonView = true; // Switch to Python view
  } else {
    x.classList.add("hidden");
    y.classList.remove("hidden");
    toggleButton.textContent = "Python";
    isPythonView = false; // Switch to Block view
  }
}

// ==========================
// 10. Code Execution
// ==========================

const editor = new EditorView({
  parent: document.getElementById("pythontext"),
  extensions: [basicSetup, python()],
});

function getCode() {
  return editor.state.doc.toString();
}

document.getElementById("run-code-btn").addEventListener("click", runCode);

// Function to run the Python code
function runCode() {
  console.log("test: code running");
  var prog = getCode();
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
}

window.runCode = runCode; 

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

// Function to set up the "Log In" button listener
function setupLoginButtonListener() {
  const loginButton = document.getElementById("loginButton");

  if (!loginButton) {
      console.error("Error: 'Log In' button not found.");
      return;
  }

  loginButton.addEventListener("click", openLoginDialog);
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
// 12. Login and Logout
// ==========================

// Function to attempt user login
function attemptLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorMsg = document.getElementById("login-error");

  if (!email || !password) {
      errorMsg.textContent = "Please enter email and password.";
      errorMsg.classList.remove("hidden");
      return;
  }

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
      closeLoginDialog(); // Close the login dialog
      updateUIAfterLogin(userCredential.user); // Update the UI
  })
  .catch((error) => {
      console.error("Login Error:", error.message);
      errorMsg.textContent = error.message;
      errorMsg.classList.remove("hidden");
  });
}

// Function to open the login dialog
function openLoginDialog() {
  if (!document.getElementById("login-dialog")) {
      createLoginDialog();
  }
}

// Function to create the login dialog
function createLoginDialog() {
  const loginDialog = document.createElement("div");
  loginDialog.id = "login-dialog";
  loginDialog.classList.add("dialog-container");

  // Create the login dialog content (makes HTML file cleaner by not having to include this in the main HTML file)
  loginDialog.innerHTML = `
      <div class="dialog-box">
          <h2>Log In</h2>
          <label for="login-email">Email:</label>
          <input type="email" id="login-email" placeholder="Enter your email">

          <label for="login-password">Password:</label>
          <input type="password" id="login-password" placeholder="Enter your password">

          <p id="login-error" class="error-message hidden"></p>

          <div class="dialog-buttons">
              <button id="login-submit">Log In</button>
              <button id="login-cancel">Cancel</button>
          </div>
      </div>
  `;

  document.body.appendChild(loginDialog);

  // Add event listeners
  document.getElementById("login-submit").addEventListener("click", attemptLogin);
  document.getElementById("login-cancel").addEventListener("click", closeLoginDialog);
  loginDialog.addEventListener("click", function (event) {
      if (event.target === loginDialog) {
          closeLoginDialog();
      }
  });
}

// Function to close the login dialog
function closeLoginDialog() {
  const loginDialog = document.getElementById("login-dialog");
  if (loginDialog) {
      loginDialog.remove();
  }
}

// Function to update the UI after user login/logout
function updateUIAfterLogin(user) {
  const loginButton = document.getElementById("loginButton");

  if (user) {
      loginButton.textContent = "Log Out";
      loginButton.removeEventListener("click", openLoginDialog);
      loginButton.addEventListener("click", logoutUser);
  } else {
      loginButton.textContent = "Log In";
      loginButton.removeEventListener("click", logoutUser);
      loginButton.addEventListener("click", openLoginDialog);
  }
}

// Function to log out the current user
function logoutUser() {
  auth.signOut()
      .then(() => {
          console.log("User logged out");
          updateUIAfterLogin(null); // Reset UI
      })
      .catch((error) => {
          console.error("Logout Error:", error.message);
      });
}



// ==========================
// 13. Additional Features (Resizing Columns, Dragging, etc.)
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
// 14. Miscellaneous Code
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

function setUpApp() {
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
setUpApp();

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
