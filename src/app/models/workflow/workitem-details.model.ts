import {Attachment} from '../document/attachment.model';
import {Recipients} from '../user/recipients.model';

export class WorkitemDetails {
  priority: any;
  subject: any;
  remarks: any;
  Keywords: any;
  createdOn: any;
  docFrom: any;
  docTo: any;
  docDate: any;
  docRecdDate: any;
  refNo: any;
  projNo: any;
  contractNo: any;
  ECMNo: any;
  workitemId: any;
  workflowId: any;
  SentItemId: any;
  actions: any;
  status: any;
  instructions: any;
  type: any;
  deadline: any;
  reminder: any;
  receivedDate: any;
  senderRoleId: any;
  senderEMPNo: any;
  recipientEMPNo: any;
  recipientRoleId: any;
  systemStatus: any;
  wfCreatorName: any;
  recipientName: any;
  senderName: any;
  recipientRoleName: any;
  senderRoleName: any;
  comments: any;
  attachments: Attachment[];
  recipients: Recipients[];
}

