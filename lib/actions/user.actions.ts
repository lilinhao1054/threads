"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const upsertUser = async ({
  clerkId,
  username,
  name,
  bio,
  image,
  path,
}: {
  clerkId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}) => {
  try {
    await prisma.user.upsert({
      where: {
        clerkId,
      },
      update: {
        clerkId,
        username,
        name,
        bio,
        image,
        onboarded: true,
      },
      create: {
        clerkId,
        username,
        name,
        bio,
        image,
        onboarded: true,
      },
    });

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
};

export const fetchUser = async (clerkId: string) => {
  try {
    let res = await prisma.user.findUniqueOrThrow({
      where: { clerkId },
      include: { threads: true },
    });
    res.threads = res.threads.filter((thread) => !thread.parentId);
    return res;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const fetchUsers = async ({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
}) => {
  try {
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    const users = await prisma.user.findMany({
      skip,
      take,
      where: {
        OR: [
          {
            name: {
              contains: searchString,
            },
          },
          {
            username: {
              contains: searchString,
            },
          },
        ],
      },
    });

    const total = await prisma.user.count();
    const hasNext = total > skip + take;
    return { users, hasNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

export const fetchUserPosts = async (authorId: string) => {
  try {
    let threads = await prisma.thread.findMany({
      where: { authorId },
      include: {
        author: true,
        community: true,
        children: {
          include: {
            author: true,
          },
        },
      },
    });
    threads = threads.filter((threads) => !threads.parentId);
    const author = await prisma.user.findUniqueOrThrow({
      where: { id: authorId },
    });
    return { ...author, threads };
  } catch (error: any) {
    throw new Error(`Failed to fetch user's posts: ${error.message}`);
  }
};

export const getActivities = async (userId: string) => {
  try {
    const userThreads = await prisma.thread.findMany({
      where: { authorId: userId },
    });

    const replies = await prisma.thread.findMany({
      where: {
        parentId: {
          in: userThreads.map((thread) => thread.id),
        },
      },
      include: {
        author: true,
      },
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
};
