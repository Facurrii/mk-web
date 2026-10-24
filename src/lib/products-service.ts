import { createClient } from "./supabase/server";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./mock-data";
import { Category, Product } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_CATEGORIES;
    }
    return data;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
}): Promise<Product[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("is_active", true);

    if (options?.featuredOnly) {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      // Fallback
      let filtered = [...INITIAL_PRODUCTS];
      if (options?.categorySlug) {
        filtered = filtered.filter((p) => p.category?.slug === options.categorySlug);
      }
      if (options?.featuredOnly) {
        filtered = filtered.filter((p) => p.is_featured);
      }
      return filtered;
    }

    if (options?.categorySlug) {
      return data.filter((p) => p.category?.slug === options.categorySlug);
    }

    return data;
  } catch {
    let filtered = [...INITIAL_PRODUCTS];
    if (options?.categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === options.categorySlug);
    }
    if (options?.featuredOnly) {
      filtered = filtered.filter((p) => p.is_featured);
    }
    return filtered;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
    }

    return data;
  } catch {
    return INITIAL_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}
