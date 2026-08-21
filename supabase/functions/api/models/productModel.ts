import { supabase } from "../models/db.ts";

export const productModel = {
  async findAll() {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(name, slug)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(body: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("products")
      .insert(body)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, body: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("products")
      .update(body)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};
