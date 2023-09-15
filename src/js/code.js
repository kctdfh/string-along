//import("./papaparse.min.js");

console.clear();

function updateVariablesWithJSONRepresentation(json) {
  json.forEach((variable) => {
    const thisVariable = figma.variables.getVariableById(
      variable.variableMeta.id
    );
    variable.modeValues.forEach((mode) => {
      thisVariable.setValueForMode(mode.id, mode.value);
    });
  });
}

function importJSONFile(body) {
  const json = JSON.parse(body);
  updateVariablesWithJSONRepresentation(json);
}

function importCSVFile(body) {
  const pastedValue = body.trim();
  const parsed = Papa.parse(pastedValue, {
    header: true,
    transformHeader: (header) => {
      let newHeader = header
        .trim()
        .replace(/ /g, "")
        .replace(/\)/g, "")
        .replace(/\(/g, "")
        .toLowerCase();
      if (newHeader === "iddonotchange") {
        newHeader = "idcolumn";
      }
      return newHeader;
    },
  }).data;
  let variables = [];
  for (let index = 0; index < parsed.length; index++) {
    const row = parsed[index];
    if (row.string === undefined) {
      row.string = "";
    }
    const variableID = row.idcolumn.split("__")[0];
    const modeId = row.idcolumn.split("__")[1];
    const value = row.string ? row.string : "";
    const variable = variables.find(
      (variable) => variable.variableMeta.id === variableID
    );
    if (variable) {
      const mode = variable.modeValues.find((mode) => mode.id === modeId);
      if (mode) {
        mode.value = value;
      } else {
        variable.modeValues.push({ id: modeId, value: value });
      }
    } else {
      variables.push({
        variableMeta: {
          id: variableID,
        },
        modeValues: [
          {
            id: modeId,
            value: value,
          },
        ],
      });
    }
  }
  updateVariablesWithJSONRepresentation(variables);
  console.log("Import finished");
  figma.ui.postMessage({ type: "IMPORT_RESULT", result: "PASS" });
}

function exportToCSV(collectionId) {
  console.log("Export started");
  const parsedCollection = parseCollectiontoFile(collectionId);
  let csv = [];
  let variableIDs = [];
  parsedCollection.forEach((variable) => {
    variable.modeValues.forEach((mode) => {
      const pushVariable = variableIDs.find(
        (id) => id === variable.variableMeta.id
      );
      if (!pushVariable) {
        variableIDs.push(variable.variableMeta.id);
      }
      const rowID = `${variable.variableMeta.id}__${mode.id}`;
      const row = {
        "ID (do not change)": rowID,
        Name: variable.variableMeta.name,
        Mode: mode.name,
        String: mode.value,
      };
      csv.push(row);
    });
  });
  csv = Papa.unparse(csv, {
    delimiter: "\t",
    header: true,
  });
  getNodesBoundToVariable(variableIDs);
  figma.ui.postMessage({ type: "EXPORT_RESULT", fileType: "CSV", result: csv });
}

function exportToJSON(collectionId) {
  const variables = parseCollectiontoFile(collectionId);
  figma.ui.postMessage({
    type: "EXPORT_RESULT",
    fileType: "JSON",
    result: JSON.stringify(variables, null, 2),
  });
}

function getRootNode(nodeId) {
  let node = figma.getNodeById(nodeId);
  let parent = node.parent;
  while (parent !== null && parent.id !== "0:1") {
    node = parent;
    parent = node.parent;
  }
  return node.id;
}

function getNodesBoundToVariable(variableID) {
  let nodesArray = [];
  figma.skipInvisibleInstanceChildren = true;
  const figmaNodes = figma.currentPage
    .findAllWithCriteria({
      types: ["TEXT"],
    })
    .filter((n) => {
      if (
        n.boundVariables !== undefined &&
        n.boundVariables["characters"] !== undefined &&
        // n.boundVariables["characters"].id === variableID &&
        variableID.includes(n.boundVariables["characters"].id)
      ) {
        return n;
      }
    });
  figmaNodes.forEach((node) => {
    nodesArray.push({
      nodeId: node.id,
      absoluteBoundingBox: node.absoluteBoundingBox,
      rootNode: getRootNode(node.id),
    });
  });
  // console.log(JSON.stringify(nodesArray, null, 2));
  annotateNodesWithVariable(nodesArray);
  return nodesArray;
}

