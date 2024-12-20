"use client";

import Link from "next/link";
import { sidebarLinks } from "../../constants/index";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignOutButton, useUser } from "@clerk/nextjs";

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const userId = useUser().user?.id;
  // console.log(userId);

  //   console.log(pathname);

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          if (link.route === "/profile" && userId) {
            link.route = `${link.route}/${userId}`;
          }

          return (
            <Link
              key={link.label}
              href={link.route}
              className={`leftsidebar_link hover:bg-se ${
                isActive && "bg-primary-600"
              }`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={"24"}
                height={"24"}
              />
              <p className="text-light-1 max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton redirectUrl="/sign-in">
            <div className="flex cursor-pointer gap-4 p-4">
              <Image
                src={"/assets/logout.svg"}
                alt="logout"
                width={"24"}
                height={"24"}
              />

              <p
                className="text-light-2
               max-lg:hidden "
              >
                Logout
              </p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}
