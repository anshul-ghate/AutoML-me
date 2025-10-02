import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.feature_selection import SelectKBest, f_classif
import warnings
warnings.filterwarnings('ignore')

# Handle optional imports gracefully
try:
    from category_encoders import TargetEncoder, OrdinalEncoder
    CATEGORY_ENCODERS_AVAILABLE = True
except ImportError:
    CATEGORY_ENCODERS_AVAILABLE = False
    print("Warning: category-encoders not available. Using fallback encoding.")

class DataProfiler:
    """Enterprise-grade data profiling with comprehensive analysis"""
    
    def __init__(self):
        self.profile = {}
        
    def analyze_dataset(self, df: pd.DataFrame) -> Dict:
        """Generate comprehensive data profile with enterprise features"""
        profile = {
            'shape': df.shape,
            'memory_usage': self._calculate_memory_usage(df),
            'missing_values': df.isnull().sum().to_dict(),
            'missing_percentage': (df.isnull().sum() / len(df) * 100).to_dict(),
            'dtypes': df.dtypes.astype(str).to_dict(),
            'numeric_cols': df.select_dtypes(include=[np.number]).columns.tolist(),
            'categorical_cols': df.select_dtypes(include=['object']).columns.tolist(),
            'datetime_cols': self._detect_datetime_cols(df),
            'high_cardinality': [col for col in df.columns if df[col].nunique() > 50],
            'low_cardinality': [col for col in df.columns if df[col].nunique() <= 10],
            'unique_counts': {col: int(df[col].nunique()) for col in df.columns},
            'outliers': self._detect_outliers(df),
            'correlations': self._compute_correlations(df),
            'feature_importance_estimate': self._estimate_feature_importance(df),
            'data_quality_score': self._calculate_data_quality_score(df),
            'recommendations': self._generate_recommendations(df),
            'statistical_summary': self._generate_statistical_summary(df)
        }
        return profile
    
    def _calculate_memory_usage(self, df: pd.DataFrame) -> Dict:
        """Calculate memory usage statistics"""
        memory_usage = df.memory_usage(deep=True)
        return {
            'total_mb': float(memory_usage.sum() / 1024**2),
            'per_column_mb': {col: float(usage / 1024**2) 
                            for col, usage in memory_usage.items()}
        }
    
    def _detect_datetime_cols(self, df: pd.DataFrame) -> List[str]:
        """Detect potential datetime columns"""
        datetime_cols = []
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                datetime_cols.append(col)
            elif df[col].dtype == 'object':
                # Try to parse a sample
                sample = df[col].dropna().head(100)
                if len(sample) > 0:
                    try:
                        pd.to_datetime(sample, infer_datetime_format=True, errors='coerce')
                        parsed_count = pd.to_datetime(sample, errors='coerce').notna().sum()
                        if parsed_count / len(sample) > 0.8:  # 80% successfully parsed
                            datetime_cols.append(col)
                    except:
                        pass
        return datetime_cols
        
    def _detect_outliers(self, df: pd.DataFrame) -> Dict:
        """Advanced outlier detection using multiple methods"""
        outliers = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            try:
                col_data = df[col].dropna()
                if len(col_data) == 0:
                    outliers[col] = {'iqr': 0, 'zscore': 0, 'isolation_forest': 0}
                    continue
                
                # IQR method
                Q1, Q3 = col_data.quantile([0.25, 0.75])
                IQR = Q3 - Q1
                lower, upper = Q1 - 1.5*IQR, Q3 + 1.5*IQR
                iqr_outliers = len(col_data[(col_data < lower) | (col_data > upper)])
                
                # Z-Score method
                z_scores = np.abs((col_data - col_data.mean()) / col_data.std())
                zscore_outliers = len(z_scores[z_scores > 3])
                
                outliers[col] = {
                    'iqr': iqr_outliers,
                    'zscore': zscore_outliers,
                    'percentage': float(iqr_outliers / len(col_data) * 100)
                }
                
            except Exception as e:
                outliers[col] = {'iqr': 0, 'zscore': 0, 'percentage': 0.0}
                
        return outliers
        
    def _compute_correlations(self, df: pd.DataFrame) -> Dict:
        """Compute comprehensive correlation analysis"""
        try:
            numeric_df = df.select_dtypes(include=[np.number])
            if len(numeric_df.columns) > 1:
                corr_matrix = numeric_df.corr()
                
                # Find highly correlated pairs
                high_corr_pairs = []
                for i in range(len(corr_matrix.columns)):
                    for j in range(i+1, len(corr_matrix.columns)):
                        corr_val = corr_matrix.iloc[i, j]
                        if abs(corr_val) > 0.8 and not pd.isna(corr_val):
                            high_corr_pairs.append({
                                'feature1': corr_matrix.columns[i],
                                'feature2': corr_matrix.columns[j],
                                'correlation': float(corr_val)
                            })
                
                return {
                    'matrix': {col1: {col2: float(corr_matrix.loc[col1, col2]) 
                                     if not pd.isna(corr_matrix.loc[col1, col2]) else 0.0
                                     for col2 in corr_matrix.columns}
                              for col1 in corr_matrix.columns},
                    'high_correlations': high_corr_pairs
                }
        except Exception:
            pass
        return {'matrix': {}, 'high_correlations': []}
    
    def _estimate_feature_importance(self, df: pd.DataFrame) -> Dict:
        """Estimate feature importance for numeric target if available"""
        try:
            # Try to identify potential target columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) < 2:
                return {}
                
            # Assume last numeric column is target
            target_col = numeric_cols[-1]
            feature_cols = numeric_cols[:-1]
            
            if len(feature_cols) > 0:
                X = df[feature_cols].fillna(0)
                y = df[target_col].fillna(0)
                
                # Compute mutual information
                from sklearn.feature_selection import mutual_info_regression
                mi_scores = mutual_info_regression(X, y)
                
                return {
                    'target_column': target_col,
                    'scores': dict(zip(feature_cols, [float(score) for score in mi_scores]))
                }
        except Exception:
            pass
        return {}
    
    def _calculate_data_quality_score(self, df: pd.DataFrame) -> float:
        """Calculate overall data quality score (0-100)"""
        try:
            scores = []
            
            # Completeness score
            completeness = 1 - df.isnull().sum().sum() / (df.shape[0] * df.shape[1])
            scores.append(completeness * 100)
            
            # Uniqueness score (avoiding duplicates)
            uniqueness = 1 - df.duplicated().sum() / len(df)
            scores.append(uniqueness * 100)
            
            # Consistency score (valid data types)
            consistency = 1 - len([col for col in df.columns 
                                 if df[col].dtype == 'object' and 
                                 df[col].str.contains(r'^[\d\s\-\+\(\)\.]+$', na=False).any()]) / df.shape[1]
            scores.append(consistency * 100)
            
            return float(np.mean(scores))
            
        except Exception:
            return 75.0  # Default reasonable score
    
    def _generate_statistical_summary(self, df: pd.DataFrame) -> Dict:
        """Generate comprehensive statistical summary"""
        summary = {}
        
        # Numeric columns summary
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            numeric_summary = df[numeric_cols].describe()
            summary['numeric'] = {
                col: {
                    'mean': float(numeric_summary.loc['mean', col]),
                    'std': float(numeric_summary.loc['std', col]),
                    'min': float(numeric_summary.loc['min', col]),
                    'max': float(numeric_summary.loc['max', col]),
                    'median': float(df[col].median()),
                    'skewness': float(df[col].skew()),
                    'kurtosis': float(df[col].kurtosis())
                } for col in numeric_cols
            }
        
        # Categorical columns summary
        categorical_cols = df.select_dtypes(include=['object']).columns
        if len(categorical_cols) > 0:
            summary['categorical'] = {
                col: {
                    'unique_count': int(df[col].nunique()),
                    'most_frequent': str(df[col].mode().iloc[0]) if len(df[col].mode()) > 0 else 'N/A',
                    'most_frequent_count': int(df[col].value_counts().iloc[0]) if len(df[col]) > 0 else 0
                } for col in categorical_cols
            }
        
        return summary
        
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generate comprehensive automated recommendations"""
        recommendations = []
        
        # Missing value recommendations
        missing_cols = df.columns[df.isnull().sum() > 0].tolist()
        if missing_cols:
            high_missing = [col for col in missing_cols if df[col].isnull().sum() / len(df) > 0.5]
            if high_missing:
                recommendations.append(f"Consider dropping columns with >50% missing values: {', '.join(high_missing[:3])}")
            else:
                recommendations.append(f"Handle missing values in: {', '.join(missing_cols[:3])}")
        
        # Datetime recommendations
        datetime_cols = self._detect_datetime_cols(df)
        if datetime_cols:
            recommendations.append(f"Extract datetime features from: {', '.join(datetime_cols[:3])}")
            
        # High cardinality recommendations
        categorical_cols = df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            unique_count = df[col].nunique()
            if unique_count > 50:
                recommendations.append(f"Apply target encoding for high cardinality: {col}")
            elif unique_count <= 10:
                recommendations.append(f"Apply one-hot encoding for: {col}")
        
        # Correlation recommendations
        correlations = self._compute_correlations(df)
        if correlations.get('high_correlations'):
            high_corr = correlations['high_correlations'][:2]  # Top 2
            for pair in high_corr:
                recommendations.append(f"High correlation detected: {pair['feature1']} ↔ {pair['feature2']} ({pair['correlation']:.2f})")
        
        # Outlier recommendations
        outliers = self._detect_outliers(df)
        high_outlier_cols = [col for col, stats in outliers.items() 
                           if isinstance(stats, dict) and stats.get('percentage', 0) > 10]
        if high_outlier_cols:
            recommendations.append(f"Review outliers in: {', '.join(high_outlier_cols[:3])}")
        
        # Data quality recommendations
        quality_score = self._calculate_data_quality_score(df)
        if quality_score < 70:
            recommendations.append("Data quality score is low. Consider data cleaning.")
        
        return recommendations

class AutoFeatureEngineer:
    """Enterprise-grade automated feature engineering"""
    
    def __init__(self):
        self.transformations_applied = []
        
    def engineer_features(self, df: pd.DataFrame, target_col: Optional[str] = None) -> pd.DataFrame:
        """Apply comprehensive feature engineering pipeline"""
        df_engineered = df.copy()
        self.transformations_applied = []
        
        try:
            # 1. Handle missing values
            df_engineered = self._handle_missing_values(df_engineered)
            
            # 2. Extract datetime features
            df_engineered = self._extract_datetime_features(df_engineered)
            
            # 3. Encode categorical variables
            df_engineered = self._encode_categoricals(df_engineered, target_col)
            
            # 4. Create polynomial features
            df_engineered = self._create_polynomial_features(df_engineered)
            
            # 5. Extract text features
            df_engineered = self._extract_text_features(df_engineered)
            
            # 6. Create interaction features
            df_engineered = self._create_interaction_features(df_engineered)
            
            # 7. Apply feature scaling preparation
            df_engineered = self._prepare_scaling_features(df_engineered)
            
        except Exception as e:
            print(f"Feature engineering warning: {e}")
            return df
            
        return df_engineered
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """Intelligent missing value handling"""
        for col in df.columns:
            missing_pct = df[col].isnull().sum() / len(df)
            
            if missing_pct > 0:
                if df[col].dtype in ['int64', 'float64']:
                    # Numeric: fill with median
                    df[col] = df[col].fillna(df[col].median())
                    self.transformations_applied.append(f"Filled missing values in {col} with median")
                    
                elif df[col].dtype == 'object':
                    # Categorical: fill with mode or 'Unknown'
                    mode_val = df[col].mode()
                    fill_val = mode_val.iloc[0] if len(mode_val) > 0 else 'Unknown'
                    df[col] = df[col].fillna(fill_val)
                    self.transformations_applied.append(f"Filled missing values in {col} with mode/Unknown")
        
        return df
        
    def _extract_datetime_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Advanced datetime feature extraction"""
        datetime_cols = []
        
        # Detect datetime columns
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                datetime_cols.append(col)
            elif df[col].dtype == 'object':
                try:
                    sample = df[col].dropna().head(50)
                    if len(sample) > 0:
                        parsed = pd.to_datetime(sample, errors='coerce')
                        if parsed.notna().sum() / len(sample) > 0.7:
                            datetime_cols.append(col)
                except:
                    pass
        
        # Extract features
        for col in datetime_cols:
            try:
                df[col] = pd.to_datetime(df[col], errors='coerce')
                
                if df[col].dtype == 'datetime64[ns]':
                    # Basic datetime features
                    df[f'{col}_year'] = df[col].dt.year
                    df[f'{col}_month'] = df[col].dt.month
                    df[f'{col}_day'] = df[col].dt.day
                    df[f'{col}_dayofweek'] = df[col].dt.dayofweek
                    df[f'{col}_hour'] = df[col].dt.hour
                    df[f'{col}_quarter'] = df[col].dt.quarter
                    
                    # Advanced datetime features
                    df[f'{col}_is_weekend'] = (df[col].dt.dayofweek >= 5).astype(int)
                    df[f'{col}_is_month_start'] = df[col].dt.is_month_start.astype(int)
                    df[f'{col}_is_month_end'] = df[col].dt.is_month_end.astype(int)
                    df[f'{col}_days_since_epoch'] = (df[col] - pd.Timestamp('1970-01-01')).dt.days
                    
                    self.transformations_applied.append(f"Extracted datetime features from {col}")
                    
            except Exception as e:
                print(f"Error processing datetime column {col}: {e}")
                continue
                
        return df
        
    def _encode_categoricals(self, df: pd.DataFrame, target_col: Optional[str] = None) -> pd.DataFrame:
        """Advanced categorical encoding with multiple strategies"""
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        for col in categorical_cols:
            if col == target_col:
                continue
                
            try:
                unique_count = df[col].nunique()
                
                if unique_count == 1:
                    # Drop constant columns
                    df.drop(col, axis=1, inplace=True)
                    self.transformations_applied.append(f"Dropped constant column: {col}")
                    
                elif unique_count <= 5:
                    # One-hot encode low cardinality
                    dummies = pd.get_dummies(df[col], prefix=col, drop_first=True, dummy_na=True)
                    df = pd.concat([df.drop(col, axis=1), dummies], axis=1)
                    self.transformations_applied.append(f"One-hot encoded: {col}")
                    
                elif unique_count <= 20:
                    # Ordinal encoding for medium cardinality
                    df[f'{col}_encoded'] = pd.Categorical(df[col]).codes
                    df.drop(col, axis=1, inplace=True)
                    self.transformations_applied.append(f"Ordinal encoded: {col}")
                    
                elif CATEGORY_ENCODERS_AVAILABLE and target_col and target_col in df.columns:
                    # Target encoding for high cardinality
                    if df[target_col].dtype in ['int64', 'float64']:
                        encoder = TargetEncoder()
                        df[f'{col}_target_encoded'] = encoder.fit_transform(df[col], df[target_col])
                        df.drop(col, axis=1, inplace=True)
                        self.transformations_applied.append(f"Target encoded: {col}")
                else:
                    # Frequency encoding as fallback
                    freq_map = df[col].value_counts().to_dict()
                    df[f'{col}_frequency'] = df[col].map(freq_map)
                    df.drop(col, axis=1, inplace=True)
                    self.transformations_applied.append(f"Frequency encoded: {col}")
                    
            except Exception as e:
                print(f"Error encoding {col}: {e}")
                continue
                
        return df
        
    def _create_polynomial_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create polynomial and interaction features"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns[:6]  # Limit to prevent explosion
        
        # Square and cube features
        for col in numeric_cols:
            try:
                if df[col].std() > 0:  # Avoid constant columns
                    df[f'{col}_squared'] = df[col] ** 2
                    df[f'{col}_cubed'] = df[col] ** 3
                    df[f'{col}_sqrt'] = np.sqrt(np.abs(df[col]))
                    df[f'{col}_log'] = np.log1p(np.abs(df[col]))
                    
                    self.transformations_applied.append(f"Created polynomial features for: {col}")
            except Exception:
                continue
                
        return df
        
    def _create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create feature interactions"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns[:5]
        
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                try:
                    # Multiplication
                    df[f'{col1}_x_{col2}'] = df[col1] * df[col2]
                    # Division (safe)
                    df[f'{col1}_div_{col2}'] = df[col1] / (df[col2] + 1e-8)
                    # Addition
                    df[f'{col1}_plus_{col2}'] = df[col1] + df[col2]
                    # Subtraction
                    df[f'{col1}_minus_{col2}'] = df[col1] - df[col2]
                    
                    self.transformations_applied.append(f"Created interaction features: {col1} × {col2}")
                except Exception:
                    continue
                    
        return df
        
    def _extract_text_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Advanced text feature extraction"""
        # Identify text columns
        text_cols = []
        for col in df.select_dtypes(include=['object']).columns:
            try:
                avg_length = df[col].astype(str).str.len().mean()
                if avg_length > 20:
                    text_cols.append(col)
            except Exception:
                continue
        
        # Extract comprehensive text features
        for col in text_cols:
            try:
                # Basic text features
                df[f'{col}_length'] = df[col].astype(str).str.len()
                df[f'{col}_word_count'] = df[col].astype(str).str.split().str.len()
                df[f'{col}_char_count'] = df[col].astype(str).str.len()
                df[f'{col}_unique_words'] = df[col].astype(str).apply(
                    lambda x: len(set(str(x).split())) if pd.notna(x) else 0
                )
                
                # Advanced text features
                df[f'{col}_uppercase_count'] = df[col].astype(str).str.count(r'[A-Z]')
                df[f'{col}_digit_count'] = df[col].astype(str).str.count(r'\d')
                df[f'{col}_special_char_count'] = df[col].astype(str).str.count(r'[^a-zA-Z0-9\s]')
                df[f'{col}_avg_word_length'] = df[col].astype(str).apply(
                    lambda x: np.mean([len(word) for word in str(x).split()]) if str(x).split() else 0
                )
                
                self.transformations_applied.append(f"Extracted text features from: {col}")
                
            except Exception:
                continue
                
        return df
        
    def _prepare_scaling_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare features for scaling by handling extreme values"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            try:
                # Cap extreme outliers
                Q1, Q3 = df[col].quantile([0.01, 0.99])
                df[col] = df[col].clip(lower=Q1, upper=Q3)
                
                # Handle infinite values
                df[col] = df[col].replace([np.inf, -np.inf], np.nan)
                df[col] = df[col].fillna(df[col].median())
                
            except Exception:
                continue
                
        return df
    
    def get_transformation_summary(self) -> List[str]:
        """Get summary of all transformations applied"""
        return self.transformations_applied
