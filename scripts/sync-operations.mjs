// Shared UI source is maintained in frontend and copied into the independent tenant app.
import {copyFile,mkdir} from 'node:fs/promises';
const files=['OperationsApp.jsx','ActionForm.jsx','MoneyView.jsx','WorkViews.jsx','helpers.js','operations.css','RepairPhotos.jsx','ReportsView.jsx','receipt.js','Checkout.jsx','CommunityView.jsx','CommunicationsView.jsx','DepositView.jsx'];
await mkdir('tenant-portal/src/pages/operations',{recursive:true});
for(const file of files)await copyFile('frontend/src/pages/operations/'+file,'tenant-portal/src/pages/operations/'+file);
console.log('Synced shared operations UI.');
