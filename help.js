import { newBlock } from './scripts/blockCreation.js';

// Create block previews when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
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