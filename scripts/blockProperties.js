// ==========================
// 2. Block Properties
// ==========================

import { blockCategory, categoryColors } from "./blockConfiguration.js";

function getBlockDropdownList(blockID) {
  if (blockID === "mathBlock") {
    blockID = "arithmeticOps";
  } else if (blockID === "comparisonBlock") {
    blockID = "comparisonOps";
  }

  switch (blockID) {
    case "movement":
      return ["---", "right", "left", "forward", "backward"]
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
    case "roundingTruncation":
      return [
        "---",
        "ceil", "floor", "trunc", 
        "round", "nearbyint", "rint"
      ];
    case "absSign":
      return [
        "---",
        "fabs", "copysign", "nextafter"
      ];
    case "numberTheory":
      return [
        "---",
        "gcd", "lcm", "comb", "perm", "factorial"
      ];
    case "sumProd":
      return [
        "---",
        "fsum", "prod"
      ];
    case "floatManipulation":
      return [
        "---",
        "frexp", "ldexp", "modf"
      ];
    case "comparisonValidation":
      return [
        "---",
        "isclose", "isfinite", "isinf", "isnan", "isqrt"
      ];
    case "remainderDivision":
      return [
        "---",
        "fmod", "remainder"
      ];
    case "logExpFunctions":
      return [
        "---",
        "exp", "expm1", "log", "log1p", 
        "log2", "log10", "pow", "sqrt"
      ];
    case "trigFunctions":
      return [
        "---",
        "acos", "asin", "atan", "atan2", 
        "cos", "sin", "tan", "degrees", 
        "radians", "dist", "hypot"
      ];
    case "hyperbolicFunctions":
      return [
        "---",
        "acosh", "asinh", "atanh", 
        "cosh", "sinh", "tanh"
      ];
    case "specialFunctions":
      return [
        "---",
        "erf", "erfc", "gamma", "lgamma"
      ];
    case "mathConstants":
      return ["---", "pi", "e", "tau", "inf", "nan"];
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