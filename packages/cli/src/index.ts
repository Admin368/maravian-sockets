#!/usr/bin/env node
import { Command } from "commander";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load .env file from current working directory
dotenv.config();

interface MaravianConfig {
  initialized: boolean;
  projectType: "nextjs" | "react" | "vanilla";
  schemaPath: string;
  generatedPath: string;
  version: string;
}

const MARAVIAN_DIR = "msocket";
const CONFIG_FILE = ".maravian";
const SCHEMA_FILE = "schema.config.js";
const GENERATED_FILE = "generated.d.ts";
const README_FILE = "README.md";

const program = new Command();
program
  .name("maravian-sockets")
  .description("Maravian Sockets CLI - v3.0")
  .version("0.3.0");

// Enhanced init command that sets up the entire project
program
  .command("init")
  .description(
    "Initialize Maravian Sockets in your project with complete setup"
  )
  .option("--app-id <id>", "Application ID (optional)")
  .option("--force", "Force re-initialization")
  .action(async (opts) => {
    console.log("🚀 Initializing Maravian Sockets project...");

    // Check if already initialized
    const configPath = path.resolve(process.cwd(), MARAVIAN_DIR, CONFIG_FILE);
    if (fs.existsSync(configPath) && !opts.force) {
      console.error(
        "❌ Project already initialized. Use --force to re-initialize."
      );
      process.exit(1);
    }

    await initializeProject(opts.appId);
  });

