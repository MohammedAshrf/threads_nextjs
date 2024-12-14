"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoos";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function fetchUserThreads(userId: string) {
  try {
    connectToDB();

    // Find all the threads authoued by user with the given userId
    // const threads  = await User.findById({id: userId})
    // TEST THE LINE ABOVE
    const threads = await User.findOne({ id: userId })
      .populate({
        path: "threads",
        model: Thread,
        populate: {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      })
      .exec();

    return threads;
  } catch (err) {
    throw new Error("error while fetching user threads " + err);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptoins = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptoins)
      .skip(skipAmount)
      .limit(pageSize);

    const totalThreadsCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalThreadsCount > skipAmount + users.length;

    return { users, isNext };
  } catch (err: any) {
    throw new Error("error while fetching users " + err.message);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userThreads = await Thread.find({ author: userId });

    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const query = {
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    };

    const replies = await Thread.find(query).populate({
      path: "author",
      model: User,
      select: "_id name image",
    });

    return replies;
  } catch (err) {
    throw new Error("error while fetching activities " + err);
  }
}
