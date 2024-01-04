import {WorkflowDetails} from './workflow-details.model';
import {Attachment} from '../document/attachment.model';
import {Recipients} from '../user/recipients.model';

export class WorkItemAction {
  id: any;
  actions: any;
  instructions: any;
  deadline: any;
  reminder: any;
  roleId: any;
  EMPNo: any;
  actionDetails: any;
  wiAction: any;
  saveType: string;
  draftId: any;
  draft: boolean;
  draftDate: any;
  docTo: any;
  docFrom: any;
  workitemId: any;
  priority: any;
  actionTaken: any;
  memoStepName:any;
  isMemoApproval:any;
  wiRemarks: any;
  recipients: Recipients[];
  attachments: Attachment[];
  workflow: WorkflowDetails;
  refNo: any;
  messages: any;
  selectedorgCode: any;
  date: any;
}
