import { UserResponse } from '../models/user-response.model';
import { User, Sexe } from '../models/user.model';
import { Role, RoleType } from '../models/role.model';

export function mapUserResponseToUser(userResponse: UserResponse): User {
  // Handle different potential formats of the role property
  let mappedRole: Role | undefined = undefined;
  
  if (userResponse.role) {
    if (typeof userResponse.role === 'string') {
      // If role is a string, create a Role object with roleType
      mappedRole = { roleType: userResponse.role as RoleType };
    } else if (Array.isArray(userResponse.role)) {
      // If role is an array (string[]), use the first value if available
      if (userResponse.role.length > 0) {
        mappedRole = { roleType: userResponse.role[0] as RoleType };
      } else {
        mappedRole = { roleType: RoleType.USER };
      }
    } else if (typeof userResponse.role === 'object' && userResponse.role.roleType) {
      // If role is already a Role object, use it directly
      mappedRole = userResponse.role as Role;
    }
  }
  
  // If no valid role was determined, default to USER
  if (!mappedRole) {
    mappedRole = { roleType: RoleType.USER };
  }

  return {
    idUser: userResponse.idUser,
    firstname: userResponse.firstname || '',
    lastname: userResponse.lastname || '',
    email: userResponse.email || '',
    dateNaissance: userResponse.dateNaissance ? new Date(userResponse.dateNaissance) : new Date(),
    sexe: userResponse.sexe || Sexe.HOMME,
    photoProfil: userResponse.photoProfil,
    numeroDeTelephone: userResponse.numeroDeTelephone,
    role: mappedRole,
    archived: userResponse.archived || false,
  };
}