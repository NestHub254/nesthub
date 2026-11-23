from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
import pymupdf
from PIL import Image as PILImage, ImageOps, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'; TMP=ROOT/'tmp/pdfs'
OUT.mkdir(parents=True,exist_ok=True); TMP.mkdir(parents=True,exist_ok=True)
for name,file in [('Arial','arial.ttf'),('Arial-Bold','arialbd.ttf'),('Arial-Italic','ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold',italic='Arial-Italic',boldItalic='Arial-Bold')
NAVY=HexColor('#172640'); BLUE=HexColor('#315BC0'); TEAL=HexColor('#087F83'); INK=HexColor('#25344C'); MUTED=HexColor('#5D6C80'); PALE=HexColor('#F0F4FA'); LINE=HexColor('#DDE5EF')
W,H=A4; CW=W-104
styles={
 'title':ParagraphStyle('title',fontName='Arial-Bold',fontSize=26,leading=31,textColor=NAVY,spaceAfter=12),
 'sub':ParagraphStyle('sub',fontName='Arial',fontSize=11.5,leading=17,textColor=MUTED,spaceAfter=17),
 'h':ParagraphStyle('h',fontName='Arial-Bold',fontSize=13,leading=17,textColor=NAVY,spaceBefore=14,spaceAfter=6),
 'body':ParagraphStyle('body',fontName='Arial',fontSize=10.4,leading=15.3,textColor=INK,spaceAfter=8),
 'small':ParagraphStyle('small',fontName='Arial',fontSize=8.5,leading=12,textColor=MUTED,spaceAfter=6),
 'cell':ParagraphStyle('cell',fontName='Arial',fontSize=9.3,leading=13.4,textColor=INK),
 'th':ParagraphStyle('th',fontName='Arial-Bold',fontSize=9.2,leading=13,textColor=white),
 'quote':ParagraphStyle('quote',fontName='Arial-Bold',fontSize=11.4,leading=17,textColor=NAVY),
}
story=[]
def p(text,style='body'):return Paragraph(text,styles[style])
def add(text,style='body'):story.append(p(text,style))
def h(text):add(text,'h')
def bullets(items):
    for item in items:
        t=Table([[p('•','cell'),p(item)]],colWidths=[13,CW-13]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story.append(t)
def table(headers,rows,widths=None):
    data=[[p(x,'th') for x in headers]]+[[p(str(x),'cell') for x in row] for row in rows]
    t=Table(data,colWidths=[CW*x for x in widths] if widths else None,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[white,PALE]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),('LINEBELOW',(0,-1),(-1,-1),.5,LINE)]));story.append(t);story.append(Spacer(1,10))
def callout(label,text):
    t=Table([[p(label.upper(),'small')],[p(text,'quote')]],colWidths=[CW]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('LINEBEFORE',(0,0),(0,-1),3,TEAL),('LEFTPADDING',(0,0),(-1,-1),15),('RIGHTPADDING',(0,0),(-1,-1),15),('TOPPADDING',(0,0),(-1,0),11),('BOTTOMPADDING',(0,-1),(-1,-1),13)]));story.append(t);story.append(Spacer(1,10))
def start(num,title,subtitle):
    if story:story.append(PageBreak())
    add(f'{num:02d} / PRESENTER\'S HANDBOOK','small');add(title,'title');add(subtitle,'sub')
