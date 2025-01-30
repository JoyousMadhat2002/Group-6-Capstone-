// import {categoryColors, blockCategory} from "./blockConfiguration.js";
let blockCounter = 0;
let dragged = null;
let highlightedBlock = null;
let isPythonView = false;
let userVariables = [];

// Define a color scheme for the categories
const categoryColors = {
  movement: "#BFEFFF", // Baby Blue
  logic: "#5a80a5", // Steel Blue
  math: "#5ba55a", // Medium Sea Green
  comparison: "#ffcc99", // Peach
  boolean: "#80cbc4", // Aqua Marine
  functions: "#995ba6", // Amethyst Purple
  variables: "#a55b80", // Rosewood
  default: "#cccccc", // Light Gray
};

const blockCategory = {
  movement: {
    elements: [
      {
        name: "forward",
        blockID: "t.forward(100)",
        description: "Move the turtle forward",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts a numeric value
        sisterElement: null,
      },
      {
        name: "right",
        blockID: "t.right(90)",
        description: "Turn the turtle right",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts an angle
        sisterElement: null,
      },
      {
        name: "back",
        blockID: "t.back(100)",
        description: "Move the turtle backward",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts a numeric value
        sisterElement: null,
      },
      {
        name: "left",
        blockID: "t.left(90)",
        description: "Turn the turtle left",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts an angle
        sisterElement: null,
      },
    ],
  },
  logic: {
    elements: [
      {
        name: "if",
        blockID: "if",
        description: "Conditional statement",
        type: "control",
        parentElement: "block",
        childElement: "block",
        sisterElement: ["elif", "else"],
      },
      {
        name: "while",
        blockID: "while",
        description: "While loop",
        type: "loop",
        parentElement: "block",
        childElement: "block",
        sisterElement: null,
      },
      {
        name: "for",
        blockID: "for",
        description: "For loop",
        type: "loop",
        parentElement: "block",
        childElement: "block",
        sisterElement: null,
      },
      {
        name: "break",
        blockID: "break",
        description: "Break loop",
        type: "loop",
        parentElement: "block",
        childElement: null,
        sisterElement: null,
      },
      {
        name: "continue",
        blockID: "continue",
        description: "Continue loop",
        type: "loop",
        parentElement: "block",
        childElement: null,
        sisterElement: null,
      },
    ],
  },
  math: {
    elements: [
      {
        name: "Arithmetic Operations",
        blockID: "arithmeticOps",
        description: "Arithmetic operators (+, -, *, /, %, **, //)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["operator", "operand1", "operand2"],
        sisterElement: null,
      },
      {
        name: "Math Text Block",
        blockID: "mathText",
        description: "A text block that accepts only numeric input",
        type: "text",
        parentElement: "block",
        childElement: ["text"],
        sisterElement: null,
      },
      {
        name: "Math Block",
        blockID: "mathBlock",
        description: "A math block for numeric input",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
        sisterElement: null,
      },
    ],
  },
  comparison: {
    elements: [
      {
        name: "Comparison Operators",
        blockID: "comparisonOps",
        description: "Comparison operators (==, !=, >, <, >=, <=)",
        type: "comparison",
        parentElement: "block",
        childElement: ["operator", "operand1", "operand2"],
        sisterElement: null,
      },
      {
        name: "Comparison Block",
        blockID: "comparisonBlock",
        description: "A comparison block for numeric input",
        type: "comparison",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
        sisterElement: null,
      },
    ],
  },
  boolean: {
    elements: [
      {
        name: "Logical Operations",
        blockID: "logicalOps",
        description: "Logical operators (and, or, not)",
        type: "logical",
        parentElement: "block",
        childElement: ["operator", "operand1", "operand2"],
        sisterElement: null,
      },
    ],
  },
  functions: {
    elements: [
      {
        name: "def",
        blockID: "def",
        description: "Define a function",
        type: "function",
        parentElement: "block",
        childElement: ["function_name", "arguments"],
        sisterElement: null,
      },
      {
        name: "return",
        blockID: "return",
        description: "Return from a function",
        type: "function",
        parentElement: "block",
        childElement: ["expression"],
        sisterElement: null,
      },
      {
        name: "print",
        blockID: "print",
        description: "Print to the console",
        type: "function",
        parentElement: "block",
        childElement: ["expression"],
        sisterElement: null,
      },
      {
        name: "Text",
        blockID: "printText",
        description: "A text block for string input",
        type: "text",
        parentElement: "block",
        childElement: ["text"],
        sisterElement: null,
      },
    ],
  },
  variables: {
    elements: [
      {
        name: "Variable Declaration",
        blockID: "varDeclOps",
        description: "Declare a variable",
        type: "variable",
        parentElement: "block",
        childElement: ["variable", "value"],
        sisterElement: null,
      },
      {
        name: "Variable Operations",
        blockID: "varOps",
        description: "Variable",
        type: "variable",
        parentElement: "block",
        childElement: ["variable", "operator", "value"],
        sisterElement: null,
      },
      {
        name: "Variable Block",
        blockID: "variableBlock",
        description: "A variable block for variable input",
        type: "variable",
        parentElement: "block",
        childElement: null,
        sisterElement: null,
      },
    ],
  },
};

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
    createInputBlock(newBlock, "Enter Text", "text-input", "blockValue", blockID);
  } else if (blockID === "varDeclOps") {
    handleVariableDeclarationBlock(newBlock); // Handle variable declaration block
  } else if (blockID === "varOps") {
    handleVariableOperationBlock(newBlock); // Handle variable operation block
  } else if (blockID === "variableBlock") {
    handleVariableBlock(newBlock); // Handle variable block
  } else if (blockID === "arithmeticOps" || blockID === "comparisonOps" || blockID === "logicalOps") {
    handleOperatorBlock(newBlock, blockID); // Handle operator blocks
  } else {
    handleDefaultBlock(newBlock, blockID); // Handle default block
  }

  if (blockID !== "varDeclOps") {
    addDepthInfo(newBlock);
    appendChildElement(newBlock, childElement);
    container.appendChild(newBlock);

    addBlockInteractivity(newBlock);
    updateLineNumbers();
  }
}

