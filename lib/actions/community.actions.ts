"use server";

import prisma from "../prisma";

export const fetchCommunities = async ({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
}) => {
  try {
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;
    const communities = await prisma.community.findMany({
      skip,
      take,
      where: {
        OR: [
          {
            username: {
              contains: searchString,
            },
          },
          {
            name: {
              contains: searchString,
            },
          },
        ],
      },
      include: {
        members: true,
      },
    });

    const total = await prisma.user.count();
    const hasNext = total > skip + take;
    return { communities, hasNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch communities: ${error.message}`);
  }
};

export const fetchCommunityDetails = async (clerkId: string) => {
  try {
    return await prisma.community.findUniqueOrThrow({
      where: {
        clerkId,
      },
      include: {
        createdBy: true,
        members: true,
        threads: true,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch community details: ${error.message}`);
  }
};

export const fetchCommunityPosts = async (communityId: string) => {
  try {
    let threads = await prisma.thread.findMany({
      where: { communityId },
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
    const community = await prisma.community.findUniqueOrThrow({
      where: { id: communityId },
    });
    return { ...community, threads };
  } catch (error: any) {
    throw new Error(`Failed to fetch community's posts: ${error.message}`);
  }
};

export const createCommunity = async (
  clerkId: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  creatorId: string
) => {
  try {
    await prisma.community.create({
      data: {
        clerkId,
        name,
        username,
        image,
        bio,
        createdBy: {
          connect: { clerkId: creatorId },
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to create community: ${error.message}`);
  }
};

export const deleteCommunity = async (communityId: string) => {
  try {
    await prisma.community.delete({ where: { clerkId: communityId } });
  } catch (error: any) {
    throw new Error(`Failed to delete community: ${error.message}`);
  }
};

export const updateCommunityInfo = async (
  communityId: string,
  name: string,
  username: string,
  image: string
) => {
  try {
    await prisma.community.update({
      where: {
        clerkId: communityId,
      },
      data: {
        name,
        username,
        image,
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to update community info: ${error.message}`);
  }
};

export const addMemberToCommunity = async (
  communityId: string,
  memberId: string
) => {
  try {
    await prisma.community.update({
      where: {
        clerkId: communityId,
      },
      data: {
        members: {
          connect: [{ clerkId: memberId }],
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to add member to community: ${error.message}`);
  }
};

export const removeUserFromCommunity = async (
  userId: string,
  communityId: string
) => {
  try {
    await prisma.community.update({
      where: {
        clerkId: communityId,
      },
      data: {
        members: {
          disconnect: [{ clerkId: userId }],
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to remove user from community: ${error.message}`);
  }
};
