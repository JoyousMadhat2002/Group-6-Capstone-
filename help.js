import { newBlock } from './scripts/blockCreation.js';

function createBlockPreview(containerId, blockId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Skip variable declaration blocks in help preview
    if (blockId === "varDeclOps") {
        const placeholder = document.createElement('div');
        placeholder.textContent = "[Variable Declaration Block]";
        placeholder.style.padding = "10px";
        placeholder.style.backgroundColor = "#cccccc";
        placeholder.style.color = "white";
        placeholder.style.borderRadius = "5px";
        container.appendChild(placeholder);
        return;
    }

    // Create a temporary container for the block
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'inline-block';
    container.appendChild(tempContainer);

    // Create the block
    newBlock(blockId, tempContainer);

    // Disable interactivity for preview blocks
    const blocks = tempContainer.querySelectorAll('.box');
    blocks.forEach(block => {
        block.style.pointerEvents = 'none';
        block.draggable = false;
    });
}

// Movement blocks
function createMovementExample(elementId, blockType) {
    // Creates an example movement block preview in the specified element
    document.getElementById(elementId).innerHTML = `<div class="block-example movement">move(${blockType})</div>`;
}

function createTurnExample(elementId, blockType) {
    // Creates an example turn block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example turn">turn(${blockType})</div>`;
}

function createSpeedExample(elementId, blockType) {
    // Creates an example speed control block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example speed">speed(${blockType})</div>`;
}

function createHomeExample(elementId, blockType) {
    // Creates an example home position block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example home">home()</div>`;
}

function createColorExample(elementId, blockType) {
    // Creates an example color selection block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example color">color(${blockType})</div>`;
}

function createPenupExample(elementId, blockType) {
    // Creates an example pen up block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example penup">penUp()</div>`;
}

function createPendownExample(elementId, blockType) {
    // Creates an example pen down block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example pendown">penDown()</div>`;
}

function createGotoExample(elementId, blockType) {
    // Creates an example goto position block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example goto">goto(${blockType})</div>`;
}

function createSetCoordinatesExample(elementId, blockType) {
    // Creates an example set coordinates block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example set-coordinates">setPosition(${blockType})</div>`;
}

function createPauseExample(elementId, blockType) {
    // Creates an example pause block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example pause">pause(${blockType})</div>`;
}

// Logic blocks
function createIfExample(elementId, blockType) {
    // Creates an example if conditional block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example if">if (${blockType}) { }</div>`;
}

function createWhileExample(elementId, blockType) {
    // Creates an example while loop block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example while">while (${blockType}) { }</div>`;
}

function createForExample(elementId, blockType) {
    // Creates an example for loop block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example for">for (${blockType}) { }</div>`;
}

function createLogicalBlockExample(elementId, blockType) {
    // Creates an example logical operator block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example logical">${blockType}</div>`;
}

// Math blocks
function createMathTextExample(elementId, blockType) {
    // Creates an example math text block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example math-text">${blockType}</div>`;
}

function createMathBlockExample(elementId, blockType) {
    // Creates an example math operation block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example math">${blockType}</div>`;
}

function createMathConstantsExample(elementId, blockType) {
    // Creates an example math constants block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example math-constants">${blockType}</div>`;
}

function createRoundAbsExample(elementId, blockType) {
    // Creates an example rounding/absolute value block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example round-abs">${blockType}</div>`;
}

function createBasicArithmeticExample(elementId, blockType) {
    // Creates an example basic arithmetic block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example arithmetic">${blockType}</div>`;
}

function createLogExpExample(elementId, blockType) {
    // Creates an example logarithm/exponent block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example log-exp">${blockType}</div>`;
}

function createTrigFunctionsExample(elementId, blockType) {
    // Creates an example trigonometric functions block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example trig">${blockType}</div>`;
}

// Comparison blocks
function createComparisonBlockExample(elementId, blockType) {
    // Creates an example comparison operator block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example comparison">${blockType}</div>`;
}

function createRangeExample(elementId, blockType) {
    // Creates an example range block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example range">${blockType}</div>`;
}

// Function blocks
function createPrintExample(elementId, blockType) {
    // Creates an example print block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example print">print(${blockType})</div>`;
}

function createPrintTextExample(elementId, blockType) {
    // Creates an example text block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example text">"${blockType}"</div>`;
}

// Variable blocks
function createVarDeclOpsExample(elementId, blockType) {
    // Creates an example variable declaration block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example var-decl">${blockType}</div>`;
}

