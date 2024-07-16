const { ROLE_LIST } = require("../../utils/lists");
const { prisma } = require("../../utils/prisma");

const Query = {
  getAuthUser: async (parent, { menu }, { session }) => {
    if (session.userId === undefined) {
      throw new Error("Not authenticated");
    }

    const user = await prisma.user.findUnique({
      select: {
        name: true,
        userGroupId: true,
        userGroup: {
          select: {
            name: true,
          },
        },
      },
      where: {
        id: session.userId,
      },
    });

    const roles = ROLE_LIST;

    let menus = [];

    for (let r of roles) {
      const role = await prisma.userGroupRole.findFirst({
        where: {
          userGroupId: user.userGroupId,
          name: r,
        },
        select: {
          id: true,
          name: true,
        },
      });
      const roleDetails = await prisma.userGroupRoleDetail.findMany({
        where: {
          userGroupRoleId: role.id,
          name: "view",
        },
        select: {
          access: true,
        },
      });

      for (let d of roleDetails) {
        if (d.access === true) {
          menus.push({ menu: role.name });
        }
      }
    }

    let access = [];

    if (menu) {
      const parsedMenu = JSON.parse(menu);

      const userGroupRole = await prisma.userGroupRole.findFirst({
        where: {
          name: parsedMenu.name,
          userGroupId: user.userGroupId,
        },
        select: {
          id: true,
        },
      });

      const detailNames = parsedMenu?.details?.map((item) => item.name);

      const userGroupRoleDetails = await prisma.userGroupRoleDetail.findMany({
        where: {
          userGroupRoleId: userGroupRole.id,
          name: {
            in: detailNames,
          },
        },
        select: {
          name: true,
          access: true,
        },
      });

      access = userGroupRoleDetails;
    }

    return {
      ...user,
      menus: menus.length === 0 ? undefined : JSON.stringify(menus),
      access: menu !== undefined ? JSON.stringify(access) : undefined,
    };
  },
  getUsers: async (parent, { take, skip, search }, { session }) => {
    const users = await prisma.user.findMany({
      include: {
        userGroup: true,
      },
      take: take,
      skip: skip,
    });

    let userSum = await prisma.sum.findUnique({
      where: {
        id: 1,
      },
    });

    return { users, userSum: userSum.sum };
  },
  getUser: async (parent, { name }, { session }) => {
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
      include: {
        userGroup: true,
      },
    });

    return user;
  },
  searchUsers: async (parent, { take, skip, search }, { session }) => {
    const users = await prisma.user.findMany({
      include: {
        userGroup: true,
      },
      take: take,
      skip: skip,
      where: {
        name: {
          contains: search,
        },
      },
    });

    let userSum = await prisma.user.count({
      where: {
        name: {
          contains: search,
        },
      },
    });

    return { users, userSum };
  },

  getUserGroups: async (parent, args, { session }) => {
    const groups = await prisma.userGroup.findMany();

    return groups;
  },
  getUserGroup: async (parent, { name }, { session }) => {
    const userGroup = await prisma.userGroup.findUnique({
      where: {
        name: name,
      },
    });

    let roles = [];
    const rolesList = [
      "dashboard",
      "buy",
      "sell",
      "product",
      "inventory",
      "outlet",
      "user",
    ];

    for (let r of rolesList) {
      const role = await prisma.userGroupRole.findFirst({
        where: {
          userGroupId: userGroup.id,
          name: r,
        },
      });
      const roleDetails = await prisma.userGroupRoleDetail.findMany({
        where: {
          userGroupRoleId: role.id,
        },
      });

      roles.push({ name: role.name, details: roleDetails });
    }

    return { id: userGroup.id, name: userGroup.name, roles: roles };
  },
};

