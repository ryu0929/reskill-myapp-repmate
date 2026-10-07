"use client";

import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SignupSchema = z
    .object({
        email: z.string().email("有効なメールアドレスを入力してください"),
        password: z.string().min(6, "パスワードは6文字以上で入力してください"),
        passwordConfirm: z.string(),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        path: ["passwordConfirm"],
        message: "パスワードが正しくありません"
    });

type SignupFormvalues = z.infer<typeof SignupSchema>

export function SignupForm() {
    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<SignupFormvalues>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {email: "", password: "", passwordConfirm: ""},
    });

    const onSubmit = async(values: SignupFormvalues) => {
        setServerError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
        });

        if(error) {
            setServerError(error.message);
            return;
        }

        router.push("/tasks");
        router.refresh();
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
      
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
      
            <FormField
              control={form.control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>パスワード（確認）</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
      
            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}
      
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "登録中..." : "アカウントを作成"}
            </Button>
          </form>
        </Form>
    );
}