function createVarOpsExample(elementId, blockType) {
    // Creates an example variable operation block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example var-ops">${blockType}</div>`;
}

function createVariableBlockExample(elementId, blockType) {
    // Creates an example variable block preview
    document.getElementById(elementId).innerHTML = `<div class="block-example variable">${blockType}</div>`;
}


document.addEventListener('DOMContentLoaded', function () {
    // Create block previews when DOM is loaded
    // Movement blocks
    createBlockPreview('move-block-preview', 'movement');
    createBlockPreview('turn-block-preview', 'turn');
    createBlockPreview('speed-block-preview', 'speed');
    createBlockPreview('home-block-preview', 'home');
    createBlockPreview('color-block-preview', 'color');
    createBlockPreview('penup-block-preview', 'penup');
    createBlockPreview('pendown-block-preview', 'pendown');
    createBlockPreview('goto-block-preview', 'goto');
    createBlockPreview('setposition-block-preview', 'setCoordinates');
    createBlockPreview('pause-block-preview', 'pause');

    // Logic blocks
    createBlockPreview('if-block-preview', 'if');
    createBlockPreview('while-block-preview', 'while');
    createBlockPreview('for-block-preview', 'for');
    createBlockPreview('logical-block-preview', 'logicalBlock');

    // Math blocks
    createBlockPreview('mathtext-block-preview', 'mathText');
    createBlockPreview('math-block-preview', 'mathBlock');
    createBlockPreview('mathconstants-block-preview', 'mathConstants');
    createBlockPreview('roundabs-block-preview', 'roundAbs');
    createBlockPreview('basicarithmetic-block-preview', 'basicArithmetic');
    createBlockPreview('logexp-block-preview', 'logExp');
    createBlockPreview('trigfunctions-block-preview', 'trigFunctions');

    // Comparison blocks
    createBlockPreview('comparison-block-preview', 'comparisonBlock');
    createBlockPreview('range-block-preview', 'range');

    // Function blocks
    createBlockPreview('print-block-preview', 'print');
    createBlockPreview('text-block-preview', 'printText');

    // Variable blocks
    createBlockPreview('vardeclaration-block-preview', 'varDeclOps');
    createBlockPreview('varoperations-block-preview', 'varOps');
    createBlockPreview('variable-block-preview', 'variableBlock');

    // Create block examples when DOM is loaded
    // Movement blocks
    createMovementExample('move-block-example', 'movement');
    createTurnExample('turn-block-example', 'turn');
    createSpeedExample('speed-block-example', 'speed');
    createHomeExample('home-block-example', 'home');
    createColorExample('color-block-example', 'color');
    createPenupExample('penup-block-example', 'penup');
    createPendownExample('pendown-block-example', 'pendown');
    createGotoExample('goto-block-example', 'goto');
    createSetCoordinatesExample('setposition-block-example', 'setCoordinates');
    createPauseExample('pause-block-example', 'pause');

    // Logic blocks
    createIfExample('if-block-example', 'if');
    createWhileExample('while-block-example', 'while');
    createForExample('for-block-example', 'for');
    createLogicalBlockExample('logical-block-example', 'logicalBlock');

    // Math blocks
    createMathTextExample('mathtext-block-example', 'mathText');
    createMathBlockExample('math-block-example', 'mathBlock');
    createMathConstantsExample('mathconstants-block-example', 'mathConstants');
    createRoundAbsExample('roundabs-block-example', 'roundAbs');
    createBasicArithmeticExample('basicarithmetic-block-example', 'basicArithmetic');
    createLogExpExample('logexp-block-example', 'logExp');
    createTrigFunctionsExample('trigfunctions-block-example', 'trigFunctions');

    // Comparison blocks
    createComparisonBlockExample('comparison-block-example', 'comparisonBlock');
    createRangeExample('range-block-example', 'range');

    // Function blocks
    createPrintExample('print-block-example', 'print');
    createPrintTextExample('text-block-example', 'printText');

    // Variable blocks
    createVarDeclOpsExample('vardeclaration-block-example', 'varDeclOps');
    createVarOpsExample('varoperations-block-example', 'varOps');
    createVariableBlockExample('variable-block-example', 'variableBlock');

    // Add click handlers for navigation
    document.querySelectorAll('.block-example').forEach(block => {
        block.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                element.classList.add('highlight');
                setTimeout(() => element.classList.remove('highlight'), 2000);
            }
        });
    });

    // Burger menu toggle
    window.toggleBurgerMenu = function () {
        const menu = document.getElementById('burgerMenu');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    };
});