import { orderController } from "../controllers/orderController.ts";

export async function orderRoutes(path: string, req: Request): Promise<Response> {
  const segments = path.split("/").filter(Boolean);
  const isCollection = segments.length === 1;
  const id = segments[1];

  if (isCollection) {
    if (req.method === "GET") return orderController.getAll();
    if (req.method === "POST") return orderController.create(req);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (id) {
    if (req.method === "GET") return orderController.getOne(id);
    if (req.method === "PUT" || req.method === "PATCH") return orderController.update(id, req);
    if (req.method === "DELETE") return orderController.delete(id);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
