import { DataPoint, ModelType, RegressionResult } from '../types';

/**
 * Calculates Regression models and statistics
 */
export function calculateRegression(
  points: DataPoint[],
  modelType: ModelType = 'linear'
): RegressionResult | null {
  const activePoints = points.filter((p) => p.enabled !== false && !isNaN(p.x) && !isNaN(p.y));
  
  if (activePoints.length < 2) {
    return null;
  }

  const n = activePoints.length;
  const xValues = activePoints.map((p) => p.x);
  const yValues = activePoints.map((p) => p.y);

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const xMean = sumX / n;
  const yMean = sumY / n;

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  let a = 0;
  let b = 0;
  let c: number | undefined = undefined;
  let predictY: (x: number) => number = () => 0;

  if (modelType === 'linear') {
    let sumXY = 0;
    let sumXX = 0;
    for (let i = 0; i < n; i++) {
      sumXY += xValues[i] * yValues[i];
      sumXX += xValues[i] * xValues[i];
    }
    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
      a = 0;
      b = yMean;
    } else {
      a = (n * sumXY - sumX * sumY) / denom;
      b = (sumY - a * sumX) / n;
    }
    predictY = (x) => a * x + b;
  } else if (modelType === 'quadratic') {
    // Solve system for y = a*x^2 + b*x + c
    let s0 = n;
    let s1 = sumX;
    let s2 = 0;
    let s3 = 0;
    let s4 = 0;
    let sy = sumY;
    let sxy = 0;
    let sx2y = 0;

    for (let i = 0; i < n; i++) {
      const x = xValues[i];
      const y = yValues[i];
      const x2 = x * x;
      s2 += x2;
      s3 += x2 * x;
      s4 += x2 * x2;
      sxy += x * y;
      sx2y += x2 * y;
    }

    // Gaussian elimination for 3x3 matrix:
    // [s4  s3  s2] [a]   [sx2y]
    // [s3  s2  s1] [b] = [sxy ]
    // [s2  s1  s0] [c]   [sy  ]
    const det =
      s4 * (s2 * s0 - s1 * s1) -
      s3 * (s3 * s0 - s1 * s2) +
      s2 * (s3 * s1 - s2 * s2);

    if (Math.abs(det) < 1e-10) {
      a = 0;
      b = 0;
      c = yMean;
    } else {
      a =
        (sx2y * (s2 * s0 - s1 * s1) -
          sxy * (s3 * s0 - s1 * s2) +
          sy * (s3 * s1 - s2 * s2)) /
        det;
      b =
        (s4 * (sxy * s0 - sy * s1) -
          s3 * (sx2y * s0 - sy * s2) +
          s2 * (sx2y * s1 - sxy * s2)) /
        det;
      c =
        (s4 * (s2 * sy - s1 * sxy) -
          s3 * (s3 * sy - s1 * sx2y) +
          s2 * (s3 * sxy - s2 * sx2y)) /
        det;
    }
    predictY = (x) => a * x * x + b * x + (c ?? 0);
  } else if (modelType === 'exponential') {
    // y = a * e^(b*x) => ln(y) = ln(a) + b*x
    const validPoints = activePoints.filter((p) => p.y > 0);
    if (validPoints.length < 2) {
      return calculateRegression(points, 'linear');
    }
    const sumLnY = validPoints.reduce((acc, p) => acc + Math.log(p.y), 0);
    const sumXLnY = validPoints.reduce((acc, p) => acc + p.x * Math.log(p.y), 0);
    const sumX = validPoints.reduce((acc, p) => acc + p.x, 0);
    const sumXX = validPoints.reduce((acc, p) => acc + p.x * p.x, 0);
    const vn = validPoints.length;

    const denom = vn * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-12) {
      a = Math.exp(sumLnY / vn);
      b = 0;
    } else {
      b = (vn * sumXLnY - sumX * sumLnY) / denom;
      const lnA = (sumLnY - b * sumX) / vn;
      a = Math.exp(lnA);
    }
    predictY = (x) => a * Math.exp(b * x);
  } else if (modelType === 'logarithmic') {
    // y = a * ln(x) + b
    const validPoints = activePoints.filter((p) => p.x > 0);
    if (validPoints.length < 2) {
      return calculateRegression(points, 'linear');
    }
    const sumLnX = validPoints.reduce((acc, p) => acc + Math.log(p.x), 0);
    const sumLnXX = validPoints.reduce((acc, p) => acc + Math.log(p.x) ** 2, 0);
    const sumYLnX = validPoints.reduce((acc, p) => acc + p.y * Math.log(p.x), 0);
    const sumY = validPoints.reduce((acc, p) => acc + p.y, 0);
    const vn = validPoints.length;

    const denom = vn * sumLnXX - sumLnX * sumLnX;
    if (Math.abs(denom) < 1e-12) {
      a = 0;
      b = sumY / vn;
    } else {
      a = (vn * sumYLnX - sumLnX * sumY) / denom;
      b = (sumY - a * sumLnX) / vn;
    }
    predictY = (x) => (x > 0 ? a * Math.log(x) + b : 0);
  }

  // Calculate Residuals, R², r, RMSE
  let ssTot = 0;
  let ssRes = 0;
  const residuals: { x: number; y: number; predictedY: number; residual: number }[] = [];

  for (let i = 0; i < n; i++) {
    const x = xValues[i];
    const y = yValues[i];
    const pY = predictY(x);
    const res = y - pY;
    residuals.push({ x, y, predictedY: pY, residual: res });

    ssTot += (y - yMean) ** 2;
    ssRes += res ** 2;
  }

  let rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 1;
  if (rSquared > 1) rSquared = 1;

  // Pearson correlation r (for linear)
  let r = 0;
  let numR = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xValues[i] - xMean;
    const dy = yValues[i] - yMean;
    numR += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX > 0 && denY > 0) {
    r = numR / (Math.sqrt(denX) * Math.sqrt(denY));
  }

  const rmse = Math.sqrt(ssRes / n);

  // Formulate mathematical equation string
  let equationText = '';
  if (modelType === 'linear') {
    const sign = b >= 0 ? '+' : '-';
    equationText = `y = ${formatNum(a)}x ${sign} ${formatNum(Math.abs(b))}`;
  } else if (modelType === 'quadratic') {
    const signB = b >= 0 ? '+' : '-';
    const signC = (c ?? 0) >= 0 ? '+' : '-';
    equationText = `y = ${formatNum(a)}x² ${signB} ${formatNum(Math.abs(b))}x ${signC} ${formatNum(Math.abs(c ?? 0))}`;
  } else if (modelType === 'exponential') {
    equationText = `y = ${formatNum(a)} · e^(${formatNum(b)}x)`;
  } else if (modelType === 'logarithmic') {
    const sign = b >= 0 ? '+' : '-';
    equationText = `y = ${formatNum(a)} · ln(x) ${sign} ${formatNum(Math.abs(b))}`;
  }

  return {
    modelType,
    coefficients: { a, b, c },
    rSquared,
    r,
    rmse,
    equationText,
    xMean,
    yMean,
    minX,
    maxX,
    minY,
    maxY,
    n,
    residuals,
  };
}

