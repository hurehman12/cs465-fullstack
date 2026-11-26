export interface ResortReport {
  resort: string;
  tripCount: number;
  validPriceCount: number;
  excludedPriceCount: number;
  averagePrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
}