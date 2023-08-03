// each variable is one row - each mode is a column
// as opposed to each mode being on a separate row

function exportToCSV(collectionId) {
  console.log("export to csv");
  const parsedCollection = parseCollectiontoFile(collectionId);
  let csv = [];
  let modes = [];
  parsedCollection.forEach((variable) => {
    variable.modeValues.forEach((mode) => {
      if (!modes.includes(mode.name)) {
        modes.push(mode.name);
      }
    });
  });
  const modeHeaders = modes.join(",");
  const header = `ID (do not change),Variable name,${modeHeaders}`;
  csv.push(header);
  parsedCollection.forEach((variable) => {
    let row = [variable.variableMeta.id, variable.variableMeta.name];
    modes.forEach((mode) => {
      const modeValue = variable.modeValues.find((m) => m.name === mode);
      row.push(modeValue ? modeValue.value : "");
    });
    row = row.join(",");
    //   let row = `${variable.variableMeta.id}__${mode.id},${variable.variableMeta.name},${mode.value},${variable.variableMeta.type}`;
    csv.push(row);
  });
  csv = csv.join("\n");
  figma.ui.postMessage({ type: "EXPORT_RESULT", fileType: "CSV", result: csv });
}
