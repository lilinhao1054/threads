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

export const fetchCommunityDetails = async (id: string) => {
  try {
    return await prisma.community.findUniqueOrThrow({
      where: {
        id,
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

export const createCommunity = async (
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string
) => {
  try {
    // todo
  } catch (error: any) {
    throw new Error(`Failed to create community: ${error.message}`);
  }
};

export const deleteCommunity = async (communityId: string) => {
  try {
    // todo
  } catch (error: any) {
    throw new Error(`Failed to delete community: ${error.message}`);
  }
};

export const updateCommunityInfo = async (
  communityId: string,
  name: string,
  usesrname: string,
  image: string
) => {
  try {
    // todo
  } catch (error: any) {
    throw new Error(`Failed to update community info: ${error.message}`);
  }
};

export const addMemberToCommunity = async (
  communityId: string,
  memberId: string
) => {
  try {
    // todo
  } catch (error: any) {
    throw new Error(`Failed to add member to community: ${error.message}`);
  }
};

export const removeUserFromCommunity = async (
  userId: string,
  communityId: string
) => {
  try {
    // todo
  } catch (error: any) {
    throw new Error(`Failed to remove user from community: ${error.message}`);
  }
};
