import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return;

  const user = await currentUser();
  if (!user) return;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard {...thread} />
      </div>
      <div className="mt-7">
        <Comment
          threadId={params.id}
          currentUserId={userInfo.id}
          currentUserImg={userInfo.image}
        />
      </div>

      <div className="mt-10">
        {thread.children.map((childItem) => (
          <ThreadCard {...childItem} isComment />
        ))}
      </div>
    </section>
  );
};

export default Page;
