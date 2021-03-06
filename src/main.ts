import { XPowerRankingSummary } from '@splatoon-stats/types';
import { rankedRuleKeys } from '@splatoon-stats/types/src/enum';
import { createSheetIfNotExists, getSheetByName } from './gas';
import { createSplatnetRequest, getRankingRange } from './splatnet';
import { PlayersRow } from './types';

const NOW = new Date();
const TODAY = new Date(NOW);

// Round date to start of hour
TODAY.setUTCMinutes(0);
TODAY.setUTCSeconds(0);
TODAY.setUTCMilliseconds(0);

// If the script executed at the start of the day, it should update last record.
if (TODAY.getHours() === 0) {
  TODAY.setUTCDate(TODAY.getDate() - 1);
}

const playersSheet = getSheetByName('Players');
// Hide players sheet if visible
if (playersSheet.isSheetHidden()) {
  playersSheet.hideSheet();
}

const players = (playersSheet.getDataRange().getValues() as PlayersRow[]).filter(
  // Skip for inactive player
  ([, , isInactive]) => !isInactive,
);

console.log(`Fetching X Rankings of ${players.length} player(s).`);

const rankingURL = `x_power_ranking/${getRankingRange(NOW)}/summary`;
const requests = players.map(([_, iksm]) => createSplatnetRequest(rankingURL, iksm));
const responses = UrlFetchApp.fetchAll(requests);

responses.forEach((res, playerIndex) => {
  const playerName = players[playerIndex][0];
  const mySheetName = `${playerName}_${NOW.getFullYear()}/${NOW.getMonth() + 1}`;
  const mySheet = createSheetIfNotExists(mySheetName, () => [[null, ...rankedRuleKeys]]);
  const lastRowIndex = mySheet.getLastRow();
  const data = JSON.parse(res.getContentText()) as XPowerRankingSummary;
  const powers = rankedRuleKeys.map((key) => data[key].my_ranking?.x_power ?? null);
  const rowData = [Utilities.formatDate(TODAY, 'UTC', 'yyyy/MM/dd'), ...powers];
  const lastRow = mySheet.getRange(lastRowIndex, 1, 1, rowData.length);
  const [[lastDate, ...oldPowers]] = lastRow.getValues() as [[Date, ...number[]]];

  let updated = false;

  if (lastDate && lastDate.getDate() === TODAY.getDate()) {
    // Update if exists

    if (oldPowers.every((value, i) => value === powers[i])) {
      console.log(`${playerName}: Power has not changed since last update.`);
    } else {
      updated = true;
      console.log(`${playerName}: Updating row ${lastRowIndex}.`);
      lastRow.setValues([rowData]);
    }
  } else {
    updated = true;

    // Insert if not exist
    console.log(`${playerName}: Inserting row at ${lastRowIndex + 1}.`);
    mySheet.appendRow(rowData);
  }

  if (updated) {
    console.log(`${playerName}: Updated record: ${powers.join(', ')}.`);
  }
});
