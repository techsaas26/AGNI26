import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-8xl font-bold text-cassette">404</h1>
      <p className="text-xl">This tape got chewed up.</p>
      <Link href="/" className="text-mustard underline">
        Rewind to home
      </Link>
    </section>
  );
}
