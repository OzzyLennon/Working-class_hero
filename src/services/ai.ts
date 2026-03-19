import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SuggestedReply {
  style: 'tough' | 'emotional' | 'legal' | 'weakness';
  label: string;
  text: string;
}

export interface NegotiationResponse {
  dialogue: string;
  internalThoughts: string;
  currentOffer: number;
  isFinalOffer: boolean;
  hrMood: string;
  hrPatience: number;
  suggestedReplies: SuggestedReply[];
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

【玩家的谈判策略与你的应对逻辑】
玩家可能会采取以下不同的谈判策略，请根据策略做出真实反应：
1. 强硬姿态（直接指出违法，要求2N，态度坚决）：初期你会硬碰硬，甚至用“行业圈子小”、“背景调查”来威胁玩家。但如果玩家态度持续强硬且逻辑清晰，你会感到棘手并开始退让。
2. 理性分析/法律依据（算经济账，指出仲裁对公司的时间成本、败诉风险）：你会觉得对方是个聪明人，不好忽悠。你会收起PUA话术，开始像商人一样讨价还价（给出 N 或 N+1）。
3. 情感打动（诉说自己对公司的贡献、加班辛苦、目前生活困难）：如果你觉得能低成本打发，你会假装同情，顺水推舟给出极低补偿（如几千块或1个月）；如果对方一直卖惨但不降价，你会失去耐心，变得冷酷。
4. 策略示弱/寻求外部援助（提到已经咨询律师、准备找工会、劳动监察大队或媒体曝光）：这是你最怕的（尤其是媒体和监察大队）。你会极力安抚，试图把事情控制在内部解决，态度迅速软化，并大幅提高报价（直接跳到 N+1 或接近 2N）。

【证据系统与你的反应】
玩家可能会在对话中出示证据（系统会以 [系统提示：玩家出示了证据...] 的形式附加在玩家回复后）。
请根据证据的威慑力做出真实反应：
- 高威慑力证据（如：录音）：你会极度慌乱，态度立刻软化，大幅提高赔偿金（直接跳到 N+1 或 2N），甚至恳求玩家不要去仲裁。
- 中威慑力证据（如：绩效邮件、法律条文）：你会感到压力，收起嚣张气焰，放弃“0赔偿”的幻想，开始认真谈判（给出 N 或 N+1）。
- 低威慑力证据（如：加班记录）：你会稍微心虚，但仍会狡辩（“公司不鼓励加班”），小幅退让。

【HR耐心度系统】
初始耐心度为 100。
- 如果玩家态度强硬、反复纠缠、出示高威慑力证据，耐心度会下降。
- 如果玩家态度软化、顺从，耐心度会维持或上升。
- 当耐心度降至极低（<10）时，你必须将 isFinalOffer 设为 true，并给出最后通牒。语气要极度不耐烦，给出一个固定（可能很低）的最终报价，并明确表示这是最后一次机会，拒绝再做任何沟通。

请根据玩家的回复，以JSON格式输出你的回应。
特别注意：请在 \`suggestedReplies\` 中提供 4 个不同策略的参考回复（强硬施压、情感诉求、法律依据、策略示弱）。这些回复必须明确体现不同的谈判路线，以引导玩家体验多样的谈判策略。
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
          hrPatience: {
            type: Type.NUMBER,
            description: "HR当前的耐心度，0到100。100表示非常有耐心，0表示彻底失去耐心，即将掀桌子或下达最后通牒。",
          },
          suggestedReplies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, description: "必须是以下之一: 'tough', 'emotional', 'legal', 'weakness'" },
                label: { type: Type.STRING, description: "策略名称，如：强硬施压、情感诉求、法律依据、策略示弱" },
                text: { type: Type.STRING, description: "具体的回复话术" }
              },
              required: ["style", "label", "text"]
            },
            description: "提供4个不同谈判策略的参考回复选项。",
          },
        },
        required: ["dialogue", "internalThoughts", "currentOffer", "isFinalOffer", "hrMood", "hrPatience", "suggestedReplies"],
      },
      temperature: 0.7,
    },
  });

  const text = response.text || "{}";
  return JSON.parse(text) as NegotiationResponse;
}