function getBlockDropdownList(blockID) {
  if (blockID === "mathBlock") {
    blockID = "arithmeticOps";
  } else if (blockID === "comparisonBlock") {
    blockID = "comparisonOps"; 
  }

  switch (blockID) {
    case "arithmeticOps":
      return ["---", "+", "-", "*", "/", "%", "**", "//"];
    case "comparisonOps":
      return ["---", "==", "!=", ">", "<", ">=", "<="];
    case "logicalOps":
      return ["---", "and", "or", "not"];
    case "varOps":
      return ["---", "=", "+=", "-=", "*=", "/="];
    default:
      return ["---"]; // Default case for blocks without specific types
  }
}

function getBlockProperties(blockID) {
  let blockCategoryColor = "#cccccc"; // Default block color
  let childElement = null;

  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    categoryData.elements.forEach((element) => {
      if (element.blockID === blockID) {
        blockCategoryColor = categoryColors[categoryName] || blockCategoryColor;
        childElement = element.childElement;
      }
    });
  }

  return { blockCategoryColor, childElement };
}

function createBlockLabel(block, blockID) {
  const blockIDLabel = document.createElement("span");
  blockIDLabel.classList.add("block-id-label");
  block.appendChild(blockIDLabel);
}

function getCategoryByBlockID(blockID) {
  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    if (categoryData.elements.some((element) => element.blockID === blockID)) {
      return categoryName;
    }
  }
  return null;
}

function handleDefaultBlock(block, blockID) {
  const blockName = blockCategory[getCategoryByBlockID(blockID)].elements.find(
    (element) => element.blockID === blockID
  ).name;

  const blockLabel = document.createElement("span");
  blockLabel.textContent = `${blockName}`;
  block.appendChild(blockLabel);
}

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
  const input1 = createInputField("0", "math-comparison-input", "block-1-value", blockID);
  horizontalContainers[0].appendChild(input1);

  // Operator Dropdown
  const operatorDropdown = createOperatorDropdown(blockID); // Pass blockID here
  operatorDropdown.dataset.dropdownType = "operator";
  horizontalContainers[1].appendChild(operatorDropdown);

  // Input 2
  const input2 = createInputField("0", "math-comparison-input", "block-2-value", blockID);
  horizontalContainers[2].appendChild(input2);

  // Append containers to the block
  horizontalContainers.forEach((container) => block.appendChild(container));

  // Update data attributes
  operatorDropdown.addEventListener("change", function () {
    block.dataset.blockOperator = operatorDropdown.value;
  });
}

