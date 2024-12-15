import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Searchbar from "@/components/shared/Searchbar";
import Pagination from "@/components/shared/Pagination";
import CommunityCard from "@/components/cards/CommunityCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  let getSearchParams = await searchParams;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarding) redirect("/onboarding");

  const result = await fetchCommunities({
    searchString: getSearchParams.q,
    pageNumber: getSearchParams?.page ? +getSearchParams.page : 1,
    pageSize: 25,
  });

  return (
    <>
      <div className="mt-5">
        <Searchbar routeType="communities" />
      </div>

      <section className="mt-9 flex flex-wrap gap-4">
        {result.communities.length === 0 ? (
          <p className="no-result">No Result</p>
        ) : (
          <>
            {result.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="communities"
        pageNumber={getSearchParams?.page ? +getSearchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}
