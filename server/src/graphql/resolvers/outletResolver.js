const { ROLE_LIST } = require("../../utils/lists");
const { prisma } = require("../../utils/prisma");

const Query = {
  getOutlets: async (parent, args, { session }) => {
    const outlets = await prisma.outlet.findMany({
      select: {
        name: true,
      },
    });

    const sum = await prisma.sum.findUnique({
      where: {
        id: 3,
      },
      select: {
        sum: true,
      },
    });

    return { outlets, sum: sum.sum };
  },
  getOutlet: async (parent, { name }, { session }) => {
    const outlet = await prisma.outlet.findUnique({
      where: {
        name: name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const users = await prisma.userOutlet.findMany({
      where: {
        outletId: outlet.id,
      },
      select: {
        access: true,
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    const mappedUser = [];

    users.forEach((u) => {
      mappedUser.push({
        id: u.user.id,
        name: u?.user?.name,
        access: u?.access,
      });
    });

    return { id: outlet.id, name: outlet.name, users: mappedUser };
  },
};

const Mutation = {
  createOutlet: async (parent, { id, name, users }, { session }) => {
    const check = await prisma.outlet.findUnique({
      where: {
        name: name,
      },
      select: {
        id: true,
      },
    });

    if (check) {
      throw new Error(
        JSON.stringify({ name: "Outlet with that name already exists" })
      );
    }

    const outlet = await prisma.outlet.create({
      data: {
        name: name,
      },
      select: {
        id: true,
      },
    });

    const parsedUsers = JSON.parse(users);

    await parsedUsers.forEach(async (u) => {
      await prisma.userOutlet.create({
        data: {
          access: u?.access,
          user: {
            connect: {
              id: u?.id,
            },
          },
          outlet: {
            connect: {
              id: outlet?.id,
            },
          },
        },
        select: false,
      });
    });

    await prisma.sum.update({
      where: {
        id: 3,
      },
      select: false,
      data: {
        sum: {
          increment: 1,
        },
      },
    });
  },
  editOutlet: async (parent, { id, name, users }, { session }) => {
    if (name !== undefined) {
      const checkOutletName = await prisma.outlet.findUnique({
        where: {
          name: name,
        },
        select: {
          id: true,
        },
      });

      if (checkOutletName) {
        throw new Error(
          JSON.stringify({ name: "Outlet with that name already exists" })
        );
      }

      await prisma.outlet.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
        select: false,
      });
    }
    if (users !== undefined) {
      const parsedUsers = JSON.parse(users);

      const editedUsers = parsedUsers.filter(
        (u) => u?.removed === undefined && u?.added === undefined
      );
      if (editedUsers.length !== 0) {
        await editedUsers.forEach(async (u) => {
          await prisma.userOutlet.update({
            where: {
              userId_outletId: {
                userId: u?.id,
                outletId: id,
              },
            },
            data: {
              access: u?.change,
            },
            select: false,
          });
        });
      }

      const removedUsers = parsedUsers.filter((u) => u?.removed === true);
      if (removedUsers.length !== 0) {
        await removedUsers.forEach(async (u) => {
          await prisma.userOutlet.delete({
            where: {
              userId_outletId: {
                userId: u?.id,
                outletId: id,
              },
            },
            select: false,
          });
        });
      }

      const addedUsers = parsedUsers.filter((u) => u?.added === true);
      if (addedUsers.length !== 0) {
        await addedUsers.forEach(async (u) => {
          await prisma.userOutlet.create({
            data: {
              access: u?.change,
              user: {
                connect: {
                  id: u?.id,
                },
              },
              outlet: {
                connect: {
                  id: id,
                },
              },
            },
            select: false,
          });
        });
      }
    }
  },
  deleteOutlet: async (parent, { id }, { session }) => {
    await prisma.userOutlet.deleteMany({
      where: {
        outletId: id,
      },
    });

    await prisma.outlet.delete({
      where: {
        id: id,
      },
      select: false,
    });

    await prisma.sum.update({
      where: {
        id: 3,
      },
      data: {
        sum: {
          decrement: 1,
        },
      },
      select: false,
    });
  },
};

const outletResolvers = {
  Query,
  Mutation,
};

module.exports = outletResolvers;
