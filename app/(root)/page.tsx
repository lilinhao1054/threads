import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return;

  let userInfo;

  try {
    userInfo = await fetchUser(user.id);
  } catch (error) {}
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(
    searchParams.page ? +searchParams.page : 1,
    5
  );

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard {...post} currentUserId={user.id} />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="/"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        hasNext={result.hasNext}
      />
    </>
  );
}