def steps(items):
    for i,(title,body) in enumerate(items,1):
        t=Table([[p(f'{i:02d}','quote'),p(f'<b>{title}</b><br/>{body}')]],colWidths=[35,CW-35]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,LINE),('LEFTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story.append(t)

start(1,'NestHub','MVP presentation handbook | Prepared for Mark Kyalo | 8 October 2026')
story.append(Spacer(1,22))
logo=Image(str(ROOT/'frontend/public/brand/owner-192.png'),width=72,height=72);logo.hAlign='LEFT';story.append(logo);story.append(Spacer(1,25))
add('One property. One connected team.\nA simpler rental experience.','title')
add('A practical guide to the owner workspace, tenant portal, receptionist workspace and grounds manager workspace. Use it to explain the product, demonstrate its workflows and answer questions honestly.','sub')
callout('The one-sentence pitch','NestHub connects homes, residents, payments, maintenance and communication so property teams can manage daily operations from a phone or laptop.')
h('Two apps, four working roles')
table(['Property app','Tenant app'],[['Owners, receptionists and grounds managers sign in to the same property application. Each role gets a different workspace.','Residents use a separate portal for their own bills, receipts, repairs, messages and home.']], [.5,.5])
add('<b>Property portal:</b> <link href="https://nesthub.sionaglobal.com" color="#315BC0">nesthub.sionaglobal.com</link><br/><b>Tenant portal:</b> <link href="https://nesthub-tenants.vercel.app" color="#315BC0">nesthub-tenants.vercel.app</link>')
add('Scope: current MVP behavior, not a promise that every future integration is live. Examples in this handbook are illustrative and do not represent actual customer transactions. No passwords are included.','small')

start(2,'The problem and the product','Explain the everyday situation before demonstrating the screens.')
h('The problem')
add('An apartment owner may be away from the building or outside the country. The receptionist handles residents, staff handle repairs, tenants pay through different channels, and water, power and maintenance costs still need attention. When these activities live in notebooks, chats and spreadsheets, it is difficult to know what is paid, what is vacant and what needs action.')
h('What NestHub connects')
steps([('The building and its units','A property contains rentable units: apartments, bedsitters, rooms, shops or offices.'),('The resident and their tenancy','A tenant account is linked to one assigned home, agreed rent, deposit and tenancy dates.'),('The money and the evidence','Bills, submitted payment references, management confirmations, receipts and building expenses form a connected record.'),('The people and the work','Residents report problems; management assigns staff; updates and private photos remain attached to the repair.')])
h('Why this helps an owner who is away')
add('The owner can check occupancy, review payment submissions, approve expenses, follow repairs and communicate with the team without being physically at the property. This requires staff to record activity accurately and an internet connection; the software does not independently verify cash or bank receipts.')
callout('What to say','“Instead of showing disconnected forms, I will show one resident moving into a home, paying a bill, reporting a repair and receiving updates.”')

start(3,'Who uses which portal?','Staff have separate role-based workspaces inside the property app.')
table(['Presentation name','Current account role','Access point'],[['Owner','Owner','Property portal'],['Receptionist / front desk','Property manager / reception','Property portal'],['Grounds manager / caretaker','Maintenance & repairs','Property portal'],['Tenant / resident','Tenant','Separate tenant portal']],[.34,.33,.33])
callout('Important naming detail','“Grounds manager” describes the maintenance role in this MVP. It is an assigned-work role, not a separate supervisor role with payroll, purchasing or staff-management powers.')
h('How access is created')
bullets(['Owners can self-register using email and password or use Google sign-in on the property side.','The owner creates staff accounts and connects them to a property. Staff use the property portal login.','Owners or receptionists create tenant accounts during move-in and choose a vacant unit. Tenants do not self-register or use Google sign-in.','Access checks happen on the server. A different owner cannot access your property simply by changing a page address.'])
h('Read this handbook in presentation order')
table(['Pages','Topic'],[['4-7','The owner, tenant, receptionist and grounds manager workspaces'],['8-11','Move-in, payments, utilities, reports, repairs and communication'],['12-14','Access, PWAs, permissions, proposed subscriptions and roadmap'],['15-16','Live demo script, audience questions and reference notes']],[.17,.83])

start(4,'The owner workspace','The control centre for property oversight and decisions.')
table(['Module','What the owner does'],[['Home','Check occupied and vacant homes, outstanding bills, received income, pending confirmations and recent activity.'],['Units & homes','Register rooms or units with type, floor and rent. Open a unit to see its resident and tenancy.'],['Tenants','Move residents in, search the directory, edit contact details, review tenancy/payment history and end a tenancy.'],['Money & bills','Set payment instructions, add charges, record and confirm payments, issue receipts and manage building expenses.'],['Repairs','View the repair board, assign staff and follow progress, notes and private images.'],['Messages','Post announcements, use the apartment group, message tenants privately and coordinate in team chat.'],['My team','Create manager/reception and maintenance accounts scoped to the building.'],['Reports','Review monthly results for a property or portfolio; export CSV or print/save PDF.']],[.23,.77])
h('Controls that apply across the workspace')
add('Switch properties at the top of the screen. Use the top-right theme selector to customise the owner workspace. Arial is used across both apps. The Property button adds another building; the refresh control updates the workspace and rent bills.')
callout('Owner outcome','“I can see what is happening, what needs approval and what the property is earning or spending, even when I am away.”')

start(5,'The tenant portal','A resident sees their own home and tasks, not the owner’s business records.')
table(['Module','Resident experience'],[['Home','See the last confirmed payment, next unpaid bill, outstanding balance, payments awaiting review and open repairs.'],['My money','Read payment instructions, view bills, submit an M-Pesa or bank reference, track confirmation and download confirmed receipts.'],['My repairs','Report an issue with urgency and description. Add private photos and follow assignment, progress and completion notes.'],['Messages','Read announcements, join the apartment group and communicate privately with the property team.'],['My home','View the assigned unit, monthly rent and tenancy information.']],[.23,.77])
h('A normal tenant journey')
add('The tenant signs in with the account created by management. They check the amount due, pay using the building’s external M-Pesa or bank instructions and select <b>I have paid</b> against the relevant bill. After management confirms the reference, the balance reduces and a receipt becomes available.')
h('If something breaks')
add('The tenant reports the problem once. The repair stays visible in My repairs, and management/staff updates also appear in messages. Photos help explain the issue without being shared with the whole apartment group.')
h('If they forget their password')
add('The tenant enters their registered email, receives a reset link and six-digit code, then enters that code with a new password and confirmation. The reset is self-service; management does not receive or choose the new password.')
callout('Tenant outcome','“I know what I owe, can show that I paid, and can reach the people responsible for my home.”')

start(6,'The receptionist workspace','Operational responsibility for one assigned property.')
add('The current account label is <b>Property manager / reception</b>. This role is intended for the person handling residents, payment follow-up and day-to-day coordination. Its sidebar contains Home, Tenants, Money & bills, Repairs and Messages.')
h('What reception can do')
bullets(['Create a tenant account and move the resident into an already registered vacant unit. The owner registers units first.','Search residents, read lease/payment history and edit names, login emails and phone numbers.','Add water, electricity or other tenant bills; record payments and confirm or reject submitted references after checking the actual transaction.','Send in-app rent reminders and submit building expenses for owner approval.','Report building issues, assign repair staff and track progress.','Post announcements, use group/private resident conversations and coordinate in private team chat.'])
h('What stays with the owner')
add('Reception cannot create properties or units, create staff accounts, set payment instructions, approve or mark expenses paid, or use the owner’s portfolio reports. Ending or reassigning a tenancy is an owner action in the current MVP.')
h('A useful daily routine')
steps([('Start with Home','Check pending payment confirmations and outstanding work.'),('Handle resident requests','Complete move-ins, verify references and follow up on unpaid bills.'),('Close the communication loop','Assign repairs, update residents and send proposed costs to the owner.')])

start(7,'The grounds manager workspace','The maintenance role focuses on assigned jobs and team coordination.')
add('Use <b>Maintenance & repairs</b> when creating this account. In your presentation you can describe the person as a grounds manager, caretaker or maintenance team member. Their workspace has Home, Repairs and Messages.')
h('What the grounds manager can do')
bullets(['See repair jobs assigned to their account and the associated unit or building location.','Update the job through Reported, Assigned, In progress and Completed states as appropriate, with an explanation of the work.','Attach before/after photos to an assigned repair. Each repair supports up to five private images.','Read and send messages in private team chat with management and other staff.','Work from the property PWA on a phone while moving around the building.'])
h('What the role cannot do')
add('Maintenance staff cannot view tenant rent balances or payment records, confirm payments, approve expenses, create tenant or staff accounts, assign work to other staff, publish apartment announcements or access tenant group/private conversations. New repair requests are raised by residents or management.')
h('Example: a leaking tap')
steps([('Receive the assignment','Management connects the ticket to the responsible staff account.'),('Record the work','The staff member marks progress, adds a photo and describes the repair.'),('Complete and communicate','The completion note becomes visible to the resident; team chat handles internal coordination.')])
callout('Scope boundary','This is not yet a full facilities-management suite: recurring grounds schedules, inspections, stock control and payroll are possible future extensions.')

start(8,'From vacant unit to move-out','The unit, tenant account and tenancy must stay connected.')
steps([('Register the property','The owner names the building and adds its location.'),('Register units / rooms','The owner opens Units & homes, selects Add unit / room, and enters the label, type, rent and floor. The unit starts vacant.'),('Create the tenant and choose a home','Use Tenants > Move a tenant in. Enter the resident’s account details, then choose a vacant unit and agree rent, deposit, start date, due day and optional lease end.'),('Save the move-in','The account and assignment save together. The unit becomes occupied; an occupied unit cannot be assigned twice.'),('Use the resident portal','Share login details privately. The tenant sees the linked home and its bills in the separate portal.'),('End the tenancy','The owner confirms move-out from the tenancy controls. The home becomes vacant and historical bills/payments remain available.')])
h('Rules worth explaining')
add('Monthly rent is charged in full from the move-in month; automatic daily proration is not implemented. Rent bills are generated when the workspace opens or refreshes, without duplicating the same charge. There is no unattended scheduled billing job yet.')
add('An optional lease-end date records the agreement; ending the tenancy is a deliberate management action. Deposit refunds are settled separately, and outstanding balances do not disappear at move-out.','small')

start(9,'Payments: bill to receipt','Payment confirmation is a controlled workflow, not automatic bank verification.')
steps([('A bill exists','Rent/deposit bills come from the tenancy. Management adds water, electricity and other charges separately.'),('The resident pays externally','The tenant follows the owner’s M-Pesa or bank details. NestHub does not trigger an STK prompt or transfer money.'),('A reference is submitted','The tenant enters the bill, amount, method, transaction reference and payment date. The submission is Pending.'),('Management checks the money','Owner or reception checks the actual M-Pesa/bank record, then confirms or rejects the reference.'),('The account updates','A confirmed payment reduces the balance, appears in reports and provides a printable receipt. Pending or rejected references do not count as received income.')])
h('First-day and partial payments')
add('Management can record a move-in payment on behalf of a tenant, including cash. It still goes through confirmation. Partial payments are allowed; pending plus confirmed amounts cannot exceed that bill’s value.')
callout('Illustrative example','Rent is KES 15,000. A tenant submits KES 5,000 and management confirms it: KES 10,000 remains. The second payment clears the bill only after it is also confirmed.')
add('<b>Receipt:</b> downloadable HTML with a print/save PDF option. It acknowledges a recorded payment; it is not a tax invoice and is not automatically emailed.','small')

start(10,'Utilities, expenses and reports','Separate what tenants owe from what the building spends.')
h('Water and electricity')
add('A tenant utility bill is a charge to a resident. A supplier invoice is a building expense. Record both when relevant: receiving money from a tenant is different from paying the water supplier. Meter readings and rates can be written in the bill description; there is no automatic meter-reading or allocation engine.')
table(['Illustrative record','Amount','Where it belongs'],[['Water charged to a tenant','KES 1,200','Tenant bill'],['Water supplier invoice','KES 8,000','Building expense'],['Staff wages or repair cost','Actual recorded cost','Building expense']],[.45,.19,.36])
h('Expense approval')
add('Owner or reception submits an expense with category, supplier, description, amount and due date. The owner approves or rejects it. Only the owner marks an approved expense paid. Marking paid records the event; it does not send money to the supplier.')
h('What the reports mean')
table(['Report measure','How to explain it'],[['Operating cash result','Confirmed non-deposit income received minus expenses marked paid, by payment date.'],['Billed operating result','Rent/utilities billed minus approved or paid operating costs, by due date, whether money moved or not.'],['Rent collection','Rent billed for the chosen month, payments confirmed against those bills, and the remaining amount.'],['Occupancy / portfolio','Occupied and vacant registered homes; compare properties and export or print the report.']],[.34,.66])
add('Refundable deposits are shown separately from income. These are operational reports, not complete statutory profit-and-loss accounts: tax, depreciation and unrecorded costs are excluded.','small')

start(11,'Repairs and communication','Keep the request, responsible person and response in one place.')
h('The repair workflow')
callout('Work moves through the board','Reported > Assigned > In progress > Completed')
add('A resident or manager describes the issue and urgency. Management assigns the responsible person. Assigned staff add progress/completion notes; the resident sees the result in repairs and messages. Shared building-area issues can also be raised by management.')
add('Private photos are attached to the repair, not to the public group. Relevant management, the reporting resident and assigned maintenance staff can access them. Up to five images are allowed. Management can remove photos; resident/staff uploaders can remove their own permitted uploads.')
h('Four communication spaces')
table(['Channel','Purpose and audience'],[['Apartment group','Residents and management discuss building matters. Keep private account information out of this shared space.'],['Announcements','Management publishes official notices. Residents can read them.'],['Private conversations','A resident communicates with the property team about their own account or home.'],['Team chat','Owner, reception and maintenance coordinate internally. Residents cannot see it.']],[.3,.7])
h('Reminders and updates')
add('Management can send an in-app rent reminder from an unpaid bill. Payment confirmations and repair notes also produce in-app updates. Open dashboards refresh approximately every 30 seconds.')
add('These are NestHub messages, not SMS, WhatsApp or phone push notifications. For an emergency, contact the property team or emergency service directly rather than waiting for an app refresh.','small')

start(12,'Access, recovery and PWAs','Explain usability and protection without overstating the product.')
h('Sign-in and account changes')
bullets(['Google sign-in is on the property side only. Tenants sign in with accounts created by management.','Staff sign in through the property app using their assigned role; creating an owner account is not the way to join an existing property as staff.','Management can edit tenant contact details. Changing the login email signs the tenant out and invalidates old reset links.','Current email self-service recovery is for tenant accounts. Do not demonstrate owner/staff recovery as an implemented feature.'])
h('Tenant password recovery')
add('The registered tenant email receives a reset link and six-digit one-time code through Brevo. The resident enters the code, a new password and confirmation. The link expires after 15 minutes, attempts are limited, and a successful reset invalidates existing sessions and other reset requests.')
h('Installable apps on phone or laptop')
add('Both portals are Progressive Web Apps (PWAs). On supported browsers, use the browser’s Install app or Add to Home Screen option. Installation provides a convenient app entry point; it does not mean every function works offline. Live balances, messages, uploads and actions require internet.')
h('Presentation-friendly details')
add('The owner and tenant apps have distinct icons. Arial is used across the interfaces, and the owner workspace offers a theme selector. If an installed copy shows an older design, close/reopen it or reload again after the update downloads.')
add('Reset emails include the NestHub logo inside the message. A grey sender avatar in an inbox is separate: reliable brand-avatar support requires sender-domain/provider configuration.','small')

start(13,'Permissions at a glance','These are the current MVP permissions, not proposed custom roles.')
table(['Task','Owner','Reception','Grounds','Tenant'],[
['Create property / unit','Yes','No','No','No'],
['Create / edit tenant','Yes','Assigned property','No','No'],
['End / reassign tenancy','Yes','No','No','No'],
['Create staff accounts','Yes','No','No','No'],
['Set payment instructions','Yes','No','No','No'],
['Submit payment reference','Yes','Yes','No','Own bills'],
['Confirm payments','Yes','Yes','No','No'],
['Submit building expense','Yes','Yes','No','No'],
['Approve / mark expense paid','Yes','No','No','No'],
['Assign repairs','Yes','Yes','No','No'],
['Update repair progress','Yes','Yes','Assigned jobs','No'],
['Private staff chat','Yes','Yes','Yes','No'],
['Portfolio reports','Yes','No','No','No'],
['Tenant email recovery','Not applicable','Not applicable','Not applicable','Own account']
],[.36,.13,.2,.16,.15])
h('The practical rule')
add('Owners oversee their own properties. Reception and maintenance are connected to a specific property. A tenant sees their own home, money and repair records plus the building communications intended for residents.')
add('Grounds managers use the maintenance role. They do not receive receptionist powers because of their job title. If a person needs financial or resident-management access, their assigned role must reflect that responsibility.','small')

start(14,'The MVP and the business model','Show value today, then explain what comes next.')
h('What is available now')
add('Connected properties, units and tenancies; tenant/staff accounts; manual payment verification; bills, receipts and expense approval; monthly property/portfolio reports; repair assignment and private images; four communication channels; tenant email recovery; and two installable PWAs.')
h('Proposed subscription packages')
table(['Plan','Proposed monthly price','Proposed package'],[['Basic','KES 1,500','1 property, up to 10 units; tenant accounts, manual payments, repairs and in-app messages.'],['Standard','KES 2,500','Up to 5 properties, unlimited units; reception/maintenance accounts, expenses and reports.'],['Enterprise','KES 5,000','Unlimited properties/units; portfolio reporting. Custom roles and integrations remain future work.']],[.2,.25,.55])
callout('Current commercial status','MVP access is unmetered. Paid checkout, subscription billing and plan limits are not active. The prices and limits on the landing page are proposed, not enforced entitlements.')
h('Next integrations and extensions')
bullets(['M-Pesa STK push and bank reconciliation need provider/business setup and verified callbacks.','SMS, WhatsApp, push notifications and automatic receipt emails need additional delivery integrations.','Scheduled rent generation, proration and deposit-refund accounting would extend the money workflow.','Custom roles, recurring grounds work, stock control and payroll would extend team operations.'])
add('Tenants and staff should belong to the owner’s subscription rather than buying individual plans. Future plan enforcement should be server-side and should not delete existing records when a plan changes.','small')

start(15,'A 10-minute live demonstration','Tell one connected story. Keep extra modules for questions.')
table(['Time','Screen / action','What to say'],[['0:00-1:00','Landing page and portal links','“The owner, team and resident use connected workspaces with different responsibilities.”'],['1:00-2:00','Owner Home; Units & homes','“I can see occupancy and register each rentable space. A unit is a room, apartment or other rentable home.”'],['2:00-3:00','Tenants > Move a tenant in','“The login, vacant unit and rent agreement connect in one flow.”'],['3:00-4:00','Tenant Home and My money','“This resident sees their own balance, home and payment instructions.”'],['4:00-5:00','Payment submission and confirmation','“The reference awaits verification. Management confirms only after checking the actual money.”'],['5:00-6:00','Receipt; building expenses','“A confirmed payment produces a receipt. Supplier costs are tracked separately.”'],['6:00-7:30','Repair board; grounds role','“The resident reports; reception assigns; grounds staff update the job with evidence.”'],['7:30-8:30','Messages and team chat','“Resident conversations and staff coordination have separate audiences.”'],['8:30-9:30','Reports; property / portfolio','“The owner sees occupancy, collection, costs and the operating result.”'],['9:30-10:00','MVP status and closing pitch','“The connected workflow is live. Provider automation and paid subscriptions are the next phase.”']],[.15,.34,.51])
h('Prepare before presenting')
add('Use clearly labelled demo accounts and records. Have owner, reception, grounds and tenant logins ready in separate browser profiles or private sessions. Prepare a vacant unit, an unpaid bill and an assigned repair. Do not create fake transactions in real customer records or display passwords.')
add('Confirm internet access, load both PWAs once, and keep this PDF as your offline explanation. If a live service is unavailable, describe the flow and label any example as an illustration.','small')

start(16,'Answers for your audience','Use direct answers and distinguish working behavior from the roadmap.')
for q,a in [
('Does paying as a tenant automatically confirm rent?','No. The tenant submits a reference; owner or reception verifies the actual transaction and confirms it. The app then updates the balance and receipt.'),
('Can I manage the apartment from another country?','Yes, with internet access. You can review records, approvals, repairs and messages remotely. Your team must still record activity and verify transactions accurately.'),
('Where do I register rooms?','Owner portal > Units & homes > Add unit / room. Vacant units then appear in the tenant move-in form.'),
('Can the grounds manager see rent or approve costs?','No. The maintenance role sees assigned repairs and staff chat. Financial approval remains with the appropriate management role.'),
('Is the cash surplus the same as profit?','Not necessarily. Cash reports track confirmed receipts and paid expenses. Billed results use due dates. Deposits are separate, and statutory adjustments are excluded.'),
('Is the subscription system already charging customers?','No. Packages are proposals. MVP access is unmetered and checkout/plan enforcement are not active.'),
('What should the pilot prove?','That users can complete move-in, payment verification and repairs with fewer missed handoffs. Measure completion times, confirmation delays, repair turnaround and user feedback; no results are claimed yet.')]:
    add(q,'h');add(a)
callout('Closing line','“NestHub makes the daily rental workflow visible and connected: the owner oversees, reception coordinates, grounds staff resolve issues, and the tenant stays informed.”')
add('<b>Basis of this guide:</b> current application routes, role checks, connected operations implementation and presentation/recovery documentation in the NestHub workspace, reviewed 8 October 2026. This handbook describes product behavior; it is not a financial, legal or security certification.','small')

class NumberedCanvas(canvas.Canvas):
    def __init__(self,*a,**k):super().__init__(*a,**k);self.states=[]
    def showPage(self):self.states.append(dict(self.__dict__));self._startPage()
    def save(self):
        total=len(self.states)
        for state in self.states:
            self.__dict__.update(state);self.footer(total);super().showPage()
        super().save()
    def footer(self,total):
        self.setStrokeColor(LINE);self.line(52,43,W-52,43)
        self.setFont('Arial',8);self.setFillColor(MUTED);self.drawString(52,28,'NESTHUB  /  MVP PRESENTATION HANDBOOK')
        self.drawRightString(W-52,28,f'{self._pageNumber:02d} / {total:02d}')
def header(c,doc):
    c.setFillColor(BLUE);c.rect(0,H-7,W,7,fill=1,stroke=0)
    c.setFont('Arial-Bold',9);c.setFillColor(NAVY);c.drawString(52,H-34,'NestHub')
    c.setFont('Arial',8);c.setFillColor(MUTED);c.drawRightString(W-52,H-34,'OWNER  /  RECEPTION  /  GROUNDS  /  TENANT')

pdf=OUT/'NestHub-MVP-Presentation-Handbook.pdf'
doc=SimpleDocTemplate(str(pdf),pagesize=A4,rightMargin=52,leftMargin=52,topMargin=62,bottomMargin=58,title='NestHub MVP Presentation Handbook',author='NestHub | Mark Kyalo',subject='Owner, tenant, receptionist and grounds manager portals and connected workflows')
doc.build(story,onFirstPage=header,onLaterPages=header,canvasmaker=NumberedCanvas)
document=pymupdf.open(pdf)
print(f'Created {pdf} | {len(document)} pages')
texts=[];thumbs=[]
for i,page in enumerate(document):
    text=page.get_text();texts.append(text)
    pix=page.get_pixmap(matrix=pymupdf.Matrix(1.25,1.25),alpha=False);pix.save(str(TMP/f'page-{i+1:02}.png'))
    thumb=PILImage.open(TMP/f'page-{i+1:02}.png').convert('RGB');thumb.thumbnail((298,422))
    tile=PILImage.new('RGB',(318,454),'#e1e6ee');tile.paste(thumb,((318-thumb.width)//2,8));ImageDraw.Draw(tile).text((12,434),f'PAGE {i+1:02}',fill='#172640');thumbs.append(tile)
    if len(text)<250:raise RuntimeError(f'Suspicious short page {i+1}')
    for block in page.get_text('dict')['blocks']:
        if block['type']!=0:continue
        if block['bbox'][3]>H-20:raise RuntimeError(f'Content below footer: page {i+1}')
if len(document)!=16:raise RuntimeError(f'Expected 16 deliberate pages, got {len(document)}')
(TMP/'extracted.txt').write_text('\n\n'.join(texts),encoding='utf8')
for start in range(0,len(thumbs),8):
    sheet=PILImage.new('RGB',(318*4,454*2),'white')
    for j,im in enumerate(thumbs[start:start+8]):sheet.paste(im,((j%4)*318,(j//4)*454))
    sheet.save(TMP/f'contact-{start//8+1}.png')
print('Text bounds and page counts passed. Rendered all pages for visual review.')
