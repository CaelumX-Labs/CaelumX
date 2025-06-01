/**
 * CaelumX Registry Types
 * 
 * Type definitions for the off-chain registry system that manages
 * carbon project metadata, verification status, and compliance data.
 */

// Project Status in Registry
export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VERIFICATION_PENDING = 'verification_pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived'
}

// Verification Standards
export enum VerificationStandard {
  VERRA = 'verra',
  GOLD_STANDARD = 'gold_standard',
  AMERICAN_CARBON_REGISTRY = 'acr',
  CLIMATE_ACTION_RESERVE = 'car',
  PLAN_VIVO = 'plan_vivo',
  CAELUM_COMMUNITY = 'caelum_community', // Community-verified projects
  OTHER = 'other'
}

// Project Categories
export enum ProjectCategory {
  RENEWABLE_ENERGY = 'renewable_energy',
  FORESTRY_CONSERVATION = 'forestry_conservation',
  REFORESTATION = 'reforestation',
  AVOIDED_DEFORESTATION = 'avoided_deforestation',
  ENERGY_EFFICIENCY = 'energy_efficiency',
  METHANE_CAPTURE = 'methane_capture',
  SUSTAINABLE_AGRICULTURE = 'sustainable_agriculture',
  BLUE_CARBON = 'blue_carbon',
  DIRECT_AIR_CAPTURE = 'direct_air_capture',
  WASTE_MANAGEMENT = 'waste_management',
  OTHER = 'other'
}

// Document Types
export enum DocumentType {
  PROJECT_DESIGN = 'project_design',
  METHODOLOGY = 'methodology',
  VALIDATION_REPORT = 'validation_report',
  VERIFICATION_REPORT = 'verification_report',
  MONITORING_REPORT = 'monitoring_report',
  SATELLITE_IMAGERY = 'satellite_imagery',
  LEGAL_AGREEMENT = 'legal_agreement',
  COMMUNITY_IMPACT = 'community_impact',
  BIODIVERSITY_ASSESSMENT = 'biodiversity_assessment',
  KYC_DOCUMENT = 'kyc_document',
  CERTIFICATE = 'certificate',
  OTHER = 'other'
}

// KYC Verification Status
export enum KYCStatus {
  NOT_SUBMITTED = 'not_submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// KYC Level
export enum KYCLevel {
  BASIC = 'basic',         // Email verification
  INDIVIDUAL = 'individual', // ID verification for individuals
  BUSINESS = 'business',    // Business verification
  ENHANCED = 'enhanced'     // Enhanced due diligence
}

// Project Interface
export interface Project {
  id: string;
  name: string;
  description: string;
  developer: {
    id: string;
    name: string;
    kycStatus: KYCStatus;
    kycLevel: KYCLevel;
    walletAddress: string;
  };
  category: ProjectCategory;
  subCategories?: string[];
  standard: VerificationStandard;
  externalRegistryId?: string;
  serialNumber?: string;
  vintage: number; // Year
  startDate: Date;
  endDate?: Date;
  creditQuantity: number; // Total tons of CO2e
  remainingCredits: number; // Unminted credits
  location: {
    country: string;
    region?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    polygonBoundaries?: [number, number][];
  };
  sdgs?: number[]; // Sustainable Development Goals (1-17)
  status: ProjectStatus;
  verificationDate?: Date;
  verifier?: string;
  documents: ProjectDocument[];
  metadata: Record<string, any>; // Flexible schema for additional data
  createdAt: Date;
  updatedAt: Date;
  daoVotes?: {
    approvalCount: number;
    rejectionCount: number;
    abstainCount: number;
    votingEnds?: Date;
  };
  mintingAllowed: boolean;
  suspensionReason?: string;
}

// Project Document
export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: DocumentType;
  ipfsHash: string;
  arweaveHash?: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
}

// Registry Sync Status
export interface RegistrySyncStatus {
  projectId: string;
  lastSyncedAt: Date;
  onChainStatus: boolean;
  syncHash: string; // Hash of last synced data
  pendingChanges: boolean;
  oracleTransactions: string[]; // Transaction signatures
  syncErrors?: string[];
}

// DAO Vote
export interface DAOVote {
  id: string;
  projectId: string;
  voter: string;
  voteType: 'approve' | 'reject' | 'abstain';
  votingPower: number;
  reason?: string;
  timestamp: Date;
  transactionSignature?: string;
}

// Verification Event
export interface VerificationEvent {
  id: string;
  projectId: string;
  eventType: 'submission' | 'review' | 'verification' | 'approval' | 'rejection' | 'suspension';
  performedBy: string;
  timestamp: Date;
  notes?: string;
  evidence?: string[];
  changesMade?: Record<string, any>;
}

// Registry Audit Log
export interface RegistryAuditLog {
  id: string;
  entityType: 'project' | 'document' | 'user' | 'vote';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'approve' | 'reject' | 'sync';
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

// KYC Document
export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'id_card' | 'passport' | 'drivers_license' | 'business_registration' | 'utility_bill' | 'bank_statement';
  documentNumber?: string;
  issuingCountry?: string;
  expiryDate?: Date;
  ipfsHash: string;
  encryptedIpfsHash?: string; // Encrypted version for private storage
  uploadedAt: Date;
  verificationStatus: KYCStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  zkProofReference?: string; // Reference to zero-knowledge proof
}
export interface ProjectData {
  name: string;
  description: string;
  creatorId: string;
}