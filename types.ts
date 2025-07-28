
export enum MethodType {
  LOCATION_BASED = '위치 기반',
  MARKET_BASED = '시장 기반',
}

export interface ChartData {
  name: string;
  [key: string]: number | string; // 여러 국가의 동적 키를 허용
}

export interface PowerGridMixItem {
  name:string;
  value: number; // Percentage
}

export interface CountryData {
    name: string;
    searchQuery: string;
    consumptionKwh: number;
    consumptionHelperText: string;
    powerGridMix: PowerGridMixItem[] | null;
    isLoading: boolean;
}
