import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sensorConfigurations = pgTable("sensor_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  deviceId: text("device_id").notNull().unique(),
  firmwareVersion: text("firmware_version"),
  baudRate: integer("baud_rate").default(256000),
  presenceTimeout: integer("presence_timeout").default(5),
  maxDetectionDistance: integer("max_detection_distance").default(4000),
  sensitivity: integer("sensitivity").default(7),
  multiTargetEnabled: boolean("multi_target_enabled").default(true),
  bluetoothEnabled: boolean("bluetooth_enabled").default(false),
  zones: jsonb("zones").$type<Zone[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  targets: jsonb("targets").$type<Target[]>().default([]),
  hasTarget: boolean("has_target").default(false),
  hasMovingTarget: boolean("has_moving_target").default(false),
  hasStillTarget: boolean("has_still_target").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const presetConfigurations = pgTable("preset_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roomType: text("room_type").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").$type<SensorConfiguration>(),
  isDefault: boolean("is_default").default(false),
});

// Zod schemas for validation
export const pointSchema = z.object({
  x: z.number().min(-3000).max(3000),
  y: z.number().min(0).max(6000),
});

export const zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["detection", "filter"]),
  color: z.string(),
  points: z.array(pointSchema).min(3), // Polygon zones need at least 3 points
  enabled: z.boolean().default(true),
});

export const targetSchema = z.object({
  id: z.number(),
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  angle: z.number(),
  distance: z.number(),
  resolution: z.number().optional(),
  isMoving: z.boolean(),
});

export const sensorConfigurationSchema = z.object({
  name: z.string().min(1),
  deviceId: z.string().min(1),
  firmwareVersion: z.string().optional(),
  baudRate: z.number().default(256000),
  presenceTimeout: z.number().min(1).max(30).default(5),
  maxDetectionDistance: z.number().min(100).max(6000).default(4000),
  sensitivity: z.number().min(1).max(10).default(7),
  multiTargetEnabled: z.boolean().default(true),
  bluetoothEnabled: z.boolean().default(false),
  zones: z.array(zoneSchema).default([]),
});

export const insertSensorConfigurationSchema = createInsertSchema(sensorConfigurations, {
  zones: zoneSchema.array(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData, {
  targets: targetSchema.array(),
}).omit({
  id: true,
  timestamp: true,
});

export const insertPresetConfigurationSchema = createInsertSchema(presetConfigurations, {
  configuration: sensorConfigurationSchema,
}).omit({
  id: true,
});

// Types
export type Point = z.infer<typeof pointSchema>;
export type Zone = z.infer<typeof zoneSchema>;
export type Target = z.infer<typeof targetSchema>;
export type SensorConfiguration = z.infer<typeof sensorConfigurationSchema>;
export type InsertSensorConfiguration = z.infer<typeof insertSensorConfigurationSchema>;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type InsertPresetConfiguration = z.infer<typeof insertPresetConfigurationSchema>;

export type SensorConfigurationRecord = typeof sensorConfigurations.$inferSelect;
export type SensorDataRecord = typeof sensorData.$inferSelect;
export type PresetConfigurationRecord = typeof presetConfigurations.$inferSelect;

// WebSocket message types
export const webSocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sensor_data"),
    data: z.object({
      deviceId: z.string(),
      targets: targetSchema.array(),
      hasTarget: z.boolean(),
      hasMovingTarget: z.boolean(),
      hasStillTarget: z.boolean(),
      timestamp: z.number(),
    }),
  }),
  z.object({
    type: z.literal("sensor_status"),
    data: z.object({
      deviceId: z.string(),
      connected: z.boolean(),
      firmwareVersion: z.string().optional(),
      lastUpdate: z.number(),
    }),
  }),
  z.object({
    type: z.literal("configuration_update"),
    data: sensorConfigurationSchema,
  }),
  z.object({
    type: z.literal("error"),
    data: z.object({
      message: z.string(),
      code: z.string().optional(),
    }),
  }),
]);

export type WebSocketMessage = z.infer<typeof webSocketMessageSchema>;
