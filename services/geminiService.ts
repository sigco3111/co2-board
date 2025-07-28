import { GoogleGenAI, Type } from "@google/genai";
import { MethodType, PowerGridMixItem } from "../types";

let ai: GoogleGenAI | null = null;
const model = "gemini-2.5-flash";

/**
 * Initializes the GoogleGenAI instance.
 * @param apiKey The API key to use. If empty or null, the instance is cleared.
 */
export const initializeAi = (apiKey: string) => {
  if (apiKey) {
    try {
      ai = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI:", error);
      ai = null;
    }
  } else {
    ai = null;
  }
};

/**
 * Checks if the Gemini API client is available and initialized.
 * @returns true if the client is ready, false otherwise.
 */
export const isAiAvailable = (): boolean => {
  return ai !== null;
};

const ensureAiReady = () => {
  if (!ai) {
    throw new Error("Gemini API가 초기화되지 않았습니다. 유효한 API 키를 제공해주세요.");
  }
};

export const getExplanation = async (method: MethodType): Promise<string> => {
  ensureAiReady();
  const prompt = `
    "${method}" 방식에 대해, 사업 관리자에게 설명하듯이 간단하고 명확하게 설명해줘. 전력 소비로 인한 Scope 2 CO2 배출량을 계산하는 방법이야.
    이 방식이 무엇을 나타내는지, 그리고 어떤 종류의 데이터를 기반으로 하는지에 초점을 맞춰줘.
    설명은 2~3개의 짧은 문장으로 간결하게 작성해줘.
  `;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error(`${method}에 대한 설명을 가져오는 중 오류 발생:`, error);
    throw new Error(`설명을 생성하지 못했습니다. API 키와 연결을 확인해주세요.`);
  }
};

export const getConsumptionEstimate = async (countryName: string): Promise<{ estimate: number | null }> => {
  ensureAiReady();
  const prompt = `Provide the average annual electricity consumption in kWh for a small to medium-sized enterprise (SME) in ${countryName}.`;

  try {
    const response = await ai!.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            consumptionKwh: {
              type: Type.NUMBER,
              description: 'Average annual electricity consumption in kWh for an SME.',
            },
          },
          required: ['consumptionKwh'],
        },
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        return { estimate: null };
    }
    const result = JSON.parse(jsonString);

    if (result && typeof result.consumptionKwh === 'number') {
      return { estimate: Math.round(result.consumptionKwh) };
    }
    return { estimate: null };
  } catch (error) {
    console.error(`Error getting consumption estimate for ${countryName}:`, error);
    return { estimate: null };
  }
};

export const getPowerGridMix = async (countryName: string): Promise<PowerGridMixItem[] | null> => {
    ensureAiReady();
    const prompt = `Provide the latest annual electricity generation mix in percentage for ${countryName}. It should include major energy sources (e.g., Coal, Natural Gas, Nuclear, Solar, Wind, Hydro, etc.). The response must be in JSON format, with keys for 'name' (in Korean) and 'value' (percentage).`;

    try {
        const response = await ai!.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        gridMix: {
                            type: Type.ARRAY,
                            description: "An array of objects representing the power grid mix.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the energy source in Korean (e.g., 석탄, 태양광).",
                                    },
                                    value: {
                                        type: Type.NUMBER,
                                        description: "The percentage of this source in the total mix.",
                                    },
                                },
                                required: ['name', 'value'],
                            },
                        },
                    },
                    required: ['gridMix'],
                },
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString) {
            return null;
        }
        const result = JSON.parse(jsonString);
        
        if (result && Array.isArray(result.gridMix)) {
            // Filter out items with 0 or negligible percentage and sort by value
            const sortedMix = result.gridMix
                .filter((item: PowerGridMixItem) => item.value > 0.1)
                .sort((a: PowerGridMixItem, b: PowerGridMixItem) => b.value - a.value);
            return sortedMix;
        }
        return null;
    } catch (error) {
        console.error(`Error getting power grid mix for ${countryName}:`, error);
        return null;
    }
};