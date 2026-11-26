const $ = (selector) => document.querySelector(selector);
const fmt = new Intl.NumberFormat('en-US');
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Stable, colorblind-considered borough identity colors (Okabe-Ito inspired).
// Scope categories intentionally use neutral grays below, never these colors.
const boroughColors = ['#0072B2', '#E69F00', '#009E73', '#56B4E9', '#CC79A7', '#77838A'];
const scopeColors = ['#344E5C', '#AAB7BE'];

// 2023 NYCHVS renter-occupied units. These denominators contextualize reports;
// they do not turn 311 reports into a diagnosis of housing conditions.
const renterHomes2023 = [436800, 727800, 613300, 481000, 64590];

const state = { months: new Set(), boroughs: new Set(), scopes: new Set(), slots: new Set() };
const sharedBorough = new URLSearchParams(window.location.search).get('borough');
const sharedSection = new URLSearchParams(window.location.search).get('section');
if (/^\d+$/.test(sharedBorough || '') && Number(sharedBorough) < boroughColors.length) state.boroughs.add(Number(sharedBorough));
let records, meta;

function selected(set, value) { return !set.size || set.has(value); }
function matches(record, omit = '') {
  return (omit === 'month' || selected(state.months, record[0])) &&
    (omit === 'borough' || selected(state.boroughs, record[1])) &&
    (omit === 'scope' || selected(state.scopes, record[2])) &&
    (omit === 'slot' || selected(state.slots, `${record[3]}-${record[4]}`));
}
function countBy(length, index, omit) {
  const counts = Array(length).fill(0);
  for (const record of records) if (matches(record, omit)) counts[record[index]] += record[6];
  return counts;
}
function countSlots() {
  const counts = Array(168).fill(0);
  for (const record of records) if (matches(record, 'slot')) counts[record[3] * 24 + record[4]] += record[6];
  return counts;
}
function total() { let value = 0; for (const record of records) if (matches(record)) value += record[6]; return value; }
function topIndex(values) { return values.reduce((best, value, index) => value > values[best] ? index : best, 0); }
function esc(value) { return String(value).replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[character])); }
function toggle(key, value) { state[key].has(value) ? state[key].delete(value) : state[key].add(value); render(); }
function tip(text, event) {
  const element = $('#tooltip');
  element.innerHTML = text;
  element.classList.add('visible');
  element.style.left = `${event.clientX + 13}px`;
  element.style.top = `${event.clientY + 13}px`;
}
function hideTip() { $('#tooltip').classList.remove('visible'); }
function bindMarks(container) {
  container.querySelectorAll('[data-key]').forEach(element => {
    const value = Number.isNaN(+element.dataset.value) ? element.dataset.value : +element.dataset.value;
    element.addEventListener('click', () => toggle(element.dataset.key, value));
    element.addEventListener('mousemove', event => tip(element.dataset.tip, event));
    element.addEventListener('mouseleave', hideTip);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); }
    });
  });
}

function renderChips() {
  const labels = [];
  state.months.forEach(value => labels.push(['months', value, monthNames[value - 1]]));
  state.boroughs.forEach(value => labels.push(['boroughs', value, meta.boroughs[value]]));
  state.scopes.forEach(value => labels.push(['scopes', value, meta.scopes[value]]));
  state.slots.forEach(value => {
    const [weekday, hour] = value.split('-');
    labels.push(['slots', value, `${meta.weekdays[weekday]} ${String(hour).padStart(2, '0')}:00`]);
  });
  $('#chips').innerHTML = labels.length
    ? labels.map(([key, value, label]) => `<button class="chip" type="button" data-remove="${key}" data-value="${value}">${esc(label)} ×</button>`).join('')
    : '<span class="chip">All 2024 requests</span>';
  $('#chips').querySelectorAll('[data-remove]').forEach(button => {
    button.onclick = () => { state[button.dataset.remove].delete(Number.isNaN(+button.dataset.value) ? button.dataset.value : +button.dataset.value); render(); };
  });
  $('#clear').disabled = !labels.length;
}

