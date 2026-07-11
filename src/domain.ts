import { Schema } from "effect"

export const AgentName = Schema.NonEmptyString

export const MemoryType = Schema.Literals([
  "architecture",
  "error-solution",
  "project-config",
  "preference",
  "learned-pattern",
  "conversation",
  "handoff"
])

export class AddMemoryRequest extends Schema.Class<AddMemoryRequest>("AddMemoryRequest")({
  agent: AgentName,
  content: Schema.NonEmptyString,
  repoPath: Schema.optional(Schema.String),
  type: Schema.optional(MemoryType),
  title: Schema.optional(Schema.String),
  customId: Schema.optional(Schema.String)
}) {}

export class SearchRequest extends Schema.Class<SearchRequest>("SearchRequest")({
  q: Schema.NonEmptyString,
  repoPath: Schema.optional(Schema.String),
  agent: Schema.optional(AgentName),
  limit: Schema.optional(Schema.Number)
}) {}

export class ContextRequest extends Schema.Class<ContextRequest>("ContextRequest")({
  agent: AgentName,
  task: Schema.NonEmptyString,
  repoPath: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number)
}) {}

export class HandoffRequest extends Schema.Class<HandoffRequest>("HandoffRequest")({
  fromAgent: AgentName,
  toAgent: AgentName,
  task: Schema.NonEmptyString,
  summary: Schema.NonEmptyString,
  repoPath: Schema.optional(Schema.String),
  completed: Schema.optional(Schema.Array(Schema.String)),
  nextSteps: Schema.optional(Schema.Array(Schema.String)),
  blockers: Schema.optional(Schema.Array(Schema.String))
}) {}

export class ApiError extends Schema.TaggedErrorClass<ApiError>()("ApiError", {
  status: Schema.Number,
  message: Schema.String
}) {}

export class ConfigError extends Schema.TaggedErrorClass<ConfigError>()("ConfigError", {
  message: Schema.String
}) {}

export class SupermemoryError extends Schema.TaggedErrorClass<SupermemoryError>()("SupermemoryError", {
  status: Schema.Number,
  message: Schema.String
}) {}

export class CreatedMemory extends Schema.Class<CreatedMemory>("CreatedMemory")({
  id: Schema.String,
  memory: Schema.String
}) {}

export class CreateMemoriesResponse extends Schema.Class<CreateMemoriesResponse>("CreateMemoriesResponse")({
  memories: Schema.Array(CreatedMemory)
}) {}

export class SearchResult extends Schema.Class<SearchResult>("SearchResult")({
  id: Schema.String,
  memory: Schema.optional(Schema.String),
  chunk: Schema.optional(Schema.String),
  similarity: Schema.Number,
  metadata: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  updatedAt: Schema.optional(Schema.String),
  version: Schema.optional(Schema.Number)
}) {}

export class SearchResponse extends Schema.Class<SearchResponse>("SearchResponse")({
  results: Schema.Array(SearchResult),
  timing: Schema.optional(Schema.Number),
  total: Schema.Number
}) {}

export interface RepoScope {
  readonly repoPath: string
  readonly containerTag: string
}

export interface StoredMemory {
  readonly id: string
  readonly status: string
  readonly containerTag: string
}
