"use client";

type Props = {
  className?: string;
  onClickStart?: () => void;
  children?: string;
};

export default function LoginButton({ className, onClickStart, children }: Props) {
  async function handleLogin() {
    onClickStart?.();

    window.location.assign("/api/auth/login");
  }

  return (
    <button
      type="button"
      onClick={() => {
        handleLogin().catch((err) => {
          console.error(err);
          alert("Login failed. Please try again.");
        });
      }}
      className={className}
    >
      {children ?? "Sign in"}
    </button>
  );
}
