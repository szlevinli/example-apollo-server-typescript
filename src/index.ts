import { ApolloServer, gql, MockList } from 'apollo-server';

const libraries = [
  {
    branch: 'downtown',
  },
  {
    branch: 'riverside',
  },
];

// The branch field of a book indicates which library has it in stock
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    branch: 'riverside',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    branch: 'downtown',
  },
];

const typeDefs = gql`
  type Query {
    libraries: [Library]
    hello: String
    people: [People]
  }

  type Library {
    branch: String!
    books: [Book!]
  }

  type Book {
    title: String!
    author: Author!
  }

  type Author {
    name: String!
  }

  type People {
    name: String
    age: Int
  }
`;

const resolvers = {
  Query: {
    libraries: (): typeof libraries => libraries,
  },
  Library: {
    books: (parent: typeof libraries[0]): typeof books =>
      books.filter((book) => book.branch === parent.branch),
  },
  Book: {
    author: (parent: typeof books[0]): { name: string } => ({
      name: parent.author,
    }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks: {
    String: () => 'Hello',
    Query: () => ({
      people: () => new MockList([0, 12]),
    }),
  },
});

server.listen().then(({ url }) => console.log(`Server ready at ${url}`));
