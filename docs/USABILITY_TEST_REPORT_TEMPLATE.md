# Heat Signal Usability Test Report

## Purpose and method

This report is ready for two final peer sessions. Each peer should use the deployed dashboard without coaching other than the three tasks below. Record verbatim comments, observed behavior, completion time, errors, and any moments of hesitation. Do not replace the blank observation fields with assumed results; this deliverable must reflect real sessions.

**Dashboard:** Heat Signal, NYC 311 HEAT/HOT WATER reports, 2024  
**Participant criteria:** two peers who have not previously used the dashboard  
**Materials:** deployed dashboard, this task sheet, and a stopwatch  
**Moderator opening:** “This dashboard shows 2024 NYC 311 heat and hot-water reports. Please think aloud. I am testing the design, not you. You may stop or skip any task.”

## Tasks given to each participant

1. Identify the month or months with the strongest report volume in the full 2024 view. Explain what in the chart supports your answer.
2. Find the borough with the highest report rate per 10,000 renter-occupied homes, then select Brooklyn and describe what changes elsewhere on the page.
3. With a borough or month selected, determine whether “Entire building” or “Apartment only” is the more common reported scope and give its share. Then clear the selection.

## Participant 1 raw observations

**Participant code:** __________  **Date:** __________  **Prior data-viz experience:** __________

| Task | Completion / time | What the participant did or said | Observed issue | Severity 1-3 |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

Direct quotes or unexpected behavior:

____________________________________________________________________________

## Participant 2 raw observations

**Participant code:** __________  **Date:** __________  **Prior data-viz experience:** __________

| Task | Completion / time | What the participant did or said | Observed issue | Severity 1-3 |
| --- | --- | --- | --- | --- |
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

Direct quotes or unexpected behavior:

____________________________________________________________________________

## Prototype-review changes already implemented

| Finding from prototype review | Final dashboard response | Evidence to capture in the peer test |
| --- | --- | --- |
| The heatmap implied a midpoint through a multi-hue/diverging treatment. | Replaced with a single-hue lightness scale and dynamic 0-mid-max legend in requests per weekday-hour cell. | Ask whether participants can identify lower and higher cells and explain the legend. |
| Borough and scope colors were reused with different meanings. | Boroughs now use stable categorical hues; scope categories use neutral gray bars with direct labels. | Ask whether the participant can explain each palette without confusing its meaning. |
| Raw borough totals could reflect borough size. | Borough comparison now uses reports per 10,000 renter-occupied homes; raw counts remain in hover detail. | Ask whether the participant can state what the borough metric means. |
| RQ3 was not obvious from the charts. | A live RQ3 sentence states the leading reported scope and share for the current selection. | Verify that the participant can answer Task 3 without calculating. |
| The opening treatment delayed analysis. | Hero height was reduced so the lens, KPI strip, and first chart appear earlier. | Record whether the participant finds the first analytical action quickly. |

## Findings and final changes after both sessions

Complete this section only after the two real sessions.

| Issue | Evidence from participant(s) | Change made | Before / after evidence |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## Accessibility check

Before submission, record the result of both checks.

| Check | Result | Action taken if needed |
| --- | --- | --- |
| Greyscale view: ordinal heatmap remains readable by lightness and scope categories remain labeled |  |  |
| Color-vision simulation: borough labels and neutral scope labels retain meaning without hue alone |  |  |

