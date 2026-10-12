import modelData from './modelData.json';
import type { PredictionInput, PredictionResponse, ModelInfo, RiskLevel } from './types';

/**
 * Local client-side inference engine using the trained Random Forest model trees.
 * Ensures zero-downtime, instantaneous predictions on Vercel or when backend is sleeping.
 */
export function runLocalPrediction(input: PredictionInput): PredictionResponse {
  const { classes, features, feature_importances, trees } = modelData;
  const x = features.map((f: string) => (input as Record<string, number>)[f] ?? 0);

  const numClasses = classes.length;
  const totalProb = new Array(numClasses).fill(0);

  for (const tree of trees) {
    let node = 0;
    while (tree.f[node] !== -2 && node < tree.f.length) {
      const featIndex = tree.f[node];
      if (x[featIndex] <= tree.th[node]) {
        node = tree.l[node];
      } else {
        node = tree.r[node];
      }
    }
    const val = tree.v[node] || [0, 0, 0];
    const sum = val.reduce((a: number, b: number) => a + b, 0) || 1;
    for (let c = 0; c < numClasses; c++) {
      totalProb[c] += (val[c] ?? 0) / sum;
    }
  }

  const probMap: Record<string, number> = {};
  let maxProb = -1;
  let predictedClass = 'Medium';

  for (let c = 0; c < numClasses; c++) {
    const p = Math.round((totalProb[c] / trees.length) * 1000) / 1000;
    const className = classes[c];
    probMap[className] = p;
    if (p > maxProb) {
      maxProb = p;
      predictedClass = className;
    }
  }

  return {
    prediction: predictedClass as RiskLevel,
    probabilities: probMap,
    feature_importances: feature_importances as Record<string, number>,
    input_summary: input as unknown as Record<string, number>,
    model_info: {
      algorithm: 'Random Forest Classifier',
      n_estimators: 100,
      test_accuracy: 0.8295,
      training_samples: 10000,
      data_source: 'Environmental Simulation Dataset (10,000 observations)',
    },
  };
}

export function getLocalModelInfo(): ModelInfo {
  return {
    algorithm: 'Random Forest Classifier',
    n_estimators: 100,
    classes: modelData.classes,
    n_features: modelData.features.length,
    feature_names: modelData.features,
    feature_importances: modelData.feature_importances as Record<string, number>,
    training_samples: 10000,
    test_accuracy: 0.8295,
    data_source: 'Environmental Simulation Dataset (10,000 observations)',
    disclaimer: 'Trained with scikit-learn Random Forest on 10,000 environmental observations.',
  };
}
