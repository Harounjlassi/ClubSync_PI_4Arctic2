// src/app/shared/models/reclamation.model.ts

export enum ReclamationType {
  Club_Communication_Issue = 'Club_Communication_Issue',
  Membership_Request_Delay = 'Membership_Request_Delay',
  Project_Organization_Issue = 'Project_Organization_Issue',
  OTHER = 'OTHER'
}

export enum ReclamationStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED'
}

export interface ReclamationRequest {
  typeReclamation: ReclamationType;
  description: string;
  statut?: ReclamationStatus;
}

// Simplifying the approach - no need for a separate interface
// The backend will accept partial objects

export interface ReclamationResponse {
  idReclamation: number;
  typeReclamation: string;
  description: string;
  statut: string;
  dateReclamation: Date;
  dateResolution: Date | null;
}

export interface ReclamationResponseDTO {
  idReclamation: number;  // Changed back from 'id' to 'idReclamation'
  nomUtilisateur: string;
  typeReclamation: string;
  description: string;
  statut: string;
  dateReclamation: Date;
  dateResolution?: Date;
}