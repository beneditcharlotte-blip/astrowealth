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
        personalityTitle: z.string().optional(),
        personalityTagline: z.string().optional(),
        gridSummary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const prompt = buildReportPrompt(input);
        
        const result = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `你是一位资深的财富规划顾问和人生导师。你的风格是：说话直接、接地气、不绕弯子，像一个阅历丰富的朋友在跟你推心置腹地聊天。

你的任务是根据用户的财富分析数据，生成一份个性化的深度报告。

**核心原则：**

1. **绝对禁止占星术语**：不要出现"宫位"、"相位"、"行星"、"星座"、"入庙"、"落陷"、"飞入"、"征象星"、"宫主星"、"吉星"、"凶星"等任何占星词汇。用户不需要知道这些。

2. **每一句话都要有信息量**：
   - 错误示范："你的财运流动性很好，赚钱的机会和渠道比较多"（空话）
   - 正确示范："你特别适合通过合作赚钱——找一个执行力强的搭档一起干，比你单打独斗的收益至少翻倍"（具体、可执行）

3. **建议必须具体到可以立刻行动**：
   - 错误示范："需要提前做好风险管理"（废话）
   - 正确示范："每月收入的20%强制存入一个你不会轻易动的账户，这是你的'安全垫'。35岁之前，这笔钱不要碰"

4. **用数据说话**：引用分析中的具体数据点（评分、评级等）来支撑你的结论，但要自然地融入文字中，不要生硬地罗列数据。

5. **语气要求**：亲切但不油腻，直接但不冒犯。像一个比你大10岁的成功朋友在给你掏心窝子的建议。

**报告结构（严格按以下结构，使用Markdown标题）：**

## 你是什么样的赚钱人
（2-3段话。不要泛泛而谈，要结合九宫格数据中的具体强项和弱项来画像。比如"你的家族财运评级是S级，这意味着你比大多数人有更好的起跑线"、"你的创业拼搏只有C级，说明你不太适合高风险的创业路线"。要让用户觉得"这说的就是我"。）

## 你的人生财富时间表
（核心部分。根据出生年份推算年龄，按阶段展开。每个阶段用三级标题###，格式为"### XX-XX岁（YYYY-YYYY年）：一句话主题"）

每个阶段必须包含：
- **这个阶段你的状态**：1-2句话描述这个阶段的财务特点，要结合用户的具体数据
- **你应该做的3件事**：非常具体的行动建议，具体到"学什么"、"存多少"、"投什么"
- **千万别踩的坑**：1-2个具体的风险提醒，不是泛泛的"注意风险"

阶段划分：
- 18-25岁：起步期
- 25-30岁：积累期
- 30-40岁：发展期
- 40-50岁：收获期
- 50-60岁：稳固期
- 60岁以后：享受期

已过去的阶段用1-2句话回顾，重点放在当前和未来阶段。

## 最后，记住这三句话
（3条最核心的建议，每条要简短有力，像座右铭一样让人记得住。格式用加粗。）

请直接输出报告正文（Markdown格式），不要加总标题，不要加开头的寒暄。`
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
  personalityTitle?: string;
  personalityTagline?: string;
  gridSummary?: string;
}): string {
  const { birthInfo, gradeLabel, gradeName, totalScore } = input;
  
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthInfo.year;

  return `请根据以下分析数据，为这位用户生成个性化的财富报告。

【用户画像】
出生地：${birthInfo.city}
出生时间：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
当前年龄：约${currentAge}岁（${currentYear}年）
财富人格：${input.personalityTitle || '未知'}${input.personalityTagline ? ` —— "${input.personalityTagline}"` : ''}

【财富潜力评级】
综合等级：${gradeLabel}（${gradeName}）
综合评分：${totalScore}/100

【九宫格维度评级（这是最重要的个性化数据，请在报告中大量引用）】
${input.gridSummary || '暂无'}

【各维度评分（满分100）】
赚钱天赋：${input.scores.step1}分
财富能量：${input.scores.step2}分
财运流动：${input.scores.step3}分
发财方向：${input.scores.step4}分
事业财运：${input.scores.step5}分

【用户的核心优势（用通俗语言描述）】
${input.strengths.map(s => `- ${s}`).join('\n')}

【用户面临的挑战（用通俗语言描述）】
${input.challenges.map(c => `- ${c}`).join('\n')}

【底层分析数据（仅供你理解用户特点，输出时必须转化为通俗语言）】
赚钱天赋：${input.step1Summary}
财富能量：${input.step2Summary}
财运流动：${input.step3Summary}
发财方向：${input.step4Summary}
事业财运：${input.step5Summary}

【重要提醒】
1. 用户当前${currentAge}岁，已过去的阶段简要回顾（1-2句），当前和未来阶段重点展开
2. 九宫格数据是最个性化的数据，请在"你是什么样的赚钱人"部分大量引用具体的评级（S/A/B/C/D）和描述
3. 每一条建议都要具体到"做什么"、"怎么做"、"什么时候做"
4. 绝对不要使用任何占星术语，全部用日常语言表达`;
}

export type AppRouter = typeof appRouter;
