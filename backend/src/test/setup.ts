import "reflect-metadata";
import { vi } from "vitest";

vi.mock("@clerk/express", () => ({
  clerkClient: {
    users: {
      updateUserMetadata: vi.fn().mockResolvedValue({}),
      deleteUser: vi.fn().mockResolvedValue(true),
      banUser: vi.fn().mockResolvedValue({}),
      unbanUser: vi.fn().mockResolvedValue({}),
      lockUser: vi.fn().mockResolvedValue({}),
      unlockUser: vi.fn().mockResolvedValue({}),
    },
  },
}));
