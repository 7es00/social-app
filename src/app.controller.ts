import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createHandler } from "graphql-http/lib/use/express";
import expressPlayground from "graphql-playground-middleware-express";
import cron from "node-cron";

import { connectDB } from "./DB";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { initializeFirebase } from "./common/service/fcm.service";

// Routes
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import postRoutes from "./modules/post/post.routes";
import commentRoutes from "./modules/comment/comment.routes";
import requestRoutes from "./modules/request/request.routes";
import reactionRoutes from "./modules/reaction/reaction.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import storyRoutes from "./modules/story/story.routes";

// GraphQL
import { postSchema } from "./modules/post/graphql/post.type.gql";
import { postQueryResolvers } from "./modules/post/graphql/post.query.gql";
import { postMutationResolvers } from "./modules/post/graphql/post.mutation.gql";
import { StoryService } from "./modules/story/story.service";

const storyService = new StoryService();

export const createApp = (): Application => {
  const app = express();

  // Security & Parsing
  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health Check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: config.nodeEnv });
  });

  // REST API Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/posts", postRoutes);
  app.use("/api/v1/posts/:postId/comments", commentRoutes);
  app.use("/api/v1/requests", requestRoutes);
  app.use("/api/v1/reactions", reactionRoutes);
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/stories", storyRoutes);

  // GraphQL Endpoint
  app.all(
    "/graphql",
    createHandler({
      schema: postSchema,
      rootValue: { ...postQueryResolvers, ...postMutationResolvers },
      context: (req) => ({ user: (req.raw as any).user }),
    })
  );

  // GraphQL Playground (dev only)
  if (config.nodeEnv !== "production") {
    app.get("/playground", expressPlayground({ endpoint: "/graphql" }));
  }

  // 404 & Error Handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export const startServer = async (): Promise<void> => {
  // Connect DB
  await connectDB();

  // Firebase
  initializeFirebase();

  // Cron: clean expired stories every hour
  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running story cleanup cron job...");
    await storyService.cleanupExpiredStories();
  });

  const app = createApp();
  const PORT = config.port;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 GraphQL at http://localhost:${PORT}/graphql`);
    console.log(`🎮 Playground at http://localhost:${PORT}/playground`);
    console.log(`💚 Health at http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });
};
