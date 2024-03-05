import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id("_storage"),
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("You must be logged in to create a file.");
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    const hasAcces =
      user.orgIds.includes(args.orgId) ||
      user.tokenIdentifier.includes(args.orgId);

    if (!hasAcces) {
      throw new ConvexError("You do not have access to this organization.");
    }

    console.log(hasAcces);

    await ctx.db.insert("files", {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    return ctx.db
      .query("files")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
  },
});
