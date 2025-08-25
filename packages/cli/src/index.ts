#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";

const program = new Command();
program
  .name("maravian-sockets")
  .description("Maravian Sockets CLI")
  .version("0.1.0");

program
  .command("init")
  .description("create a starter schema config")
  .option("-o, --out <file>", "output file", "socketmax.config.ts")
  .action((opts) => {
    const file = path.resolve(process.cwd(), opts.out);
    if (fs.existsSync(file)) {
      console.error("File exists:", file);
      process.exit(1);
    }
    fs.writeFileSync(
      file,
      `import { z, defineSchema } from '@maravian/maravian-sockets-types';\n\nexport default defineSchema({\n  appId: 'my-app',\n  version: new Date().toISOString(),\n  topics: [\n    {\n      topic: 'chat.messages',\n      description: 'Chat topic',\n      messages: [\n        { name: 'send', direction: 'publish', payload: z.object({ text: z.string() }) },\n        { name: 'received', direction: 'subscribe', payload: z.object({ text: z.string(), from: z.string() }) }\n      ]\n    }\n  ]\n});\n`
    );
    console.log("Created:", file);
  });

program
  .command("push")
  .description("push schema to server")
  .option("--server <url>", "server URL", "http://localhost:8080")
  .option("--app-id <id>", "application ID")
  .option("--app-key <key>", "application key")
  .requiredOption("--config <file>")
  .action(async (opts) => {
    // Prompt for missing required fields
    if (!opts.appId) {
      process.stdout.write("App ID: ");
      opts.appId = await readInput();
    }
    if (!opts.appKey) {
      process.stdout.write("App Key: ");
      opts.appKey = await readInput();
    }
    const configPath = path.resolve(process.cwd(), opts.config);
    if (!fs.existsSync(configPath)) {
      console.error("Config not found:", configPath);
      process.exit(1);
    }
    // Load TS/JS module
    let schema;
    if (configPath.endsWith(".js")) {
      // Handle JS files directly
      schema = require(configPath);
    } else {
      // Handle TS files with ts-node
      require("ts-node").register({ transpileOnly: true });
      const mod = await import(configPath);
      schema = mod.default || mod.schema || mod;
    }
    // serialize Zod payloads into JSON Schema per message
    const jsonSchema = {
      appId: schema.appId,
      version: schema.version,
      topics: schema.topics.map((t: any) => ({
        topic: t.topic,
        description: t.description,
        system: !!t.system,
        messages: t.messages.map((m: any) => ({
          name: m.name,
          direction: m.direction,
          // basic zod -> json schema using zod's describe in a simplistic way
          jsonSchema:
            m.payload && (m.payload._def || m.payload._getType)
              ? zodToJson(m.payload).schema
              : undefined,
        })),
      })),
    };

    const res = await fetch(new URL("/api/schema/push", opts.server), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        appId: opts.appId,
        appKey: opts.appKey,
        version: schema.version,
        schema: jsonSchema,
      }),
    });
    if (!res.ok) {
      console.error("Push failed:", res.status, await res.text());
      process.exit(1);
    }
    console.log("Pushed:", await res.json());
  });

program
  .command("generate")
  .description("generate TS types from latest schema")
  .requiredOption("--server <url>")
  .requiredOption("--app-id <id>")
  .option(
    "--dts-out <file>",
    "output declaration file",
    "maravian-sockets.generated.d.ts"
  )
  .option("--ts-out <file>", "optional typed helper .ts file")
  .action(async (opts) => {
    const res = await fetch(
      new URL(
        `/api/schema/latest?appId=${encodeURIComponent(opts.appId)}`,
        opts.server
      )
    );
    if (!res.ok) {
      console.error("Fetch failed:", res.status, await res.text());
      process.exit(1);
    }
    const schema = await res.json();
    const dts = generateDTS(schema);
    const dtsOut = path.resolve(process.cwd(), opts.dtsOut);
    fs.writeFileSync(dtsOut, dts);
    console.log("Generated:", dtsOut);

    if (opts.tsOut) {
      const ts = generateTSHelpers(schema);
      const tsOut = path.resolve(process.cwd(), opts.tsOut);
      fs.writeFileSync(tsOut, ts);
      console.log("Generated:", tsOut);
    }
  });

program
  .command("schema:pull")
  .description("pull latest schema")
  .requiredOption("--server <url>")
  .requiredOption("--app-id <id>")
  .action(async (opts) => {
    const res = await fetch(
      new URL(
        `/api/schema/latest?appId=${encodeURIComponent(opts.appId)}`,
        opts.server
      )
    );
    if (!res.ok) {
      console.error("Fetch failed:", res.status, await res.text());
      process.exit(1);
    }
    console.log(JSON.stringify(await res.json(), null, 2));
  });

program
  .command("log")
  .description("list schema versions")
  .requiredOption("--server <url>")
  .requiredOption("--app-id <id>")
  .action(async (opts) => {
    const res = await fetch(
      new URL(
        `/api/schema/versions?appId=${encodeURIComponent(opts.appId)}`,
        opts.server
      )
    );
    if (!res.ok) {
      console.error("Fetch failed:", res.status, await res.text());
      process.exit(1);
    }
    console.log(await res.text());
  });