function renderKPIs() {
  const all = total();
  const boroughs = countBy(meta.boroughs.length, 1);
  const slots = countSlots();
  const statuses = countBy(meta.statuses.length, 5);
  const closed = statuses.reduce((value, count, index) => value + (meta.statuses[index] === 'Closed' ? count : 0), 0);
  const peak = topIndex(slots);
  $('#kpis').innerHTML = `<article class="kpi"><b>${fmt.format(all)}</b><span>reports in this view</span></article>
    <article class="kpi"><b>${esc(meta.boroughs[topIndex(boroughs)])}</b><span>largest raw report total</span></article>
    <article class="kpi"><b>${meta.weekdays[Math.floor(peak / 24)]} ${String(peak % 24).padStart(2, '0')}:00</b><span>busiest weekday-hour cell</span></article>
    <article class="kpi"><b>${all ? Math.round(closed / all * 100) : 0}%</b><span>marked closed</span></article>`;
}

function renderMonthly() {
  const counts = Array.from({ length: 12 }, () => Array(meta.boroughs.length).fill(0));
  for (const record of records) if (matches(record, 'month')) counts[record[0] - 1][record[1]] += record[6];
  const max = Math.max(...counts.map(row => row.reduce((sum, value) => sum + value, 0)), 1);
  const width = 1000, height = 270, left = 42, bottom = 28, top = 10, plotHeight = height - bottom - top;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Monthly 2024 report totals stacked by borough">`;
  for (let index = 0; index < 4; index += 1) {
    const y = top + plotHeight - (index / 3) * plotHeight;
    svg += `<line class="gridline" x1="${left}" y1="${y}" x2="${width - 5}" y2="${y}"/><text class="axis-label" x="0" y="${y + 4}">${fmt.format(Math.round(max * index / 3))}</text>`;
  }
  counts.forEach((row, month) => {
    let used = 0;
    row.forEach((count, borough) => {
      const barHeight = count / max * plotHeight;
      const y = top + plotHeight - used - barHeight;
      const selectedClass = state.months.has(month + 1) || state.boroughs.has(borough) ? ' is-selected' : '';
      svg += `<rect class="bar-segment${selectedClass}" tabindex="0" role="button" aria-label="${monthNames[month]}, ${meta.boroughs[borough]}, ${fmt.format(count)} requests" data-key="months" data-value="${month + 1}" data-tip="<b>${monthNames[month]} ${esc(meta.boroughs[borough])}</b><br>${fmt.format(count)} requests" x="${left + month * 78}" y="${y}" width="53" height="${barHeight}" fill="${boroughColors[borough]}"/>`;
      used += barHeight;
    });
    svg += `<text class="axis-label" x="${left + month * 78 + 26}" y="${height - 7}" text-anchor="middle">${monthNames[month]}</text>`;
  });
  svg += '</svg>';
  $('#monthly').innerHTML = svg;
  $('#borough-legend').innerHTML = meta.boroughs.map((borough, index) => `<button type="button" data-key="boroughs" data-value="${index}" data-tip="Filter: ${esc(borough)}"><i style="background:${boroughColors[index]}"></i>${esc(borough)}</button>`).join('');
  bindMarks($('#monthly'));
  bindMarks($('#borough-legend'));
}

function renderBars(id, labels, values, key, colors, options = {}) {
  const max = Math.max(...values, 1), width = 520, height = Math.max(150, labels.length * 36 + 22), left = 128;
  let svg = `<svg viewBox="0 0 ${width} ${height}" role="img">`;
  labels.forEach((label, index) => {
    const y = 12 + index * 36;
    const barWidth = values[index] / max * (width - left - 58);
    const selectedClass = state[key].has(index) ? ' is-selected' : '';
    const valueLabel = options.formatValue ? options.formatValue(values[index]) : fmt.format(values[index]);
    const tooltipValue = options.tooltipValue ? options.tooltipValue(values[index], index) : `${fmt.format(values[index])} requests`;
    svg += `<text class="bar-label" x="${left - 9}" y="${y + 17}" text-anchor="end">${esc(label)}</text><rect class="bar-row${selectedClass}" tabindex="0" role="button" aria-label="${esc(label)}, ${tooltipValue}" data-key="${key}" data-value="${index}" data-tip="<b>${esc(label)}</b><br>${tooltipValue}" x="${left}" y="${y}" width="${barWidth}" height="24" rx="3" fill="${colors[index] || '#73838a'}"/><text class="bar-value" x="${left + barWidth + 7}" y="${y + 17}">${valueLabel}</text>`;
  });
  svg += '</svg>';
  $(id).innerHTML = svg;
  bindMarks($(id));
}

