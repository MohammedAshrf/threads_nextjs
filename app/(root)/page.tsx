import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <h1 className="head-text text-left">Threads</h1>
      <UserButton />
    </>
  );
}
