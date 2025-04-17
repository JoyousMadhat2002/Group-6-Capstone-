import { newBlock, userVariables } from './scripts/blockCreation.js';

// Helper functions
function addVariable(varName) {
    if (!userVariables.includes(varName)) {
        userVariables.push(varName);
    }
}

function createVariableBlock(container, varName) {
    addVariable(varName);
    const varBlock = newBlock('variableBlock', container);
    if (varBlock) {
        const varBox = document.getElementById(varBlock);
        if (varBox) {
            const dropdown = varBox.querySelector('.block-dropdown');
            if (dropdown) dropdown.value = varName;
        }
    }
    return varBlock;
}

function createMathBlock(container, value) {
    const mathBlock = newBlock('mathText', container);
    if (mathBlock) {
        const mathBox = document.getElementById(mathBlock);
        if (mathBox) {
            const input = mathBox.querySelector('input');
            if (input) input.value = value;
        }
    }
    return mathBlock;
}

function createTextBlock(container, text) {
    const textBlock = newBlock('printText', container);
    if (textBlock) {
        const textBox = document.getElementById(textBlock);
        if (textBox) {
            const textarea = textBox.querySelector('textarea');
            if (textarea) textarea.value = text;
        }
    }
    return textBlock;
}

function setDropdownValue(block, value) {
    if (block) {
        const dropdown = block.querySelector('.block-dropdown');
        if (dropdown) dropdown.value = value;
    }
}

// Movement examples
function createMovementExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'movement', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'forward');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '100');
    }
}

function createTurnExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'turn', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'right');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '90');
    }
}

function createSpeedExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'speed', true);
    const block = document.getElementById(blockId);
    if (block) {
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '5');
    }
}

function createHomeExample(elementId) {
    createBlockPreview(elementId, 'home', true);
}

function createColorExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'color', true);
    const block = document.getElementById(blockId);
    if (block) {
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createTextBlock(valueContainer, 'red');
    }
}

function createPenupExample(elementId) {
    createBlockPreview(elementId, 'penup', true);
}

function createPendownExample(elementId) {
    createBlockPreview(elementId, 'pendown', true);
}

function createGotoExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'goto', true);
    const block = document.getElementById(blockId);
    if (block) {
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createMathBlock(containers[0], '100');
        if (containers[1]) createMathBlock(containers[1], '100');
    }
}

function createSetCoordinatesExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'setCoordinates', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'setX');
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createMathBlock(containers[0], '100');
        if (containers[1]) createMathBlock(containers[1], '100');
        if (containers[2]) createMathBlock(containers[2], '45');
    }
}

function createPauseExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'pause', true);
    const block = document.getElementById(blockId);
    if (block) {
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '2');
    }
}

// Logic examples
function createIfExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'if', true);
    const block = document.getElementById(blockId);
    if (block) {
        // Condition
        const conditionContainer = block.querySelector('.child-box-container-horizontal');
        if (conditionContainer) {
            const comparisonId = newBlock('comparisonBlock', conditionContainer);
            const comparisonBlock = document.getElementById(comparisonId);
            if (comparisonBlock) {
                setDropdownValue(comparisonBlock, '>');
                const containers = comparisonBlock.querySelectorAll('.child-box-container-horizontal');
                if (containers[0]) createVariableBlock(containers[0], 'x');
                if (containers[1]) createMathBlock(containers[1], '5');
            }
        }
        // Then block
        const thenContainer = block.querySelector('.child-box-container');
        if (thenContainer) {
            const printId = newBlock('print', thenContainer);
            const printBlock = document.getElementById(printId);
            if (printBlock) {
                const textContainer = printBlock.querySelector('.child-box-container-horizontal');
                if (textContainer) createTextBlock(textContainer, 'x is greater than 5');
            }
        }
    }
}

function createWhileExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'while', true);
    const block = document.getElementById(blockId);
    if (block) {
        // Condition
        const conditionContainer = block.querySelector('.child-box-container-horizontal');
        if (conditionContainer) {
            const comparisonId = newBlock('comparisonBlock', conditionContainer);
            const comparisonBlock = document.getElementById(comparisonId);
            if (comparisonBlock) {
                setDropdownValue(comparisonBlock, '<');
                const containers = comparisonBlock.querySelectorAll('.child-box-container-horizontal');
                if (containers[0]) createVariableBlock(containers[0], 'x');
                if (containers[1]) createMathBlock(containers[1], '10');
            }
        }
        // Loop body
        const bodyContainer = block.querySelector('.child-box-container');
        if (bodyContainer) {
            // Print block
            const printId = newBlock('print', bodyContainer);
            const printBlock = document.getElementById(printId);
            if (printBlock) {
                const textContainer = printBlock.querySelector('.child-box-container-horizontal');
                if (textContainer) createVariableBlock(textContainer, 'x');
            }
            // Increment block
            const incrementId = newBlock('varOps', bodyContainer);
            const incrementBlock = document.getElementById(incrementId);
            if (incrementBlock) {
                setDropdownValue(incrementBlock, '+=');
                const containers = incrementBlock.querySelectorAll('.child-box-container-horizontal');
                if (containers[0]) createVariableBlock(containers[0], 'x');
                if (containers[1]) createMathBlock(containers[1], '1');
            }
        }
    }
}

function createForExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'for', true);
    const block = document.getElementById(blockId);
    if (block) {
        // Range
        const rangeContainer = block.querySelector('.child-box-container-horizontal');
        if (rangeContainer) {
            const rangeId = newBlock('range', rangeContainer);
            const rangeBlock = document.getElementById(rangeId);
            if (rangeBlock) {
                const containers = rangeBlock.querySelectorAll('.child-box-container-horizontal');
                if (containers[0]) createMathBlock(containers[0], '0');
                if (containers[1]) createMathBlock(containers[1], '5');
            }
        }
        // Loop body
        const bodyContainer = block.querySelector('.child-box-container');
        if (bodyContainer) {
            const printId = newBlock('print', bodyContainer);
            const printBlock = document.getElementById(printId);
            if (printBlock) {
                const textContainer = printBlock.querySelector('.child-box-container-horizontal');
                if (textContainer) createVariableBlock(textContainer, 'i');
            }
        }
    }
}

function createLogicalBlockExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'logicalBlock', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'and');
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        // Left comparison
        if (containers[0]) {
            const leftCompId = newBlock('comparisonBlock', containers[0]);
            const leftComp = document.getElementById(leftCompId);
            if (leftComp) {
                setDropdownValue(leftComp, '>');
                const leftContainers = leftComp.querySelectorAll('.child-box-container-horizontal');
                if (leftContainers[0]) createVariableBlock(leftContainers[0], 'x');
                if (leftContainers[1]) createMathBlock(leftContainers[1], '5');
            }
        }
        // Right comparison
        if (containers[1]) {
            const rightCompId = newBlock('comparisonBlock', containers[1]);
            const rightComp = document.getElementById(rightCompId);
            if (rightComp) {
                setDropdownValue(rightComp, '<');
                const rightContainers = rightComp.querySelectorAll('.child-box-container-horizontal');
                if (rightContainers[0]) createVariableBlock(rightContainers[0], 'y');
                if (rightContainers[1]) createMathBlock(rightContainers[1], '10');
            }
        }
    }
}

// Math examples
function createMathTextExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'mathText', true);
    const block = document.getElementById(blockId);
    if (block) {
        const input = block.querySelector('input');
        if (input) input.value = '42';
    }
}

function createMathBlockExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'mathBlock', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, '+');
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createMathBlock(containers[0], '5');
        if (containers[1]) createMathBlock(containers[1], '3');
    }
}

function createMathConstantsExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'mathConstants', true);
    const block = document.getElementById(blockId);
    if (block) setDropdownValue(block, 'pi');
}

function createRoundAbsExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'roundAbs', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'floor');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '3.7');
    }
}

function createBasicArithmeticExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'basicArithmetic', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'factorial');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '5');
    }
}

function createLogExpExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'logExp', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'sqrt');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '16');
    }
}

function createTrigFunctionsExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'trigFunctions', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, 'sin');
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createMathBlock(valueContainer, '90');
    }
}

// Comparison examples
function createComparisonBlockExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'comparisonBlock', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, '>');
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createVariableBlock(containers[0], 'x');
        if (containers[1]) createMathBlock(containers[1], '5');
    }
}

function createRangeExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'range', true);
    const block = document.getElementById(blockId);
    if (block) {
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createMathBlock(containers[0], '0');
        if (containers[1]) createMathBlock(containers[1], '10');
        if (containers[2]) createMathBlock(containers[2], '2');
    }
}

// Function examples
function createPrintExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'print', true);
    const block = document.getElementById(blockId);
    if (block) {
        const valueContainer = block.querySelector('.child-box-container-horizontal');
        if (valueContainer) createTextBlock(valueContainer, 'Hello, World!');
    }
}

function createPrintTextExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'printText', true);
    const block = document.getElementById(blockId);
    if (block) {
        const textarea = block.querySelector('textarea');
        if (textarea) textarea.value = 'Hello, World!';
    }
}

// Variable examples
function createVarDeclOpsExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'varDeclOps', true);
    const block = document.getElementById(blockId);
    if (block) {
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createVariableBlock(containers[0], 'x');
        if (containers[1]) createMathBlock(containers[1], '10');
    }
}

function createVarOpsExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'varOps', true);
    const block = document.getElementById(blockId);
    if (block) {
        setDropdownValue(block, '+=');
        const containers = block.querySelectorAll('.child-box-container-horizontal');
        if (containers[0]) createVariableBlock(containers[0], 'x');
        if (containers[1]) createMathBlock(containers[1], '5');
    }
}

function createVariableBlockExample(elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    const blockId = createBlockPreview(elementId, 'variableBlock', true);
    const block = document.getElementById(blockId);
    if (block) {
        const dropdown = block.querySelector('.block-dropdown');
        if (dropdown && dropdown.options.length > 0) {
            dropdown.value = dropdown.options[0].value;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Add default variables for examples
    addVariable('x');
    addVariable('y');
    addVariable('i');

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
