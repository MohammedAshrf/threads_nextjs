import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import UserCard from "../cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "../cards/CommunityCard";

export default async function RightSidebar() {
  const user = await currentUser();
  // const userInfo = await fetchUser(user.id);

  const users = await fetchUsers({
    userId: user?.id || "",
    pageNumber: 1,
    pageSize: 6,
  });

  const communities = await fetchCommunities({
    pageNumber: 1,
    pageSize: 6,
  });

  return (
    <section className="custom-scrollbar rightsidebar">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>

        <div className="mt-14 flex flex-col gap-9">
          {users.users.length === 0 ? (
            <p className="no-result"> No Result </p>
          ) : (
            <>
              {users.users.map((person) => (
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
      </div>
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium text-light-1">
          Suggested Communities
        </h3>

        <section className="mt-9 flex flex-wrap gap-4">
          {communities.communities.length === 0 ? (
            <p className="no-result"> No Result </p>
          ) : (
            <>
              {communities.communities.map((community) => (
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
      </div>
    </section>
  );
}
