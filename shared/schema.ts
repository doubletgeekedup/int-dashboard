import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sources of Truth
export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // STC, CPT, SLC, TMC, CAS, NVL
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, syncing, error
  version: text("version").notNull(),
  uptime: text("uptime").notNull().default("99.9%"),
  recordCount: integer("record_count").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(150), // in ms
  lastSync: timestamp("last_sync").defaultNow(),
  connectionString: text("connection_string"),
  apiEndpoint: text("api_endpoint"),
  isJanusGraph: boolean("is_janus_graph").default(false),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulletins and Updates
export const bulletins = pgTable("bulletins", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary").notNull(),
  priority: text("priority").notNull().default("medium"), // critical, high, medium, low
  category: text("category").notNull(), // security, feature, maintenance, developer-notes
  author: text("author").notNull(),
  isRead: boolean("is_read").default(false),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages for LLM Analysis
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sourceCode: text("source_code"), // null for general dashboard chat
  message: text("message").notNull(),
  response: text("response").notNull(),
  sessionId: text("session_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Integration Transactions/Activities
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  sourceCode: text("source_code").notNull(),
  type: text("type").notNull(), // cache-update, data-sync, query-process, config-update
  status: text("status").notNull(), // success, processing, failed, error
  duration: integer("duration"), // in ms
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Knowledge Base Links
export const knowledgeLinks = pgTable("knowledge_links", {
  id: serial("id").primaryKey(),
  sourceCode: text("source_code"), // null for general links
  title: text("title").notNull(),
  description: text("description").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(), // documentation, api-reference, troubleshooting
  icon: text("icon").notNull().default("fas fa-book"),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance Metrics
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  sourceCode: text("source_code").notNull(),
  metricType: text("metric_type").notNull(), // response-time, throughput, error-rate, uptime
  value: integer("value").notNull(),
  unit: text("unit").notNull(), // ms, requests/sec, percentage
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert Schemas
export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulletinSchema = createInsertSchema(bulletins).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeLinkSchema = createInsertSchema(knowledgeLinks).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  timestamp: true,
});

// Types
export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;

export type Bulletin = typeof bulletins.$inferSelect;
export type InsertBulletin = z.infer<typeof insertBulletinSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type KnowledgeLink = typeof knowledgeLinks.$inferSelect;
export type InsertKnowledgeLink = z.infer<typeof insertKnowledgeLinkSchema>;

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;

// API Response Types
export type DashboardStats = {
  totalIntegrations: number;
  activeSources: number;
  dataPoints: string;
  avgResponseTime: string;
};

export type SourceStats = {
  status: string;
  version: string;
  records: string;
  responseTime: string;
  uptime: string;
};
