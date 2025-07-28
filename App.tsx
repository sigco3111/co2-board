import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MethodType, ChartData, CountryData } from './types';
import { LOCATION_BASED_EMISSION_FACTOR, MARKET_BASED_EMISSION_FACTOR } from './constants';
import { getExplanation, getConsumptionEstimate, getPowerGridMix, initializeAi, isAiAvailable } from './services/geminiService';
import { BuildingIcon } from './components/icons/BuildingIcon';
import { LeafIcon } from './components/icons/LeafIcon';
import { ZapIcon } from './components/icons/ZapIcon';
import { MethodCard } from './components/MethodCard';
import { LoaderIcon } from './components/icons/LoaderIcon';
import { PowerGridMixChart } from './components/PowerGridMixChart';
import { SearchIcon } from './components/icons/SearchIcon';
import { ApiKeyManager } from './components/ApiKeyManager';

const initialCountryA: CountryData = {
    name: '대한민국',
    searchQuery: '',
    consumptionKwh: 1000000,
    consumptionHelperText: '예시 값입니다.',
    powerGridMix: null,
    isLoading: false,
};

const initialCountryB: CountryData = {
    name: '독일',
    searchQuery: '',
    consumptionKwh: 1000000,
    consumptionHelperText: '예시 값입니다.',
    powerGridMix: null,
    isLoading: false,
};

