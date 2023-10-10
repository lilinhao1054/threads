import { redirect } from "next/navigation";

// import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import ThreadCard from "../cards/ThreadCard";

interface Result {
  name: string;
  image: string | null;
  clerkId: string;
  threads: {
    id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string | null;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string | null;
    } | null;
    createdAt: Date;
    children: {
      author: {
        image: string | null;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    // result = await fetchCommunityPosts(accountId);
    result = await fetchUserPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          id={thread.id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          text={thread.text}
          author={
            accountType === "User"
              ? {
                  name: result.name,
                  image: result.image,
                  clerkId: result.clerkId,
                }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  clerkId: thread.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.clerkId, image: result.image }
              : thread.community
          }
          createdAt={thread.createdAt}
          children={thread.children}
        />
      ))}
    </section>
  );
}

export default ThreadsTab;
