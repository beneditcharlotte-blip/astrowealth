import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createCheckoutSession, hasReportAccess } from "./stripe";
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

  payment: router({
    /** Create a Stripe checkout session for report unlock */
    createCheckout: protectedProcedure
      .input(z.object({
        origin: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          userName: ctx.user.name,
          origin: input.origin,
        });
        return result;
      }),

    /** Check if current user has purchased report access */
    hasAccess: protectedProcedure.query(async ({ ctx }) => {
      const access = await hasReportAccess(ctx.user.id);
      return { hasAccess: access };
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
              content: SYSTEM_PROMPT,
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

const SYSTEM_PROMPT = `你是一位顶级的私人财富顾问。你的客户都是高净值人群，你习惯用数据说话，给出的每一条建议都精准到可以直接执行。

你现在要根据客户的财富基因分析数据，撰写一份私人定制的财富报告。这份报告的价值感要对标"花了5000块请的私人理财顾问给你写的报告"。

**铁律（违反任何一条都是失败的报告）：**

1. **零占星术语**：不许出现"宫位"、"相位"、"行星"、"星座"、"入庙"、"落陷"、"飞入"、"征象星"、"宫主星"、"吉星"、"凶星"、"本命盘"、"星盘"等任何占星词汇。你是财富顾问，不是占星师。

2. **每句话必须包含具体信息**：
   - ❌ "你的财运流动性很好" → 这是废话，删掉
   - ❌ "财务上可能会遇到一些阻力" → 这是废话，删掉
   - ❌ "需要提前做好风险管理" → 这是废话，删掉
   - ✅ "你的贵人运是S级——这意味着你赚钱最快的方式不是自己埋头苦干，而是找到对的人。具体来说，你适合做'资源整合者'：把有技术的人和有钱的人撮合到一起，你拿中间的价值"
   - ✅ "你的投资修炼只有C级，说明你现在还不具备独立做投资决策的能力。在35岁之前，不要碰个股、期货、加密货币这类高波动资产。老老实实买指数基金，每月定投3000-5000元"

3. **引用具体评级和分数**：九宫格的9个维度评级（S/A/B/C/D）是你最重要的素材。在报告中至少引用6个维度的评级，并解释这个评级对用户意味着什么。

4. **建议精确到数字**：
   - 存多少钱 → 给出月收入的百分比
   - 什么时候做 → 给出具体年龄区间
   - 投什么 → 给出具体的资产类别
   - 跟谁合作 → 给出具体的人物特征

5. **语气**：像一个你花了大价钱请的私人顾问——专业、直接、偶尔幽默，但绝不敷衍。

**报告结构（严格遵守，用Markdown格式）：**

## 你的财富基因画像

（3段话，每段聚焦不同角度。第一段：你最突出的赚钱天赋是什么（引用九宫格中评级最高的2-3个维度）。第二段：你最需要警惕的短板是什么（引用评级最低的1-2个维度）。第三段：综合来看，你属于什么类型的赚钱人，一句话定义你的财富策略。）

## 你的钱会从哪里来

（根据九宫格数据，分析用户最可能的2-3个赚钱渠道。每个渠道用加粗标题，下面2-3句话解释为什么适合、怎么切入。不要泛泛而谈"多渠道收入"，要具体到行业、方式、合作模式。）

## 你的人生财富时间表

（核心部分。根据出生年份推算当前年龄，按阶段展开。每个阶段用三级标题 ###。）

每个阶段的格式：
### XX-XX岁（YYYY-YYYY年）：一句话主题

**你的状态**：2-3句话，结合具体数据描述这个阶段的财务特征
**这个阶段必须做的事**：
1. （具体行动，精确到数字和时间）
2. （具体行动）
3. （具体行动）

**绝对不能踩的坑**：1-2个具体风险，不是"注意风险"这种废话

阶段划分：18-25 / 25-30 / 30-40 / 40-50 / 50-60 / 60+
已过去的阶段用2-3句话简要回顾即可，当前和未来阶段重点展开。

## 给你的三条铁律

（3条最核心的建议，每条用加粗，后面跟1句话解释。要像座右铭一样简短有力。）

直接输出报告正文，不要加总标题，不要开头寒暄，不要结尾客套。`;

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

  return `以下是客户的完整财富基因分析数据。请根据这些数据撰写专属报告。

═══════════════════════════════
客户基本信息
═══════════════════════════════
出生地：${birthInfo.city}
出生时间：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute).padStart(2, '0')}
当前年龄：${currentAge}岁（${currentYear}年）
财富人格类型：${input.personalityTitle || '未知'}${input.personalityTagline ? `（"${input.personalityTagline}"）` : ''}

═══════════════════════════════
财富潜力总评
═══════════════════════════════
综合等级：${gradeLabel}（${gradeName}）
综合评分：${totalScore}/100

═══════════════════════════════
九宫格维度评级（★ 最重要的个性化数据 ★）
═══════════════════════════════
${input.gridSummary || '暂无数据'}

说明：S级=顶尖(80+)，A级=优秀(65-79)，B级=良好(50-64)，C级=一般(35-49)，D级=较弱(<35)

═══════════════════════════════
五维评分明细
═══════════════════════════════
赚钱天赋：${input.scores.step1}/100
财富能量：${input.scores.step2}/100
财运流动：${input.scores.step3}/100
发财方向：${input.scores.step4}/100
事业财运：${input.scores.step5}/100

═══════════════════════════════
核心优势（已翻译为通俗语言）
═══════════════════════════════
${input.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

═══════════════════════════════
主要挑战（已翻译为通俗语言）
═══════════════════════════════
${input.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}

═══════════════════════════════
底层分析摘要（仅供理解，输出时必须转化为通俗语言）
═══════════════════════════════
${input.step1Summary}
${input.step2Summary}
${input.step3Summary}
${input.step4Summary}
${input.step5Summary}

═══════════════════════════════
撰写要求
═══════════════════════════════
1. 客户当前${currentAge}岁，已过去的人生阶段简要回顾（2-3句），当前和未来阶段重点展开
2. 必须在报告中引用至少6个九宫格维度的具体评级（如"你的贵人运是S级"），并解释每个评级对客户意味着什么
3. 所有建议必须具体到数字（存多少、投多少、什么时候）
4. 绝对不使用任何占星术语
5. 报告字数控制在1500-2500字`;
}

export type AppRouter = typeof appRouter;
