const { gql } = require("apollo-server-express");

const outletSchema = gql`
  type UserOutlet {
    id: Int
    name: String
    access: Int
  }

  type Outlet {
    id: Int
    name: String
    users: [UserOutlet]
  }

  type OutletsWithSum {
    outlets: [Outlet]
    sum: Int
  }

  type Query {
    getOutlets: OutletsWithSum
    getOutlet(name: String): Outlet
  }

  type Mutation {
    createOutlet(name: String, users: String): Outlet
    editOutlet(id: Int, name: String, users: String): Outlet
    deleteOutlet(id: Int): Outlet
  }
`;

module.exports = outletSchema;
