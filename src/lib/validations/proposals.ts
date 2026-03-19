import { z } from "zod/v4";

export const proposalRespondSchema = z.object({
  action: z.enum(["accept", "reject", "shortlist"]),
});

export type ProposalRespondInput = z.infer<typeof proposalRespondSchema>;