export function formatNum(val: number, decimals: number = 4): string {
  if (isNaN(val)) return '0';
  if (Math.abs(val) < 0.0001 && val !== 0) {
    return val.toExponential(2);
  }
  return parseFloat(val.toFixed(decimals)).toString();
}

/**
 * Predict Y given X or X given Y for linear regression
 */
export function predictFromModel(
  reg: RegressionResult,
  val: number,
  mode: 'xToY' | 'yToX'
): { predictedVal: number; isExtrapolation: boolean } {
  const { a, b, c } = reg.coefficients;
  let predictedVal = 0;
  let testX = val;

  if (mode === 'xToY') {
    testX = val;
    if (reg.modelType === 'linear') {
      predictedVal = a * val + b;
    } else if (reg.modelType === 'quadratic') {
      predictedVal = a * val * val + b * val + (c ?? 0);
    } else if (reg.modelType === 'exponential') {
      predictedVal = a * Math.exp(b * val);
    } else if (reg.modelType === 'logarithmic') {
      predictedVal = val > 0 ? a * Math.log(val) + b : 0;
    }
  } else {
    // yToX
    if (reg.modelType === 'linear') {
      predictedVal = Math.abs(a) > 1e-12 ? (val - b) / a : 0;
      testX = predictedVal;
    } else {
      // Default fallback linear approximation
      predictedVal = Math.abs(a) > 1e-12 ? (val - b) / a : 0;
      testX = predictedVal;
    }
  }

  const isExtrapolation = testX < reg.minX || testX > reg.maxX;

  return { predictedVal, isExtrapolation };
}

/**
 * Returns qualitative description of Pearson Correlation r
 */
export function getCorrelationDescription(r: number): { text: string; color: string } {
  const absR = Math.abs(r);
  const sign = r >= 0 ? '양의 상관관계' : '음의 상관관계';

  if (absR >= 0.9) {
    return { text: `매우 강한 ${sign} (|r| ≥ 0.9)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (absR >= 0.7) {
    return { text: `강한 ${sign} (0.7 ≤ |r| < 0.9)`, color: 'text-blue-700 bg-blue-50 border-blue-200' };
  } else if (absR >= 0.4) {
    return { text: `뚜렷한 ${sign} (0.4 ≤ |r| < 0.7)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else if (absR >= 0.2) {
    return { text: `약한 ${sign} (0.2 ≤ |r| < 0.4)`, color: 'text-orange-700 bg-orange-50 border-orange-200' };
  } else {
    return { text: `상관관계 거의 없음 (|r| < 0.2)`, color: 'text-slate-700 bg-slate-100 border-slate-200' };
  }
}
