export interface DataPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  enabled?: boolean; // toggle point in or out of model
}

export type ModelType = 'linear' | 'quadratic' | 'exponential' | 'logarithmic';

export interface RegressionResult {
  modelType: ModelType;
  // Linear: y = a*x + b (a=slope, b=intercept)
  // Quadratic: y = a*x^2 + b*x + c
  // Exponential: y = a * e^(b*x)
  // Logarithmic: y = a * ln(x) + b
  coefficients: {
    a: number;
    b: number;
    c?: number;
  };
  rSquared: number; // Coefficient of determination R²
  r: number; // Pearson correlation coefficient r
  rmse: number; // Root Mean Squared Error
  equationText: string;
  xMean: number;
  yMean: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  n: number;
  residuals: { x: number; y: number; predictedY: number; residual: number }[];
}

export interface PredictionResult {
  inputVal: number;
  predictedVal: number;
  type: 'xToY' | 'yToX';
  isExtrapolation: boolean;
  notes: string;
}

export interface StudentInfo {
  schoolName: string;
  gradeClass: string;
  studentId: string;
  name: string;
  subject: string;
  topic: string;
  date: string;
}

export interface ReflectionData {
  slopeMeaning: string;
  interceptMeaning: string;
  rSquaredInterpretation: string;
  conclusion: string;
  questionsAndCuriosity: string;
}

export interface SampleDataset {
  id: string;
  title: string;
  category: '물리학' | '생명과학' | '지구과학' | '사회/경제' | '수학';
  description: string;
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  points: { x: number; y: number; label?: string }[];
  defaultSlopeMeaning?: string;
  defaultInterceptMeaning?: string;
}
