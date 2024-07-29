export interface AnnualFees {
 level: string;
 budget: string;
}

export interface AnnualFeesMap {
 [s: string]: AnnualFees;
}

export const ANNUAL_FEES_MAP: AnnualFeesMap = {
 LEVEL_A: {
  level: "Level A",
  budget: "$15,000"
 },
 LEVEL_B: {
  level: "Level B",
  budget: "$10,000"
 },
 LEVEL_C: {
  level: "Level C",
  budget: "$5,000"
 },
 LEVEL_D: {
  level: "Level D",
  budget: "$0"
 },
};

export const ANNUAL_FEES = Object.keys(ANNUAL_FEES_MAP).map(code => ANNUAL_FEES_MAP[code]);
