import Image from "next/image";
import Link from "next/link";

export default function Topbar() {
  return (
    <nav className="topbar">
      <Link href={"/"} className="flex items-center gap-4">
        <Image src={"/assets/logo.svg"} alt="logo" width={"28"} height={"28"} />
      </Link>
    </nav>
  );
}
