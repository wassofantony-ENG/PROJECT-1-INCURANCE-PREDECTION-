export type Client = {
  id: number;
  user_id: number;
  email: string;
  customers_name: string;
  age: number;
  gender: number;
  bmi: number;
  bloodpressure: number;
  diabetic: number;
  children: number;
  smoker: number;
  region: number;
  AI_Prediction: number;
  isDone: boolean;
  final_cost: number;
};

export type PredictionForm = {
  age: number;
  gender: number;
  bmi: number;
  bloodpressure: number;
  diabetic: number;
  children: number;
  smoker: number;
  region: number;
};

export type ModelResult = {
  name: string;
  result: number;
  description: string;
  score: number;
};

export type ComparePredictions = {
  results: ModelResult[];
};


