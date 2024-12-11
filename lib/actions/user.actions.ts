"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoos";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarding: true,
      },
      { upsert: true }
    );

    if (path === "profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    // console.log(err);
    throw new Error("error while updating the user data " + err.message);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    // Query by string ID
    return await User.findOne({ id: userId });
    //   .populate({
    //   path: "communities",
    //   model: Community,
    // });
  } catch (err) {
    // console.log(err);
    throw new Error("error while fetching user " + err);
  }
}
