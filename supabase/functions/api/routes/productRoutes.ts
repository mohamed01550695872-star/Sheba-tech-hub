import { productController } from "../controllers/productController.ts";

export async function productRoutes(path: string, req: Request): Promise<Response> {
  // /products          GET → getAll, POST → create
  // /products/:id      GET → getOne, PUT → update, DELETE → delete
  const segments = path.split("/").filter(Boolean);
  const isCollection = segments.length === 1;
  const id = segments[1];

  if (isCollection) {
    if (req.method === "GET") return productController.getAll();
    if (req.method === "POST") return productController.create(req);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (id) {
    if (req.method === "GET") return productController.getOne(id);
    if (req.method === "PUT" || req.method === "PATCH") return productController.update(id, req);
    if (req.method === "DELETE") return productController.delete(id);
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