function isCollide(a, b) {
  const val = {
    collision: !(
      a.y + a.height <= b.y ||
      a.y >= b.y + b.height ||
      a.x + a.width <= b.x ||
      a.x >= b.x + b.width
    ),
    overlap: 0,
  };
  if (val.collision) {
    // area of the intersection, which is a rectangle too:
    const SI =
      Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
      Math.max(
        0,
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
      );
    // area of the union:
    const SU = a.width * a.height + b.width * b.height - SI;
    // ratio of intersection over union:
    val.overlap = SI / SU;

    // bad approaches
    // val.overlap = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
    // val.overlap = (a.width + b.width) / 2 - Math.abs(a.x - b.x);
    // val.overlap = (a.w * a.h) - (b.w * b.h) / 2 - Math.abs(a.x - b.x);
  } else {
    val.overlap = 0;
  }
  return val;
}

function isOutOfBounds(a, b) {
  const aMiddleX = a.x + a.width / 2;
  const aMiddleY = a.y + a.height / 2;
  return (
    aMiddleX + a.width / 2 > b.x + b.width ||
    aMiddleX - a.width / 2 < b.x ||
    aMiddleY + a.height / 2 > b.y + b.height ||
    aMiddleY - a.height / 2 < b.y
  );
}

function getWrapperXY(
  nodeToPlace,
  targetNode,
  rootNode,
  otherNodes,
  lineLength
) {
  const coordinateResults = [];
  // try to place the node above the target node
  const aboveX = targetNode.x + targetNode.width / 2 - nodeToPlace.width / 2;
  const aboveY = targetNode.y - lineLength - nodeToPlace.height;
  coordinateResults.push({
    placement: "above",
    x: aboveX,
    y: aboveY,
  });
  // check if it collides with any other nodes
  let aboveCollisionInstances = 0;
  const aboveCombinedTargetAndNodeToPlace = {
    x: targetNode.x > aboveX ? aboveX : targetNode.x,
    y: targetNode.y > aboveY ? aboveY : targetNode.y,
    width:
      targetNode.width > nodeToPlace.width
        ? targetNode.width
        : nodeToPlace.width,
    height: nodeToPlace.height + targetNode.height + lineLength,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(aboveCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      aboveCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[0].collisions = aboveCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(aboveCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[0].outOfBounds = true;
  } else {
    coordinateResults[0].outOfBounds = false;
  }
  // try to place the node below the target node
  const belowX = targetNode.x + targetNode.width / 2 - nodeToPlace.width / 2;
  const belowY = targetNode.y + targetNode.height + lineLength;
  coordinateResults.push({
    placement: "below",
    x: belowX,
    y: belowY,
  });
  // check if it collides with any other nodes
  let belowCollisionInstances = 0;
  const belowCombinedTargetAndNodeToPlace = {
    x: targetNode.x > belowX ? belowX : targetNode.x,
    y: targetNode.y > belowY ? belowY : targetNode.y,
    width:
      targetNode.width > nodeToPlace.width
        ? targetNode.width
        : nodeToPlace.width,
    height: nodeToPlace.height + targetNode.height + lineLength,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(belowCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      belowCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[1].collisions = belowCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(belowCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[1].outOfBounds = true;
  } else {
    coordinateResults[1].outOfBounds = false;
  }
  // try to place the node to the left of the target node
  const leftX = targetNode.x - lineLength - nodeToPlace.width;
  const leftY = targetNode.y + targetNode.height / 2 - nodeToPlace.height / 2;
  coordinateResults.push({
    placement: "left",
    x: leftX,
    y: leftY,
  });
  // check if it collides with any other nodes
  let leftCollisionInstances = 0;
  const leftCombinedTargetAndNodeToPlace = {
    x: targetNode.x > leftX ? leftX : targetNode.x,
    y: targetNode.y > leftY ? leftY : targetNode.y,
    width: nodeToPlace.width + targetNode.width + lineLength,
    height:
      targetNode.height > nodeToPlace.height
        ? targetNode.height
        : nodeToPlace.height,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(leftCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      leftCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[2].collisions = leftCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(leftCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[2].outOfBounds = true;
  } else {
    coordinateResults[2].outOfBounds = false;
  }
  // try to place the node to the right of the target node
  const rightX = targetNode.x + targetNode.width + lineLength;
  const rightY = targetNode.y + targetNode.height / 2 - nodeToPlace.height / 2;
  coordinateResults.push({
    placement: "right",
    x: rightX,
    y: rightY,
  });
  // check if it collides with any other nodes
  let rightCollisionInstances = 0;
  const rightCombinedTargetAndNodeToPlace = {
    x: targetNode.x > rightX ? rightX : targetNode.x,
    y: targetNode.y > rightY ? rightY : targetNode.y,
    width: nodeToPlace.width + targetNode.width + lineLength,
    height:
      targetNode.height > nodeToPlace.height
        ? targetNode.height
        : nodeToPlace.height,
  };
  otherNodes.forEach((otherNode) => {
    const collides = isCollide(rightCombinedTargetAndNodeToPlace, otherNode);
    if (collides.collision) {
      rightCollisionInstances += collides.overlap;
    }
  });
  coordinateResults[3].collisions = rightCollisionInstances;
  // check if it is out of bounds of the root node
  if (isOutOfBounds(rightCombinedTargetAndNodeToPlace, rootNode)) {
    coordinateResults[3].outOfBounds = true;
  } else {
    coordinateResults[3].outOfBounds = false;
  }
  // filter out any coordinates that are out of bounds, and sort by collisions
  const filteredCoordinates = coordinateResults
    .filter((coordinate) => {
      return !coordinate.outOfBounds;
    })
    .sort((a, b) => {
      return a.collisions - b.collisions;
    });
  // draw all combined target and node rectangles for debugging
  /* const leftRect = figma.createRectangle();
  leftRect.resize(
    leftCombinedTargetAndNodeToPlace.width,
    leftCombinedTargetAndNodeToPlace.height
  );
  leftRect.x = leftCombinedTargetAndNodeToPlace.x;
  leftRect.y = leftCombinedTargetAndNodeToPlace.y;
  leftRect.fills = [];
  leftRect.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 1 } }];
  leftRect.strokeWeight = 2;
  leftRect.name = `left`;
  const rightRect = figma.createRectangle();
  rightRect.resize(
    rightCombinedTargetAndNodeToPlace.width,
    rightCombinedTargetAndNodeToPlace.height
  );
  rightRect.x = rightCombinedTargetAndNodeToPlace.x;
  rightRect.y = rightCombinedTargetAndNodeToPlace.y;
  rightRect.fills = [];
  rightRect.strokes = [{ type: "SOLID", color: { r: 0, g: 1, b: 0 } }];
  rightRect.strokeWeight = 2;
  rightRect.name = `right`;
  const aboveRect = figma.createRectangle();
  aboveRect.resize(
    aboveCombinedTargetAndNodeToPlace.width,
    aboveCombinedTargetAndNodeToPlace.height
  );
  aboveRect.x = aboveCombinedTargetAndNodeToPlace.x;
  aboveRect.y = aboveCombinedTargetAndNodeToPlace.y;
  aboveRect.fills = [];
  aboveRect.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 0 } }];
  aboveRect.strokeWeight = 2;
  aboveRect.name = `above`;
  const belowRect = figma.createRectangle();
  belowRect.resize(
    belowCombinedTargetAndNodeToPlace.width,
    belowCombinedTargetAndNodeToPlace.height
  );
  belowRect.x = belowCombinedTargetAndNodeToPlace.x;
  belowRect.y = belowCombinedTargetAndNodeToPlace.y;
  belowRect.fills = [];
  belowRect.strokes = [{ type: "SOLID", color: { r: 0, g: 1, b: 1 } }];
  belowRect.strokeWeight = 2;
  belowRect.name = `below`; */
  // if there are no coordinates that are not out of bounds, return the "above" coordinates
  if (filteredCoordinates.length === 0) {
    return {
      x: aboveX,
      y: aboveY,
      placement: "above",
    };
  } else {
    return {
      x: filteredCoordinates[0].x,
      y: filteredCoordinates[0].y,
      placement: filteredCoordinates[0].placement,
    };
  }
}

function getLineXY(annotationNode, targetNode, placement, lineLength) {
  switch (placement) {
    case "above":
      return {
        x: targetNode.x + targetNode.width / 2,
        y: annotationNode.y + annotationNode.height,
      };
    case "below":
      return {
        x: targetNode.x + targetNode.width / 2,
        y: annotationNode.y,
      };
    case "left":
      return {
        x: annotationNode.x + annotationNode.width,
        y: targetNode.y + targetNode.height / 2,
      };
    case "right":
      return {
        x: targetNode.x + targetNode.width,
        y: targetNode.y + targetNode.height / 2,
      };
  }
}

function annotateNodesWithVariable(nodesArray) {
  // group nodesArray by root node
  let aggregatedNodes = nodesArray.sort((a, b) => {
    return a.rootNode > b.rootNode;
  });
  aggregatedNodes = nodesArray.reduce((acc, curr) => {
    const rootNode = curr.rootNode;
    if (acc[rootNode]) {
      acc[rootNode].push(curr);
    } else {
      acc[rootNode] = [curr];
    }
    return acc;
  }, {});
  aggregatedNodes = Object.values(aggregatedNodes);
  // TODO to make sure the annotations are fully done before screenshots are taken, we need to create a promise for each annotation, and then when all the promises are resolved, take the screenshot
  for (
    let nodeArrayIndex = 0;
    nodeArrayIndex < aggregatedNodes.length;
    nodeArrayIndex++
  ) {
    const nodesArray = aggregatedNodes[nodeArrayIndex];
    let existingNodes = [];
    let variableNames = [];
    for (let index = 0; index < nodesArray.length; index++) {
      const node = nodesArray[index];
      const nodeObj = figma.getNodeById(node.nodeId);
      const variableID = nodeObj.boundVariables["characters"].id;
      const variable = figma.variables.getVariableById(variableID);
      const variableName = variable.name;
      if (!variableNames.includes(variableName)) {
        variableNames.push(variableName);
      }
      const rootNode = figma.getNodeById(node.rootNode);
      const rootNodeName = rootNode.name;
      const rootNodeID = rootNode.id;
      console.log(`rootNodeID: ${rootNodeID}`)
      const allNodes = nodesArray
        .filter((node) => {
          if (node.rootNode === rootNodeID) {
            return node;
          }
        })
        .map((node) => {
          return figma.getNodeById(node.nodeId);
        });
      allNodes.forEach((node) => {
        existingNodes.push(node);
      });
      // first make sure there isn't already an annotation on the node
      const existingAnnotation = figma.currentPage
        .findAllWithCriteria({
          types: ["GROUP"],
        })
        .filter((n) => {
          if (
            n.getSharedPluginData("stringalong_annotation", "variableName") &&
            getRootNode(n.id) === rootNodeID
          ) {
            return n;
          }
        });
      if (existingAnnotation.length > 0) {
        existingAnnotation.forEach((annotation) => {
          if (!existingNodes.includes(annotation)) {
            existingNodes.push(annotation);
          }
        });
        return;
      }
      // check if the wrapper frame already exists
      const existingWrapper = figma.currentPage
        .findAllWithCriteria({
          types: ["FRAME"],
        })
        .filter((n) => {
          if (
            n.getSharedPluginData(
              "stringalong_annotation_wrapper",
              "rootNodeID"
            ) === rootNodeID
          ) {
            return n;
          }
        });
      let wrapperFame;
      if (existingWrapper.length > 0) {
        const wrapper = existingWrapper[0];
        wrapperFame = wrapper.id;
      } else {
        // create a wrapper frame for the annoations, and place it where the root node is placed and size it to the root node
        const wrapper = figma.createFrame();
        wrapper.name = "stringalong_annotation_wrapper";
        wrapper.x = rootNode.x;
        wrapper.y = rootNode.y;
        wrapper.resize(rootNode.width, rootNode.height);
        wrapper.layoutMode = "NONE";
        wrapper.expanded = false;
        wrapper.fills = [];
        wrapper.setSharedPluginData(
          "stringalong_annotation_wrapper",
          "rootNodeID",
          rootNodeID
        );
        wrapperFame = wrapper.id;
      }
      // create a red stroked rectangle around the node
      const rect = figma.createRectangle();
      rect.resize(
        node.absoluteBoundingBox.width,
        node.absoluteBoundingBox.height
      );
      rect.x = node.absoluteBoundingBox.x;
      rect.y = node.absoluteBoundingBox.y;
      rect.fills = [];
      rect.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
      rect.strokeWeight = 2;
      rect.name = `${variableName} (${rootNodeName})`;
      rect.setSharedPluginData(
        "stringalong_annotation",
        "variableName",
        variableName
      );
      // create a text node with the variable name and place it on top of the rectangle, centered, with a white background, and a red border, and a line attaching the text node to the rectangle
      // figma.loadFontAsync({ family: "Inter", style: "Regular" })
      const fontLoad = new Promise((resolve) => {
        figma.loadFontAsync({ family: "Inter", style: "Regular" }).then(() => {
          resolve();
        });
      });
      fontLoad.then(() => {
        const text = figma.createText();
        // find the width of the text node
        text.characters = variableName;
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        text.name = `${variableName} (${rootNodeName})`;
        text.fontSize = 18;
        const textWrapper = figma.createFrame();
        textWrapper.name = `${variableName} (${rootNodeName})`;
        textWrapper.layoutMode = "HORIZONTAL";
        textWrapper.primaryAxisAlignItems = "CENTER";
        textWrapper.counterAxisAlignItems = "CENTER";
        textWrapper.primaryAxisSizingMode = "AUTO";
        textWrapper.counterAxisSizingMode = "AUTO";
        textWrapper.paddingLeft = 20;
        textWrapper.paddingRight = 20;
        textWrapper.paddingTop = 10;
        textWrapper.paddingBottom = 10;
        textWrapper.cornerRadius = 10;
        textWrapper.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
        textWrapper.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        textWrapper.appendChild(text);
        const lineLength = textWrapper.height;
        const textWrapperCoordinates = getWrapperXY(
          {
            figmaNode: textWrapper,
            x: textWrapper.absoluteBoundingBox.x,
            y: textWrapper.absoluteBoundingBox.y,
            width: textWrapper.absoluteBoundingBox.width,
            height: textWrapper.absoluteBoundingBox.height,
          },
          {
            figmaNode: nodeObj,
            x: nodeObj.absoluteBoundingBox.x,
            y: nodeObj.absoluteBoundingBox.y,
            width: nodeObj.absoluteBoundingBox.width,
            height: nodeObj.absoluteBoundingBox.height,
          },
          {
            figmaNode: rootNode,
            x: rootNode.absoluteBoundingBox.x,
            y: rootNode.absoluteBoundingBox.y,
            width: rootNode.absoluteBoundingBox.width,
            height: rootNode.absoluteBoundingBox.height,
          },
          existingNodes.map((node) => {
            return {
              figmaNode: node,
              x: node.absoluteBoundingBox.x,
              y: node.absoluteBoundingBox.y,
              width: node.absoluteBoundingBox.width,
              height: node.absoluteBoundingBox.height,
            };
          }),
          lineLength
        );
        textWrapper.x = textWrapperCoordinates.x;
        textWrapper.y = textWrapperCoordinates.y;
        textWrapper.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        // create a line connecting the text node to the rectangle
        const line = figma.createLine();
        // rotate the line 90 degrees
        if (textWrapperCoordinates.placement === "above") {
          line.rotation = -90;
        } else if (textWrapperCoordinates.placement === "below") {
          line.rotation = 90;
        }
        line.resize(lineLength, 0);
        const lineCoordinates = getLineXY(
          {
            figmaNode: textWrapper,
            x: textWrapper.absoluteBoundingBox.x,
            y: textWrapper.absoluteBoundingBox.y,
            width: textWrapper.absoluteBoundingBox.width,
            height: textWrapper.absoluteBoundingBox.height,
          },
          {
            figmaNode: nodeObj,
            x: nodeObj.absoluteBoundingBox.x,
            y: nodeObj.absoluteBoundingBox.y,
            width: nodeObj.absoluteBoundingBox.width,
            height: nodeObj.absoluteBoundingBox.height,
          },
          textWrapperCoordinates.placement,
          lineLength
        );
        line.x = lineCoordinates.x;
        line.y = lineCoordinates.y;
        line.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        line.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
        line.strokeWeight = 3;
        line.name = `${variableName} (${rootNodeName})`;
        line.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        // group the rectangle, text node, and line
        // TODO when the root node is auto-layout, the group is not placed in the correct position - the solution is to disable auto-layout on the root node, take the screenshot, then re-enable auto-layout on the root node with the same settings
        const group = figma.group(
          [rect, textWrapper, line],
          figma.getNodeById(wrapperFame)
        );
        group.name = `stringalong_annotation`;
        group.expanded = false;
        group.setSharedPluginData(
          "stringalong_annotation",
          "variableName",
          variableName
        );
        if (!existingNodes.includes(group)) {
          existingNodes.push(group);
        }
        // if it's the last node, wrap the wrapper frame and the rootNode in a group
        if (index === nodesArray.length - 1) {
          console.log("last node");
          const wrapperFrame = figma.getNodeById(wrapperFame);
          const rootNode = figma.getNodeById(node.rootNode);
          const group = figma.group([wrapperFrame, rootNode], rootNode.parent);
          group.name = variableNames.sort().join(" - ");
          group.setSharedPluginData(
            "stringalong_screenshot_group",
            "rootNodeID",
            rootNodeID
          );
          group.expanded = false;
        }
      });
    }
  }
  exportRootNodeScreenshot();
}

function exportRootNodeScreenshot() {
  let nodeScreenshots = [];
  let promises = [];
  const screenShotTargets = figma.currentPage.findChildren((n) =>
    n.getSharedPluginData("stringalong_screenshot_group", "rootNodeID")
  );
  console.log(`Number of nodes to screenshot: ${screenShotTargets.length}`);
  for (let index = 0; index < screenShotTargets.length; index++) {
    const node = screenShotTargets[index];
    const nodeObj = figma.getNodeById(node.id);
    const rootNode = figma.getNodeById(getRootNode(node.id));
    const rootNodeName = rootNode.name;
    const variableID = nodeObj.getSharedPluginData(
      "stringalong_screenshot_group",
      "variableID"
    );
    const variable = figma.variables.getVariableById(variableID);
    const variableName = variable.name;
    const exportOptions = {
      format: "PNG",
      constraint: {
        type: "SCALE",
        value: 1,
      },
    };
    const exportPromise = rootNode
      .exportAsync(exportOptions)
      .then((buffer) => {
        nodeScreenshots.push({
          buffer: buffer,
        });
      })
      .catch((error) => {
        console.log(error);
      });
    promises.push(exportPromise);
  }
  Promise.all(promises).then(() => {
    console.log(nodeScreenshots);
  });
}

function getAllCollections() {
  let collections = figma.variables.getLocalVariableCollections();
  collections = collections.map((collection) => {
    return {
      id: collection.id,
      name: collection.name,
    };
  });
  return collections;
}

function sanatizeString(string) {
  if (
    (string.startsWith(`'`) && string.endsWith(`'`)) ||
    (string.startsWith(`"`) && string.endsWith(`"`))
  ) {
    string = string.slice(1, -1);
  }
  return string;
}

function compareUpdatedVariables(body) {
  const updatedVariables = [];
  body.forEach((variable) => {
    const thisVariable = figma.variables.getVariableById(variable.variableID);
    if (thisVariable !== null) {
      let modeValue = thisVariable.valuesByMode[variable.modeId];
      if (sanatizeString(modeValue) !== sanatizeString(variable.value)) {
        updatedVariables.push({
          variableID: variable.variableID.replace("VariableID:", ""),
          modeId: variable.modeId,
          pastedValue: variable.value,
          figmaValue: modeValue,
        });
      }
    } else {
      console.log("VARIABLE NOT FOUND");
    }
  });
  figma.ui.postMessage({
    type: "COMPARE_RESULT",
    result: JSON.stringify(updatedVariables),
  });
  return updatedVariables;
}

// SECTION Collection parsing functions

// NOTE given a collection ID, parse it
function parseCollectiontoFile(collectionId) {
  const collections = figma.variables.getLocalVariableCollections();
  const files = [];
  collections.forEach((collection) =>
    files.push(...processCollection(collection, collectionId))
  );
  return files;
}

// NOTE given a collection, returns its string variables as an array of objects
function processCollection({ name, modes, variableIds, id }, collectionId) {
  if (collectionId !== undefined && collectionId !== id) {
    figma.ui.postMessage({
      type: "NOTICE",
      result: "BAD_COLLECTION",
    });
    return [];
  }
  const allVariableObjects = [];
  const collectionName = name;
  variableIds.forEach((variableID) => {
    const { name, resolvedType, valuesByMode } =
      figma.variables.getVariableById(variableID);
    if (resolvedType !== "STRING") {
      return;
    }
    const variableObject = {
      collectionMeta: {
        name: collectionName,
        id: id,
      },
      variableMeta: {
        name: name,
        id: variableID,
        // type: resolvedType
      },
      modeValues: [],
      // boundedNodes: getNodesBoundToVariable(variableID),
    };
    modes.forEach(({ modeId, name }) => {
      const value = valuesByMode[modeId];
      const modeObj = {
        id: modeId,
        name,
        value,
      };
      variableObject.modeValues.push(modeObj);
    });
    allVariableObjects.push(variableObject);
  });
  allVariableObjects.sort(
    (a, b) => a.variableMeta.id.split(":")[2] > b.variableMeta.id.split(":")[2]
  );
  return allVariableObjects;
}

// !SECTION Collection parsing functions

// SECTION sending/receiving messages between plugin and code

figma.ui.onmessage = (e) => {
  const submitter = e.submitter;
  const selectedCollectionID = e.collectionId;
  if (e.type === "IMPORT") {
    if (submitter === "JSON") {
      importJSONFile(e.body);
    } else {
      importCSVFile(e.body);
    }
  } else if (e.type === "EXPORT") {
    // handle GET_COLLECTIONS
    if (e.type === "GET_COLLECTIONS") {
      const collections = getAllCollections();
      figma.ui.postMessage({
        type: "GET_COLLECTIONS",
        result: collections,
      });
    }
    // handle submitter
    if (submitter === "JSON") {
      exportToJSON(selectedCollectionID);
    } else {
      exportToCSV(selectedCollectionID);
    }
  } else if (e.type === "TO_COMPARE") {
    compareUpdatedVariables(e.body);
  }
};

if (figma.command === "import") {
  figma.showUI(__uiFiles__["import"], {
    width: 500,
    height: 500,
    themeColors: true,
  });
} else if (figma.command === "export") {
  figma.showUI(__uiFiles__["export"], {
    width: 500,
    height: 500,
    themeColors: true,
  });
  const collections = getAllCollections();
  figma.ui.postMessage({
    type: "GET_COLLECTIONS",
    result: collections,
  });
}

// !SECTION sending/receiving messages between plugin and code
