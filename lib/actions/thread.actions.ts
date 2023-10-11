"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { Thread } from "@prisma/client";

export const createThread = async ({
  text,
  authorId,
  communityId,
}: {
  text: string;
  authorId: string;
  communityId?: string;
}) => {
  try {
    if (communityId)
      await prisma.thread.create({
        data: {
          text,
          author: {
            connect: { id: authorId },
          },
          community: {
            connect: { clerkId: communityId },
          },
        },
      });
    else
      await prisma.thread.create({
        data: {
          text,
          authorId,
        },
      });
    revalidatePath("/");
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
};

export const fetchPosts = async (pageNumber = 1, pageSize = 5) => {
  try {
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    let posts = await prisma.thread.findMany({
      skip,
      take,
      include: {
        author: true,
        children: {
          include: {
            author: true,
          },
        },
        community: true,
      },
    });

    posts = posts.filter((post) => !post.parentId);

    const total = await prisma.thread.count();
    const hasNext = total > skip + take;
    return { posts, hasNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

export const fetchThreadById = async (id: string) => {
  try {
    return await prisma.thread.findUniqueOrThrow({
      where: { id },
      include: {
        author: true,
        children: {
          include: {
            author: true,
            children: {
              include: {
                author: true,
              },
            },
          },
        },
        community: true,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
};

export const addCommentToThread = async (
  parentId: string,
  text: string,
  authorId: string,
  path: string
) => {
  try {
    await prisma.thread.create({
      data: {
        text,
        authorId,
        parentId,
      },
    });
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
};

async function deleteThreadHelper(thread: Thread) {
  const children = await prisma.thread.findMany({
    where: {
      parentId: thread.id,
    },
  });
  for (const child of children) {
    await deleteThreadHelper(child);
  }

  await prisma.thread.delete({
    where: {
      id: thread.id,
    },
  });
}

export const deleteThread = async (id: string, path: string) => {
  try {
    const thread = await prisma.thread.findUniqueOrThrow({ where: { id } });
    await deleteThreadHelper(thread);
    revalidatePath(path);
    revalidatePath("/");
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
};
