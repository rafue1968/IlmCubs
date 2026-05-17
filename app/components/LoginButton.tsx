"use client";

type Props = {
  className?: string;
  href?: string;
  onClickStart?: () => void;
  testId?: string;
  children?: string;
};

export default function LoginButton({
  className,
  href = "/api/auth/login",
  onClickStart,
  testId,
  children,
}: Props) {
  return (
    <a
      href={href}
      data-testid={testId}
      onClick={() => {
        onClickStart?.();
      }}
      className={className}
    >
      {children ?? "Sign in"}
    </a>
  );
}