const Mutation = {
  login: async (parent, { name, password }, { session }) => {
    const user = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (!user) {
      throw new Error("Either name or password is wrong");
    }

    if (user.password !== password) {
      throw new Error("Either name or password is wrong");
    }

    session.userId = user.id;

    let toMenu = "";

    const roles = ROLE_LIST;

    let shouldBreak = false;

    for (let r of roles) {
      if (shouldBreak) break;

      const role = await prisma.userGroupRole.findFirst({
        where: {
          userGroupId: user.userGroupId,
          name: r,
        },
      });
      const roleDetails = await prisma.userGroupRoleDetail.findMany({
        where: {
          userGroupRoleId: role.id,
          name: "view",
        },
      });

      for (let d of roleDetails.filter((f) => f.name === "view")) {
        if (d.access === true) {
          if (r === "user") {
            toMenu = "/user/users";
          } else {
            toMenu = r;
          }

          shouldBreak = true;
        }
      }
    }

    return { ...user, toMenu };
  },
  logout: async (parent, args, { session }) => {
    session.userId = undefined;
  },

  createUser: async (parent, { name, password, userGroupId }, { session }) => {
    const checkUser = await prisma.user.findUnique({
      where: {
        name: name,
      },
    });

    if (checkUser) {
      throw new Error(
        JSON.stringify({ name: "User with that name already exists" })
      );
    }

    const user = await prisma.user.create({
      data: {
        name: name,
        password: password,
        userGroup: {
          connect: {
            id: userGroupId,
          },
        },
      },
    });

    await prisma.sum.update({
      where: {
        id: 1,
      },
      data: {
        sum: {
          increment: 1,
        },
      },
    });

    return user;
  },
  updateUser: async (
    parent,
    { userId, userName, name, password, userGroupId },
    { session }
  ) => {
    if (name) {
      const checkUser = await prisma.user.findUnique({
        where: {
          name: name,
        },
      });

      if (checkUser) {
        throw new Error(
          JSON.stringify({ name: "User with that name already exists" })
        );
      }
    }

    let user = {};

    if (name || password) {
      const update = await prisma.user.update({
        data: {
          name: name,
          password: password,
        },
        where: {
          id: userId,
        },
      });

      user = update;
    }

    if (userGroupId) {
      const update = await prisma.user.update({
        data: {
          userGroup: {
            connect: {
              id: userGroupId,
            },
          },
        },
        where: {
          id: userId,
        },
      });

      user = update;
    }

    return user;
  },
  deleteUser: async (parent, { id }, { session }) => {
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });

    await prisma.sum.update({
      where: {
        id: 1,
      },
      data: {
        sum: {
          decrement: 1,
        },
      },
    });

    return user;
  },

  createUserGroup: async (parent, { name, check }, { session }) => {
    const checks = JSON.parse(check);
    // console.log(checks);

    const userGroup = await prisma.userGroup.create({
      data: {
        name: name,
      },
      select: {
        id: true,
      },
    });

    for (let r of checks) {
      const userGroupRole = await prisma.userGroupRole.create({
        data: {
          name: r.name.toLowerCase(),
          userGroup: {
            connect: {
              id: userGroup.id,
            },
          },
        },
        select: {
          id: true,
        },
      });

      for (let d of r.details) {
        await prisma.userGroupRoleDetail.create({
          data: {
            name: d.name.toLowerCase(),
            access: d.access,
            userGroupRole: {
              connect: {
                id: userGroupRole.id,
              },
            },
          },
          select: false,
        });
      }
    }
  },
  editUserGroup: async (parent, { id, name, check }, { session }) => {
    if (name) {
      const checkGroup = await prisma.userGroup.findUnique({
        where: {
          name: name,
        },
      });

      if (checkGroup) {
        throw new Error(
          JSON.stringify({ name: "Group with that name already exists" })
        );
      }

      userGroup = await prisma.userGroup.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });
    }

    const list = JSON.parse(check);

    if (list.length !== 0) {
      list[0].forEach(async (l) => {
        await prisma.userGroupRoleDetail.update({
          where: {
            id: l.id,
          },
          data: {
            access: l.access,
          },
        });
      });
    }
  },
  deleteUserGroup: async (parent, { id }, { session }) => {
    const check = await prisma.user.findMany({
      where: {
        userGroupId: id,
      },
    });

    if (check?.length !== 0) {
      throw new Error(
        JSON.stringify({ user: "There are users with this group" })
      );
    }

    const roles = [
      "dashboard",
      "buy",
      "sell",
      "product",
      "inventory",
      "outlet",
      "user",
    ];

    for (const r of roles) {
      const role = await prisma.userGroupRole.findFirst({
        where: {
          userGroupId: id,
          name: r,
        },
        select: {
          id: true,
        },
      });

      if (role) {
        await prisma.userGroupRoleDetail.deleteMany({
          where: {
            userGroupRoleId: role.id,
          },
        });
      }
    }

    await prisma.userGroupRole.deleteMany({
      where: {
        userGroupId: id,
      },
    });

    await prisma.userGroup.delete({
      where: {
        id: id,
      },
    });
  },
};

const userResolvers = {
  Query,
  Mutation,
};

module.exports = userResolvers;
