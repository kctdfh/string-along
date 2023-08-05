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
  console.log("IMPORT");
  updateVariablesWithJSONRepresentation(json);
  console.log("Import finished");
}

function importCSVFile(body) {
  const rows = body.split("\n");
  console.log("IMPORT");
  // remove the first row, which is the header
  rows.shift();
  let variables = [];
  rows.forEach((row) => {
    const cells = row.split(",");
    const variableId = cells[0].split("__")[0];
    const modeId = cells[0].split("__")[1];
    const value = cells[3];
    const variable = variables.find(
      (variable) => variable.variableMeta.id === variableId
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
          id: variableId,
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
}

function parseCollectiontoFile(collectionId) {
  const collections = figma.variables.getLocalVariableCollections();
  const files = [];
  collections.forEach((collection) =>
    files.push(...processCollection(collection, collectionId))
  );
  return files;
}

function exportToCSV(collectionId) {
  console.log("export to csv");
  const parsedCollection = parseCollectiontoFile(collectionId);
  let csv = [];
  const header = "ID (do not change),Name,Mode,String";
  csv.push(header);
  parsedCollection.forEach((variable) => {
    variable.modeValues.forEach((mode) => {
      const rowID = `${variable.variableMeta.id}__${mode.id}`;
      const row = `${rowID},${variable.variableMeta.name},${mode.name},${mode.value}`;
      csv.push(row);
    });
  });
  csv = csv.join("\n");
  figma.ui.postMessage({ type: "EXPORT_RESULT", fileType: "CSV", result: csv });
}

function exportToJSON(collectionId) {
  console.log("export to json");
  const variables = parseCollectiontoFile(collectionId);
  figma.ui.postMessage({
    type: "EXPORT_RESULT",
    fileType: "JSON",
    result: JSON.stringify(variables, null, 2),
  });
}

function getRootNote(nodeId) {
  // starting from nodeId, traverse up the tree until you find a node where the parent attribute's id is 0:1
  // return that node
  let node = figma.getNodeById(nodeId);
  let parent = node.parent;
  while (parent.id !== "0:1") {
    node = parent;
    parent = node.parent;
  }
  return node.id;
}

function getNodesBoundToVariable(variableId) {
  let nodesArray = [];
  const figmaNodes = figma.currentPage.findAll((n) => {
    if (
      n.boundVariables !== undefined &&
      n.boundVariables["characters"] !== undefined &&
      n.boundVariables["characters"].id === variableId
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

// NOTE returns an array of variable objects
function processCollection({ name, modes, variableIds, id }, collectionId) {
  if (collectionId !== undefined && collectionId !== id) {
    return [];
  }
  const allVariableObjects = [];
  const collectionName = name;
  variableIds.forEach((variableId) => {
    const { name, resolvedType, valuesByMode } =
      figma.variables.getVariableById(variableId);
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
        id: variableId,
        // type: resolvedType
      },
      modeValues: [],
      // boundedNodes: getNodesBoundToVariable(variableId),
    };
    // console.log(JSON.stringify(modes, null, 2));
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

figma.ui.onmessage = (e) => {
  // console.log("code received message", e);
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
