import { blockCategory, categoryColors } from "./blockConfiguration.js";

// ==========================
// 2. Block Properties
// ==========================



function getBlockDropdownList(blockID) {
  if (blockID === "mathBlock") {
    blockID = "arithmeticOps";
  } else if (blockID === "comparisonBlock") {
    blockID = "comparisonOps";
  } else if (blockID === "logicalBlock") {
    blockID = "logicalOps";
  }

  switch (blockID) {
    case "movement":
      return ["---", "forward", "backward"]
    case "turn":
      return ["---", "right", "left"]
    case "setCoordinates":
      return ["---", "setX", "setY", "setHeading"]
    case "arithmeticOps":
      return ["---", "+", "-", "*", "/", "%", "**", "//"];
    case "comparisonOps":
      return ["---", "==", "!=", ">", "<", ">=", "<="];
    case "logicalOps":
      return ["---", "and", "or", "not"];
    case "varOps":
      return ["---", "=", "+=", "-=", "*=", "/="];
    case "if":
      return ["---", "else if", "else"];
    case "mathConstants":
      return ["---", "pi", "e", "tau", "inf", "nan"];
    case "roundAbs":
      return ["---", "round", "ceil", "floor", "trunc", "abs"];
    case "basicArithmetic":
      return ["---", "gcd", "lcm", "factorial", "sum", "prod"];
    case "logExp":
      return ["---", "log", "log10", "exp", "sqrt", "pow"];
    case "trigFunctions":
      return ["---", "sin", "cos", "tan", "asin", "acos", "atan", "radians", "degrees"];
    case "random":
      return ["---", "random", "randint", "uniform", "choice", "sample", "shuffle"];
    default:
      return ["---"]; // Default case for blocks without specific types
  }
}

function getBlockProperties(blockID) {
  let blockCategoryColor = "#cccccc"; // Default block color
  let childElement = null;
  let description = "No description available."; // Default description

  // Iterate through the blockCategory to find the block's properties
  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    const element = categoryData.elements.find((element) => element.blockID === blockID);
    if (element) {
      blockCategoryColor = categoryColors[categoryName] || blockCategoryColor;
      childElement = element.childElement;
      description = element.description || description; 
      break;
    }
  }

  return { blockCategoryColor, childElement, description };
}

function getCategoryByBlockID(blockID) {
  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    if (categoryData.elements.some((element) => element.blockID === blockID)) {
      return categoryName;
    }
  }
  return null;
}

function createBlockLabel(block, blockID) {
  const blockIDLabel = document.createElement("span");
  blockIDLabel.classList.add("block-id-label");
  block.appendChild(blockIDLabel);
}

export { getBlockDropdownList, getBlockProperties, getCategoryByBlockID, createBlockLabel };