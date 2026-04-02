import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob, FilterCriteria, Property } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export interface Inquiry {
  id: bigint;
  propertyId: bigint;
  propertyTitle: string;
  message: string;
  status: string;
  response: string | null;
  createdAt: bigint;
  updatedAt: bigint;
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublishedProperties(criteria: FilterCriteria = {}) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["publishedProperties", criteria],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterPublishedProperties(criteria);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePropertyDetails(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["property", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPublishedPropertyDetails(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAgentPropertyDetails(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["agentProperty", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPropertyDetails(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAgentProfile(principal: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["agentProfile", principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        const profile = await actor.getCallerUserProfile();
        if (profile?.profileType.__kind__ === "agent") {
          return profile.profileType.agent;
        }
        return null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useFavoriteProperties() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getFavoriteProperties(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddFavorite() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      return actor.addPropertyToFavorites(identity.getPrincipal(), propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor || !identity) throw new Error("Not authenticated");
      return actor.removePropertyFromFavorites(
        identity.getPrincipal(),
        propertyId,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

export function useInquireProperty() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      propertyId,
      message,
    }: { propertyId: bigint; message: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.inquireProperty(propertyId, message);
    },
  });
}

export function useAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (property: Property) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createProperty(property);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedProperties"] });
    },
  });
}

export function usePublishProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.publishProperty(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publishedProperties"] });
    },
  });
}

export function useUploadPropertyImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      blob,
    }: { propertyId: bigint; blob: ExternalBlob }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.uploadPropertyImage(propertyId, blob);
    },
    onSuccess: (_data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["agentProperty", propertyId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["publishedProperties"] });
    },
  });
}

export function useVerifyAgent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agentPrincipal: string) => {
      if (!actor) throw new Error("Not authorized");
      const { Principal } = await import("@icp-sdk/core/principal");
      return actor.verifyAgent(Principal.fromText(agentPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useAgentInquiries() {
  const { actor, isFetching } = useActor();
  return useQuery<Inquiry[]>({
    queryKey: ["agentInquiries"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAgentInquiries() as Promise<Inquiry[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBuyerInquiries() {
  const { actor, isFetching } = useActor();
  return useQuery<Inquiry[]>({
    queryKey: ["buyerInquiries"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getBuyerInquiries() as Promise<Inquiry[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRespondToInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inquiryId,
      response,
    }: { inquiryId: bigint; response: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.respondToInquiry(inquiryId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentInquiries"] });
    },
  });
}

export function useCreateSupportTicket() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      subject,
      message,
      email,
    }: { subject: string; message: string; email: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).createSupportTicket(subject, message, email);
    },
  });
}

export function usePromoteProperty() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (propertyId: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.promoteProperty(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agentProperties"] });
      queryClient.invalidateQueries({ queryKey: ["publishedProperties"] });
    },
  });
}

export interface Transaction {
  id: string;
  propertyId: bigint;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export function useTransactionsForBuyer(buyerId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["buyerTransactions", buyerId],
    queryFn: async () => {
      if (!actor || !buyerId) return [];
      return (actor as any).getTransactionsForBuyer(buyerId) as Promise<
        Transaction[]
      >;
    },
    enabled: !!actor && !isFetching && !!buyerId,
  });
}

export function useTransactionsForSeller(sellerId: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["sellerTransactions", sellerId],
    queryFn: async () => {
      if (!actor || !sellerId) return [];
      return (actor as any).getTransactionsForSeller(sellerId) as Promise<
        Transaction[]
      >;
    },
    enabled: !!actor && !isFetching && !!sellerId,
  });
}

export function useAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["allTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllTransactions() as Promise<Transaction[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTransactionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return (actor as any).updateTransactionStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTransactions"] });
    },
  });
}

// ── Property Reviews ──────────────────────────────────────────────────────────

export function usePropertyReviews(propertyId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["propertyReviews", propertyId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPropertyReviews(propertyId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePropertyAverageRating(propertyId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["propertyAverageRating", propertyId.toString()],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getPropertyAverageRating(propertyId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasSubmittedReview(propertyId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["hasSubmittedReview", propertyId.toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasSubmittedReview(propertyId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      propertyId,
      rating,
      comment,
    }: {
      propertyId: bigint;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitReview(propertyId, rating, comment);
    },
    onSuccess: (_data, { propertyId }) => {
      queryClient.invalidateQueries({
        queryKey: ["propertyReviews", propertyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["propertyAverageRating", propertyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasSubmittedReview", propertyId.toString()],
      });
    },
  });
}

// ── Agent Reviews ─────────────────────────────────────────────────────────────

import type { Principal } from "@icp-sdk/core/principal";

export function useAgentReviews(agentId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["agentReviews", agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return [];
      return actor.getAgentReviews(agentId);
    },
    enabled: !!actor && !isFetching && !!agentId,
  });
}

export function useAgentAverageRating(agentId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["agentAverageRating", agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return 0;
      return actor.getAgentAverageRating(agentId);
    },
    enabled: !!actor && !isFetching && !!agentId,
  });
}

export function useHasSubmittedAgentReview(agentId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["hasSubmittedAgentReview", agentId?.toString()],
    queryFn: async () => {
      if (!actor || !agentId) return false;
      return actor.hasSubmittedAgentReview(agentId);
    },
    enabled: !!actor && !isFetching && !!agentId,
  });
}

export function useSubmitAgentReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      agentId,
      transactionId,
      rating,
      comment,
    }: {
      agentId: Principal;
      transactionId: string;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitAgentReview(agentId, transactionId, rating, comment);
    },
    onSuccess: (_data, { agentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["agentReviews", agentId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["agentAverageRating", agentId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasSubmittedAgentReview", agentId.toString()],
      });
    },
  });
}
