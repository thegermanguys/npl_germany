import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav user={null} />
      <section className="page-hero">
        <div className="wrap">
          <h1>Not found</h1>
          <p className="lede">
            <Link href="/">Back home</Link>
          </p>
        </div>
      </section>
    </>
  );
}
