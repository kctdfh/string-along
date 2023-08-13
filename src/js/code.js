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
  const parsed = Papa.parse(body, {
    header: false
  }).data;
  // remove the first row, which is the header
  parsed.shift();
  let variables = [];
  parsed.forEach((row) => {
    const variableID = row[0].split("__")[0];
    const modeId = row[0].split("__")[1];
    const value = row[3];
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
  });
  updateVariablesWithJSONRepresentation(variables);
  console.log("Import finished");
  figma.ui.postMessage({ type: "IMPORT_RESULT", result: "PASS" });
}

function exportToCSV(collectionId) {
  console.log("Export started");
  const parsedCollection = parseCollectiontoFile(collectionId);
  let csv = [];
  parsedCollection.forEach((variable) => {
    variable.modeValues.forEach((mode) => {
      const rowID = `${variable.variableMeta.id}__${mode.id}`;
      const row = {
        "ID (do not change)": rowID,
        "Name": variable.variableMeta.name,
        "Mode": mode.name,
        "String": mode.value,
      };
      csv.push(row);
    });
  });
  csv = Papa.unparse(csv, {
    delimiter: "\t",
    header: true,
  });
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
  const figmaNodes = figma.currentPage.findAll((n) => {
    if (
      n.boundVariables !== undefined &&
      n.boundVariables["characters"] !== undefined &&
      n.boundVariables["characters"].id === variableID
    ) {
      return n;
    }
  });
  figmaNodes.forEach((node) => {
    nodesArray.push({
      nodeId: node.id,
      rootNode: getRootNote(node.id),
    });
  });

  return nodesArray;
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
  console.log("COMPARE");
  body.forEach((variable) => {
    const thisVariable = figma.variables.getVariableById(variable.variableID);
    if (thisVariable !== null) {
      let modeValue = thisVariable.valuesByMode[variable.modeId];
      if (sanatizeString(modeValue.trim()) !== sanatizeString(variable.value.trim())) {
        updatedVariables.push({
          variableID: variable.variableID.replace("VariableID:", ""),
          modeId: variable.modeId,
          /* pastedValue: variable.value.trim(),
          figmaValue: modeValue.trim(), */
        });
      }
    } else {
      console.log("VARIABLE NOT FOUND");
    }
  });
  // console.log(updatedVariables);
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
