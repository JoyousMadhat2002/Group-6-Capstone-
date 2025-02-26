// ==========================
// 1. Block Configuration
// ==========================

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
      },
      {
        name: "right",
        blockID: "t.right(90)",
        description: "Turn the turtle right",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts an angle
      },
      {
        name: "back",
        blockID: "t.back(100)",
        description: "Move the turtle backward",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts a numeric value
      },
      {
        name: "left",
        blockID: "t.left(90)",
        description: "Turn the turtle left",
        type: "movement",
        parentElement: "block",
        childElement: ["value"], // accepts an angle
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
      },
      {
        name: "while",
        blockID: "while",
        description: "While loop",
        type: "loop",
        parentElement: "block",
        childElement: "block",
      },
      {
        name: "for",
        name: "for",
        blockID: "for",
        description: "For loop",
        type: "loop",
        parentElement: "block",
        childElement: "block",
      },
      {
        name: "break",
        blockID: "break",
        description: "Break loop",
        type: "loop",
        parentElement: "block",
        childElement: null,
      },
      {
        name: "continue",
        blockID: "continue",
        description: "Continue loop",
        type: "loop",
        parentElement: "block",
        childElement: null,
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
      },
      {
        name: "Math Text Block",
        blockID: "mathText",
        description: "A text block that accepts only numeric input",
        type: "text",
        parentElement: "block",
        childElement: ["text"],
      },
      {
        name: "Math Block",
        blockID: "mathBlock",
        description: "A math block for numeric input",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
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
      },
      {
        name: "Comparison Block",
        blockID: "comparisonBlock",
        description: "A comparison block for numeric input",
        type: "comparison",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
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
      },
    ],
  },
  functions: {
    elements: [
      /* Future implementation
      {
        name: "def",
        blockID: "def",
        description: "Define a function",
        type: "function",
        parentElement: "block",
        childElement: ["function_name", "arguments"],
      },
      {
        name: "return",
        blockID: "return",
        description: "Return from a function",
        type: "function",
        parentElement: "block",
        childElement: ["expression"],
      },
      */
      {
        name: "print",
        blockID: "print",
        description: "Print to the console",
        type: "function",
        parentElement: "block",
        childElement: ["expression"],
      },
      {
        name: "Text",
        blockID: "printText",
        description: "A text block for string input",
        type: "text",
        parentElement: "block",
        childElement: ["text"],
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
      },
      {
        name: "Variable Operations",
        blockID: "varOps",
        description: "Variable",
        type: "variable",
        parentElement: "block",
        childElement: ["variable", "operator", "value"],
      },
      {
        name: "Variable Block",
        blockID: "variableBlock",
        description: "A variable block for variable input",
        type: "variable",
        parentElement: "block",
        childElement: null,
      },
    ],
  },
};
  

export { categoryColors, blockCategory };