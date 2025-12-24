"use client";

import { useCallback } from "react";

interface ConfirmFormProps {
  action: (formData: FormData) => void;
  message: string;
  hiddenFields?: Record<string, string>;
  children: React.ReactNode;
}

export const ConfirmForm = ({ action, message, hiddenFields, children }: ConfirmFormProps) => {
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      if (!confirm(message)) {
        event.preventDefault();
      }
    },
    [message]
  );

  return (
    <form action={action} onSubmit={handleSubmit}>
      {hiddenFields &&
        Object.entries(hiddenFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      {children}
    </form>
  );
};
