"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { create } from "domain";

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

const loginSchema = z.object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      }
    });

    const router = useRouter();
    const [serverError, setServerError] = useState<string | null>();

    const onSubmit = async(values: LoginFormValues) => {
        setServerError(null);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
        });

        if(error) {
            setServerError("メールアドレスまたはパスワードが正しくありません");
            return;
        }

        router.push("/tasks");
        router.refresh();
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={( { field } ) => (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="password" render={( { field } ) => (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="you@example.com" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && (<p className="text-sm text-red-500">{serverError}</p>)}

            <Button 
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "ログイン中..." : "ログイン" }
            </Button>
          </form>
        </Form>
    );
}