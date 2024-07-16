const userSchema = require("./schemas/userSchema");
const userResolvers = require("./resolvers/userResolver");
const outletSchema = require("./schemas/outletSchema");
const outletResolvers = require("./resolvers/outletResolver");

const typeDefs = [userSchema, outletSchema];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...outletResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...outletResolvers.Mutation,
  },
};

module.exports = { typeDefs, resolvers };
