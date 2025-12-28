"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useToast } from "@/components/ui/toast";

export interface ConfirmActionState {
  error?: string | null;
  success?: boolean;
}

interface ConfirmFormProps {
  action: (prevState: ConfirmActionState, formData: FormData) => Promise<ConfirmActionState>;
  message: string;
  hiddenFields?: Record<string, string>;
  children: React.ReactNode;
}

export const ConfirmForm = ({ action, message, hiddenFields, children }: ConfirmFormProps) => {
  const { showToast } = useToast();
  const [state, formAction] = useFormState(action, { error: null, success: false });
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (state?.error) {
      showToast(state.error, "error");
    } else if (state?.success) {
      showToast("처리가 완료되었습니다.", "success");
    }
  }, [state, showToast]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!confirm(message)) {
        event.preventDefault();
      }
    },
    [message]
  );

  return (
    <form action={formAction} onSubmit={handleSubmit}>
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      {children}
    </form>
  );
};
