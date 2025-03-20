// ==========================
// 1. Block Configuration
// ==========================

const categoryColors = {
  movement: "#BFEFFF", // Baby Blue
  logic: "#5a80a5", // Steel Blue
  math: "#5abd42", // Green
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
        name: "movement",
        blockID: "movement",
        description: "Movement for Turtle",
        type: "movement",
        parentElement: "block",
        childElement: ["function", "value"],
      }
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
      },*/
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
        childElement: ["operator"],
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
        childElement: ["operator"],
      },
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
      {
        name: "Math Constants",
        blockID: "mathConstants",
        description: "Math constants (pi, e, tau, inf, nan)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["constant"],
      },
      {
        name: "Rounding and Truncation",
        blockID: "roundingTruncation",
        description: "Rounding and truncation functions (ceil, floor, trunc, round, nearbyint, rint)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Absolute Value and Sign",
        blockID: "absSign",
        description: "Absolute value and sign-related functions (fabs, copysign, nextafter)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Number Theory and Combinatorics",
        blockID: "numberTheory",
        description: "Number theory and combinatorics functions (gcd, lcm, comb, perm, factorial)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Summation and Products",
        blockID: "sumProd",
        description: "Summation and product functions (fsum, prod)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Floating-Point Manipulation",
        blockID: "floatManipulation",
        description: "Floating-point manipulation functions (frexp, ldexp, modf)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Comparison and Validation",
        blockID: "comparisonValidation",
        description: "Comparison and validation functions (isclose, isfinite, isinf, isnan, isqrt)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Remainder and Division",
        blockID: "remainderDivision",
        description: "Remainder and division functions (fmod, remainder)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Logarithmic and Exponential Functions",
        blockID: "logExpFunctions",
        description: "Logarithmic and exponential functions (exp, expm1, log, log1p, log2, log10, pow, sqrt)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Trigonometric Functions",
        blockID: "trigFunctions",
        description: "Trigonometric functions (acos, asin, atan, atan2, cos, sin, tan, degrees, radians, dist, hypot)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Hyperbolic Functions",
        blockID: "hyperbolicFunctions",
        description: "Hyperbolic functions (acosh, asinh, atanh, cosh, sinh, tanh)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
      },
      {
        name: "Special Functions",
        blockID: "specialFunctions",
        description: "Special functions (erf, erfc, gamma, lgamma)",
        type: "arithmetic",
        parentElement: "block",
        childElement: ["function", "value"],
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