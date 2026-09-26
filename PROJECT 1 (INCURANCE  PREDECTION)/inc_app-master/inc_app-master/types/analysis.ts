export type AnalysisResult = {
    avg_cost: number;
    avg_age: number;
    avg_AI_pred: number;
    clients_num: number;
    final_value_set: number;
};

export type AgeGroupBucket = {
  group: string;
  avg_cost: number;
  count: number;
};

export type RegionBucket = {
  region: number;
  avg_cost: number;
  count: number;
};

export type LabelBucket = {
  label: string;
  count: number;
  avg_cost: number;
};

export type ChildrenBucket = {
  children: number | string;
  count: number;
  avg_cost: number;
};

export type BmiBucket = {
  range: string;
  count: number;
  avg_cost: number;
};

export type PredictionActualPoint = {
  predicted: number;
  actual: number;
};

export type BloodPressureBucket = {
  range: string;
  count: number;
  avg_cost: number;
};

export type ChartsData = {
  costByAgeGroup: AgeGroupBucket[];
  costByRegion: RegionBucket[];
  smokerBreakdown: LabelBucket[];
  genderBreakdown: LabelBucket[];
  diabeticBreakdown: LabelBucket[];
  childrenBreakdown: ChildrenBucket[];
  bmiDistribution: BmiBucket[];
  predictionVsActual: PredictionActualPoint[];
  bloodPressureRisk: BloodPressureBucket[];
};
