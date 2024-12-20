// "use server";

// import { revalidatePath } from "next/cache";
// import Thread from "../models/thread.model";
// import User from "../models/user.model";
// import { connectToDB } from "../mongoos";

// interface Params {
//   text: string;
//   author: string;
//   communityId: string | null;
//   path: string;
// }

// export async function createThread({
//   text,
//   author,
//   communityId,
//   path,
// }: Params) {
//   try {
//     connectToDB();

//     const createdThread = await Thread.create({
//       text,
//       author,
//       community: null,
//     });

//     // Update user model
//     await User.findByIdAndUpdate(author, {
//       $push: { threads: createdThread._id },
//     });

//     revalidatePath(path);
//   } catch (err) {
//     throw new Error("error while creating thread " + err);
//   }
// }

// export async function fetchThreads(pageNumber = 1, pageSize = 20) {
//   try {
//     connectToDB();

//     // Calculate the number of threads to skip
//     const skipAmount = (pageNumber - 1) * pageSize;

//     // Fetch the posts that have no parents (top-level threads...)
//     const threadsQuery = Thread.find({
//       parentId: { $in: [null, undefined] },
//     })
//       .sort({ createAt: "desc" })
//       .skip(skipAmount)
//       .limit(pageSize)
//       .populate({ path: "author", model: User })
//       .populate({
//         path: "children",
//         populate: {
//           path: "author",
//           model: User,
//           select: "_id name parentId image",
//         },
//       });

//     const totalThreadsCount = await Thread.countDocuments({
//       parentId: {
//         $in: [null, undefined],
//       },
//     });

//     const threads = await threadsQuery.exec();

//     const isNext = totalThreadsCount > skipAmount + threads.length;

//     return { threads, isNext };
//   } catch (err) {
//     throw new Error("error while fetching threads " + err);
//   }
// }

// export async function fetchThreadById(id: string) {
//   try {
//     connectToDB();

//     // TODO: Pupulate community
//     const thread = await Thread.findById(id)
//       .populate({
//         path: "author",
//         model: User,
//         select: "_id id name image",
//       })
//       .populate({
//         path: "children",
//         populate: [
//           {
//             path: "author",
//             model: User,
//             select: "_id id name parentId image",
//           },
//           {
//             path: "children",
//             model: "Thread",
//             populate: {
//               path: "author",
//               model: User,
//               select: "_id id name parentId image",
//             },
//           },
//         ],
//       })
//       .exec();

//     return thread;
//   } catch (err) {
//     throw new Error("error while fetching the thread " + err);
//   }
// }

// export async function addCommentToThread(
//   threadId: string,
//   commentText: string,
//   userId: string,
//   path: string
// ) {
//   try {
//     connectToDB();

//     // Find the original thread by its ID.
//     const originalThread = await Thread.findById(threadId);

//     if (!originalThread) {
//       throw new Error("thread not found");
//     }

//     // Create a new thread with the commetn text
//     const commentThread = new Thread({
//       text: commentText,
//       author: userId,
//       parentId: threadId,
//     });

//     // Save the new thread
//     const savedCommentThread = await commentThread.save();

//     // Update the original thread to include the new comment
//     originalThread.children.push(savedCommentThread._id);

//     // Save the original thread
//     await originalThread.save();

//     revalidatePath(path);
//   } catch (err) {
//     throw new Error("error while adding comment " + err);
//   }
// }

"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoos";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const threads = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + threads.length;

  return { threads, isNext };
}

interface Params {
  text: string;
  image: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  image,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      image,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
