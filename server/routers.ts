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
              content: `你是一位资深的占星财富分析师，精通西方占星学和印度占星学。你需要根据用户的星盘分析数据，撰写一份专业、个性化、有深度的综合财富报告。

报告要求：
1. 语言风格：专业但通俗易懂，避免过于技术化的占星术语，让普通用户也能理解
2. 内容结构：按照"总体概述 → 财富天赋 → 财富机遇 → 潜在挑战 → 行动建议 → 未来展望"的顺序
3. 个性化：必须基于用户的具体星盘数据，不要泛泛而谈
4. 积极导向：即使面对挑战，也要给出建设性的建议和积极的视角
5. 篇幅：1500-2000字左右，内容充实但不冗长

请直接输出报告正文（Markdown格式），不要加标题头。使用二级标题(##)分隔各部分。`
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
  const { birthInfo, grade, gradeLabel, gradeName, totalScore, ascSign, mcSign } = input;
  
  const planetInfo = input.keyPlanets.map(p => 
    `${p.name}（${p.role}）：落在${p.sign}第${p.house}宫，${p.dignity}状态`
  ).join('\n');

  return `请根据以下星盘分析数据，为用户撰写个性化的综合财富报告：

【用户信息】
出生地：${birthInfo.city}
出生时间：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日 ${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute).padStart(2, '0')}
上升星座：${ascSign}
中天星座：${mcSign}

【财富格局等级】
等级：${gradeLabel}（${gradeName}）
综合评分：${totalScore}/100

【关键财富征象星】
${planetInfo}

【各维度评分】
核心财富征象：${input.scores.step1}/100
先天状态强度：${input.scores.step2}/100
相位联动网络：${input.scores.step3}/100
宫位系统配置：${input.scores.step4}/100
职业运势联动：${input.scores.step5}/100

【六步分析摘要】
第一步（核心财富征象）：${input.step1Summary}
第二步（先天状态）：${input.step2Summary}
第三步（相位联动）：${input.step3Summary}
第四步（宫位系统）：${input.step4Summary}
第五步（职业运势）：${input.step5Summary}

【已识别的优势】
${input.strengths.map(s => `- ${s}`).join('\n')}

【已识别的挑战】
${input.challenges.map(c => `- ${c}`).join('\n')}

请基于以上数据撰写个性化的综合财富报告。`;
}

export type AppRouter = typeof appRouter;
