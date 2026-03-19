import { z } from "zod/v4";

export const createConversationSchema = z.object({
  targetCompanyId: z.number().int().positive("targetCompanyId es requerido"),
  subject: z.string().min(1, "El asunto es requerido").max(300, "Asunto demasiado largo"),
  initialMessage: z.string().max(2000).optional(),
  rfqId: z.number().int().positive().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "El mensaje es requerido").max(5000, "Mensaje demasiado largo"),
  messageType: z.enum(["text", "image", "file"]).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
