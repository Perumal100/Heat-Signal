"""Prepare an exact compact data cube from the 264,750-record NYC 311 extract."""
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen
import json

ENDPOINT = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"
WHERE = "complaint_type = 'HEAT/HOT WATER' AND created_date between '2024-01-01T00:00:00' and '2024-12-31T23:59:59'"
SELECT = "date_extract_m(created_date) as month,borough,descriptor,date_extract_dow(created_date) as dow,date_extract_hh(created_date) as hour,status,count(*) as n"
GROUP = "date_extract_m(created_date),borough,descriptor,date_extract_dow(created_date),date_extract_hh(created_date),status"
BOROUGHS = ["BRONX", "BROOKLYN", "MANHATTAN", "QUEENS", "STATEN ISLAND", "Unspecified"]

def get_page(offset):
    query = urlencode({"$select": SELECT, "$where": WHERE, "$group": GROUP, "$limit": 50000, "$offset": offset})
    with urlopen(f"{ENDPOINT}?{query}", timeout=180) as response:
        return json.load(response)

def main():
    rows, offset = [], 0
    while True:
        page = get_page(offset)
        rows.extend(page)
        print(f"Downloaded {len(rows):,} aggregate cells", flush=True)
        if len(page) < 50000: break
        offset += len(page)
    borough_index = {value:index for index,value in enumerate(BOROUGHS)}
    statuses = sorted({row.get("status", "Unspecified") for row in rows})
    status_index = {value:index for index,value in enumerate(statuses)}
    # Socrata's DOW is Sunday=0. The dashboard is Monday-first.
    compact = []
    for row in rows:
        borough = borough_index.get(row.get("borough", "").upper(), 5)
        scope = 0 if row["descriptor"] == "ENTIRE BUILDING" else 1
        weekday = (int(row["dow"]) - 1) % 7
        compact.append([int(row["month"]), borough, scope, weekday, int(row["hour"]), status_index[row.get("status", "Unspecified")], int(row["n"])])
    total = sum(row[6] for row in compact)
    if total != 264750: raise ValueError(f"Expected 264,750 records, received {total:,}")
    output = Path(__file__).parent / "dist" / "data"; output.mkdir(parents=True, exist_ok=True)
    (output / "requests.json").write_text(json.dumps(compact,separators=(",",":")), encoding="utf-8")
    meta = {"title":"NYC 311 Heat / Hot Water Requests - 2024","records":total,"source":"NYC Open Data - 311 Service Requests from 2020 to Present (erm2-nwe9)","sourceUrl":"https://data.cityofnewyork.us/d/erm2-nwe9","query":WHERE,"fields":["unique_key","created_date","borough","descriptor","status","incident_zip"],"cleaning":"Kept every calendar-year 2024 HEAT/HOT WATER request, normalized non-five-borough values to Unspecified, and aggregated the full extract by month, borough, reported scope, weekday, hour, and status for responsive browser-side filtering.","boroughs":BOROUGHS,"scopes":["Entire building","Apartment only"],"weekdays":["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],"statuses":statuses,"aggregateCells":len(compact)}
    (output / "meta.json").write_text(json.dumps(meta,indent=2),encoding="utf-8")
    print(f"Wrote {total:,} real requests in {len(compact):,} aggregate cells.", flush=True)
if __name__ == "__main__": main()

