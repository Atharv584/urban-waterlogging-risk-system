"""
Retrain the waterlogging model with the current scikit-learn version
to fix pickle compatibility issues.
"""
import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# Load dataset
data_path = os.path.join(os.path.dirname(__file__), '..', 'synthetic_waterlogging_dataset.csv')
df = pd.read_csv(data_path)

features = ['Rainfall_1h_mm', 'Rainfall_24h_mm', 'Drainage_Capacity_mm_h',
            'Elevation_m', 'Slope_degrees', 'Soil_Saturation_pct',
            'Impervious_Surface_pct', 'Historical_Waterlogging']

X = df[features]
y = df['Waterlogging_Risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Test Accuracy: {accuracy * 100:.2f}%")
print(f"Classes: {model.classes_.tolist()}")
print(f"Feature importances: {dict(zip(features, [round(x,4) for x in model.feature_importances_]))}")

# Save model and features
model_path = os.path.join(os.path.dirname(__file__), 'waterlogging_model.pkl')
features_path = os.path.join(os.path.dirname(__file__), 'waterlogging_features.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(model, f)

with open(features_path, 'wb') as f:
    pickle.dump(features, f)

print(f"\nModel saved to {model_path}")
print(f"Features saved to {features_path}")
