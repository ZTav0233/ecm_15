import {Role} from './role.model';
import {DelegateModel} from './delegate.model';
import {OrgUnit} from '../admin/org-unit.model';

export class User {
  id: any;
  name: any;
  userName: string;
  fulName: string;
  title: string;
  mail: string;
  EmpNo: any;
  KocId: any;
  orgCode: any;
  appRole: string;
  isAdmin: string;
  isReport: string;
  roles: Role[];
  iseSignAllowed: number;
  isInitalAllowed: number;
  isInitialAllowed: number;
  delegated: DelegateModel[];
  headof: OrgUnit[];
  isReportAdmin: string;
  initialAllowed:any;
  esignAllowed:any;
  status:any;
}
