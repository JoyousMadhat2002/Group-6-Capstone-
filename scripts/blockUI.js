import { updateLineNumbers } from "./blockCreation.js";


let highlightedBlock = null;
let dragged = null;

const logicBlocks = ["if", "while", "for"];

// ==========================
// 8. UI and Interactivity
// ==========================

// Function to toggle between showing and hiding block categories
export function toggleCategory(categoryId) {
    const allCategories = document.querySelectorAll(".category-blocks");
    allCategories.forEach((category) => {
        if (category.id === categoryId) {
            category.classList.toggle("hidden");
        } else {
            category.classList.add("hidden"); 
        }
    });

    console.log("Toggled category:", categoryId);
}

// Function to add interactivity to blocks
export function addBlockInteractivity(block) {
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
    const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal, .block-code-result");

    if (!targetBlock || targetBlock === dragged) return;

    // Check if the target container is inside the dragged block
    if (dragged.contains(targetBlock)) {
        return;
    }

    // Check if the dragged block is a logic block and the target is a horizontal container
    if (
        (dragged.dataset.blockID === "if" || dragged.dataset.blockID === "while" || dragged.dataset.blockID === "for") &&
        targetBlock.classList.contains("child-box-container-horizontal")
    ) {
        console.log("Invalid drop: Logic block cannot be placed inside a horizontal container.");
        targetBlock.classList.add("invalid-drop-target");
        return; // Prevent dropping logic blocks inside horizontal containers
    } else {
        // Remove visual feedback if the drop is valid
        targetBlock.classList.remove("invalid-drop-target");
    }

    clearDropHighlights(); // Clear previous highlights

    // Handle dropping inside the block-code-result container
    if (targetBlock.classList.contains("block-code-result")) {
        // Highlight the entire block-code-result container
        targetBlock.classList.add("highlight-inside");
        return;
    }

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

    const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal, .block-code-result");

    if (!targetBlock || targetBlock === dragged) return;

    // Get the parent container of the target block
    const parentContainer = targetBlock.parentElement;

    // Check if the dragged block is a logic block and the parent container is a horizontal container
    if (
        (dragged.dataset.blockID === "if" || dragged.dataset.blockID === "while" || dragged.dataset.blockID === "for") &&
        parentContainer.classList.contains("child-box-container-horizontal")
    ) {
        console.log("Invalid drop: Logic block cannot be placed inside a horizontal container.");
        return; // Prevent dropping logic blocks inside horizontal containers
    }

    if (targetBlock.classList.contains("block-code-result")) {
        // Drop at the bottom of the block-code-result container
        targetBlock.appendChild(dragged);
    } else if (targetBlock.classList.contains("highlight-inside")) {
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
    updateLineNumbers();

    console.log("Dragged Block ID:", dragged.dataset.blockID);
    console.log("Target Block Class:", targetBlock.classList);
    console.log("Parent Container Class:", parentContainer.classList);

    clearDropHighlights();
    dragged = null;
}

// Event handler for when the dragged element leaves the drop target
function dragLeave(event) {
    const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal");

    if (targetBlock) {
        // Remove all highlights when leaving the target
        targetBlock.classList.remove("highlight-inside", "drop-above", "drop-below", "invalid-drop-target");
    }
}

// Event handler for clicking outside any block
function handleClickOutside(event) {
    const targetBlock = event.target.closest(".box, .child-box-container, .child-box-container-horizontal");

    if (!targetBlock) {
        // Clicked outside any block, remove all highlights
        clearDropHighlights();
    }
}

// Function to clear all drop highlights
export function clearDropHighlights() {
    document.querySelectorAll(".drop-above, .drop-below, .highlight-inside, .invalid-drop-target").forEach((block) => {
        block.classList.remove("drop-above", "drop-below", "highlight-inside", "invalid-drop-target");
    });
}

// Add event listeners
document.addEventListener("dragleave", dragLeave);
document.addEventListener("click", handleClickOutside);

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

// Function to remove a block
export function removeBlock(blockId) {
    const block = document.getElementById(blockId);
    if (block) {
        block.remove(); // Remove the block from the DOM
        updateLineNumbers(); // Update the line numbers after removal
    }
}

// Event listener for the delete key
document.addEventListener("keydown", function (event) {
    if (event.key === "Delete" && highlightedBlock) {
        removeBlock(highlightedBlock.id); // Remove the highlighted block
        highlightedBlock = null; // Clear the highlighted block reference
    }
});

// Event listener for dragging blocks to the code-container (to delete them)
const codeContainer = document.querySelector(".code-container");
if (codeContainer) {
    codeContainer.addEventListener("dragover", function (event) {
        event.preventDefault();
    });

    codeContainer.addEventListener("drop", function (event) {
        event.preventDefault();
        if (dragged) {
            removeBlock(dragged.id); // Remove the dragged block
            dragged = null; // Clear the dragged block reference
        }
    });
} else {
    console.warn("Code container not found. Block deletion on drag to code container will not work.");
}

export function toggleDropdownVisibility(dropdown) {
    dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
}