function renderBoroughRates() {
  const rawCounts = countBy(meta.boroughs.length, 1, 'borough').slice(0, 5);
  const rates = rawCounts.map((count, index) => count / renterHomes2023[index] * 10000);
  renderBars('#borough', meta.boroughs.slice(0, 5), rates, 'boroughs', boroughColors.slice(0, 5), {
    formatValue: value => value.toFixed(0),
    tooltipValue: (value, index) => `${value.toFixed(1)} reports per 10,000 renter homes<br>${fmt.format(rawCounts[index])} raw reports`
  });
}

function renderScope() {
  const counts = countBy(meta.scopes.length, 2, 'scope');
  renderBars('#scope', meta.scopes, counts, 'scopes', scopeColors);
  const top = topIndex(counts), all = counts.reduce((sum, count) => sum + count, 0), percentage = all ? Math.round(counts[top] / all * 100) : 0;
  $('#scope-answer').innerHTML = all
    ? `<strong>Answer to RQ3:</strong> ${esc(meta.scopes[top])} is the more common reported scope in this view (${percentage}% of ${fmt.format(all)} reports). Change month or borough to compare the pattern.`
    : 'No reports match this selection.';
}

function heatColor(value, maximum) {
  const proportion = maximum ? value / maximum : 0;
  // Constant hue and saturation; lightness alone encodes ordered report volume.
  return d3.hsl(24, 72, 97 - proportion * 57).formatHex();
}

function renderHeatLegend(maximum) {
  const values = [0, Math.round(maximum / 2), maximum];
  $('#heat-scale').innerHTML = `<span>Requests in one weekday-hour cell</span><span class="legend-ramp" aria-hidden="true"></span>${values.map(value => `<span class="heat-legend-item"><i style="background:${heatColor(value, maximum)}"></i>${fmt.format(value)}</span>`).join('')}`;
}

function renderHeatmap() {
  const values = countSlots(), maximum = d3.max(values) || 1;
  const grid = d3.select('#heatmap').html('').append('div').attr('class', 'heat-grid');
  grid.append('span');
  grid.selectAll('.hour-label').data(d3.range(24)).join('span').attr('class', 'hour-label').text(hour => hour);
  meta.weekdays.forEach((day, weekday) => {
    grid.append('span').attr('class', 'heat-label').text(day);
    grid.selectAll(`.d3-day-${weekday}`)
      .data(d3.range(24).map(hour => ({ weekday, hour, value: values[weekday * 24 + hour] })))
      .join('button')
      .attr('class', item => `heatcell d3-day-${weekday}${state.slots.has(`${item.weekday}-${item.hour}`) ? ' is-selected' : ''}`)
      .attr('type', 'button')
      .attr('aria-label', item => `${day} ${item.hour}:00, ${fmt.format(item.value)} requests`)
      .style('background', item => heatColor(item.value, maximum))
      .on('click', (event, item) => toggle('slots', `${item.weekday}-${item.hour}`))
      .on('mousemove', (event, item) => tip(`<b>${day} ${String(item.hour).padStart(2, '0')}:00</b><br>${fmt.format(item.value)} requests`, event))
      .on('mouseleave', hideTip);
  });
  renderHeatLegend(maximum);
}

function render() {
  renderChips();
  renderKPIs();
  renderMonthly();
  renderBoroughRates();
  renderScope();
  renderHeatmap();
}

Promise.all([fetch('data/requests.json').then(response => response.json()), fetch('data/meta.json').then(response => response.json())])
  .then(([loadedRecords, loadedMeta]) => {
    records = loadedRecords;
    meta = loadedMeta;
    $('#source-count').textContent = `${fmt.format(meta.records)} requests loaded`;
    $('#method-text').textContent = `This dashboard loads all ${fmt.format(meta.records)} records in a fixed 2024 extract, then aggregates in the browser when you select a mark. ${meta.cleaning} The borough comparison uses 2023 NYC Housing and Vacancy Survey renter-occupied homes as a transparent denominator. The weekday-hour heatmap is rendered with D3.js using data joins and a one-hue lightness scale.`;
    $('#clear').onclick = () => { Object.values(state).forEach(set => set.clear()); render(); };
    render();
    if (sharedSection === 'borough' || sharedSection === 'heatmap') requestAnimationFrame(() => document.querySelector(sharedSection === 'borough' ? '.twoup' : '.heat-panel')?.scrollIntoView({ block: 'start' }));
  })
  .catch(error => {
    $('#source-count').textContent = 'Data could not load';
    $('#method-text').textContent = `The prepared request extract is unavailable: ${error.message}`;
    console.error(error);
  });

