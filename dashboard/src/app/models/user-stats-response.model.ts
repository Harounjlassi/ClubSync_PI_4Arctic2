export class UserStatsResponse {
    totalUsers: number;
    activeUsers: number;
    archivedUsers: number;
    usersByRole: { [role: string]: number };
    usersBySexe: { [sexe: string]: number };
    
    constructor(data?: Partial<UserStatsResponse>) {
      Object.assign(this, data || {});
    }
  }