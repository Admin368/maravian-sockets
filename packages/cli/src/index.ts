#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";

const program = new Command();
program.name("socket-max").description("Socket Max CLI").version("0.1.0");

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
    fs.writeFileSync(file, `import { z } from 'zod';\nimport { defineSchema } from '@socket-max/types';\n\nexport default defineSchema({\n  appId: 'my-app',\n  version: new Date().toISOString(),\n  topics: [\n    {\n      topic: 'chat.messages',\n      description: 'Chat topic',\n      messages: [\n        { name: 'send', direction: 'publish', payload: z.object({ text: z.string() }) },\n        { name: 'received', direction: 'subscribe', payload: z.object({ text: z.string(), from: z.string() }) }\n      ]\n    }\n  ]\n});\n`);
    console.log("Created:", file);
  });

program
  .command("push")
  .description("push schema to server")
  .requiredOption("--server <url>")
  .requiredOption("--app-id <id>")
  .requiredOption("--app-key <key>")
  .requiredOption("--config <file>")
  .action(async (opts) => {
    const configPath = path.resolve(process.cwd(), opts.config);
    if (!fs.existsSync(configPath)) {
      console.error("Config not found:", configPath);
      process.exit(1);
    }
    // Load TS module with ts-node
    require("ts-node").register({ transpileOnly: true });
    const mod = await import(configPath);
    const schema = (mod.default || mod.schema || mod);
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
jsonSchema: (m.payload && (m.payload._def || m.payload._getType)) ? zodToJson(m.payload).schema : undefined
        }))
      }))
    };

    const res = await fetch(new URL("/api/schema/push", opts.server), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ appId: opts.appId, appKey: opts.appKey, version: schema.version, schema: jsonSchema })
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
  .option("--out <file>", "output d.ts", "socket-max.generated.d.ts")
  .action(async (opts) => {
    const res = await fetch(new URL(`/api/schema/latest?appId=${encodeURIComponent(opts.appId)}`, opts.server));
    if (!res.ok) {
      console.error("Fetch failed:", res.status, await res.text());
      process.exit(1);
    }
    const schema = await res.json();
    const dts = generateDTS(schema);
    const out = path.resolve(process.cwd(), opts.out);
    fs.writeFileSync(out, dts);
    console.log("Generated:", out);
  });

program
  .command("schema:pull")
  .description("pull latest schema")
  .requiredOption("--server <url>")
  .requiredOption("--app-id <id>")
  .action(async (opts) => {
    const res = await fetch(new URL(`/api/schema/latest?appId=${encodeURIComponent(opts.appId)}`, opts.server));
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
    const res = await fetch(new URL(`/api/schema/versions?appId=${encodeURIComponent(opts.appId)}`, opts.server));
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

// Minimal zod -> json schema converter (very partial)
function zodToJson(z: any): { schema: any; optional?: boolean } {
  const typ = z._def?.typeName;
  if (!typ) return { schema: { type: "object" } };
  switch (typ) {
    case "ZodString": return { schema: { type: "string" } };
    case "ZodNumber": return { schema: { type: "number" } };
    case "ZodBoolean": return { schema: { type: "boolean" } };
    case "ZodObject": {
      const shape = typeof z._def.shape === 'function' ? z._def.shape() : z._def.shape;
      const props: any = {};
      const required: string[] = [];
      for (const k of Object.keys(shape)) {
        const sch = zodToJson(shape[k]);
        props[k] = sch.schema;
        if (!sch.optional) required.push(k);
      }
      return { schema: { type: "object", properties: props, required } };
    }
    case "ZodArray": return { schema: { type: "array", items: zodToJson(z._def.type).schema } };
    case "ZodEnum": return { schema: { enum: z._def.values } };
    case "ZodLiteral": return { schema: { const: z._def.value } };
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
  lines.push("// Generated by Socket Max CLI\n");
  lines.push("declare namespace SocketMax {\n");
  for (const t of schema.topics || []) {
    const typeName = t.topic.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`  namespace ${typeName} {`);
    for (const m of t.messages || []) {
      const msgName = m.name.replace(/[^a-zA-Z0-9]/g, "_");
      lines.push(`    type ${msgName}Payload = any;`); // Placeholder; full typing requires richer converter
    }
    lines.push("  }");
  }
  lines.push("}\n");
  return lines.join("\n");
}

