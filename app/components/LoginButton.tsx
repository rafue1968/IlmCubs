"use client";

type Props = {
  className?: string;
  onClickStart?: () => void;
  children?: string;
};

export default function LoginButton({ className, onClickStart, children }: Props) {
  return (
    <a
      href="/api/auth/login"
      onClick={() => {
        onClickStart?.();
      }}
      className={className}
    >
      {children ?? "Sign in"}
    </a>
  );
}