function handleControlBlock(block, blockID) {
  const topChildBox = createChildBox(block.id, blockID);
  const topLabel = document.createElement("span");
  topLabel.classList.add("block-top-label");
  topLabel.textContent = `${blockID.charAt(0).toUpperCase() + blockID.slice(1)
    }:`;
  block.appendChild(topLabel);
  block.appendChild(topChildBox);

  if (blockID === "for") {
    const extraTopChildBox = createChildBox(block.id, blockID);
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
  const valueInput = createInputField("0", "math-comparison-input", "block2Value", "varOps");
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

function updateVariableValueInBlock(block, selectedVariable) {
  const existingValueAttribute = block.querySelector(
    ".variable-value-attribute"
  );
  if (existingValueAttribute) {
    existingValueAttribute.remove();
  }
}

function updateVariableAttributes(block, selectedVariable) {
  const existingAttributes = block.querySelectorAll(".variable-attribute");
  existingAttributes.forEach((attr) => attr.remove());

  updateVariableValueInBlock(block, selectedVariable);
}

function createChildBox(parentID, parentBlockID) {
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
    block.appendChild(childBox);
  }
}

function addBlockInteractivity(block) {
  block.draggable = true;
  block.addEventListener("dragstart", dragStart);
  block.addEventListener("dragover", dragOver);
  block.addEventListener("drop", drop);
  block.addEventListener("click", selectBlock);
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

// Event handler for starting a drag event on a block
function dragStart(event) {
  dragged = event.target.closest(".box");
  console.log("dragStart: ", dragged);
  if (dragged) {
    event.dataTransfer.effectAllowed = "move"; // Allow movement
  }
}

// Event handler to allow the block to be dropped
function dragOver(event) {
  event.preventDefault();

  const targetBlock = event.target.closest(".box");
  if (!targetBlock || targetBlock === dragged) return;

  // Get dimensions of the target block and cursor position
  const rect = targetBlock.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const margin = rect.height * 0.25; // Increase margin size for top and bottom zones (25% of block height)

  // Remove existing highlights
  clearDropHighlights();

  if (offsetY < margin) {
    // Highlight drop above
    targetBlock.classList.add("drop-above");
  } else if (offsetY > rect.height - margin) {
    // Highlight drop below
    targetBlock.classList.add("drop-below");
  } else {
    // Highlight drop inside (if child container exists)
    const childContainer = targetBlock.querySelector(".child-box-container");
    if (childContainer) {
      targetBlock.classList.add("drop-inside");
    }
  }
}

// Event handler for handling the drop action
function drop(event) {
  event.preventDefault();
  const targetBlock = event.target.closest(".box");
  if (!dragged || !targetBlock || targetBlock === dragged) return; // Skip invalid drops

  // Determine drop zone and perform appropriate action
  if (targetBlock.classList.contains("drop-above")) {
    // Drop above
    targetBlock.parentNode.insertBefore(dragged, targetBlock);
    updateDepth(dragged, targetBlock, -1); // Adjust depth relative to target block
  } else if (targetBlock.classList.contains("drop-below")) {
    // Drop below
    targetBlock.parentNode.insertBefore(dragged, targetBlock.nextSibling);
    updateDepth(dragged, targetBlock, -1); // Adjust depth relative to target block
  } else if (targetBlock.classList.contains("drop-inside")) {
    const childContainer = targetBlock.querySelector(".child-box-container");
    if (childContainer) {
      // Drop inside child container
      childContainer.appendChild(dragged);
      updateDepth(dragged, targetBlock, 1); // Increase depth
    }
  }

  clearDropHighlights(); // Clean up
  dragged = null; // Reset the dragged block
}

function dragEnd() {
  clearDropHighlights(); // Clear all highlights
  dragged = null; // Reset dragged block
}

document.querySelectorAll(".box").forEach((box) => {
  box.draggable = true; // Make the box draggable
  box.addEventListener("dragstart", dragStart);
  box.addEventListener("dragover", dragOver);
  box.addEventListener("drop", drop);
  box.addEventListener("dragend", dragEnd);
});

function clearDropHighlights() {
  document
    .querySelectorAll(".drop-above, .drop-below, .drop-inside")
    .forEach((block) => {
      block.classList.remove("drop-above", "drop-below", "drop-inside");
    });
}

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

// Prevent click event from closing the category block (optional behavior)
document.querySelectorAll(".category-blocks button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation(); // Stop click propagation to prevent closing the category
  });
});

