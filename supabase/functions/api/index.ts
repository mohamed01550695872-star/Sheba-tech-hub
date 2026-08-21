import { productRoutes } from "./routes/productRoutes.ts";
import { categoryRoutes } from "./routes/categoryRoutes.ts";
import { orderRoutes } from "./routes/orderRoutes.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/api/, "").replace(/^\//, "");

    if (path === "" || path === "/") {
      return Response.json(
        {
          message: "Sheba Tech Hub API",
          endpoints: ["/products", "/categories", "/orders"],
        },
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resource = path.split("/")[0];

    if (resource === "products") return await productRoutes(path, req);
    if (resource === "categories") return await categoryRoutes(path, req);
    if (resource === "orders") return await orderRoutes(path, req);

    return Response.json({ error: "Route not found" }, { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
