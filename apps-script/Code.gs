/**
 * Name Caller Wheel — backend.
 *
 * Runs as a Google Apps Script web app bound to a private spreadsheet.
 * Deploy: Execute as me, anyone with the link. The frontend sends every
 * request as a text/plain POST carrying a key that must match the
 * SECRET_KEY script property. No key, no data.
 *
 * Tabs (created automatically if missing): Roster, Log, State, Settings.
 * See sheet-template.md for the layout.
 */

const TAB_HEADERS = {
  Roster: ['Class', 'Student', 'Active'],
  Log: ['Timestamp', 'Class', 'Student', 'Method', 'Note'],
  State: ['Key', 'Value', 'UpdatedAt'],
  Settings: ['Key', 'Value']
};

function doGet() {
  return json({ ok: true, service: 'name-caller-wheel' });
}

function doPost(e) {
  const secret = PropertiesService.getScriptProperties().getProperty('SECRET_KEY');
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return json({ error: 'bad request' });
  }
  if (!secret || req.key !== secret) return json({ error: 'unauthorized' });

  const handlers = {
    getData: getData,
    logCall: logCall,
    setActive: setActive,
    resetRound: resetRound,
    saveSettings: saveSettings,
    setState: setState,
    getState: getState
  };
  const handler = handlers[req.action];
  if (!handler) return json({ error: 'unknown action' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return json(handler(req));
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Actions ---------- */

function getData() {
  const rows = sheet('Roster').getDataRange().getValues().slice(1);
  const classes = [];
  const rosters = {};
  for (const [cls, student, active] of rows) {
    const className = String(cls).trim();
    const name = String(student).trim();
    if (!className || !name) continue;
    if (!rosters[className]) {
      classes.push(className);
      rosters[className] = [];
    }
    rosters[className].push({ name: name, active: isTrue(active) });
  }
  return {
    classes: classes,
    rosters: rosters,
    called: calledLists(classes),
    settings: readSettings(),
    state: { currentClass: readState('currentClass') }
  };
}

function logCall(req) {
  sheet('Log').appendRow([new Date(), req.className, req.student, req.method, '']);
  const called = readCalled(req.className);
  if (called.indexOf(req.student) < 0) called.push(req.student);
  writeState('called:' + req.className, JSON.stringify(called));
  return { ok: true };
}

function setActive(req) {
  const tab = sheet('Roster');
  const rows = tab.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === req.className && String(rows[i][1]).trim() === req.student) {
      tab.getRange(i + 1, 3).setValue(req.active === true);
      return { ok: true };
    }
  }
  return { ok: false };
}

function resetRound(req) {
  writeState('called:' + req.className, '[]');
  sheet('Log').appendRow([new Date(), req.className, '', 'reset', '']);
  return { ok: true };
}

function saveSettings(req) {
  const tab = sheet('Settings');
  const rows = tab.getDataRange().getValues();
  const rowFor = {};
  for (let i = 1; i < rows.length; i++) {
    const key = String(rows[i][0]).trim();
    if (key) rowFor[key] = i + 1;
  }
  Object.keys(req.settings).forEach(function (key) {
    if (rowFor[key]) tab.getRange(rowFor[key], 2).setValue(req.settings[key]);
    else tab.appendRow([key, req.settings[key]]);
  });
  return { ok: true };
}

function setState(req) {
  writeState(req.stateKey, req.value);
  return { ok: true };
}

function getState(req) {
  return { value: readState(req.stateKey) };
}

/* ---------- Sheet access ---------- */

function sheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let tab = ss.getSheetByName(name);
  if (!tab) {
    tab = ss.insertSheet(name);
    tab.appendRow(TAB_HEADERS[name]);
  }
  return tab;
}

function readState(key) {
  const rows = sheet('State').getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === key) return rows[i][1] === '' ? null : String(rows[i][1]);
  }
  return null;
}

function writeState(key, value) {
  const tab = sheet('State');
  const rows = tab.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === key) {
      tab.getRange(i + 1, 2, 1, 2).setValues([[value, new Date()]]);
      return;
    }
  }
  tab.appendRow([key, value, new Date()]);
}

function readCalled(className) {
  const raw = readState('called:' + className);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function calledLists(classes) {
  const called = {};
  classes.forEach(function (className) {
    called[className] = readCalled(className);
  });
  return called;
}

function readSettings() {
  const rows = sheet('Settings').getDataRange().getValues();
  const raw = {};
  for (let i = 1; i < rows.length; i++) {
    const key = String(rows[i][0]).trim();
    if (key) raw[key] = rows[i][1];
  }
  return {
    spinSeconds: Number(raw.spinSeconds) || 5,
    palette: String(raw.palette || 'carnival'),
    confetti: raw.confetti === undefined ? true : isTrue(raw.confetti),
    sound: isTrue(raw.sound),
    pollSeconds: Number(raw.pollSeconds) || 2
  };
}

function isTrue(value) {
  return value === true || String(value).trim().toUpperCase() === 'TRUE';
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
