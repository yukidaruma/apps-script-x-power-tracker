const sheets = SpreadsheetApp.getActive();

export const getSheetByName = (name: string) => {
  const sheet = sheets.getSheetByName(name);
  if (!sheet) {
    throw new Error(`Failed to find sheet ${name}.`);
  }

  return sheet;
};

/**
 * @param name name of the sheet
 * @param defaultDataFunc Function that supplies default data for when the sheet is created
 */
export const createSheetIfNotExists = (name: string, defaultDataFunc?: () => any[][]) => {
  let sheet = sheets.getSheetByName(name);
  if (!sheet) {
    sheet = sheets.insertSheet(name);
    if (defaultDataFunc) {
      const defaultData = defaultDataFunc();
      sheet
        .getRange(
          1,
          1,
          defaultData.length,
          defaultData[0].length, // Assume array is rectangular
        )
        .setValues(defaultData);
    }
  }

  return sheet;
};

export const getLastRowData = <T = any>(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  col = 0,
): T[] | null => {
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(lastRow, col).getValues();
  if (values.length) {
    return values[0] as T[];
  }

  return null;
};
