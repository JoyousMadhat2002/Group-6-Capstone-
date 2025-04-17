import { newBlock, userVariables } from './scripts/blockCreation.js';

document.addEventListener('DOMContentLoaded', function () {
    // Create block previews
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

    createBlockPreview('if-block-preview', 'if');
    createBlockPreview('while-block-preview', 'while');
    createBlockPreview('for-block-preview', 'for');
    createBlockPreview('logical-block-preview', 'logicalBlock');

    createBlockPreview('mathtext-block-preview', 'mathText');
    createBlockPreview('math-block-preview', 'mathBlock');
    createBlockPreview('mathconstants-block-preview', 'mathConstants');
    createBlockPreview('roundabs-block-preview', 'roundAbs');
    createBlockPreview('basicarithmetic-block-preview', 'basicArithmetic');
    createBlockPreview('logexp-block-preview', 'logExp');
    createBlockPreview('trigfunctions-block-preview', 'trigFunctions');

    createBlockPreview('comparison-block-preview', 'comparisonBlock');
    createBlockPreview('range-block-preview', 'range');

    createBlockPreview('print-block-preview', 'print');
    createBlockPreview('text-block-preview', 'printText');

    createBlockPreview('vardeclaration-block-preview', 'varDeclOps');
    createBlockPreview('varoperations-block-preview', 'varOps');
    createBlockPreview('variable-block-preview', 'variableBlock');

    // Create block examples
    // turtle.move(100)
    createBlockExample('move-block-example-codes');

    // turtle.turn(90)
    createBlockExample('turn-block-example-codes');

    // turtle.speed(5)
    createBlockExample('speed-block-example-codes');

    // turtle.home()
    createBlockExample('home-block-example-codes');

    // turtle.color("red")
    createBlockExample('color-block-example-codes');

    // turtle.penup()
    createBlockExample('penup-block-example-codes');

    // turtle.pendown()
    createBlockExample('pendown-block-example-codes');

    // turtle.goto(100, 100)
    createBlockExample('goto-block-example-codes');

    // turtle.setposition(100, 100, 45)
    createBlockExample('setposition-block-example-codes');

    // turtle.pause(2)
    createBlockExample('pause-block-example-codes');

    // if x > 5:
    //     print("x is greater than 5")
    createBlockExample('if-block-example-codes');

    // while x < 10:
    //     print(x)
    //     x += 1
    createBlockExample('while-block-example-codes');

    // for i in range(5):
    //     print(i)
    createBlockExample('for-block-example-codes');

    // if x > 5 and y < 10:
    //     print("Condition met")
    createBlockExample('logical-block-example-codes');

    // 42
    createBlockExample('mathtext-block-example-codes');

    // 5 + 3
    createBlockExample('math-block-example-codes');

    // math.pi
    createBlockExample('mathconstants-block-example-codes');

    // math.floor(3.7)
    createBlockExample('roundabs-block-example-codes');

    // math.factorial(5)
    createBlockExample('basicarithmetic-block-example-codes');

    // math.sqrt(16)
    createBlockExample('logexp-block-example-codes');

    // math.sin(math.radians(90))
    createBlockExample('trigfunctions-block-example-codes');

    // x > 5
    createBlockExample('comparison-block-example-codes');

    // range(0, 10, 2)
    createBlockExample('range-block-example-codes');

    // print("Hello, World!")
    createBlockExample('print-block-example-codes');

    // "Hello, World!"
    createBlockExample('text-block-example-codes');

    // x = 10
    createBlockExample('varoperations-block-example-codes');

    // x += 5
    createBlockExample('variable-block-example-codes');

    // Navigation click handlers
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

function createBlockExample(containerId) {
    const container = document.getElementById(containerId);
}

function createBlockPreview(containerId, blockId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Skip variable declaration blocks in help preview
    if (blockId === "varDeclOps") {
        const placeholder = document.createElement('div');
        placeholder.textContent = "Variable Declaration";
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

        // Remove all child blocks unless it's an example block
        if (!containerId.includes('example-codes')) {
            const childContainers = block.querySelectorAll('.child-box-container, .child-box-container-horizontal');
            childContainers.forEach(container => {
                container.innerHTML = '';
            });
        }
    });
}
