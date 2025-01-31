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
    case "arithmeticOps":
      return ["---", "+", "-", "*", "/", "%", "**", "//"];
    case "comparisonOps":
      return ["---", "==", "!=", ">", "<", ">=", "<="];
    case "logicalOps":
      return ["---", "and", "or", "not"];
    case "varOps":
      return ["---", "=", "+=", "-=", "*=", "/="];
    default:
      return ["---"]; // Default case for blocks without specific types
  }
}

function getBlockProperties(blockID) {
  let blockCategoryColor = "#cccccc"; // Default block color
  let childElement = null;

  for (const [categoryName, categoryData] of Object.entries(blockCategory)) {
    categoryData.elements.forEach((element) => {
      if (element.blockID === blockID) {
        blockCategoryColor = categoryColors[categoryName] || blockCategoryColor;
        childElement = element.childElement;
      }
    });
  }

  return { blockCategoryColor, childElement };
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