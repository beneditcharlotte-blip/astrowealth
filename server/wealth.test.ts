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
          content: "## 总体概述\n\n这是一份测试报告。\n\n## 财富天赋\n\n你的金星落在金牛座，这是非常好的配置。",
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
  gradeLabel: "A8+",
  gradeName: "优良财星",
  totalScore: 65,
  ascSign: "天蝎座",
  mcSign: "狮子座",
  step1Summary: "正财宫宫头金牛座，金星入庙。偏财宫宫头天蝎座。",
  step2Summary: "整体先天强度：强。金星入庙，木星中性，月亮耀升。",
  step3Summary: "吉相位3个，挑战相位1个，财富流动整体顺畅。",
  step4Summary: "二宫主星飞入第10宫（excellent）；金星飞入第2宫（excellent）",
  step5Summary: "中天落在狮子座，事业与财富高度联动。",
  strengths: ["核心财富征象星先天状态优秀", "多重吉相位构成财富网络"],
  challenges: ["部分财星飞入挑战宫位"],
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
    expect(result.report).toContain("总体概述");
  });

  it("validates input schema - rejects missing required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Missing birthInfo should throw
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
