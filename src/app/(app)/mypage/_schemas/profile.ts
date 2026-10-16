import { z } from "zod";
import { genderOptions } from "../_types/mypage";

export const profileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "名前を入力してください"),

    gender: z.enum(genderOptions),

    password: z.string().refine(
        (value) => value === "" || value.length >= 8,
        "パスワードは8文字以上で入力してください"
    ),
    confirmation: z.string(),
}).refine((values) => values.password === values.confirmation, {
    message: "パスワードが一致しません",
    path: ["confirmation"],
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
