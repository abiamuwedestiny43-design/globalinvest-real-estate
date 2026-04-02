import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SellerSubmissionStatus = { __kind__: "pending" } | { __kind__: "approved" } | { __kind__: "rejected" };
export interface SellerSubmission {
    id: bigint;
    sellerPrincipal: Principal;
    sellerName: string;
    sellerEmail: string;
    title: string;
    description: string;
    propertyType: string;
    price: number;
    currency: string;
    location: string;
    country: string;
    bedrooms: bigint;
    bathrooms: bigint;
    area: number;
    imageUrls: Array<string>;
    status: SellerSubmissionStatus;
    submittedAt: bigint;
    adminNote: string;
}

export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Review {
    id: bigint;
    createdAt: bigint;
    propertyId: bigint;
    comment: string;
    buyerId: Principal;
    rating: bigint;
    buyerName: string;
}
export interface UserProfile {
    profileType: {
        __kind__: "agent";
        agent: AgentProfile;
    } | {
        __kind__: "buyer";
        buyer: BuyerProfile;
    };
}
export interface IdDocumentSubmission {
    id: bigint;
    backBlob?: ExternalBlob;
    status: IdDocStatus;
    submitterPrincipal: Principal;
    submittedAt: bigint;
    email: string;
    frontBlob: ExternalBlob;
    docType: string;
    lastName: string;
    firstName: string;
}
export interface InquiryWithTitle {
    id: bigint;
    status: InquiryStatus;
    createdAt: bigint;
    propertyTitle: string;
    propertyId: bigint;
    updatedAt: bigint;
    message: string;
    buyerId: BuyerId;
    response?: string;
}
export interface FilterCriteria {
    status?: PropertyStatus;
    propertyType?: PropertyType;
    city?: string;
    minBedrooms?: bigint;
    maxPrice?: number;
    maxBedrooms?: bigint;
    minPrice?: number;
}
export interface ContactInfo {
    country: string;
    city: string;
    email: string;
    address: string;
    phone: string;
}
export type BuyerId = Principal;
export interface Transaction {
    id: string;
    status: TransactionStatus;
    createdAt: bigint;
    propertyTitle: string;
    propertyId: bigint;
    sellerName: string;
    updatedAt: bigint;
    currency: string;
    buyerId: string;
    sellerId: string;
    buyerName: string;
    amount: number;
}
export interface BuyerProfile {
    principal: Principal;
    contactInfo: ContactInfo;
    lastName: string;
    firstName: string;
}
export interface Property {
    id: bigint;
    status: PropertyStatus;
    title: string;
    featured: boolean;
    features: Array<string>;
    country: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    area: number;
    city: string;
    createdAt: bigint;
    description: string;
    agentId: AgentId;
    updatedAt: bigint;
    currency: string;
    address: string;
    bathrooms: bigint;
    price: number;
    images: Array<ExternalBlob>;
}
export interface AgentReview {
    id: bigint;
    createdAt: bigint;
    agentId: Principal;
    comment: string;
    buyerId: Principal;
    rating: bigint;
    buyerName: string;
    transactionId: string;
}
export type AgentId = Principal;
export interface AgentProfile {
    bio: string;
    principal: Principal;
    verified: boolean;
    contactInfo: ContactInfo;
    agency: string;
    licenseNumber: string;
    rating: number;
    lastName: string;
    firstName: string;
}
export interface Ticket {
    id: bigint;
    status: TicketStatus;
    subject: string;
    messages: Array<TicketMessage>;
    createdAt: bigint;
    updatedAt: bigint;
    requesterEmail: string;
    priority: TicketPriority;
    requesterPrincipal: Principal;
}
export interface TicketMessage {
    createdAt: bigint;
    text: string;
    senderPrincipal: Principal;
    senderLabel: string;
}
export enum IdDocStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum InquiryStatus {
    closed = "closed",
    responded = "responded",
    pending = "pending"
}
export enum PropertyStatus {
    sold = "sold",
    available = "available",
    draft = "draft"
}
export enum PropertyType {
    commercial = "commercial",
    house = "house",
    land = "land",
    apartment = "apartment"
}
export enum TicketPriority {
    low = "low",
    high = "high",
    urgent = "urgent",
    medium = "medium"
}
export enum TicketStatus {
    resolved = "resolved",
    open = "open",
    inProgress = "inProgress"
}
export enum TransactionStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface NewsPost {
    id: bigint;
    title: string;
    summary: string;
    content: string;
    category: string;
    author: string;
    imageUrl: string;
    publishedAt: bigint;
    featured: boolean;
}