program.parseAsync().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Helper function to read user input
function readInput(): Promise<string> {
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Minimal zod -> json schema converter (very partial)
function zodToJson(z: any): { schema: any; optional?: boolean } {
  const typ = z._def?.typeName;
  if (!typ) return { schema: { type: "object" } };
  switch (typ) {
    case "ZodString":
      return { schema: { type: "string" } };
    case "ZodNumber":
      return { schema: { type: "number" } };
    case "ZodBoolean":
      return { schema: { type: "boolean" } };
    case "ZodObject": {
      const shape =
        typeof z._def.shape === "function" ? z._def.shape() : z._def.shape;
      const props: any = {};
      const required: string[] = [];
      for (const k of Object.keys(shape)) {
        const sch = zodToJson(shape[k]);
        props[k] = sch.schema;
        if (!sch.optional) required.push(k);
      }
      return { schema: { type: "object", properties: props, required } };
    }
    case "ZodArray":
      return {
        schema: { type: "array", items: zodToJson(z._def.type).schema },
      };
    case "ZodEnum":
      return { schema: { enum: z._def.values } };
    case "ZodLiteral":
      return { schema: { const: z._def.value } };
    case "ZodOptional": {
      const inner = zodToJson(z._def.innerType);
      return { schema: inner.schema, optional: true };
    }
    default:
      return { schema: { type: "object" } };
  }
}

function generateDTS(schema: any): string {
  const lines: string[] = [];
  lines.push("// Generated by Maravian Sockets CLI\n");
  lines.push("declare namespace SocketMaxGenerated {\n");
  // Topics interface mapping publish/subscribe payloads
  lines.push("  interface Topics {\n");
  for (const t of schema.topics || []) {
    lines.push(`    \"${t.topic}\": {`);
    // Build maps
    const pub: string[] = [];
    const sub: string[] = [];
    for (const m of t.messages || []) {
      const tsType = jsonSchemaToTs(m.jsonSchema || { type: "object" });
      if (m.direction === "publish" || m.direction === "both")
        pub.push(`\"${m.name}\": ${tsType}`);
      if (m.direction === "subscribe" || m.direction === "both")
        sub.push(`\"${m.name}\": ${tsType}`);
    }
    lines.push(`      publish: { ${pub.join("; ")} };`);
    lines.push(`      subscribe: { ${sub.join("; ")} };`);
    lines.push("    }");
  }
  lines.push("  }\n");
  lines.push("  type TopicName = keyof Topics;\n");
  lines.push(
    "  type PublishType<T extends TopicName> = keyof Topics[T]['publish'];\n"
  );
  lines.push(
    "  type SubscribeType<T extends TopicName> = keyof Topics[T]['subscribe'];\n"
  );
  lines.push("}\n");
  return lines.join("\n");
}

function generateTSHelpers(schema: any): string {
  const lines: string[] = [];
  lines.push("// Generated by Maravian Sockets CLI\n");
  // Repeat minimal type mapping for helpers
  lines.push("export interface Topics {\n");
  for (const t of schema.topics || []) {
    lines.push(`  \"${t.topic}\": {`);
    const pub: string[] = [];
    const sub: string[] = [];
    for (const m of t.messages || []) {
      const tsType = jsonSchemaToTs(m.jsonSchema || { type: "object" });
      if (m.direction === "publish" || m.direction === "both")
        pub.push(`\"${m.name}\": ${tsType}`);
      if (m.direction === "subscribe" || m.direction === "both")
        sub.push(`\"${m.name}\": ${tsType}`);
    }
    lines.push(`    publish: { ${pub.join("; ")} };`);
    lines.push(`    subscribe: { ${sub.join("; ")} };`);
    lines.push("  }");
  }
  lines.push("}\n");
  lines.push("export type TopicName = keyof Topics;\n");
  lines.push(
    "export type PublishType<T extends TopicName> = keyof Topics[T]['publish'];\n"
  );
  lines.push(
    "export type SubscribeType<T extends TopicName> = keyof Topics[T]['subscribe'];\n"
  );
  lines.push(
    `export type PublishPayload<T extends TopicName, K extends PublishType<T>> = Topics[T]['publish'][K];\n`
  );
  lines.push(
    `export type SubscribePayload<T extends TopicName, K extends SubscribeType<T>> = Topics[T]['subscribe'][K];\n`
  );
  lines.push(
    `export type IncomingMessage<P> = { type: string; payload: P; ts?: number };\n`
  );
  lines.push(
    `export function typedPublish<T extends TopicName, K extends PublishType<T>>(client: { publish: any }, topic: T, type: K, payload: PublishPayload<T,K>, room?: string) {\n  return client.publish(topic as string, type as string, payload as any, room);\n}\n`
  );
  lines.push(
    `export function typedOnTopic<T extends TopicName, K extends SubscribeType<T>>(client: { onTopic: any }, topic: T, listener: (msg: IncomingMessage<SubscribePayload<T,K>>) => void) {\n  return client.onTopic(topic as string, listener as any);\n}\n`
  );
  return lines.join("\n");
}

function jsonSchemaToTs(s: any): string {
  if (!s) return "any";
  if (s.$ref) return "any";
  if (s.enum) return s.enum.map((v: any) => JSON.stringify(v)).join(" | ");
  if (s.const !== undefined) return JSON.stringify(s.const);
  if (Array.isArray(s.type)) {
    return s.type
      .map((t: string) => jsonSchemaToTs({ ...s, type: t }))
      .join(" | ");
  }
  switch (s.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return "number";
    case "boolean":
      return "boolean";
    case "null":
      return "null";
    case "array": {
      const it = jsonSchemaToTs(s.items || { type: "any" });
      return `${it}[]`;
    }
    case "object": {
      const props = s.properties || {};
      const req = new Set<string>((s.required || []) as string[]);
      const entries = Object.keys(props).map(
        (k) =>
          `${JSON.stringify(k)}${req.has(k) ? "" : "?"}: ${jsonSchemaToTs(
            props[k]
          )}`
      );
      return `{ ${entries.join("; ")} }`;
    }
    default:
      return "any";
  }
}
