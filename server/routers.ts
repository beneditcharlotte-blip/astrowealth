import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  wealth: router({
    generateReport: publicProcedure
      .input(z.object({
        birthInfo: z.object({
          city: z.string(),
          year: z.number(),
          month: z.number(),
          day: z.number(),
          hour: z.number(),
          minute: z.number(),
        }),
        grade: z.string(),
        gradeLabel: z.string(),
        gradeName: z.string(),
        totalScore: z.number(),
        ascSign: z.string(),
        mcSign: z.string(),
        step1Summary: z.string(),
        step2Summary: z.string(),
        step3Summary: z.string(),
        step4Summary: z.string(),
        step5Summary: z.string(),
        strengths: z.array(z.string()),
        challenges: z.array(z.string()),
        keyPlanets: z.array(z.object({
          name: z.string(),
          sign: z.string(),
          house: z.number(),
          dignity: z.string(),
          role: z.string(),
        })),
        scores: z.object({
          step1: z.number(),
          step2: z.number(),
          step3: z.number(),
          step4: z.number(),
          step5: z.number(),
        }),
      }))
      .mutation(async ({ input }) => {
        const prompt = buildReportPrompt(input);
        
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `你是一位资深的财富规划顾问，擅长将复杂的星盘分析数据转化为通俗易懂、实用的人生财富规划建议。

你的任务是根据用户的星盘分析数据，生成一份"人生财富时间表"报告。

**核心要求：**
1. **绝对禁止使用占星术语**：不要出现"宫位"、"相位"、"行星"、"星座"、"入庙"、"落陷"、"飞入"、"征象星"、"宫主星"等任何占星专业词汇。用户不懂这些。
2. **按人生阶段组织内容**：根据用户的出生年份，将报告按照具体的年龄段/年份区间来组织，告诉用户每个阶段需要注意什么、应该做什么。
3. **语言要口语化、亲切**：像一位有经验的长辈在跟你聊天，给你实在的建议。
4. **建议要具体可执行**：不要说"把握机遇"这种空话，要说"这个阶段适合学习理财知识"、"可以考虑开始定投基金"等具体建议。
5. **篇幅**：1500-2500字，内容充实但不啰嗦。

**报告结构（必须严格按照以下结构，使用二级标题##）：**

## 你的财富基因
（2-3段话，用通俗语言总结这个人的赚钱天赋和特点，比如"你是那种靠人脉赚钱的人"、"你适合稳扎稳打积累财富"等）

## 你的人生财富时间表
（这是报告的核心部分。根据出生年份推算当前年龄，然后按以下阶段展开，每个阶段用三级标题###，格式为"### XX-XX岁（YYYY-YYYY年）：阶段主题"）

要覆盖的阶段：
- 18-25岁：起步期
- 25-30岁：积累期  
- 30-40岁：发展期
- 40-50岁：收获期
- 50-60岁：稳固期
- 60岁以后：享受期

每个阶段要包含：
- 这个阶段的财务特点（1-2句话）
- 具体应该做什么（2-3条实际建议）
- 需要避免什么（1-2条提醒）

如果用户当前年龄已经过了某个阶段，用过去时态简要回顾；对于当前和未来阶段，重点展开。

## 给你的三条核心建议
（3条最重要的、最个性化的财务建议，每条1-2句话，简洁有力）

请直接输出报告正文（Markdown格式），不要加总标题。`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 4096,
        });

        const content = result.choices[0]?.message?.content;
        const reportText = typeof content === 'string' 
          ? content 
          : Array.isArray(content) 
            ? content.filter(c => c.type === 'text').map(c => (c as { type: 'text'; text: string }).text).join('')
            : '';

        return { report: reportText };
      }),
  }),
});

function buildReportPrompt(input: {
  birthInfo: { city: string; year: number; month: number; day: number; hour: number; minute: number };
  grade: string;
  gradeLabel: string;
  gradeName: string;
  totalScore: number;
  ascSign: string;
  mcSign: string;
  step1Summary: string;
  step2Summary: string;
  step3Summary: string;
  step4Summary: string;
  step5Summary: string;
  strengths: string[];
  challenges: string[];
  keyPlanets: Array<{ name: string; sign: string; house: number; dignity: string; role: string }>;
  scores: { step1: number; step2: number; step3: number; step4: number; step5: number };
}): string {
  const { birthInfo, gradeLabel, gradeName, totalScore } = input;
  
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthInfo.year;

  return `请根据以下分析数据，为用户生成个性化的"人生财富时间表"报告。

【用户基本信息】
出生地：${birthInfo.city}
出生时间：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
当前年龄：约${currentAge}岁（${currentYear}年）

【财富潜力评级】
等级：${gradeLabel}（${gradeName}）
综合评分：${totalScore}/100

【各维度评分（满分100）】
赚钱天赋：${input.scores.step1}
财富能量：${input.scores.step2}
财运流动：${input.scores.step3}
发财方向：${input.scores.step4}
事业财运：${input.scores.step5}

【分析发现的优势】
${input.strengths.map(s => `- ${s}`).join('\n')}

【分析发现的挑战】
${input.challenges.map(c => `- ${c}`).join('\n')}

【后台分析摘要（仅供参考，请转化为通俗语言）】
赚钱天赋分析：${input.step1Summary}
财富能量分析：${input.step2Summary}
财运流动分析：${input.step3Summary}
发财方向分析：${input.step4Summary}
事业财运分析：${input.step5Summary}

请注意：
1. 用户当前${currentAge}岁，请根据这个年龄来安排时间表的重点
2. 已经过去的阶段简要回顾，当前和未来阶段重点展开
3. 所有建议必须具体可执行，禁止空洞的鸡汤
4. 绝对不要使用任何占星术语`;
}

export type AppRouter = typeof appRouter;
