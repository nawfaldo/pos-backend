const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.userGroup.create({
    data: {
      name: "Admin",
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "dashboard",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "buy",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 2,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "sell",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 3,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "inventory",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 4,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "product",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 5,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "outlet",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 6,
        },
      },
    },
  });
  await prisma.userGroupRole.create({
    data: {
      name: "user",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "view",
      access: true,
      userGroupRole: {
        connect: {
          id: 7,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "create",
      access: true,
      userGroupRole: {
        connect: {
          id: 7,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "edit",
      access: true,
      userGroupRole: {
        connect: {
          id: 7,
        },
      },
    },
  });
  await prisma.userGroupRoleDetail.create({
    data: {
      name: "delete",
      access: true,
      userGroupRole: {
        connect: {
          id: 7,
        },
      },
    },
  });
  await prisma.user.create({
    data: {
      name: "Admin",
      password: "1234",
      userGroup: {
        connect: {
          id: 1,
        },
      },
    },
  });
  await prisma.sum.create({
    data: {
      name: "user",
      sum: 1,
    },
  });
  await prisma.sum.create({
    data: {
      name: "user group",
      sum: 1,
    },
  });
  await prisma.sum.create({
    data: {
      name: "outlet",
      sum: 0,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
