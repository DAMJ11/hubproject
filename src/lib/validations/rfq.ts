import { z } from "zod/v4";

export const rfqCreateSchema = z.object({
  projectType: z.enum(["design_only", "tech_pack", "design_and_sample", "production_with_design", "production_only"]).optional(),
  categoryId: z.number().int().positive("categoryId es requerido"),
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(300, "Título demasiado largo"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(5000, "Descripción demasiado larga"),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  deadline: z.string().optional(),
  proposalsDeadline: z.string().optional(),
  requiresSample: z.boolean().optional(),
  preferredMaterials: z.string().max(1000).optional(),
  sustainabilityPriority: z.boolean().optional(),
  materials: z
    .array(
      z.object({
        materialType: z.string().min(1).max(200),
        composition: z.string().max(500).optional(),
        recycledPercentage: z.number().min(0).max(100).optional(),
        specifications: z.string().max(2000).optional(),
      })
    )
    .optional(),
});

export const rfqUpdateSchema = z.object({
  id: z.number().int().positive("id es requerido"),
  status: z.enum(["draft", "open", "evaluating", "awarded", "cancelled", "expired"]).optional(),
  title: z.string().min(3).max(300).optional(),
  description: z.string().min(10).max(5000).optional(),
  quantity: z.number().int().min(1).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  deadline: z.string().optional(),
  proposalsDeadline: z.string().optional(),
  requiresSample: z.boolean().optional(),
  preferredMaterials: z.string().max(1000).optional(),
  sustainabilityPriority: z.boolean().optional(),
});

export type RFQCreateInput = z.infer<typeof rfqCreateSchema>;
export type RFQUpdateInput = z.infer<typeof rfqUpdateSchema>;
