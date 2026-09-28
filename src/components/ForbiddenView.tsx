import Link from "next/link";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/session";

export async function ForbiddenView() {
  const user = await getSession();

  return (
    <>
      <Nav user={user} />
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">NPL GERMANY</div>
          <h1>You cannot open this page</h1>
          <p className="lede">
            <Link href="/">Back home</Link>
            {user ? null : (
              <>
                {" "}
                · <Link href="/login">Sign in</Link>
              </>
            )}
          </p>
        </div>
      </section>
    </>
  );
}
