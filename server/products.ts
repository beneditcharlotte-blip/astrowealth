/**
 * Stripe product/price definitions for AstroWealth.
 * One-time payment for AI deep analysis report unlock.
 */

export const PRODUCTS = {
  REPORT_UNLOCK: {
    name: "AI 专属深度解读",
    description: "解锁完整的 AI 个性化财富报告，包含财富基因画像、赚钱渠道分析、人生财富时间表等深度内容",
    productType: "report_unlock" as const,
    /** Price in cents (USD). $2.99 */
    priceAmount: 299,
    currency: "usd",
  },
} as const;

export type ProductType = typeof PRODUCTS.REPORT_UNLOCK.productType;
