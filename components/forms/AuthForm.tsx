"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ZodType } from "zod";
import { fieldClass, Label } from "@/components/stock/fields";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { ActionResponse } from "@/types/global";

type Values = Record<string, string>;

interface AuthFormProps<T extends Values> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: "SIGN_IN" | "SIGN_UP";
}

const FIELDS: Record<
  string,
  { label: string; type: string; autoComplete: string; placeholder: string }
> = {
  name: {
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your name",
  },
  username: {
    label: "Username",
    type: "text",
    autoComplete: "username",
    placeholder: "Letters, numbers and _",
  },
  email: {
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  password: {
    label: "Password",
    type: "password",
    autoComplete: "current-password",
    placeholder: "At least 6 characters",
  },
};

const AuthForm = <T extends Values>({
  schema,
  defaultValues,
  formType,
  onSubmit,
}: AuthFormProps<T>) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Values>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const isSignIn = formType === "SIGN_IN";

  const submit = () => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
        )
      );
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await onSubmit(parsed.data);
      if (!result?.success) {
        toast.error(
          result?.error?.message ??
            (isSignIn ? "Could not sign in." : "Could not create the account.")
        );
        return;
      }
      router.push(ROUTES.HOME);
      router.refresh();
    });
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mt-12 flex flex-col gap-5"
    >
      <h1 className="font-wide text-[34px] font-black uppercase leading-none tracking-tight">
        {isSignIn ? "Sign in" : "Create account"}
      </h1>
      <p className="-mt-1 text-sm text-fg-muted">
        {isSignIn
          ? "Sign in to see the stock."
          : "The admin gives your account access after you sign up."}
      </p>

      {Object.keys(defaultValues).map((key) => {
        const field = FIELDS[key];
        return (
          <div key={key} className="flex flex-col gap-2">
            <Label htmlFor={key}>{field.label}</Label>
            <input
              id={key}
              name={key}
              type={field.type}
              autoComplete={
                key === "password" && !isSignIn
                  ? "new-password"
                  : field.autoComplete
              }
              autoCapitalize={key === "name" ? "words" : "none"}
              placeholder={field.placeholder}
              value={values[key]}
              aria-invalid={!!errors[key]}
              onChange={(e) => {
                setValues((v) => ({ ...v, [key]: e.target.value }));
                setErrors((er) => ({ ...er, [key]: undefined }));
              }}
              className={cn(fieldClass, "placeholder:text-fg-faint")}
            />
            {errors[key] && (
              <p role="alert" className="text-xs font-semibold text-out">
                {errors[key]}
              </p>
            )}
          </div>
        );
      })}

      <Button
        type="submit"
        variant="gold"
        size="tap"
        disabled={pending}
        className="mt-2"
      >
        {pending
          ? isSignIn
            ? "Signing in..."
            : "Creating account..."
          : isSignIn
            ? "Sign in"
            : "Create account"}
      </Button>

      <p className="text-center text-sm text-fg-muted">
        {isSignIn ? "New here? " : "Already have an account? "}
        <Link
          href={isSignIn ? ROUTES.SIGN_UP : ROUTES.SIGN_IN}
          className="font-bold text-gold"
        >
          {isSignIn ? "Create account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
};

export default AuthForm;