export interface backendInterface {
    addPropertyToFavorites(buyerId: BuyerId, propertyId: bigint): Promise<void>;
    approveIdDocument(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAgentProfile(profile: AgentProfile): Promise<void>;
    createBuyerProfile(profile: BuyerProfile): Promise<void>;
    createProperty(property: Property): Promise<bigint>;
    createSupportTicket(subject: string, message: string, email: string): Promise<bigint>;
    deleteProperty(propertyId: bigint): Promise<void>;
    filterPublishedProperties(criteria: FilterCriteria): Promise<Array<Property>>;
    getAgentAverageRating(agentId: Principal): Promise<number>;
    getAgentInquiries(): Promise<Array<InquiryWithTitle>>;
    getAgentProfile(agentPrincipal: Principal): Promise<AgentProfile | null>;
    getAgentProperties(agentId: AgentId): Promise<Array<Property>>;
    getAgentReviews(agentId: Principal): Promise<Array<AgentReview>>;
    getAgentsForVerification(): Promise<Array<AgentProfile>>;
    getAllProperties(): Promise<Array<Property>>;
    getAllPropertyImages(): Promise<Array<ExternalBlob>>;
    getAllPublishedProperties(): Promise<Array<Property>>;
    getAllSupportTickets(): Promise<Array<Ticket>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getAnalytics(): Promise<{
        agentCount: bigint;
        propertyCount: bigint;
        inquiryCount: bigint;
        buyerCount: bigint;
        userCount: bigint;
    }>;
    getBuyerInquiries(): Promise<Array<InquiryWithTitle>>;
    getBuyerProfile(buyerId: BuyerId): Promise<BuyerProfile | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavoriteProperties(buyerId: BuyerId): Promise<Array<Property>>;
    getFeaturedProperties(): Promise<Array<Property>>;
    getIdDocumentSubmissions(): Promise<Array<IdDocumentSubmission>>;
    getProperty(propertyId: bigint): Promise<Property | null>;
    getPropertyAverageRating(propertyId: bigint): Promise<number>;
    getPropertyDetails(propertyId: bigint): Promise<Property>;
    getPropertyReviews(propertyId: bigint): Promise<Array<Review>>;
    getPublishedProperty(propertyId: bigint): Promise<Property | null>;
    getPublishedPropertyDetails(propertyId: bigint): Promise<Property>;
    getTransactionsForBuyer(buyerId: string): Promise<Array<Transaction>>;
    getTransactionsForSeller(sellerId: string): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasSubmittedAgentReview(agentId: Principal): Promise<boolean>;
    hasSubmittedReview(propertyId: bigint): Promise<boolean>;
    inquireProperty(propertyId: bigint, message: string): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    promoteProperty(propertyId: bigint): Promise<void>;
    publishProperty(propertyId: bigint): Promise<void>;
    rejectIdDocument(id: bigint): Promise<void>;
    removePropertyFromFavorites(buyerId: BuyerId, propertyId: bigint): Promise<void>;
    respondToInquiry(inquiryId: bigint, response: string): Promise<void>;
    respondToTicket(ticketId: bigint, reply: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProperties(searchText: string): Promise<Array<Property>>;
    submitAgentReview(agentId: Principal, transactionId: string, rating: bigint, comment: string): Promise<void>;
    submitIdDocument(firstName: string, lastName: string, email: string, docType: string, frontBlob: ExternalBlob, backBlob: ExternalBlob | null): Promise<bigint>;
    submitReview(propertyId: bigint, rating: bigint, comment: string): Promise<void>;
    updateProperty(propertyId: bigint, updatedProperty: Property): Promise<void>;
    updateTicketPriority(ticketId: bigint, priority: TicketPriority): Promise<void>;
    updateTicketStatus(ticketId: bigint, status: TicketStatus): Promise<void>;
    updateTransactionStatus(id: string, status: TransactionStatus): Promise<void>;
    uploadPropertyImage(propertyId: bigint, blobId: ExternalBlob): Promise<void>;
    verifyAgent(agentId: AgentId): Promise<void>;
    createNewsPost(title: string, summary: string, content: string, category: string, author: string, imageUrl: string, featured: boolean): Promise<bigint>;
    getAllNewsPosts(): Promise<Array<NewsPost>>;
    getFeaturedNewsPosts(): Promise<Array<NewsPost>>;
    updateNewsPost(id: bigint, title: string, summary: string, content: string, category: string, author: string, imageUrl: string, featured: boolean): Promise<boolean>;
    deleteNewsPost(id: bigint): Promise<boolean>;
    getPublicMarketStats(): Promise<{ totalListings: bigint; totalAgents: bigint; totalBuyers: bigint }>;
    submitSellerListing(sellerName: string, sellerEmail: string, title: string, description: string, propertyType: string, price: number, currency: string, location: string, country: string, bedrooms: bigint, bathrooms: bigint, area: number, imageUrls: Array<string>): Promise<bigint>;
    getMySellerSubmissions(): Promise<Array<SellerSubmission>>;
    getSellerSubmissions(): Promise<Array<SellerSubmission>>;
    approveSellerSubmission(id: bigint, adminNote: string): Promise<void>;
    rejectSellerSubmission(id: bigint, adminNote: string): Promise<void>;
}
