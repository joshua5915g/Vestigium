@echo off
echo ========================================================
echo [VESTIGIUM] Running Phase 2 Threat Extraction Pipeline
echo ========================================================
cd /d %~dp0
python -m pip install -r requirements.txt
python run_pipeline.py --provider mock --count 4
pause