const App: React.FC = () => {
  const [countryA, setCountryA] = useState<CountryData>(initialCountryA);
  const [countryB, setCountryB] = useState<CountryData>(initialCountryB);

  const [locationBasedExplanation, setLocationBasedExplanation] = useState<string>('');
  const [marketBasedExplanation, setMarketBasedExplanation] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<MethodType | null>(null);
  const [error, setError] = useState<string>('');
  
  const [userApiKey, setUserApiKey] = useState('');
  const [isKeyAvailable, setIsKeyAvailable] = useState(false);

  const fetchCountryData = useCallback(async (countryName: string, setter: React.Dispatch<React.SetStateAction<CountryData>>) => {
    if (!countryName || !isAiAvailable()) {
        setter(prev => ({ ...prev, isLoading: false }));
        return;
    }

    setter(prev => ({ ...prev, isLoading: true, name: countryName, searchQuery: '' }));
    setError('');

    try {
      const [consumptionResult, gridMixResult] = await Promise.all([
          getConsumptionEstimate(countryName),
          getPowerGridMix(countryName)
      ]);
      
      setter(prev => ({
        ...prev,
        consumptionKwh: consumptionResult.estimate ?? prev.consumptionKwh,
        consumptionHelperText: consumptionResult.estimate 
            ? `${countryName}의 SME 평균치를 기반으로 추정된 값입니다.`
            : `${countryName}의 소비량 추정 실패. 이전 값을 유지합니다.`,
        powerGridMix: gridMixResult,
        isLoading: false,
      }));

    } catch (err: any) {
      console.error(`Failed to fetch data for ${countryName}:`, err);
      setError(`${countryName} 데이터 로딩 실패: API 키가 유효한지 확인해주세요.`);
      setter(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchAllCountryData = useCallback(() => {
      if (isAiAvailable()) {
        fetchCountryData(countryA.name, setCountryA);
        fetchCountryData(countryB.name, setCountryB);
      }
  }, [countryA.name, countryB.name, fetchCountryData]);

  const resetAllAiData = useCallback(() => {
    setCountryA(prev => ({
        ...initialCountryA,
        name: prev.name, // Keep name
        consumptionKwh: prev.consumptionKwh, // Keep user input
        isLoading: false,
    }));
    setCountryB(prev => ({
        ...initialCountryB,
        name: prev.name, // Keep name
        consumptionKwh: prev.consumptionKwh, // Keep user input
        isLoading: false,
    }));
    setLocationBasedExplanation('');
    setMarketBasedExplanation('');
  }, []);

  // One-time effect to initialize API key from env or local storage
  useEffect(() => {
    const envApiKey = process.env.API_KEY;
    const storedApiKey = localStorage.getItem('gemini_api_key');
    let keyToUse = '';

    if (envApiKey) {
      keyToUse = envApiKey;
    } else if (storedApiKey) {
      keyToUse = storedApiKey;
      setUserApiKey(storedApiKey);
    }
    
    if (keyToUse) {
      initializeAi(keyToUse);
      setIsKeyAvailable(true);
      fetchAllCountryData();
    } else {
      setIsKeyAvailable(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const handleKeyUpdate = (key: string, action: 'save' | 'clear') => {
    if (action === 'save') {
      localStorage.setItem('gemini_api_key', key);
      setUserApiKey(key);
      initializeAi(key);
      setIsKeyAvailable(true);
      setError('');
      // Fetch data now that the key is available
      fetchAllCountryData();
    } else { // 'clear'
      localStorage.removeItem('gemini_api_key');
      setUserApiKey('');
      initializeAi('');
      setIsKeyAvailable(false);
      resetAllAiData();
      setError('API 키가 제거되었습니다. 기능을 사용하려면 새 키를 입력하세요.');
    }
  };


  const handleSearchA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryA.searchQuery.trim()) return;
    fetchCountryData(countryA.searchQuery.trim(), setCountryA);
  };
  
  const handleSearchB = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countryB.searchQuery.trim()) return;
    fetchCountryData(countryB.searchQuery.trim(), setCountryB);
  };

  const emissionsA = useMemo(() => ({
    location: (countryA.consumptionKwh * LOCATION_BASED_EMISSION_FACTOR) / 1000 / 1000,
    market: (countryA.consumptionKwh * MARKET_BASED_EMISSION_FACTOR) / 1000 / 1000
  }), [countryA.consumptionKwh]);

  const emissionsB = useMemo(() => ({
    location: (countryB.consumptionKwh * LOCATION_BASED_EMISSION_FACTOR) / 1000 / 1000,
    market: (countryB.consumptionKwh * MARKET_BASED_EMISSION_FACTOR) / 1000 / 1000
  }), [countryB.consumptionKwh]);

  const chartData: ChartData[] = useMemo(() => [
    { name: MethodType.LOCATION_BASED, [countryA.name]: parseFloat(emissionsA.location.toFixed(2)), [countryB.name]: parseFloat(emissionsB.location.toFixed(2)) },
    { name: MethodType.MARKET_BASED, [countryA.name]: parseFloat(emissionsA.market.toFixed(2)), [countryB.name]: parseFloat(emissionsB.market.toFixed(2)) },
  ], [countryA.name, countryB.name, emissionsA, emissionsB]);

  const handleGetExplanation = useCallback(async (method: MethodType) => {
    if (!isAiAvailable()) {
      setError('AI 설명을 생성하려면 먼저 API 키를 설정해주세요.');
      return;
    }
    setIsGenerating(method);
    setError('');
    try {
      const explanation = await getExplanation(method);
      if (method === MethodType.LOCATION_BASED) setLocationBasedExplanation(explanation);
      else setMarketBasedExplanation(explanation);
    } catch (err: any) {
      setError(`AI 설명 로딩 실패: ${err.message}`);
      console.error(err);
    } finally {
      setIsGenerating(null);
    }
  }, []);
  
  const areControlsDisabled = countryA.isLoading || countryB.isLoading || !isKeyAvailable;

  return (
    <div className="min-h-screen bg-navy-950 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">국가간 CO₂ 배출량 비교 분석</h1>
          <p className="mt-4 text-lg text-navy-300 max-w-3xl mx-auto">
            두 국가의 전력 사용으로 인한 CO₂ 배출량을 <span className="font-semibold text-white">위치 기반</span> 및 <span className="font-semibold text-white">시장 기반</span> 방식으로 비교 분석합니다.
          </p>
        </header>

        <ApiKeyManager 
            isKeySet={isKeyAvailable} 
            onKeyUpdate={handleKeyUpdate} 
            initialKey={userApiKey} 
        />

        <div className="bg-navy-900/50 p-6 rounded-2xl shadow-lg border border-navy-800 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">국가별 배출량 비교 (톤 CO₂e)</h2>
            <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#263892" />
                        <XAxis dataKey="name" stroke="#a3baff" tick={{ fill: '#e0e9ff' }} />
                        <YAxis stroke="#a3baff" tick={{ fill: '#e0e9ff' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderColor: '#2d49e1', color: '#e0e9ff', borderRadius: '0.5rem' }} cursor={{fill: 'rgba(45, 73, 225, 0.2)'}}/>
                        <Legend wrapperStyle={{ color: '#e0e9ff' }} />
                        <Bar dataKey={countryA.name} fill="#a3baff" radius={[4, 4, 0, 0]} />
                        <Bar dataKey={countryB.name} fill="#577cff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Country A Column */}
            <div className="flex flex-col gap-6 p-6 bg-navy-900/30 rounded-2xl border border-navy-800">
                <form onSubmit={handleSearchA} className="flex gap-2 items-center">
                    <input type="text" value={countryA.searchQuery} onChange={(e) => setCountryA(p => ({...p, searchQuery: e.target.value}))} className="flex-grow bg-navy-950 border-2 border-navy-700 rounded-lg p-3 text-white text-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition disabled:opacity-50" placeholder={`${countryA.name} (으)로 검색...`} disabled={areControlsDisabled}/>
                    <button type="submit" disabled={areControlsDisabled || !countryA.searchQuery.trim()} className="bg-navy-600 hover:bg-navy-500 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-navy-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center h-[54px] w-[76px]">
                        {countryA.isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
                    </button>
                </form>
                 <div>
                    <label className="flex items-center text-lg font-medium text-navy-200 mb-2">
                        <ZapIcon className="w-6 h-6 mr-2 text-yellow-400" /> 연간 전력 소비량 (kWh)
                        {countryA.isLoading && <LoaderIcon className="w-5 h-5 ml-3 animate-spin text-navy-400" />}
                    </label>
                    <input type="number" value={countryA.consumptionKwh} onChange={(e) => setCountryA(p => ({...p, consumptionKwh: Number(e.target.value)}))} className="w-full bg-navy-950 border-2 border-navy-700 rounded-lg p-3 text-white text-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition disabled:opacity-50" disabled={countryA.isLoading}/>
                    <p className="mt-2 text-sm text-navy-400 h-4">{!countryA.isLoading ? countryA.consumptionHelperText : ''}</p>
                </div>
                <PowerGridMixChart data={countryA.powerGridMix} isLoading={countryA.isLoading} country={countryA.name} />
                <MethodCard methodType={MethodType.LOCATION_BASED} icon={<BuildingIcon className="w-8 h-8 text-red-400" />} emissionFactor={LOCATION_BASED_EMISSION_FACTOR} totalEmissions={emissionsA.location} explanation={locationBasedExplanation} isLoading={isGenerating === MethodType.LOCATION_BASED} onExplain={() => handleGetExplanation(MethodType.LOCATION_BASED)} disabled={!isKeyAvailable} />
                <MethodCard methodType={MethodType.MARKET_BASED} icon={<LeafIcon className="w-8 h-8 text-green-400" />} emissionFactor={MARKET_BASED_EMISSION_FACTOR} totalEmissions={emissionsA.market} explanation={marketBasedExplanation} isLoading={isGenerating === MethodType.MARKET_BASED} onExplain={() => handleGetExplanation(MethodType.MARKET_BASED)} disabled={!isKeyAvailable} />
            </div>

            {/* Country B Column */}
            <div className="flex flex-col gap-6 p-6 bg-navy-900/30 rounded-2xl border border-navy-800">
                <form onSubmit={handleSearchB} className="flex gap-2 items-center">
                    <input type="text" value={countryB.searchQuery} onChange={(e) => setCountryB(p => ({...p, searchQuery: e.target.value}))} className="flex-grow bg-navy-950 border-2 border-navy-700 rounded-lg p-3 text-white text-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition disabled:opacity-50" placeholder={`${countryB.name} (으)로 검색...`} disabled={areControlsDisabled}/>
                    <button type="submit" disabled={areControlsDisabled || !countryB.searchQuery.trim()} className="bg-navy-600 hover:bg-navy-500 text-white font-bold py-3 px-5 rounded-lg transition-colors disabled:bg-navy-800 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center h-[54px] w-[76px]">
                        {countryB.isLoading ? <LoaderIcon className="w-6 h-6 animate-spin" /> : <SearchIcon className="w-6 h-6" />}
                    </button>
                </form>
                 <div>
                    <label className="flex items-center text-lg font-medium text-navy-200 mb-2">
                        <ZapIcon className="w-6 h-6 mr-2 text-yellow-400" /> 연간 전력 소비량 (kWh)
                        {countryB.isLoading && <LoaderIcon className="w-5 h-5 ml-3 animate-spin text-navy-400" />}
                    </label>
                    <input type="number" value={countryB.consumptionKwh} onChange={(e) => setCountryB(p => ({...p, consumptionKwh: Number(e.target.value)}))} className="w-full bg-navy-950 border-2 border-navy-700 rounded-lg p-3 text-white text-xl focus:ring-2 focus:ring-navy-500 focus:border-navy-500 transition disabled:opacity-50" disabled={countryB.isLoading}/>
                    <p className="mt-2 text-sm text-navy-400 h-4">{!countryB.isLoading ? countryB.consumptionHelperText : ''}</p>
                </div>
                <PowerGridMixChart data={countryB.powerGridMix} isLoading={countryB.isLoading} country={countryB.name} />
                <MethodCard methodType={MethodType.LOCATION_BASED} icon={<BuildingIcon className="w-8 h-8 text-red-400" />} emissionFactor={LOCATION_BASED_EMISSION_FACTOR} totalEmissions={emissionsB.location} explanation={locationBasedExplanation} isLoading={isGenerating === MethodType.LOCATION_BASED} onExplain={() => handleGetExplanation(MethodType.LOCATION_BASED)} disabled={!isKeyAvailable} />
                <MethodCard methodType={MethodType.MARKET_BASED} icon={<LeafIcon className="w-8 h-8 text-green-400" />} emissionFactor={MARKET_BASED_EMISSION_FACTOR} totalEmissions={emissionsB.market} explanation={marketBasedExplanation} isLoading={isGenerating === MethodType.MARKET_BASED} onExplain={() => handleGetExplanation(MethodType.MARKET_BASED)} disabled={!isKeyAvailable} />
            </div>
        </main>
        
        {error && <div className="mt-8 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}

        <footer className="text-center mt-12 text-sm text-navy-400">
          <p>이 도구는 Scope 2 회계 방법에 대한 예시적인 비교를 제공합니다.</p>
          <p>배출 계수 및 전력망 구성 데이터는 AI에 의해 생성되었으며 실제와 다를 수 있습니다.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;