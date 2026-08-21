import { productModel } from "../models/productModel.ts";

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export const productController = {
  async getAll() {
    const data = await productModel.findAll();
    return Response.json(data);
  },

  async getOne(id: string) {
    const data = await productModel.findById(id);
    if (!data) return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json(data);
  },

  async create(req: Request) {
    const body = await parseBody(req);
    if (!body.name || body.price == null) {
      return Response.json({ error: "name and price are required" }, { status: 400 });
    }
    const data = await productModel.create(body);
    return Response.json(data, { status: 201 });
  },

  async update(id: string, req: Request) {
    const body = await parseBody(req);
    const data = await productModel.update(id, body);
    if (!data) return Response.json({ error: "Product not found" }, { status: 404 });
    return Response.json(data);
  },

  async delete(id: string) {
    await productModel.delete(id);
    return new Response(null, { status: 204 });
  },
};
