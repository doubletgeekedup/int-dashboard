import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Division Teams (Sources of Truth)
// Each division team contains multiple teams that cluster data nodes by type
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
  divisionType: text("division_type"), // system_operations, configuration_mgmt, service_coordination, etc.
  teamCount: integer("team_count").default(0), // number of teams in this division
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Threads within Sources of Truth
// Each thread is a cluster of related data nodes with complex structure
export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  nodekey: text("nodekey").notNull(), // Thread@id@{threadId}
  tqName: text("tq_name").notNull(), // TQName like "STC_yy.STC_yy"
  class: text("class").notNull().default("Thread"),
  threadId: text("thread_id").notNull(), // this corresponds to the 'tid' field from external work items
  componentNode: jsonb("component_node").notNull(), // Array of component nodes
  createTime: jsonb("create_time").notNull(), // Array format: [year, month, day, hour, minute, second, nanoseconds]
  updateTime: jsonb("update_time").notNull(), // Array format: [year, month, day, hour, minute, second, nanoseconds]
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

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
});

// Types
export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;

export type Thread = typeof threads.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;

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
  systemUptime?: string;
  lastUpdateTime?: Date;
};

export type SourceStats = {
  status: string;
  version: string;
  records: string;
  responseTime: string;
  uptime: string;
};

export type SelectKnowledgeLink = typeof knowledgeLinks.$inferSelect;

// Knowledge Retention Tables for Government-Level Security
export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"), // system, analysis, insights, procedures
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  tags: text("tags").array().default([]),
  sourceCode: text("source_code"), // STC, CPT, SLC, TMC, CAS, NVL
  sessionId: text("session_id"),
  isConfidential: boolean("is_confidential").default(false),
  retentionPolicy: text("retention_policy").default("permanent"), // temporary, standard, permanent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  accessCount: integer("access_count").default(0),
});

export const knowledgeRelations = pgTable("knowledge_relations", {
  id: serial("id").primaryKey(),
  fromEntryId: integer("from_entry_id").references(() => knowledgeEntries.id),
  toEntryId: integer("to_entry_id").references(() => knowledgeEntries.id),
  relationType: text("relation_type").notNull(), // similar, depends_on, contradicts, updates
  confidence: real("confidence").default(0.5), // 0.0 to 1.0
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeAccess = pgTable("knowledge_access", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").references(() => knowledgeEntries.id),
  accessType: text("access_type").notNull(), // view, edit, search, reference
  sessionId: text("session_id"),
  sourceCode: text("source_code"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for knowledge entries
export const insertKnowledgeEntrySchema = createInsertSchema(knowledgeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastAccessedAt: true,
  accessCount: true,
});

export const insertKnowledgeRelationSchema = createInsertSchema(knowledgeRelations).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeAccessSchema = createInsertSchema(knowledgeAccess).omit({
  id: true,
  createdAt: true,
});

export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type InsertKnowledgeEntry = z.infer<typeof insertKnowledgeEntrySchema>;
export type KnowledgeRelation = typeof knowledgeRelations.$inferSelect;
export type InsertKnowledgeRelation = z.infer<typeof insertKnowledgeRelationSchema>;
export type KnowledgeAccess = typeof knowledgeAccess.$inferSelect;
export type InsertKnowledgeAccess = z.infer<typeof insertKnowledgeAccessSchema>;

export * from "drizzle-zod";
