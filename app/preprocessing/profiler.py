# app/preprocessing/profiler.py
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from sklearn.feature_selection import SelectKBest, f_classif
from category_encoders import TargetEncoder, OrdinalEncoder

class DataProfiler:
    def __init__(self):
        self.profile = {}
        
    def analyze_dataset(self, df: pd.DataFrame) -> Dict:
        """Generate comprehensive data profile"""
        profile = {
            'shape': df.shape,
            'missing_values': df.isnull().sum().to_dict(),
            'dtypes': df.dtypes.to_dict(),
            'numeric_cols': df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_cols': df.select_dtypes(include=['object']).columns.tolist(),
            'datetime_cols': df.select_dtypes(include=['datetime64']).columns.tolist(),
            'high_cardinality': [col for col in df.columns if df[col].nunique() > 50],
            'outliers': self._detect_outliers(df),
            'correlations': self._compute_correlations(df),
            'recommendations': self._generate_recommendations(df)
        }
        return profile
        
    def _detect_outliers(self, df: pd.DataFrame) -> Dict:
        """Detect outliers using IQR method"""
        outliers = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            Q1, Q3 = df[col].quantile([0.25, 0.75])
            IQR = Q3 - Q1
            lower, upper = Q1 - 1.5*IQR, Q3 + 1.5*IQR
            outliers[col] = len(df[(df[col] < lower) | (df[col] > upper)])
        return outliers
        
    def _compute_correlations(self, df: pd.DataFrame) -> Dict:
        """Compute feature correlations"""
        numeric_df = df.select_dtypes(include=[np.number])
        return numeric_df.corr().to_dict() if len(numeric_df.columns) > 1 else {}
        
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate automated feature engineering recommendations"""
        recommendations = []
        
        # Check for datetime columns
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                recommendations.append(f"Extract datetime features from {col}")
                
        # Check for high cardinality categoricals
        for col in df.select_dtypes(include=['object']).columns:
            if df[col].nunique() > 20:
                recommendations.append(f"Consider target encoding for {col}")
                
        return recommendations

class AutoFeatureEngineer:
    """Automatically generate features based on data type"""
    
    def engineer_features(self, df: pd.DataFrame, target_col: str = None) -> pd.DataFrame:
        df_engineered = df.copy()
        
        # DateTime features
        df_engineered = self._extract_datetime_features(df_engineered)
        
        # Categorical encoding
        df_engineered = self._encode_categoricals(df_engineered, target_col)
        
        # Numeric feature interactions
        df_engineered = self._create_feature_interactions(df_engineered)
        
        # Text features if present
        df_engineered = self._extract_text_features(df_engineered)
        
        return df_engineered
        
    def _extract_datetime_features(self, df: pd.DataFrame) -> pd.DataFrame:
        for col in df.columns:
            if df[col].dtype == 'datetime64[ns]' or 'date' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                    df[f'{col}_year'] = df[col].dt.year
                    df[f'{col}_month'] = df[col].dt.month
                    df[f'{col}_dayofweek'] = df[col].dt.dayofweek
                    df[f'{col}_hour'] = df[col].dt.hour
                except:
                    pass
        return df
        
    def _encode_categoricals(self, df: pd.DataFrame, target_col: str = None) -> pd.DataFrame:
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col == target_col:
                continue
                
            if df[col].nunique() < 10:
                # One-hot encode low cardinality
                dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
                df = pd.concat([df, dummies], axis=1)
                df.drop(col, axis=1, inplace=True)
            elif target_col and df[target_col].dtype in ['int64', 'float64']:
                # Target encode high cardinality
                encoder = TargetEncoder()
                df[f'{col}_encoded'] = encoder.fit_transform(df[col], df[target_col])
                df.drop(col, axis=1, inplace=True)
                
        return df
        
    def _create_feature_interactions(self, df: pd.DataFrame) -> pd.DataFrame:
        numeric_cols = df.select_dtypes(include=[np.number]).columns[:5]  # Limit to avoid explosion
        
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                # Polynomial features
                df[f'{col1}_x_{col2}'] = df[col1] * df[col2]
                df[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-8)
                
        return df
        
    def _extract_text_features(self, df: pd.DataFrame) -> pd.DataFrame:
        text_cols = [col for col in df.columns if df[col].dtype == 'object' 
                    and df[col].str.len().mean() > 20]  # Likely text columns
                    
        for col in text_cols:
            df[f'{col}_length'] = df[col].astype(str).str.len()
            df[f'{col}_word_count'] = df[col].astype(str).str.split().str.len()
            df[f'{col}_unique_words'] = df[col].astype(str).apply(lambda x: len(set(x.split())))
            
        return df
