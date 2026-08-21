import { supabase } from "../models/db.ts";

export const categoryModel = {
  async findAll() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async findById(id: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(body: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("categories")
      .insert(body)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, body: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("categories")
      .update(body)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
};
