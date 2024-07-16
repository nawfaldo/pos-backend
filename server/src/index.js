const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./graphql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const mysql = require("mysql");
const { cookieConfig } = require("./utils/cookie");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const cookie = mysql.createConnection(cookieConfig);

const sessionStore = new MySQLStore({}, cookie);

app.use(
  session({
    name: "kukis",
    store: sessionStore,
    secret: "514701",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "strict",
    },
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://studio.apollographql.com"],
    credentials: true,
  })
);

app.use(helmet());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
  context: ({ req }) => {
    return {
      session: req.session,
    };
  },
});

server.start().then(() => {
  server.applyMiddleware({ app, cors: false });

  const port = 4000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`);
  });
});
