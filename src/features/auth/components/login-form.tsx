"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form } from "@/shared/forms/form";

import { loginSchema, type LoginFormValues } from "../schemas/login-schema";
import { useLogin } from "../hooks/use-login";

export function LoginForm() {
  const mutation = useLogin();
  const router = useRouter();

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await mutation.mutateAsync(values);
      router.push("/user");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  return (
    <Form<LoginFormValues>
      schema={loginSchema}
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input id="email" type="email" name="email" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <Input id="password" type="password" name="password" />
      </div>

      <Button type="submit" className="mt-2" disabled={mutation.isPending}>
        {mutation.isPending ? "Entrando..." : "Entrar"}
      </Button>
    </Form>
  );
}

