# Heat Signal Submission Guide

## Dashboard

- Live dashboard: https://perumal100.github.io/Heat-Signal/
- Repository: https://github.com/Perumal100/Heat-Signal
- Dashboard tool: D3.js
- Hosting platform: GitHub Pages
- Deployment method: GitHub Actions
- Data source: NYC Open Data 311 Service Requests from 2020 to Present

## Technical implementation

The dashboard is built with HTML, CSS, JavaScript, and D3.js. Python prepares the compact browser data files from the NYC Open Data extract. A shared filter state connects the monthly chart, borough comparison, reported scope chart, weekday-hour heatmap, KPI strip, and active filter chips.

## Dashboard evidence

The dashboard includes four coordinated views.

1. Monthly reports by borough uses ordered month position, stacked bar length, and borough hue.
2. Borough concentration uses aligned bar length for reports per 10,000 renter-occupied homes.
3. Reported scope uses bar length, neutral category styling, and a direct answer to the third research question.
4. The weekday-hour heatmap uses ordered position and sequential orange lightness for request count.

Selecting a mark filters the other views and the KPI strip. Hover provides exact values, filter chips show the active selection, and Clear all restores the complete 2024 view.

## Files to submit

- Source code and dashboard files in this repository.
- Hosted dashboard link.
- `docs/FINAL_REFLECTION.md` or the formatted reflection document.
- Completed usability test report based on `docs/USABILITY_TEST_REPORT_TEMPLATE.md`.
- Two or three annotated screenshots, or a 60-second screen recording.

## Final checks before upload

- Confirm the dashboard opens from the GitHub Pages link.
- Confirm each of the four views filters the others.
- Complete two real peer sessions and enter observations, quotes, findings, and actions in the usability report.
- Record the greyscale and color-vision checks in the report.
- Export the reflection as one page.
- Include the hosted dashboard link, source repository link, and final documentation in the course portal.

