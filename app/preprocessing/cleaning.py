import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler

def clean_and_scale(df: pd.DataFrame, numeric_cols=None):
    """Fill missing values and scale numeric features."""
    if numeric_cols is None:
        numeric_cols = df.select_dtypes(include='number').columns.tolist()

    # Impute missing values with mean
    imputer = SimpleImputer(strategy='mean')
    df[numeric_cols] = imputer.fit_transform(df[numeric_cols])

    # Standard scaling
    scaler = StandardScaler()
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    return df
