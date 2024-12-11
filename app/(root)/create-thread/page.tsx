import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function page() {
  const user = await currentUser();
  //   console.log(user.id);

  // => test:
  // -- What'll happen if you commented the following line.s
  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarding) redirect("onboarding");

  return (
    <div>
      <h1 className="head-text">create thread</h1>

      <PostThread userId={userInfo._id.toString()} />
    </div>
  );
}
