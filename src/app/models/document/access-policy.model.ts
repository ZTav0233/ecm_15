import {AccessPolicyPermissions} from './access-policy-permissions.model';

export class AccessPolicy {
  id: any;
  name: any;
  desc: any;
  objectId: any;
  orgUnitId: any;
  orgCode: any;
  orgName: any;
  permissions: AccessPolicyPermissions[];
}
