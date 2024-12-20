import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  image: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    name: string;
    image: string;
    id: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

{
  /* <h2 className="text-small-regular text-light-2">{content}</h2> */
}

export default function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  image,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) {
  // console.log(community);

  return (
    <article
      className={`flex flex-col w-full rounded-xl ${
        isComment ? "mt-4 px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 w-full flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="profile image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            <div className="thread-card_bar"></div>
          </div>

          <div>
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="cursor-pointer text-base-semibold text-light-1">
                {author.name}
              </h4>
            </Link>

            <p className="mt-2 text-small-regular text-light-2">{content}</p>

            {/* {image && (
              <div className="w-[400px] h-[200px] relative mt-5">
                <Image src={image} alt="thread image" fill />
              </div>
            )} */}

            {image && (
              <div className="relative w-[400px] pb-[50%] mt-5 overflow-hidden">
                <Image
                  src={image}
                  alt="thread image"
                  layout="fill"
                  objectFit="contain"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )}

            <div className="mt-5 flex-flex-col gap-3">
              <div className="flex gap-3.5">
                <Image
                  src={"/assets/heart-gray.svg"}
                  alt="heart"
                  width={28}
                  height={28}
                  className="cursor-pointer object-contain p-0.5 rounded-xl hover:bg-primary-400"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src={"/assets/reply.svg"}
                    alt="reply"
                    width={28}
                    height={28}
                    className="cursor-pointer object-contain p-0.5 rounded-xl hover:bg-primary-400"
                  />
                </Link>
                <Image
                  src={"/assets/share.svg"}
                  alt="share"
                  width={28}
                  height={28}
                  className="cursor-pointer object-contain p-0.5 rounded-xl hover:bg-primary-400"
                />
                <Image
                  src={"/assets/repost.svg"}
                  alt="repost"
                  width={28}
                  height={28}
                  className="cursor-pointer object-contain p-0.5 rounded-xl hover:bg-primary-400"
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* TODO: DeleteThread */}
        {/* TODO: Show commetn logos */}
      </div>
      {!isComment && community && (
        <Link
          href={`communities/${community.id}`}
          className="mt-5 flex items-center"
        >
          <p className="text-subtel-medium text-gray-1">
            {formatDateString(createdAt)}- {community.name} Community
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className="ml-1 rounded-full object-cover"
          />
        </Link>
      )}
    </article>
  );
}
