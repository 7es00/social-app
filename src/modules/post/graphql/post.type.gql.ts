import { buildSchema } from "graphql";

export const postSchema = buildSchema(`
  type Media {
    url: String!
    publicId: String!
    type: String!
  }

  type User {
    _id: ID!
    firstName: String!
    lastName: String!
    username: String!
    profilePicture: String
  }

  type Post {
    _id: ID!
    userId: User!
    content: String
    media: [Media]
    privacy: String!
    tags: [User]
    location: String
    isPinned: Boolean!
    shareCount: Int!
    isDeleted: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type PostList {
    posts: [Post]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type Query {
    getPost(id: ID!): Post
    getFeed(page: Int, limit: Int): PostList
    getUserPosts(userId: ID!, page: Int, limit: Int): PostList
  }

  type Mutation {
    createPost(content: String, privacy: String, location: String): Post
    updatePost(id: ID!, content: String, privacy: String): Post
    deletePost(id: ID!): String
    pinPost(id: ID!): Post
  }
`);
