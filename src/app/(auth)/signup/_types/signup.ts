export const genderOptions = ["男性", "女性", "無回答"] as const;

// 配列の値から「男性 | 女性 | 無回答」というUnion型を生成する。
export type Gender = (typeof genderOptions)[number];
