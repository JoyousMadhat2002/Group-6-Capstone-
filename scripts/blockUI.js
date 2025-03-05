import { updateLineNumbers } from "./blockCreation.js";


let highlightedBlock = null;
let dragged = null;

// ==========================
// 8. UI and Interactivity
// ==========================

// Function to toggle between showing and hiding block categories
export function toggleCategory(categoryId) {
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

// Function to clear all drop highlights
export function clearDropHighlights() {
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