// Event listener to handle dragging over the left-side container for deleting blocks
const codeContainer = document.querySelector(".code-container");
codeContainer.addEventListener("dragover", function (event) {
  event.preventDefault(); // Allow dropping by preventing default behavior
});
codeContainer.addEventListener("drop", function (event) {
  event.preventDefault();
  if (dragged) {
    dragged.remove(); // Remove the dragged block
    dragged = null; // Reset the dragged element
    updateLineNumbers(); // Update line numbers after block removal
  }
});

// Event listener to remove the drop target highlight when dragging leaves a block
document.addEventListener("dragleave", function (event) {
  const targetBlock = event.target.closest(".box");
  if (targetBlock) {
    targetBlock.classList.remove("drop-target"); // Remove drop target highlight
  }
});

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

// Event listener to deselect block when clicking outside the highlighted block
document.addEventListener("click", function (event) {
  if (highlightedBlock && !highlightedBlock.contains(event.target)) {
    highlightedBlock.classList.remove("selected"); // Remove highlight
    highlightedBlock = null; // Reset highlighted block
  }
});

// Event listener to delete the highlighted block when the "Delete" key is pressed
document.addEventListener("keydown", function (event) {
  if (event.key === "Delete" && highlightedBlock) {
    highlightedBlock.remove(); // Remove the highlighted block
    highlightedBlock = null; // Reset the highlighted block
    updateLineNumbers(); // Update line numbers after deletion
  }
});

const pythonTextarea = document.getElementById("pythontext"); // creating const for element to pull from
ptext = pythonTextarea.value; // initializing variable.

// test function for storing textarea input as variable
function StoreBlob() {
  ptext = pythonTextarea.value;
  ptext = ptext.toString();
}

// test function for sending stored state to blob to read into textarea
function PullBlob() {
  const blob = new Blob([ptext], { type: "text/plain" });
  blob.text().then((text) => {
    pythonTextarea.value = text; // sends contents of blob to textarea
  });
  // t.value = ptext; // less useful way to store information
}

const blockContainer = document.getElementById("box-container"); // Gets box container, could use as global variable?

function blockToText() {
  pythontext.value = ""; // Clear the text area

  let blockChildElements = blockContainer.children; // Get all children/blocks from the box-container

  for (let i = 0; i < blockChildElements.length; i++) {
    // Loop through children/blocks
    // Add indentation based on the block's depth
    for (let j = 0; j < Number(blockChildElements[i].dataset.blockDepth); j++) {
      pythontext.value += "    "; // Add spaces for indentation
    }

    // Add blockID, blockType, XValue, Operator, and YValue to the text area
    pythontext.value += `blockID: ${blockChildElements[i].dataset.blockID} `;
    pythontext.value += `XValue: ${blockChildElements[i].dataset.blockXValue} `;
    pythontext.value += `Operator: ${blockChildElements[i].dataset.blockOperator} `;
    pythontext.value += `YValue: ${blockChildElements[i].dataset.blockYValue}\n`;

    console.log(blockChildElements[i]); // Log the block element for debugging
  }
}

// Function to convert text programming to block programming
function textToBlock() {
  let text = pythontext.value;

  let lines = text.split("\n"); // Separate lines for parsing
  // console.log(lines);

  document.getElementById("box-container").innerHTML = ""; // Clear block container

  let depthBuilder = ["box-container"]; //
  let currDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] != "") {
      lines[i] = lines[i].trim();
      // line = line.split(" ");

      let tokens = lines[i].split(" ");

      let a = tokens[0];
      let b = tokens[1];
      let c = tokens[2];
      let d = tokens[3];
      let builtBlock = newBlock(a, b, c, d);
    }
  }
}