program
  .command("push")
  .description("push schema to server")
  .option(
    "--server <url>",
    "server URL",
    process.env.NEXT_PUBLIC_MSOCKET_SERVER_URL || "http://localhost:8080"
  )
  .option("--app-id <id>", "application ID")
  .option("--app-key <key>", "application key")
  .option("--config <file>", "schema config file")
  .action(async (opts) => {
    // Auto-detect config file if not provided
    if (!opts.config) {
      const autoPath = path.join(process.cwd(), MARAVIAN_DIR, SCHEMA_FILE);
      if (fs.existsSync(autoPath)) {
        opts.config = autoPath;
        console.log(
          `📄 Using schema: ${path.relative(process.cwd(), autoPath)}`
        );
      } else {
        console.error(
          "❌ No schema config found. Run `maravian-sockets init` first or specify --config"
        );
        process.exit(1);
      }
    }
    // Get app ID from CLI option, environment variable, or prompt
    if (!opts.appId) {
      opts.appId = process.env.MSOCKET_APP_ID;
    }
    if (!opts.appKey) {
      opts.appKey = process.env.MSOCKET_APP_KEY;
    }

    // If still missing, check if .env file exists and provide helpful message
    if (!opts.appId || !opts.appKey) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) {
        console.error(
          "\nMissing app credentials. Please create a .env file in your project root with:"
        );
        console.error("MSOCKET_APP_ID=your-app-id");
        console.error("MSOCKET_APP_KEY=your-app-key");
        console.error(
          "\nAlternatively, provide them as command line options: --app-id and --app-key"
        );
        process.exit(1);
      }
    }

    // Prompt for any still missing fields
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
      try {
        require("ts-node").register({
          transpileOnly: true,
          compilerOptions: {
            module: "commonjs",
            target: "es2020",
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            moduleResolution: "node",
          },
          ignore: ["/node_modules/"],
        });
        const mod = await import(configPath);
        schema = mod.default || mod.schema || mod;
      } catch (error) {
        console.error(
          "Error loading TypeScript config file. Try using a .js file instead."
        );
        console.error(
          "Error details:",
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
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
  .option(
    "--server <url>",
    "server URL",
    process.env.NEXT_PUBLIC_MSOCKET_SERVER_URL || "http://localhost:8080"
  )
  .option("--app-id <id>", "application ID")
  .option("--dts-out <file>", "output declaration file")
  .option("--ts-out <file>", "optional typed helper .ts file")
  .action(async (opts) => {
    // Auto-detect output path if not provided
    if (!opts.dtsOut) {
      const autoPath = path.join(process.cwd(), MARAVIAN_DIR, GENERATED_FILE);
      if (fs.existsSync(path.join(process.cwd(), MARAVIAN_DIR))) {
        opts.dtsOut = autoPath;
        console.log(
          `📝 Generating types: ${path.relative(process.cwd(), autoPath)}`
        );
      } else {
        opts.dtsOut = "maravian-sockets.generated.d.ts";
      }
    }
    // Get app ID from CLI option or environment variable
    if (!opts.appId) {
      opts.appId = process.env.MSOCKET_APP_ID;
    }

    if (!opts.appId) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) {
        console.error(
          "\nMissing app ID. Please create a .env file in your project root with:"
        );
        console.error("MSOCKET_APP_ID=your-app-id");
        console.error(
          "\nAlternatively, provide it as a command line option: --app-id"
        );
        process.exit(1);
      }
      process.stdout.write("App ID: ");
      opts.appId = await readInput();
    }
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
  .option(
    "--server <url>",
    "server URL",
    process.env.NEXT_PUBLIC_MSOCKET_SERVER_URL
  )
  .option("--app-id <id>", "application ID")
  .action(async (opts) => {
    // Validate server URL
    if (!opts.server) {
      console.error("\nMissing server URL. Please provide it via:");
      console.error("- Command line: --server <url>");
      console.error("- Environment variable: NEXT_PUBLIC_MSOCKET_SERVER_URL");
      process.exit(1);
    }

    // Get app ID from CLI option or environment variable
    if (!opts.appId) {
      opts.appId = process.env.MSOCKET_APP_ID;
    }

    if (!opts.appId) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) {
        console.error(
          "\nMissing app ID. Please create a .env file in your project root with:"
        );
        console.error("MSOCKET_APP_ID=your-app-id");
        console.error(
          "\nAlternatively, provide it as a command line option: --app-id"
        );
        process.exit(1);
      }
      process.stdout.write("App ID: ");
      opts.appId = await readInput();
    }
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
  .option(
    "--server <url>",
    "server URL",
    process.env.NEXT_PUBLIC_MSOCKET_SERVER_URL
  )
  .option("--app-id <id>", "application ID")
  .action(async (opts) => {
    // Validate server URL
    if (!opts.server) {
      console.error("\nMissing server URL. Please provide it via:");
      console.error("- Command line: --server <url>");
      console.error("- Environment variable: NEXT_PUBLIC_MSOCKET_SERVER_URL");
      process.exit(1);
    }

    // Get app ID from CLI option or environment variable
    if (!opts.appId) {
      opts.appId = process.env.MSOCKET_APP_ID;
    }

    if (!opts.appId) {
      const envPath = path.resolve(process.cwd(), ".env");
      if (!fs.existsSync(envPath)) {
        console.error(
          "\nMissing app ID. Please create a .env file in your project root with:"
        );
        console.error("MSOCKET_APP_ID=your-app-id");
        console.error(
          "\nAlternatively, provide it as a command line option: --app-id"
        );
        process.exit(1);
      }
      process.stdout.write("App ID: ");
      opts.appId = await readInput();
    }
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
  lines.push("declare namespace MSocketGenerated {\n");
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
  lines.push(
    "  type PublishPayload<T extends TopicName, K extends PublishType<T>> = Topics[T]['publish'][K];\n"
  );
  lines.push(
    "  type SubscribePayload<T extends TopicName, K extends SubscribeType<T>> = Topics[T]['subscribe'][K];\n"
  );
  lines.push(
    "  type IncomingMessage<P> = { type: string; payload: P; ts?: number };\n"
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

async function initializeProject(appId?: string) {
  const cwd = process.cwd();
  const socketsDir = path.join(cwd, MARAVIAN_DIR);
  if (!fs.existsSync(socketsDir)) fs.mkdirSync(socketsDir, { recursive: true });

  // Create .env if missing
  const envLocal = path.join(cwd, ".env");
  if (!fs.existsSync(envLocal)) {
    fs.writeFileSync(
      envLocal,
      [
        "# Maravian Sockets Configuration",
        "NEXT_PUBLIC_MSOCKET_SERVER_URL=http://localhost:8080",
        `NEXT_PUBLIC_MSOCKET_APP_ID=${appId || "my-app"}`,
        "NEXT_PUBLIC_MSOCKET_APP_KEY=YOUR_APP_KEY_HERE",
        "NEXT_PUBLIC_DEBUG_SOCKETS=true",
        "",
      ].join("\n")
    );
    console.log("📝 Created .env");
  }

  // Create schema.config.js
  const schemaPath = path.join(socketsDir, SCHEMA_FILE);
  if (!fs.existsSync(schemaPath)) {
    const content = `/* eslint-disable @typescript-eslint/no-require-imports */\nconst { z, defineSchema } = require('@maravian/maravian-sockets-types');\n\nmodule.exports = defineSchema({\n  appId: process.env.NEXT_PUBLIC_MSOCKET_APP_ID || '${
      appId || "my-app"
    }',\n  version: new Date().toISOString(),\n  topics: [\n    {\n      topic: 'chat.messages',\n      description: 'Chat messages',\n      messages: [\n        { name: 'send', direction: 'both', payload: z.object({ username: z.string(), text: z.string() }) }\n      ]\n    },\n    {\n      topic: 'system.presence',\n      description: 'Presence',\n      messages: [\n        { name: 'user.join', direction: 'both', payload: z.object({ username: z.string() }) },\n        { name: 'user.leave', direction: 'both', payload: z.object({ username: z.string() }) }\n      ]\n    }\n  ]\n});\n`;
    fs.writeFileSync(schemaPath, content);
    console.log("📝 Created", path.relative(cwd, schemaPath));
  }

  // README
  const readmePath = path.join(socketsDir, README_FILE);
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      [
        "# Maravian Sockets",
        "",
        "This folder contains your Maravian Sockets schema and generated types.",
        "",
        "Commands:",
        "- pnpm msocket:create",
        "- pnpm msocket:push",
        "- pnpm msocket:generate",
        "",
        "Generated types will be written to msocket/generated.d.ts",
        "",
      ].join("\n")
    );
  }

  // .maravian state
  const state: MaravianConfig = {
    initialized: true,
    projectType: fs.existsSync(path.join(cwd, "next.config.js"))
      ? "nextjs"
      : "vanilla",
    schemaPath: path.relative(cwd, schemaPath),
    generatedPath: path.relative(cwd, path.join(socketsDir, GENERATED_FILE)),
    version: "3.0.0",
  };
  fs.writeFileSync(
    path.join(socketsDir, CONFIG_FILE),
    JSON.stringify(state, null, 2)
  );

  // Update package.json scripts
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts["msocket:init"] = "npx @maravian/maravian-sockets-cli init";
    pkg.scripts["msocket:create"] = `npx @maravian/maravian-sockets-cli init`;
    pkg.scripts[
      "msocket:push"
    ] = `npx @maravian/maravian-sockets-cli push --config ${path.join(
      MARAVIAN_DIR,
      SCHEMA_FILE
    )}`;
    pkg.scripts[
      "msocket:generate"
    ] = `npx @maravian/maravian-sockets-cli generate --dts-out ${path.join(
      MARAVIAN_DIR,
      GENERATED_FILE
    )}`;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log("🧩 Updated package.json scripts");
  }

  // Next.js config patching
  const nextConfigPath = path.join(cwd, "next.config.js");
  if (fs.existsSync(nextConfigPath)) {
    let cfg = fs.readFileSync(nextConfigPath, "utf8");
    if (!cfg.includes("transpilePackages")) {
      cfg = cfg.replace(/module\.exports\s*=\s*nextConfig;?/s, "");
      const injected = `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  transpilePackages: [\n    '@maravian/maravian-sockets-sdk',\n    '@maravian/maravian-sockets-types'\n  ],\n  experimental: {\n    esmExternals: 'loose'\n  },\n  webpack: (config, { dev }) => {\n    if (dev) {\n      config.resolve.alias = {\n        ...config.resolve.alias,\n        '@maravian/maravian-sockets-sdk': require('path').resolve(__dirname, 'packages/sdk/src/index.tsx'),\n      };\n    }\n    config.resolve.extensionAlias = {\n      '.js': ['.ts', '.tsx', '.js', '.jsx'],\n      '.mjs': ['.mts', '.mjs'],\n      '.cjs': ['.cts', '.cjs']\n    };\n    return config;\n  }\n};\n\nmodule.exports = nextConfig;\n`;
      fs.writeFileSync(nextConfigPath, injected);
      console.log("🔧 Patched next.config.js");
    }
  }

  console.log("✅ Maravian Sockets initialized.");
}
