import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "test-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "## 你的财富基因画像\n\n你的贵人运是S级，这意味着你赚钱最快的方式不是自己埋头苦干。你的金钱直觉达到A级，对钱有天然的敏感度。\n\n## 你的钱会从哪里来\n\n**合作赚钱**\n你适合做资源整合者。\n\n## 你的人生财富时间表\n\n### 25-30岁（2015-2020年）：积累期\n\n**你的状态**：这是你打基础的阶段。\n**这个阶段必须做的事**：\n1. 每月定投3000元指数基金\n2. 考取一个专业证书\n3. 建立3个核心人脉\n\n**绝对不能踩的坑**：不要碰个股\n\n## 给你的三条铁律\n\n**1. 先存后花** —— 每月收入的20%强制储蓄\n**2. 借力打力** —— 你的贵人运是最大的资产\n**3. 慢就是快** —— 35岁前不碰高风险投资",
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

const sampleInput = {
  birthInfo: {
    city: "北京",
    year: 1990,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
  },
  grade: "A8",
  gradeLabel: "A8",
  gradeName: "千万级",
  totalScore: 65,
  ascSign: "天蝎座",
  mcSign: "狮子座",
  step1Summary: "正财宫宫头金牛座，金星入庙。偏财宫宫头天蝎座。",
  step2Summary: "整体先天强度：强。金星入庙，木星中性，月亮耀升。",
  step3Summary: "吉相位3个，挑战相位1个，财富流动整体顺畅。",
  step4Summary: "二宫主星飞入第10宫（excellent）；金星飞入第2宫（excellent）",
  step5Summary: "中天落在狮子座，事业与财富高度联动。",
  strengths: ["赚钱天赋强，对金钱有天然的敏感度", "多个有利因素互相配合"],
  challenges: ["部分方向需要更多耐心"],
  keyPlanets: [
    { name: "金星", sign: "金牛座", house: 2, dignity: "入庙", role: "天然财富征象星" },
    { name: "木星", sign: "巨蟹座", house: 4, dignity: "耀升", role: "天然扩张征象星" },
    { name: "月亮", sign: "金牛座", house: 2, dignity: "耀升", role: "福禄征象星" },
  ],
  scores: {
    step1: 70,
    step2: 75,
    step3: 60,
    step4: 55,
    step5: 65,
  },
};

describe("wealth.generateReport", () => {
  it("returns a non-empty report string", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wealth.generateReport(sampleInput);

    expect(result).toBeDefined();
    expect(result.report).toBeDefined();
    expect(typeof result.report).toBe("string");
    expect(result.report.length).toBeGreaterThan(0);
    expect(result.report).toContain("财富");
  });

  it("accepts optional personalityTitle, personalityTagline, and gridSummary", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wealth.generateReport({
      ...sampleInput,
      personalityTitle: "社交型收割者",
      personalityTagline: "人脉就是钱脉",
      gridSummary: "家族财运（A级，72分）：你的家庭背景对财富积累有明显助力\n金钱直觉（S级，88分）：你对钱有天生的第六感\n偏财体质（B级，55分）：你偶尔会有意外之财\n贵人运（A级，75分）：你天生容易遇到帮你赚钱的贵人\n人脉经营（B级，60分）：你的社交能力够用\n职场晋升（A级，70分）：你的事业上升通道很宽\n投资修炼（C级，42分）：投资不是你的强项\n创业拼搏（B级，58分）：你可以尝试创业",
    });

    expect(result).toBeDefined();
    expect(result.report).toBeDefined();
    expect(typeof result.report).toBe("string");
    expect(result.report.length).toBeGreaterThan(0);
  });

  it("works without optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.wealth.generateReport(sampleInput);

    expect(result).toBeDefined();
    expect(result.report).toBeDefined();
  });

  it("validates input schema - rejects missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.wealth.generateReport({
        ...sampleInput,
        birthInfo: undefined as any,
      })
    ).rejects.toThrow();
  });

  it("validates input schema - rejects invalid score types", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.wealth.generateReport({
        ...sampleInput,
        totalScore: "not-a-number" as any,
      })
    ).rejects.toThrow();
  });
});