function toggleView() {
  var x = document.getElementById("python-code-result");
  var y = document.getElementById("box-container");
  var storeButton = document.getElementById("store-p");
  var pullButton = document.getElementById("pull-p");
  var toggleButton = document.getElementById("toggleButton");

  if (x.style.display === "block") {
    x.style.display = "none";
    y.style.display = "block";
    storeButton.style.display = "none";
    pullButton.style.display = "none";
    toggleButton.textContent = "Python";
    isPythonView = false; // Switch to Block view
  } else {
    x.style.display = "block";
    y.style.display = "none";
    storeButton.style.display = "inline"; // Show the store and pull buttons
    pullButton.style.display = "inline";
    toggleButton.textContent = "Block";
    isPythonView = true; // Switch to Python view
  }
}

document.querySelector('[name="btt"]').addEventListener("click", blockToText);
document.querySelector('[name="ttb"]').addEventListener("click", textToBlock);
document.getElementById("toggleButton").addEventListener("click", toggleView);
document
  .getElementById("store-p")
  .querySelector("button")
  .addEventListener("click", StoreBlob);
document
  .getElementById("pull-p")
  .querySelector("button")
  .addEventListener("click", PullBlob);

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

// Event listener for CTRL + ENTER
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "Enter") {
    runCode();
  }
});

// Placeholder functions for future implementation of running/stopping code; added for implementation of CTRL+ENTER
let isRunning = false; // tracks if the program is running

document.getElementById("output").style.whiteSpace = "pre-wrap";

function outf(text) {
  var mypre = document.getElementById("output");
  mypre.innerHTML += text.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "\n";
}

function builtinRead(x) {
  if (
    Sk.builtinFiles === undefined ||
    Sk.builtinFiles["files"][x] === undefined
  )
    throw "File not found: '" + x + "'";
  return Sk.builtinFiles["files"][x];
}

// placeholder function: start code
function runCode() {
  /* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
    if (isRunning == true) {
        // if program currently running, and CTRL+ENTER hit again, stop code
        stopCode();
        return;
    }
    */

  //isRunning = true; // set flag for code running // NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE

  console.log("test: code running");
  var prog = document.getElementById("pythontext").value; // Python code input
  var mypre = document.getElementById("output"); // Output area
  mypre.innerHTML = ""; // Clear previous output

  Sk.pre = "output";
  console.log(Sk);
  Sk.configure({ output: outf, read: builtinRead });
  (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "mycanvas";

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
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  runCode();
});

/* NOT CURRENTLY NEEDED, COMMENTED OUT FOR POTENTIAL FUTURE USE
// placeholder function: stop code
function stopCode() {
    isRunning = false; // reset flag

    // REPLACE BELOW WITH FUTURE IMPLEMENTATION LATER
    console.log("test: code stopped");
}
// Placeholder end
*/

// login button functionality
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

// save button functionality
const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", function () {
  const pythonCode = document.getElementById("pythontext").value;
  localStorage.setItem("savedCode", pythonCode);
  alert("Code saved locally!");
});

//Code to resize the columns
document.addEventListener("DOMContentLoaded", () => {
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

  //Does the calculations for the resizing
  function onDrag(event) {
    if (!isDragging || !currentSpacer) return;

    const deltaX = event.clientX - startX;

    if (currentSpacer === spacer1) {
      const newWidthCol1 = startWidthCol1 + deltaX;
      const newWidthCol2 = startWidthCol2 - deltaX;

      if (newWidthCol1 < MIN_WIDTH1 || newWidthCol2 < MIN_WIDTH2) return;

      col1.style.flexBasis = `${startWidthCol1 + deltaX}px`;
      col2.style.flexBasis = `${startWidthCol2 - deltaX}px`;
    } else if (currentSpacer === spacer2) {
      const newWidthCol2 = startWidthCol2 + deltaX;
      const newWidthCol3 = startWidthCol3 - deltaX;

      if (newWidthCol2 < MIN_WIDTH2 || newWidthCol3 < MIN_WIDTH1) return;

      col2.style.flexBasis = `${startWidthCol2 + deltaX}px`;
      col3.style.flexBasis = `${startWidthCol3 - deltaX}px`;
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
});
