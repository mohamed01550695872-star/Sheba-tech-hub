import { categoryModel } from "../models/categoryModel.ts";

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export const categoryController = {
  async getAll() {
    const data = await categoryModel.findAll();
    return Response.json(data);
  },

  async getOne(id: string) {
    const data = await categoryModel.findById(id);
    if (!data) return Response.json({ error: "Category not found" }, { status: 404 });
    return Response.json(data);
  },

  async create(req: Request) {
    const body = await parseBody(req);
    if (!body.name || !body.slug) {
      return Response.json({ error: "name and slug are required" }, { status: 400 });
    }
    const data = await categoryModel.create(body);
    return Response.json(data, { status: 201 });
  },

  async update(id: string, req: Request) {
    const body = await parseBody(req);
    const data = await categoryModel.update(id, body);
    if (!data) return Response.json({ error: "Category not found" }, { status: 404 });
    return Response.json(data);
  },

  async delete(id: string) {
    await categoryModel.delete(id);
    return new Response(null, { status: 204 });
  },
};
