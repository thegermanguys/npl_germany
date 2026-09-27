import { logoutUser } from "@/app/actions/auth";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={logoutUser}>
      <button type="submit" className={className ?? "text-link"}>
        Sign out
      </button>
    </form>
  );
}
