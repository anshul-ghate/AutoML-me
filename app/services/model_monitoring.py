"""
model_monitoring.py - Production Drift Detection with Evidently AI (Python 3.12 Compatible)
"""
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset, DataQualityPreset
import pandas as pd
from typing import Dict, Any
import json

class ModelDriftMonitor:
    def __init__(self):
        self.reference_data = {}
    
    def set_reference_data(self, session_id: str, df: pd.DataFrame):
        """Store reference data for drift comparison"""
        self.reference_data[session_id] = df.copy()
    
    def detect_drift(self, session_id: str, current_df: pd.DataFrame) -> Dict[str, Any]:
        """Real drift detection using Evidently AI"""
        if session_id not in self.reference_data:
            return {"error": "No reference data found. Upload baseline data first."}
        
        reference = self.reference_data[session_id]
        
        # Create drift report
        report = Report(metrics=[
            DataDriftPreset(),
            DataQualityPreset()
        ])
        
        try:
            report.run(reference_data=reference, current_data=current_df)
            result_dict = report.as_dict()
            
            # Extract key metrics
            drift_detected = False
            drifted_features = []
            drift_score = 0.0
            
            # Parse Evidently output
            if 'metrics' in result_dict:
                for metric in result_dict['metrics']:
                    if 'result' in metric:
                        # Check for dataset drift
                        if 'dataset_drift' in metric['result']:
                            drift_detected = metric['result']['dataset_drift']
                        
                        # Check for drift score
                        if 'drift_score' in metric['result']:
                            drift_score = metric['result'].get('drift_score', 0)
                            if drift_score > 0.1:
                                drift_detected = True
                        
                        # Collect drifted features
                        if 'drift_by_columns' in metric['result']:
                            for col, drift_info in metric['result']['drift_by_columns'].items():
                                if isinstance(drift_info, dict) and drift_info.get('drift_detected', False):
                                    drifted_features.append(col)
            
            return {
                "drift_detected": drift_detected,
                "drifted_features": drifted_features,
                "drift_score": drift_score,
                "timestamp": pd.Timestamp.utcnow().isoformat(),
                "full_report": result_dict
            }
            
        except Exception as e:
            return {
                "error": f"Drift detection failed: {str(e)}",
                "drift_detected": False,
                "drifted_features": [],
                "drift_score": 0.0,
                "timestamp": pd.Timestamp.utcnow().isoformat()
            }

# Global instance
_monitor = None

def get_drift_monitor() -> ModelDriftMonitor:
    global _monitor
    if _monitor is None:
        _monitor = ModelDriftMonitor()
    return _monitor
