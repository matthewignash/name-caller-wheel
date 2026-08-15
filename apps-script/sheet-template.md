# Spreadsheet layout

One private Google Sheet, four tabs. Tab names and headers must match exactly —
but you only need to create **Roster** yourself: the backend creates any missing
tab (with headers) the first time it needs one.

## Roster — you fill this in

| Class  | Student  | Active |
| ------ | -------- | ------ |
| Bio 9A | Aanya K. | TRUE   |
| Bio 9A | Ben O.   | TRUE   |
| Chem 11| Diego A. | TRUE   |

- One row per student. The Class column drives the class picker.
- Use first name + last initial — the wheel shows exactly what you type here.
- Active is the master toggle (long absence, left the school). Tip: select the
  column and use Insert → Checkbox. The teacher view can flip it remotely.

## Log — written by the app, yours to annotate

| Timestamp        | Class  | Student  | Method | Note |
| ---------------- | ------ | -------- | ------ | ---- |
| 2026-08-18 09:14 | Bio 9A | Aanya K. | spin   |      |
| 2026-08-18 09:16 | Bio 9A | Ben O.   | pick   | quiet all week |

- `spin` = random. `pick` = you chose them deliberately. `reset` rows mark the
  start of a new round.
- Note is never read by the app — it is your private column for comment-writing
  and conference prep.

## State — managed by the app, leave it alone

| Key            | Value                | UpdatedAt |
| -------------- | -------------------- | --------- |
| currentClass   | Bio 9A               | …         |
| called:Bio 9A  | ["Aanya K.","Ben O."]| …         |
| command        | {"type":"SPIN", …}   | …         |

Cross-device sync and who-has-been-called tracking. Safe to clear if things
ever look stuck — the app rebuilds it.

## Settings — optional overrides

| Key         | Value    |
| ----------- | -------- |
| spinSeconds | 5        |
| palette     | carnival |
| pickerStyle | wheel    |
| confetti    | TRUE     |
| sound       | FALSE    |
| pollSeconds | 2        |

Created and updated from the app's Settings panel; edit here if you prefer.
