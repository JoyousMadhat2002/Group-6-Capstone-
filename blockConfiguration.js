// Define a color scheme for the categories
const categoryColors = {
    movement: "#BFEFFF", // Baby Blue
    logic: "#5a80a5", // Steel Blue
    math: "#5ba55a", // Medium Sea Green
    comparison: "#ffcc99", // Peach
    boolean: "#80cbc4", // Aqua Marine
    functions: "#995ba6", // Amethyst Purple
    variables: "#a55b80", // Rosewood
};

const blockCategory = {
    movement: {
      elements: [
        {
          name: "forward",
          blockID: "t.forward(100)",
          description: "Move the turtle forward",
          type: "movement",
          blockType: ["forward"],
          parentElement: "block",
          childElement: ["value"], // accepts a numeric value
          sisterElement: null,
        },
        {
          name: "right",
          blockID: "t.right(90)",
          description: "Turn the turtle right",
          type: "movement",
          blockType: ["right"],
          parentElement: "block",
          childElement: ["value"], // accepts an angle
          sisterElement: null,
        },
        {
          name: "back",
          blockID: "t.back(100)",
          description: "Move the turtle backward",
          type: "movement",
          blockType: ["back"],
          parentElement: "block",
          childElement: ["value"], // accepts a numeric value
          sisterElement: null,
        },
        {
          name: "left",
          blockID: "t.left(90)",
          description: "Turn the turtle left",
          type: "movement",
          blockType: ["left"],
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
          blockType: ["control"],
          parentElement: "block",
          childElement: "block",
          sisterElement: ["elif", "else"],
        },
        {
          name: "while",
          blockID: "while",
          description: "While loop",
          type: "loop",
          blockType: ["loop"],
          parentElement: "block",
          childElement: "block",
          sisterElement: null,
        },
        {
          name: "for",
          blockID: "for",
          description: "For loop",
          type: "loop",
          blockType: ["loop"],
          parentElement: "block",
          childElement: "block",
          sisterElement: null,
        },
        {
          name: "break",
          blockID: "break",
          description: "Break loop",
          type: "loop",
          blockType: ["loop"],
          parentElement: "block",
          childElement: null,
          sisterElement: null,
        },
        {
          name: "continue",
          blockID: "continue",
          description: "Continue loop",
          type: "loop",
          blockType: ["loop"],
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
          blockType: ["---", "+", "-", "*", "/", "%", "**", "//"],
          parentElement: "block",
          childElement: ["operator", "operand1", "operand2"],
          sisterElement: null,
        },
  
        {
          name: "Math Text Block",
          blockID: "mathText",
          description: "A text block that accepts only numeric input",
          type: "text",
          blockType: ["number"],
          parentElement: "block",
          childElement: ["text"],
          sisterElement: null,
        },
  
        {
          name: "Math Block",
          blockID: "mathBlock",
          description: "A math block for numeric input",
          type: "arithmetic",
          blockType: ["math"],
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
          blockType: ["---", "==", "!=", ">", "<", ">=", "<="],
          parentElement: "block",
          childElement: ["operator", "operand1", "operand2"],
          sisterElement: null,
        },
  
        {
          name: "Comparison Block",
          blockID: "comparisonBlock",
          description: "A comparison block for numeric input",
          type: "comparison",
          blockType: ["comparison"],
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
          blockType: ["---", "and", "or", "not"],
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
          blockType: ["function"],
          parentElement: "block",
          childElement: ["function_name", "arguments"],
          sisterElement: null,
        },
        {
          name: "return",
          blockID: "return",
          description: "Return from a function",
          type: "function",
          blockType: ["function"],
          parentElement: "block",
          childElement: ["expression"],
          sisterElement: null,
        },
        {
          name: "print",
          blockID: "print",
          description: "Print to the console",
          type: "function",
          blockType: ["function"],
          parentElement: "block",
          childElement: ["expression"],
          sisterElement: null,
        },
  
        {
          name: "Text",
          blockID: "printText",
          description: "A text block for string input",
          type: "text",
          blockType: ["text"],
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
          blockType: ["variable"],
          parentElement: "block",
          childElement: ["variable", "value"],
          sisterElement: null,
        },
  
        {
          name: "Variable Operations",
          blockID: "varOps",
          description: "Variable",
          type: "variable",
          blockType: ["variable"],
          parentElement: "block",
          childElement: ["variable", "operator", "value"],
          sisterElement: null,
        },
  
        {
          name: "Variable Block",
          blockID: "variableBlock",
          description: "A variable block for variable input",
          type: "variable",
          blockType: ["variable"],
          parentElement: "block",
          childElement: null,
          sisterElement: null,
        },
  
      ],
    },
  };
  

export { categoryColors, blockCategory };