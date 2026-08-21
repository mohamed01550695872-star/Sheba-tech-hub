import { categoryController } from "../controllers/categoryController.ts";

export async function categoryRoutes(path: string, req: Request): Promise<Response> {
  const segments = path.split("/").filter(Boolean);
  const isCollection = segments.length === 1;
  const id = segments[1];

  if (isCollection) {
    if (req.method === "GET") return categoryController.getAll();
    if (req.method === "POST") return categoryController.create(req);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (id) {
    if (req.method === "GET") return categoryController.getOne(id);
    if (req.method === "PUT" || req.method === "PATCH") return categoryController.update(id, req);
    if (req.method === "DELETE") return categoryController.delete(id);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
