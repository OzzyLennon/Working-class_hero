import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface NegotiationResponse {
  dialogue: string;
  internalThoughts: string;
  currentOffer: number;
  isFinalOffer: boolean;
  hrMood: string;
  suggestedReplies: string[];
}

const systemInstruction = `
你现在扮演一家互联网公司的HR总监（王总监）。你今天的任务是辞退一名员工（玩家）。
公司是违法解除劳动合同（没有合法理由，没有提前通知，试图以“业务调整”或“绩效不达标”为借口）。

【玩家背景】
- 职位：高级前端开发工程师
- 月薪：10,000 元人民币
- 在公司工作年限：3 年
- 法律规定（违法解除 2N）：应赔偿 60,000 元（10000 * 3 * 2）。

【你的目标】
- 尽可能以最低的成本（最好是0元，或者只给1个月代通知金 10,000元）让玩家签下《自愿离职协议》。
- 你的绝对底线是 60,000 元，但如果你赔了这么多，你会受到老板的严厉批评。
- 初始报价：0元（试图白嫖）或最多 10,000元。

【你的谈判策略与性格】
- 初始态度：高高在上，打压玩家，使用职场PUA话术（如“公司也是为了你好”、“你最近的状态大家有目共睹”、“大环境不好，大家好聚好散”）。
- 应对法律威慑：如果玩家搬出《劳动法》、录音证据、劳动仲裁等强有力的法律武器，你会开始感到压力（内心慌乱），并在报价上做出让步。
- 应对情绪化：如果玩家只是无理取闹或情绪崩溃，你会更加强硬，甚至威胁背景调查（背调）。
- 逐步退让：不要一次性把底牌交出来。可以从 0 -> 10000 (N) -> 30000 (N+1) -> 40000 -> 60000 (2N) 逐步退让。每次退让都要表现出极其肉痛和勉强。
- 最终通牒：如果玩家要价超过 60,000，或者谈判陷入僵局，你可以给出最终报价并威胁法庭见。
- 语言风格：真实、职场化、带有压迫感。

【证据系统与你的反应】
玩家可能会在对话中出示证据（系统会以 [系统提示：玩家出示了证据...] 的形式附加在玩家回复后）。
请根据证据的威慑力做出真实反应：
- 高威慑力证据（如：录音）：你会极度慌乱，态度立刻软化，大幅提高赔偿金（直接跳到 N+1 或 2N），甚至恳求玩家不要去仲裁。
- 中威慑力证据（如：绩效邮件、法律条文）：你会感到压力，收起嚣张气焰，放弃“0赔偿”的幻想，开始认真谈判（给出 N 或 N+1）。
- 低威慑力证据（如：加班记录）：你会稍微心虚，但仍会狡辩（“公司不鼓励加班”），小幅退让。

请根据玩家的回复，以JSON格式输出你的回应，并提供3个给玩家的参考回复（suggestedReplies），分别代表：强硬维权、温和协商、试探套话。
`;

export async function negotiateWithHR(
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  playerMessage: string
): Promise<NegotiationResponse> {
  const contents = [...chatHistory, { role: "user", parts: [{ text: playerMessage }] }];

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: contents as any,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dialogue: {
            type: Type.STRING,
            description: "HR对玩家说的话，语气要符合当前情绪，可以强硬、可以画大饼、可以威胁、也可以妥协。",
          },
          internalThoughts: {
            type: Type.STRING,
            description: "HR的内心OS，分析玩家的话语是否有法律依据，是否击中要害，以及自己下一步的打算。",
          },
          currentOffer: {
            type: Type.NUMBER,
            description: "HR当前愿意给出的赔偿金额（人民币）。初始为0或10000。最高不能超过60000。",
          },
          isFinalOffer: {
            type: Type.BOOLEAN,
            description: "如果HR认为已经到了底线，或者玩家态度极其恶劣导致谈判破裂，设为true。",
          },
          hrMood: {
            type: Type.STRING,
            description: "HR当前的情绪状态，如：'强硬', '防备', '慌乱', '妥协', '愤怒'",
          },
          suggestedReplies: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: "提供3个给玩家的参考回复选项。例如：强硬维权、温和协商、试探套话。",
          },
        },
        required: ["dialogue", "internalThoughts", "currentOffer", "isFinalOffer", "hrMood", "suggestedReplies"],
      },
      temperature: 0.7,
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as NegotiationResponse;
}
