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
  exportRootNodeScreenshot();
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

function getRootNote(nodeId) {
  let node = figma.getNodeById(nodeId);
  let parent = node.parent;
  while (parent.id !== "0:1") {
    node = parent;
    parent = node.parent;
  }
  return node.id;
}

function getNodesBoundToVariable(variableID) {
  // NOTE Too slow. Hangs the UI. Need to find a better way to do this. For now, it's outscoped.
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
      rootNode: getRootNote(node.id),
    });
  });
  // console.log(JSON.stringify(nodesArray, null, 2));
  annotateNodesWithVariable(nodesArray);
  return nodesArray;
}

function annotateNodesWithVariable(nodesArray) {
  for (let index = 0; index < nodesArray.length; index++) {
    const node = nodesArray[index];
    const nodeObj = figma.getNodeById(node.nodeId);
    const variableID = nodeObj.boundVariables["characters"].id;
    const variable = figma.variables.getVariableById(variableID);
    const variableName = variable.name;
    const rootNodeName = figma.getNodeById(node.rootNode).name;
    // first make sure there isn't already an annotation on the node
    const existingAnnotation = figma.currentPage
      .findAllWithCriteria({
        types: ["GROUP"],
      })
      .filter((n) => {
        if (n.type === "GROUP") {
          if (n.getSharedPluginData("stringalong_annotation", "variableID")) {
            return n;
          }
        }
      });
    if (existingAnnotation.length > 0) {
      existingAnnotation.forEach((annotation) => {
        const annotationVariableID = annotation.getSharedPluginData(
          "stringalong_annotation",
          "variableID"
        );
        console.log(
          annotationVariableID + " " + variableID + " already exists"
        );
      });
      return;
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
      "variableID",
      variableID
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
      text.fontSize = 16;
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
      textWrapper.x =
        node.absoluteBoundingBox.x +
        node.absoluteBoundingBox.width / 2 -
        figma.getNodeById(textWrapper.id).width / 2;
      textWrapper.y = node.absoluteBoundingBox.y - 60;
      textWrapper.setSharedPluginData(
        "stringalong_annotation",
        "variableID",
        variableID
      );
      // create a line connecting the text node to the rectangle
      const line = figma.createLine();
      // rotate the line 90 degrees
      line.rotation = 90;
      line.resize(21, 0);
      line.x = node.absoluteBoundingBox.x + node.absoluteBoundingBox.width / 2;
      line.y = node.absoluteBoundingBox.y;
      line.fills = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
      line.strokes = [{ type: "SOLID", color: { r: 1, g: 0, b: 0 } }];
      line.strokeWeight = 2;
      line.name = `${variableName} (${rootNodeName})`;
      line.setSharedPluginData(
        "stringalong_annotation",
        "variableID",
        variableID
      );
      // group the rectangle, text node, and line
      const group = figma.group(
        [rect, textWrapper, line],
        figma.getNodeById(node.rootNode)
      );
      group.name = `stringalong_annotation`;
      group.setSharedPluginData(
        "stringalong_annotation",
        "variableID",
        variableID
      );
      group.expanded = false;
      group.setSharedPluginData(
        "stringalong_annotation",
        "variableName",
        variableName
      );
      // put the group in the node's root parent and lock it
      // group.parent = nodeObj.parent;
      // group.locked = true;
    });
  }
}

function exportRootNodeScreenshot() {
  const nodes = figma.currentPage
    .findAllWithCriteria({
      types: ["GROUP"],
    })
    .filter((node) => {
      if (node.getSharedPluginData("stringalong_annotation", "variableID")) {
        return node;
      }
    });
  let nodeScreenshots = [];
  let promises = [];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    const nodeObj = figma.getNodeById(node.id);
    const rootNode = figma.getNodeById(getRootNote(node.id));
    const rootNodeName = rootNode.name;
    const variableID = nodeObj.getSharedPluginData(
      "stringalong_annotation",
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
