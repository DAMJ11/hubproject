import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const registerBase = z.object({
  email: z.email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "Nombre demasiado largo"),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(100, "Apellido demasiado largo"),
  role: z.enum(["brand", "manufacturer"]),
  companyName: z
    .string()
    .min(2, "El nombre de empresa debe tener al menos 2 caracteres")
    .max(200, "Nombre de empresa demasiado largo"),
  termsAccepted: z.literal(true, "Debes aceptar los términos y condiciones"),
});

export const registerSchema = registerBase.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Las contraseñas no coinciden", path: ["confirmPassword"] },
);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
