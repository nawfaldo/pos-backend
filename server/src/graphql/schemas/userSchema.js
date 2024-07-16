const { gql } = require("apollo-server-express");

const userSchema = gql`
  type UserGroupRoleDetail {
    id: Int
    name: String
    access: Boolean
  }

  type UserGroupRole {
    id: Int
    name: String
    details: [UserGroupRoleDetail]
  }

  type UserGroup {
    id: Int
    name: String
    roles: [UserGroupRole]
  }

  type User {
    id: Int
    name: String
    password: String
    userGroup: UserGroup
    menus: String
    toMenu: String
    access: String
  }

  type UsersWithSum {
    users: [User]
    userSum: Int
  }

  type Query {
    getAuthUser(menu: String): User
    getUsers(take: Int, skip: Int): UsersWithSum
    getUser(name: String): User
    searchUsers(take: Int, skip: Int, search: String): UsersWithSum

    getUserGroups: [UserGroup]
    getUserGroup(name: String): UserGroup
  }

  type Mutation {
    login(name: String, password: String): User
    logout: User

    createUser(name: String, password: String, userGroupId: Int): User
    updateUser(
      userId: Int
      userName: String
      name: String
      password: String
      userGroupId: Int
    ): User
    deleteUser(id: Int): User

    createUserGroup(name: String, check: String): UserGroup
    editUserGroup(id: Int, name: String, check: String): UserGroup
    deleteUserGroup(id: Int): UserGroup
  }
`;

module.exports = userSchema;
