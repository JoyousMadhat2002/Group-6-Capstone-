// ==========================
// 1. Block Configuration
// ==========================

const categoryColors = {
  movement: "#669999 ",
  logic: "#5a80a5",
  math: "#5abd42",
  comparison: "#ffcc99",
  boolean: "#99cccc",
  functions: "#996699",
  variables: "#996666",
  default: "#cccccc",
};

const blockCategory = {
  movement: {
    elements: [
      {
        name: "Move",
        blockID: "movement",
        description: "Move Turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Turn",
        blockID: "turn",
        description: "Turn the turtle by angle",
        type: "movement",
        parentElement: "block",
        childElement: ["angle"],
      },
      {
        name: "Speed",
        blockID: "speed",
        description: "Set the speed of the turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["speed"],
      },
      {
        name: "Home",
        blockID: "home",
        description: "Move the turtle to the origin",
        type: "movement",
        parentElement: "block",
        childElement: null,
      },
      {
        name: "Color",
        blockID: "color",
        description: "Set the color of the turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["color"],
      },
      {
        name: "Pen Up",
        blockID: "penup",
        description: "Lift the pen",
        type: "movement",
        parentElement: "block",
        childElement: null,
      },
      {
        name: "Pen Down",
        blockID: "pendown",
        description: "Lower the pen",
        type: "movement",
        parentElement: "block",
        childElement: null,
      },
      {
        name: "Go To",
        blockID: "goto",
        description: "Move the turtle to a specific location",
        type: "movement",
        parentElement: "block",
        childElement: ["x", "y"],
      },
      {
        name: "Set Position",
        blockID: "setCoordinates",
        description: "Set the position or angle of the turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["x", "y", "angle"],
      },
      {
        name: "Pause",
        blockID: "pause",
        description: "Pause the turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["time"],
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
        blockID: "for",
        description: "For loop",
        type: "loop",
        parentElement: "block",
        childElement: "block",
      },
      /*{
        name: "Logical Operations",
        blockID: "logicalOps",
        description: "Logical operators (and, or, not)",
        type: "logical",
        parentElement: "block",
        childElement: ["operator", "operand1", "operand2"],
      },*/
      {
        name: "Logical Block",
        blockID: "logicalBlock",
        description: "A logical block for boolean input",
        type: "logical",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
      },
      {
        name: "Comma Separated",
        blockID: "commaSeparated",
        description: "A block that combines values with commas",
        type: "logical",
        parentElement: "block",
        childElement: ["block", "operand1", "operand2"],
      },
    ],
  },

  math: {
    elements: [
      /*{
        name: "Arithmetic Operations",
        blockID: "arithmeticOps",
        description: "Arithmetic operators (+, -, *, /, %, **, //)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["operator"],
      },*/
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
      /*{
        name: "Comparison Operators",
        blockID: "comparisonOps",
        description: "Comparison operators (==, !=, >, <, >=, <=)",
        type: "comparison",
        parentElement: "block",
        childElement: ["operator"],
      },*/
      {
        name: "Comparison Block",
        blockID: "comparisonBlock",
        description: "A comparison block for numeric input",
        type: "comparison",
        parentElement: "block",
        childElement: ["block", "operator", "operand1", "operand2"],
      },
      {
        name: "Range",
        blockID: "range",
        description: "Range function for loops",
        type: "loop",
        parentElement: "block",
        childElement: ["start", "end", "step"],
      },
    ],
  },

  functions: {
    elements: [
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
      {
        name: "Random",
        blockID: "random",
        description: "Generate a random number",
        type: "random",
        parentElement: "block",
        childElement: ["min", "max"],
      },
      {
        name: "Math Constants",
        blockID: "mathConstants",
        description: "Includes commonly used mathematical constants such as pi (π), Euler's number (e), tau (τ), infinity (inf), and not-a-number (nan).",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["constant"]
      },
      {
        name: "Rounding and Absolute Value",
        blockID: "roundAbs",
        description: "Provides functions for rounding and handling absolute values, including ceiling (ceil), floor (floor), rounding to the nearest integer (round), truncating decimal values (trunc), and getting the absolute value of a number (fabs).",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"]
      },
      {
        name: "Basic Arithmetic",
        blockID: "basicArithmetic",
        description: "Includes fundamental arithmetic operations such as finding the greatest common divisor (gcd), least common multiple (lcm), computing factorials (factorial), summing a sequence of numbers (sum), and calculating the product of a sequence (prod).",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"]
      },
      {
        name: "Logarithms and Exponents",
        blockID: "logExp",
        description: "Provides functions for logarithmic and exponential calculations, including computing natural logarithms (log), base-10 logarithms (log10), exponentiation (exp), square roots (sqrt), and raising a number to a given power (pow).",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"]
      },
      {
        name: "Trigonometry",
        blockID: "trigFunctions",
        description: "Includes trigonometric functions for working with angles and periodic calculations, such as sine (sin), cosine (cos), tangent (tan), inverse sine (asin), inverse cosine (acos), inverse tangent (atan), conversion between radians and degrees (radians, degrees).",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"]
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