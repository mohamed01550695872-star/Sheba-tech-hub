import { orderModel } from "../models/orderModel.ts";

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

export const orderController = {
  async getAll() {
    const data = await orderModel.findAll();
    return Response.json(data);
  },

  async getOne(id: string) {
    const data = await orderModel.findById(id);
    if (!data) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json(data);
  },

  async create(req: Request) {
    const body = await parseBody(req);
    if (!body.customer_name || !body.customer_email || !body.shipping_address || body.total == null) {
      return Response.json(
        { error: "customer_name, customer_email, shipping_address, and total are required" },
        { status: 400 },
      );
    }
    const data = await orderModel.create(body);
    return Response.json(data, { status: 201 });
  },

  async update(id: string, req: Request) {
    const body = await parseBody(req);
    const data = await orderModel.update(id, body);
    if (!data) return Response.json({ error: "Order not found" }, { status: 404 });
    return Response.json(data);
  },

  async delete(id: string) {
    await orderModel.delete(id);
    return new Response(null, { status: 204 });
  },
};
