@echo off
echo Starting Heat Signal at http://localhost:8000
start "" http://localhost:8000
python -m http.server 8000 --directory dist

