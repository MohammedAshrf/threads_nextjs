import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import UserCard from "@/components/cards/UserCard";
import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";

import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  // console.log(user);
  if (!user) return null;

  let getSearchParams = await searchParams;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarding) redirect("/onboarding");

  const result = await fetchUsers({
    userId: user.id,
    searchString: getSearchParams.q,
    // searchString: "",
    pageNumber: getSearchParams?.page ? +getSearchParams.page : 1,
    // pageNumber: 1,
    pageSize: 25,
  });

  return (
    <section>
      <Searchbar routeType="search" />

      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>

      <Pagination
        path="search"
        pageNumber={getSearchParams?.page ? +getSearchParams.page : 1}
        isNext={result.isNext}
      />
    </section>
  );
}
