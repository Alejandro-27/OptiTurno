import { supabase } from "../config/database";

export const profesionalesService = {
  async crear(datos: {
    sucursal_id: string;
    nombre: string;
    especialidad?: string;
    telefono?: string;
  }) {
    const { data, error } = await supabase
      .from("profesionales")
      .insert([datos])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
