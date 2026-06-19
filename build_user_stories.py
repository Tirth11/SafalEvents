# -*- coding: utf-8 -*-
"""Generate End-to-End User Stories Word document for Safal-AI."""
import datetime
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT = r"E:\Safalvir\SafalAI\repo\SafalAI_User_Stories.docx"
TODAY = datetime.date(2026, 6, 15).strftime("%d %B %Y")

BRAND = RGBColor(0x6D, 0x28, 0xD9)      # violet
INK   = RGBColor(0x1F, 0x29, 0x37)
MUTED = RGBColor(0x6B, 0x72, 0x80)
LABELBG = "F1ECFB"
HEADBG  = "6D28D9"

# ----------------------------------------------------------------------------
# USER STORY DATA  (grounded in the actual Safal-AI codebase:
#   backend routes: auth, chat, expense, purchase, receipt, warranty,
#   event, family, report, credit  |  Prisma models  |  Next.js pages)
# ----------------------------------------------------------------------------
EPICS = [
 {"id":"AUTH","name":"Authentication & Account","desc":"Registration, JWT sign-in, profile management, password and preference (currency/language) handling.","stories":[
   {"id":"US-AUTH-001","title":"Register a new account","role":"new user","want":"create an account with my name, email and password","benefit":"I can start using Safal-AI","pri":"High","deps":"—",
    "ac":["POST /auth/register accepts name, email and password.","Email must be unique; duplicates are rejected with a clear error.","Password is stored hashed and a JWT is returned on success.","A default currency (USD), language (en) and role (user) are set."]},
   {"id":"US-AUTH-002","title":"Sign in","role":"registered user","want":"log in with my email and password","benefit":"I securely access my data","pri":"High","deps":"US-AUTH-001",
    "ac":["POST /auth/login validates credentials and returns a JWT on success.","Invalid credentials are rejected without revealing which field failed.","The token authorizes all subsequent protected requests."]},
   {"id":"US-AUTH-003","title":"View my profile","role":"signed-in user","want":"retrieve my profile details","benefit":"I can see my account information","pri":"Medium","deps":"US-AUTH-002",
    "ac":["GET /auth/me returns the authenticated user's profile.","Password is never returned in the payload.","Unauthenticated requests are rejected (401)."]},
   {"id":"US-AUTH-004","title":"Update my profile & preferences","role":"signed-in user","want":"update my name, avatar, phone, currency and language","benefit":"the app reflects my identity and locale","pri":"Medium","deps":"US-AUTH-003",
    "ac":["PUT /auth/me updates editable profile fields.","Currency and language changes apply across the app.","Changes persist and are returned in the response."]},
   {"id":"US-AUTH-005","title":"Change my password","role":"signed-in user","want":"change my password by providing the current and new password","benefit":"I keep my account secure","pri":"Medium","deps":"US-AUTH-002",
    "ac":["PUT /auth/password verifies the current password before changing.","The new password is hashed and stored.","An incorrect current password is rejected."]},
   {"id":"US-AUTH-006","title":"Protected, per-user data access","role":"platform owner","want":"all data endpoints to require a valid JWT and scope data to the owner","benefit":"users only ever see their own records","pri":"High","deps":"US-AUTH-002",
    "ac":["All non-auth routes require a valid bearer token (authenticate middleware).","Queries are scoped by the authenticated userId.","Expired/invalid tokens return 401."]},
 ]},

 {"id":"CHAT","name":"AI Conversational Assistant","desc":"The core conversational interface: natural-language intent detection, AI-proposed actions with confirmation, attachments, history and guided onboarding.","stories":[
   {"id":"US-CHAT-001","title":"Chat with the AI assistant","role":"user","want":"type a natural-language message and get a helpful AI response","benefit":"I manage finances by talking instead of filling forms","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /chat accepts a message and/or attachments.","The assistant returns a structured response with content and an optional action.","An empty message with no attachments is rejected."]},
   {"id":"US-CHAT-002","title":"Detect intent from free text","role":"user","want":"the AI to understand whether I'm adding an expense, asking for a report, checking warranties or budget, or uploading a receipt","benefit":"I don't need to learn commands","pri":"High","deps":"US-CHAT-001",
    "ac":["The assistant classifies the message into an intent (add_expense, generate_report, check_warranty, check_budget, upload_receipt, general_query).","Unrecognized input falls back to a helpful general response with suggestions.","The detected intent drives the response and proposed action."]},
   {"id":"US-CHAT-003","title":"Add an expense by chatting","role":"user","want":"say something like \"Add $50 for groceries\" and have the AI parse the amount and description","benefit":"logging expenses takes seconds","pri":"High","deps":"US-CHAT-002, US-EXP-001",
    "ac":["The AI extracts amount and description from the message.","It returns a proposed expense that requires explicit confirmation before saving.","On confirmation the expense is created against my account."]},
   {"id":"US-CHAT-004","title":"Confirm or cancel an AI-proposed action","role":"user","want":"review what the AI understood and confirm or cancel before anything is saved","benefit":"I stay in control and avoid mistakes","pri":"High","deps":"US-CHAT-003",
    "ac":["Actions that change data are returned with status \"requires_confirmation\".","A preview card shows the parsed values.","Confirming commits the action; cancelling discards it."]},
   {"id":"US-CHAT-005","title":"Get reports and insights via chat","role":"user","want":"ask \"show my spending\" and receive a summary","benefit":"I get insights conversationally","pri":"Medium","deps":"US-CHAT-002, US-RPT-001",
    "ac":["A report intent returns a spending summary (totals, top category, period comparison).","The reply offers a detailed breakdown follow-up.","Figures are drawn from the user's data."]},
   {"id":"US-CHAT-006","title":"Check warranties and budget via chat","role":"user","want":"ask about my warranties or budget status in chat","benefit":"I get quick status without navigating menus","pri":"Medium","deps":"US-CHAT-002",
    "ac":["A warranty query lists active warranties and offers to set reminders.","A budget query returns spent/remaining vs the monthly budget.","Responses reflect the user's actual records."]},
   {"id":"US-CHAT-007","title":"Attach files to a message","role":"user","want":"attach a receipt image or document to my chat message","benefit":"I can capture data straight from a photo","pri":"Medium","deps":"US-CHAT-001, US-RCP-001",
    "ac":["Attachments can be sent with or without text.","Attached receipts can be routed to OCR processing.","Attachments are associated with the message in history."]},
   {"id":"US-CHAT-008","title":"View chat history","role":"user","want":"see my previous conversation with the assistant","benefit":"I have context and a record","pri":"Medium","deps":"US-CHAT-001",
    "ac":["GET /chat/history returns the user's messages in order.","Both user and assistant messages (with actions) are included.","History is scoped to the authenticated user."]},
   {"id":"US-CHAT-009","title":"Clear chat history","role":"user","want":"clear my conversation history","benefit":"I can reset context or protect privacy","pri":"Low","deps":"US-CHAT-008",
    "ac":["DELETE /chat/history removes the user's history.","A confirmation is returned.","Subsequent history fetches are empty."]},
   {"id":"US-CHAT-010","title":"Quick actions & suggested follow-ups","role":"user","want":"tap quick-action chips and AI-suggested follow-ups","benefit":"I discover capabilities and move faster","pri":"Medium","deps":"US-CHAT-001",
    "ac":["The chat surface shows quick actions (add expense, scan receipt, report, etc.).","After a response, relevant follow-up suggestions are offered.","Selecting a suggestion pre-fills or triggers the related flow."]},
   {"id":"US-CHAT-011","title":"Guided onboarding & AI greeting","role":"new user","want":"a greeting and an onboarding checklist when I first open the assistant","benefit":"I learn what Safal-AI can do","pri":"Low","deps":"US-CHAT-001",
    "ac":["A personalized greeting is shown on first use.","An onboarding checklist guides initial setup tasks.","Completed steps update the checklist state."]},
 ]},

 {"id":"EXP","name":"Expense Management","desc":"Create, browse, edit, delete and summarize expenses with categories, tags, payment methods and attribution.","stories":[
   {"id":"US-EXP-001","title":"Add an expense","role":"user","want":"record an expense with amount, category, subcategory, description, date, payment method and tags","benefit":"my spending is captured accurately","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /expenses creates an expense for the user.","Amount, category, description and date are required.","Optional payment method, subcategory and tags are stored.","The new expense is returned with its ID."]},
   {"id":"US-EXP-002","title":"Browse and filter expenses","role":"user","want":"list my expenses and filter by date range and category","benefit":"I can find and review spending","pri":"High","deps":"US-EXP-001",
    "ac":["GET /expenses returns the user's expenses.","Filters by date range and category narrow results.","Results are ordered and paginated/limited sensibly."]},
   {"id":"US-EXP-003","title":"View an expense","role":"user","want":"open a single expense to see all its details","benefit":"I can verify a record","pri":"Medium","deps":"US-EXP-002",
    "ac":["GET /expenses/:id returns the full expense.","Linked receipt/event/family member references are included.","Accessing another user's expense is forbidden."]},
   {"id":"US-EXP-004","title":"Edit an expense","role":"user","want":"update an existing expense","benefit":"I can correct mistakes","pri":"Medium","deps":"US-EXP-003",
    "ac":["PUT /expenses/:id updates editable fields.","Validation matches creation rules.","The updated record is returned."]},
   {"id":"US-EXP-005","title":"Delete an expense","role":"user","want":"delete an expense I no longer want","benefit":"I keep my records clean","pri":"Medium","deps":"US-EXP-003",
    "ac":["DELETE /expenses/:id removes the expense.","Only the owner can delete it.","A success response is returned."]},
   {"id":"US-EXP-006","title":"Expense summary & statistics","role":"user","want":"see totals and category breakdowns for a period","benefit":"I understand where my money goes","pri":"High","deps":"US-EXP-001",
    "ac":["GET /expenses/stats/summary returns totals and per-category aggregates.","Period comparison (e.g. vs last month) is available.","Figures power dashboard charts."]},
   {"id":"US-EXP-007","title":"Attribute expenses to family/events","role":"user","want":"tag an expense to a family member and/or an event","benefit":"shared and event costs are tracked correctly","pri":"Medium","deps":"US-EXP-001, US-FAM-001, US-EVT-001",
    "ac":["An expense can reference a familyMemberId and/or eventId.","Attributed expenses appear in per-member and per-event views.","Attribution is editable."]},
   {"id":"US-EXP-008","title":"Tag and search expenses","role":"user","want":"add tags to expenses and filter by them","benefit":"I can group spend my own way","pri":"Low","deps":"US-EXP-001",
    "ac":["Multiple tags can be attached to an expense.","Expenses can be filtered by tag.","Tags are shown on the expense card."]},
 ]},

 {"id":"PUR","name":"Purchase & Item Tracking","desc":"Track purchased items with brand, store, quantity and links to warranties and receipts.","stories":[
   {"id":"US-PUR-001","title":"Add a purchased item","role":"user","want":"record an item with name, brand, category, price, store, quantity, purchase date and notes","benefit":"I keep an inventory of what I own","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /purchases creates a purchase item.","Name, category, price and purchase date are required.","Optional brand, store, quantity and notes are stored."]},
   {"id":"US-PUR-002","title":"Browse purchases","role":"user","want":"list my purchased items","benefit":"I can review what I've bought","pri":"Medium","deps":"US-PUR-001",
    "ac":["GET /purchases returns the user's items ordered by purchase date.","Items show key attributes and any linked warranty.","Results are scoped to the user."]},
   {"id":"US-PUR-003","title":"Attach a warranty to a purchase","role":"user","want":"link a warranty to a purchased item","benefit":"I track coverage for my products","pri":"High","deps":"US-PUR-001, US-WAR-001",
    "ac":["A purchase can have one linked warranty (1:1).","Creating the warranty associates it with the item.","The item view shows warranty status."]},
   {"id":"US-PUR-004","title":"Link purchase to a receipt & family member","role":"user","want":"associate a purchase with its receipt and the family member it belongs to","benefit":"I have proof and correct ownership","pri":"Medium","deps":"US-PUR-001, US-RCP-001",
    "ac":["A purchase can reference a receiptId and familyMemberId.","Linked receipt is viewable from the item.","Attribution appears in family views."]},
 ]},

 {"id":"RCP","name":"Receipt Scanning & OCR","desc":"Upload receipt images, extract data via OCR and turn them into expenses or purchases.","stories":[
   {"id":"US-RCP-001","title":"Upload a receipt","role":"user","want":"upload a photo of a receipt","benefit":"I can capture spend without typing","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /receipts/upload accepts an image and stores it.","A receipt record is created with status \"pending\".","The stored image is retrievable."]},
   {"id":"US-RCP-002","title":"Extract data with OCR","role":"user","want":"have the receipt processed to extract merchant, amount, date and items","benefit":"data entry is automated","pri":"High","deps":"US-RCP-001",
    "ac":["POST /receipts/:id/process runs OCR and stores ocrData.","Receipt status moves to processed on success.","Extracted fields are returned for review."]},
   {"id":"US-RCP-003","title":"Create records from a receipt","role":"user","want":"review the extracted data and create an expense or purchase from it","benefit":"a scan becomes a tracked record in one step","pri":"High","deps":"US-RCP-002, US-EXP-001, US-PUR-001",
    "ac":["Extracted values pre-fill an expense/purchase form for confirmation.","Confirming creates the record linked to the receipt.","Edits before saving are supported."]},
   {"id":"US-RCP-004","title":"View receipts and status","role":"user","want":"see my uploaded receipts and their processing status","benefit":"I know what's captured and what's pending","pri":"Medium","deps":"US-RCP-001",
    "ac":["GET /receipts lists the user's receipts with status (pending/processed).","Each entry links to the source image and any created records.","List is scoped to the user."]},
   {"id":"US-RCP-005","title":"Attach a receipt as proof","role":"user","want":"link a receipt to an existing expense or purchase","benefit":"every record can have supporting proof","pri":"Medium","deps":"US-RCP-001, US-EXP-001",
    "ac":["An expense/purchase can reference a receiptId.","The linked receipt is viewable from the record.","Proof is available for warranty/return claims."]},
 ]},

 {"id":"WAR","name":"Warranty & Expiry Tracking","desc":"Track product warranties and expiring items with configurable reminders and a dashboard.","stories":[
   {"id":"US-WAR-001","title":"Add a warranty","role":"user","want":"record a warranty with start/end dates, duration, provider, number and document","benefit":"I never lose track of coverage","pri":"High","deps":"US-PUR-001",
    "ac":["POST /warranties creates a warranty linked to a purchase item.","Start date, end date and duration (months) are captured.","Optional provider, warranty number and document URL are stored."]},
   {"id":"US-WAR-002","title":"View warranties","role":"user","want":"list my warranties and see which are active or expiring","benefit":"I can act before coverage ends","pri":"High","deps":"US-WAR-001",
    "ac":["GET /warranties returns warranties with computed status.","Expiring-soon items are highlighted.","Each shows the linked product and end date."]},
   {"id":"US-WAR-003","title":"Configure warranty reminders","role":"user","want":"enable reminders and choose how many days before expiry to be alerted","benefit":"I'm warned in time","pri":"Medium","deps":"US-WAR-001",
    "ac":["Reminders can be enabled/disabled per warranty.","Reminder lead days are configurable (default 30 and 7).","Settings persist on the warranty."]},
   {"id":"US-WAR-004","title":"Receive expiry reminders","role":"user","want":"be notified as a warranty approaches expiry","benefit":"I can renew, claim or replace in time","pri":"Medium","deps":"US-WAR-003, US-NOT-001",
    "ac":["Notifications fire on the configured lead days.","Each notification references the product and end date.","Reminders stop once the warranty expires or is disabled."]},
   {"id":"US-WAR-005","title":"Track expiring items","role":"user","want":"track non-warranty items that expire (documents, perishables, subscriptions) with reminders","benefit":"nothing important lapses unnoticed","pri":"Medium","deps":"US-AUTH-002",
    "ac":["An expiry item stores name, category, expiry date and reminder days (default 7/3/1).","Reminders can be enabled/disabled.","Upcoming expiries surface in the tracker."]},
   {"id":"US-WAR-006","title":"Warranty & expiry dashboard","role":"user","want":"a dashboard summarizing warranties and upcoming expiries","benefit":"I get an at-a-glance overview","pri":"Low","deps":"US-WAR-002, US-WAR-005",
    "ac":["The dashboard groups items by status (active/expiring/expired).","An expiry timeline/tracker is shown.","Items link to their detail."]},
 ]},

 {"id":"EVT","name":"Event Budgets & Cost Splitting","desc":"Create events with budgets, add participants and expenses, split costs and share.","stories":[
   {"id":"US-EVT-001","title":"Create an event","role":"user","want":"create an event with a name, budget, dates and description","benefit":"I can plan and track group spending","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /events creates an event with budget and start date.","Optional end date and description are stored.","Status defaults to \"planned\"."]},
   {"id":"US-EVT-002","title":"List my events","role":"user","want":"see all my events and their status","benefit":"I can manage multiple events","pri":"Medium","deps":"US-EVT-001",
    "ac":["GET /events returns the user's events.","Status (planned/active/completed) is shown.","Events are ordered by start date."]},
   {"id":"US-EVT-003","title":"Add participants","role":"user","want":"add people to an event with their contact details","benefit":"I can split costs among them","pri":"High","deps":"US-EVT-001",
    "ac":["Participants store name and optional email/phone.","Each tracks amountPaid, amountOwed and status.","Participants belong to a single event."]},
   {"id":"US-EVT-004","title":"Add event expenses & split","role":"user","want":"log an expense paid by someone and choose how to split it","benefit":"the event's costs are shared fairly","pri":"High","deps":"US-EVT-003",
    "ac":["An event expense captures description, amount, payer and split type (equal by default).","Splits update each participant's owed/paid balances.","Event expenses are listed under the event."]},
   {"id":"US-EVT-005","title":"Settle up","role":"user","want":"see who owes whom and settle balances","benefit":"everyone is squared away after the event","pri":"Medium","deps":"US-EVT-004",
    "ac":["Per-participant net balances are computed from paid vs owed.","A settlement summary shows required transfers.","Marking paid updates participant status."]},
   {"id":"US-EVT-006","title":"Track spend vs budget","role":"user","want":"see total event spend against the budget","benefit":"I avoid overspending","pri":"Medium","deps":"US-EVT-001, US-EVT-004",
    "ac":["Event total is summed from event expenses.","Remaining budget and over/under status are shown.","Overspend is clearly flagged."]},
   {"id":"US-EVT-007","title":"Share an event","role":"user","want":"share an event via a link","benefit":"participants can view details","pri":"Low","deps":"US-EVT-001",
    "ac":["A share link can be generated for an event.","Opening the link shows event details to invitees.","Sharing does not expose unrelated user data."]},
 ]},

 {"id":"FAM","name":"Family Management","desc":"Manage family members, roles and shared/attributed spending.","stories":[
   {"id":"US-FAM-001","title":"Add a family member","role":"user","want":"add a family member with name, relationship and contact","benefit":"I can track shared finances","pri":"High","deps":"US-AUTH-002",
    "ac":["POST /family/members creates a member with name and relationship.","Optional email, phone and avatar are stored.","Role defaults to \"member\"."]},
   {"id":"US-FAM-002","title":"List family members","role":"user","want":"see all family members","benefit":"I can manage my household","pri":"Medium","deps":"US-FAM-001",
    "ac":["GET /family/members returns the user's members.","Each shows relationship and role.","List is scoped to the owner."]},
   {"id":"US-FAM-003","title":"Assign member roles","role":"user","want":"set a member as admin or member","benefit":"I control who can manage shared data","pri":"Low","deps":"US-FAM-001",
    "ac":["A member's role can be set to admin or member.","Role influences permitted actions.","Changes persist."]},
   {"id":"US-FAM-004","title":"Per-member spending view","role":"user","want":"see expenses and purchases attributed to each member","benefit":"I understand each person's spend","pri":"Medium","deps":"US-FAM-001, US-EXP-007",
    "ac":["Expenses/purchases attributed to a member are aggregated.","A per-member total and list are shown.","Unattributed items are excluded."]},
 ]},

 {"id":"RPT","name":"AI Reports & Insights","desc":"Generate financial reports, visual charts and period comparisons.","stories":[
   {"id":"US-RPT-001","title":"Generate a financial report","role":"user","want":"generate a report for a chosen period and category","benefit":"I get a clear picture of my finances","pri":"High","deps":"US-EXP-001",
    "ac":["POST /reports/generate produces a report for the requested scope.","Totals, top categories and comparisons are included.","The report is based on the user's data."]},
   {"id":"US-RPT-002","title":"Visual charts & trends","role":"user","want":"see charts of spending by category and over time","benefit":"trends are easy to grasp","pri":"Medium","deps":"US-RPT-001, US-EXP-006",
    "ac":["Category breakdown and trend charts are rendered (Recharts).","Charts reflect the selected period.","Empty states are handled gracefully."]},
   {"id":"US-RPT-003","title":"Compare periods","role":"user","want":"compare one period against another (e.g. month vs month)","benefit":"I can see if I'm improving","pri":"Medium","deps":"US-RPT-001",
    "ac":["Two periods can be compared side by side.","Percentage change is shown per category and total.","Increases/decreases are visually distinguished."]},
   {"id":"US-RPT-004","title":"Export or share a report","role":"user","want":"export or share a generated report","benefit":"I can keep or send records","pri":"Low","deps":"US-RPT-001",
    "ac":["A report can be exported (e.g. PDF/CSV) or shared.","Exported content matches the on-screen report.","Sharing respects data privacy."]},
 ]},

 {"id":"CRD","name":"Credits & Subscriptions","desc":"Pay-per-use AI credit system, top-ups, consumption logging and subscription plans.","stories":[
   {"id":"US-CRD-001","title":"View credit balance","role":"user","want":"see my current AI credit balance","benefit":"I know how much AI usage I have left","pri":"High","deps":"US-AUTH-002",
    "ac":["GET /credits/balance returns the user's balance.","Balance reflects all prior transactions.","It is visible in the app header/credits page."]},
   {"id":"US-CRD-002","title":"Purchase credits","role":"user","want":"buy more AI credits","benefit":"I can keep using AI features","pri":"High","deps":"US-CRD-001",
    "ac":["POST /credits/purchase adds credits and records a transaction.","The new balance is returned.","A purchase (credit) transaction is logged."]},
   {"id":"US-CRD-003","title":"Consume credits per AI action","role":"user","want":"credits to be deducted per AI action and recorded","benefit":"usage is transparent and metered","pri":"High","deps":"US-CHAT-001, US-CRD-001",
    "ac":["Each AI action reports the credits it used (e.g. add-expense costs more than a query).","A debit transaction with type/action/description is recorded.","Balance decreases accordingly."]},
   {"id":"US-CRD-004","title":"View credit transaction history","role":"user","want":"see a log of credit purchases and usage","benefit":"I can audit my spending of credits","pri":"Medium","deps":"US-CRD-002, US-CRD-003",
    "ac":["A chronological list of credit transactions is shown.","Each entry shows amount, type, action and description.","History is scoped to the user."]},
   {"id":"US-CRD-005","title":"Subscription plans","role":"user","want":"subscribe to a plan that includes recurring credits/benefits","benefit":"heavy users get better value","pri":"Medium","deps":"US-CRD-001",
    "ac":["Available plans are listed on the subscriptions page.","Subscribing grants the plan's credit allowance/benefits.","Plan status and renewal are visible."]},
   {"id":"US-CRD-006","title":"Insufficient-credit handling","role":"user","want":"be warned and blocked when I don't have enough credits for an action","benefit":"I'm never surprised by failures","pri":"Medium","deps":"US-CRD-003",
    "ac":["Actions are blocked when the balance is insufficient.","A clear message prompts a top-up or upgrade.","No partial/charged action occurs on block."]},
 ]},

 {"id":"NOT","name":"Notifications & Reminders","desc":"In-app notification inbox and reminder delivery for warranties, expiries and budgets.","stories":[
   {"id":"US-NOT-001","title":"Notification inbox","role":"user","want":"see my notifications in one place","benefit":"I don't miss important alerts","pri":"Medium","deps":"US-AUTH-002",
    "ac":["Notifications list type, title, message and time.","Unread notifications are visually distinct.","Notifications are scoped to the user."]},
   {"id":"US-NOT-002","title":"Mark notifications read","role":"user","want":"mark notifications as read","benefit":"I can manage what I've seen","pri":"Low","deps":"US-NOT-001",
    "ac":["A notification can be marked read (single or all).","Unread count updates accordingly.","State persists across sessions."]},
   {"id":"US-NOT-003","title":"Reminder notifications","role":"user","want":"receive reminders for warranties, expiries and budgets","benefit":"I act before deadlines","pri":"Medium","deps":"US-WAR-004, US-WAR-005",
    "ac":["Reminders generate notifications on schedule.","Each carries contextual data (item, date).","Reminders respect per-item enable/disable settings."]},
 ]},

 {"id":"INT","name":"Integrations & Phase 2","desc":"Planned advanced capabilities: WhatsApp, voice, multilingual, AI memory and SafalMyBuy connectivity.","stories":[
   {"id":"US-INT-001","title":"Connect SafalMyBuy account","role":"existing SafalMyBuy user","want":"connect my SafalMyBuy data to Safal-AI","benefit":"my existing records are available to the assistant","pri":"Medium","deps":"US-AUTH-002",
    "ac":["A product-connect flow links the SafalMyBuy account.","Connection status is shown on the integrations page.","Connected data is usable by the AI."]},
   {"id":"US-INT-002","title":"WhatsApp capture (Phase 2)","role":"user","want":"add expenses and receipts via WhatsApp","benefit":"I can log on the go","pri":"Low","deps":"US-CHAT-001",
    "ac":["Messages/receipts sent over WhatsApp create records.","The same intent detection applies.","Confirmations are returned via WhatsApp."]},
   {"id":"US-INT-003","title":"Voice commands (Phase 2)","role":"user","want":"speak to add expenses or ask questions","benefit":"hands-free finance management","pri":"Low","deps":"US-CHAT-001",
    "ac":["Voice input is transcribed and processed as chat.","Spoken confirmations are supported.","Errors are gracefully reported."]},
   {"id":"US-INT-004","title":"Multilingual support (Phase 2)","role":"user","want":"use the assistant in my language","benefit":"the product is accessible to me","pri":"Low","deps":"US-AUTH-004",
    "ac":["The UI and AI respond in the user's selected language.","Language preference is respected across features.","Fallback to English when unsupported."]},
   {"id":"US-INT-005","title":"AI memory & personalization (Phase 2)","role":"user","want":"the AI to remember my preferences and patterns","benefit":"responses get more relevant over time","pri":"Low","deps":"US-CHAT-001",
    "ac":["The assistant recalls recurring categories/merchants.","Suggestions adapt to the user's habits.","Users can review/clear remembered data."]},
 ]},

 {"id":"PLT","name":"Platform, Admin & Cross-Cutting","desc":"Security, administration, multi-currency, settings UI and overall experience.","stories":[
   {"id":"US-PLT-001","title":"Secure, isolated multi-tenant data","role":"platform owner","want":"every record to be owned by and visible only to its user","benefit":"user data is private and safe","pri":"High","deps":"US-AUTH-006",
    "ac":["All models carry a userId and cascade on user deletion.","Endpoints filter strictly by the authenticated user.","Cross-user access attempts are rejected."]},
   {"id":"US-PLT-002","title":"Admin console","role":"admin","want":"administer users and platform data","benefit":"I can support and govern the platform","pri":"Medium","deps":"US-AUTH-002",
    "ac":["An admin page is accessible only to role = admin.","Admins can view users and key metrics.","Non-admins are denied access."]},
   {"id":"US-PLT-003","title":"Multi-currency support","role":"user","want":"track values in my chosen currency","benefit":"the app fits my region","pri":"Medium","deps":"US-AUTH-004",
    "ac":["Each record can carry a currency; the user has a base currency.","Amounts display with the correct currency symbol/format.","Reports respect currency."]},
   {"id":"US-PLT-004","title":"Settings & preferences","role":"user","want":"manage my profile, preferences and password from a settings page","benefit":"I control my account in one place","pri":"Medium","deps":"US-AUTH-004, US-AUTH-005",
    "ac":["The settings page edits profile, currency and language.","Password change is available.","Saved changes reflect immediately."]},
   {"id":"US-PLT-005","title":"Responsive dashboard experience","role":"user","want":"a responsive layout with sidebar navigation across modules","benefit":"I work efficiently on any device","pri":"Medium","deps":"—",
    "ac":["Sidebar/header navigation links to all modules.","Layout adapts to mobile and desktop.","Loading and empty states are handled."]},
 ]},
]

# ----------------------------------------------------------------------------
# DOCX BUILD HELPERS
# ----------------------------------------------------------------------------
def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hexcolor)
    tcPr.append(shd)

def set_cell_text(cell, text, bold=False, color=None, size=None, white=False):
    cell.text = ''
    p = cell.paragraphs[0]
    run = p.add_run(text)
    run.bold = bold
    if size: run.font.size = Pt(size)
    if white: run.font.color.rgb = RGBColor(0xFF,0xFF,0xFF)
    elif color: run.font.color.rgb = color
    return p

def add_bullets(cell, items):
    cell.text = ''
    for i, it in enumerate(items):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.style = doc.styles['List Bullet']
        p.add_run(it)

doc = Document()
normal = doc.styles['Normal']
normal.font.name = 'Calibri'; normal.font.size = Pt(10.5); normal.font.color.rgb = INK
for h in ['Heading 1','Heading 2','Heading 3']:
    doc.styles[h].font.name = 'Calibri'; doc.styles[h].font.color.rgb = BRAND

# ---------- TITLE PAGE ----------
t = doc.add_paragraph(); t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('\n\n\n\nSafal-AI'); r.font.size = Pt(40); r.bold = True; r.font.color.rgb = BRAND
sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
rs = sub.add_run('End-to-End User Stories'); rs.font.size = Pt(20); rs.font.color.rgb = INK
sub2 = doc.add_paragraph(); sub2.alignment = WD_ALIGN_PARAGRAPH.CENTER
rs2 = sub2.add_run('AI-First Conversational Finance Assistant — Functional User Stories with Acceptance Criteria'); rs2.font.size = Pt(11); rs2.font.color.rgb = MUTED
doc.add_paragraph('\n\n')
info = doc.add_table(rows=5, cols=2); info.alignment = WD_TABLE_ALIGNMENT.CENTER; info.style = 'Table Grid'
info.columns[0].width = Inches(1.8); info.columns[1].width = Inches(3.8)
for i,(k,v) in enumerate([('Product','Safal-AI — AI assistant for expenses, purchases, receipts, warranties, events & insights'),
        ('Document','End-to-End User Stories'),('Version','1.0'),('Date',TODAY),('Status','Draft for review')]):
    set_cell_text(info.rows[i].cells[0], k, bold=True); shade(info.rows[i].cells[0], LABELBG)
    set_cell_text(info.rows[i].cells[1], v)
doc.add_page_break()

# ---------- HOW TO READ ----------
doc.add_heading('How to read this document', level=1)
doc.add_paragraph('This document captures the complete, end-to-end functional scope of Safal-AI as user stories, grouped into epics (modules). '
                  'Each story has a unique ID, a role-based narrative (As a … I want … so that …), testable acceptance criteria, a priority and dependencies. '
                  'Stories reflect the implemented backend API (auth, chat, expense, purchase, receipt, warranty, event, family, report, credit), the data model and the Next.js application.')
conv = doc.add_table(rows=1, cols=2); conv.style = 'Table Grid'
hdr = conv.rows[0].cells
set_cell_text(hdr[0], 'Convention', bold=True, white=True); shade(hdr[0], HEADBG)
set_cell_text(hdr[1], 'Meaning', bold=True, white=True); shade(hdr[1], HEADBG)
for k,v in [('Story ID', 'US-<EPIC>-<NNN>, e.g. US-CHAT-003. IDs are stable references for traceability.'),
            ('Priority', 'High = core / must-have, Medium = important, Low = nice-to-have / Phase 2.'),
            ('Dependencies', 'Other story IDs that should be delivered first; "—" means none.'),
            ('Roles', 'User (account holder), Admin, and Platform Owner for cross-cutting items.')]:
    row = conv.add_row().cells
    set_cell_text(row[0], k, bold=True); shade(row[0], LABELBG)
    set_cell_text(row[1], v)

# ---------- EPIC SUMMARY ----------
doc.add_heading('Epic summary', level=1)
es = doc.add_table(rows=1, cols=4); es.style = 'Table Grid'
for i,h in enumerate(['Epic ID','Epic','# Stories','Scope']):
    set_cell_text(es.rows[0].cells[i], h, bold=True, white=True); shade(es.rows[0].cells[i], HEADBG)
for ep in EPICS:
    c = es.add_row().cells
    set_cell_text(c[0], 'EPIC-'+ep['id'], bold=True); set_cell_text(c[1], ep['name'])
    set_cell_text(c[2], str(len(ep['stories']))); set_cell_text(c[3], ep['desc'])

# ---------- TRACEABILITY INDEX ----------
doc.add_heading('Traceability index (all stories)', level=1)
idx = doc.add_table(rows=1, cols=4); idx.style = 'Table Grid'
for i,h in enumerate(['Story ID','Title','Priority','Depends on']):
    set_cell_text(idx.rows[0].cells[i], h, bold=True, white=True); shade(idx.rows[0].cells[i], HEADBG)
total = 0
for ep in EPICS:
    for s in ep['stories']:
        total += 1
        c = idx.add_row().cells
        set_cell_text(c[0], s['id'], bold=True); set_cell_text(c[1], s['title'])
        set_cell_text(c[2], s['pri']); set_cell_text(c[3], s['deps'])
doc.add_page_break()

# ---------- DETAILED STORIES ----------
doc.add_heading('Detailed user stories', level=1)
for ep in EPICS:
    doc.add_heading('EPIC-%s — %s' % (ep['id'], ep['name']), level=2)
    doc.add_paragraph(ep['desc'])
    for s in ep['stories']:
        doc.add_heading('%s — %s' % (s['id'], s['title']), level=3)
        tbl = doc.add_table(rows=0, cols=2); tbl.style = 'Table Grid'
        tbl.columns[0].width = Inches(1.5); tbl.columns[1].width = Inches(5.0)
        def row(label, value=None, bullets=None):
            cells = tbl.add_row().cells
            set_cell_text(cells[0], label, bold=True); shade(cells[0], LABELBG)
            if bullets is not None: add_bullets(cells[1], bullets)
            else: set_cell_text(cells[1], value)
        row('Story ID', s['id'])
        row('Epic', 'EPIC-%s — %s' % (ep['id'], ep['name']))
        row('Priority', s['pri'])
        row('User story', 'As a %s, I want to %s, so that %s.' % (s['role'], s['want'], s['benefit']))
        row('Acceptance criteria', bullets=s['ac'])
        row('Dependencies', s['deps'])
        doc.add_paragraph('')

# ---------- FOOTER ----------
def add_page_number(p):
    run = p.add_run()
    a = OxmlElement('w:fldChar'); a.set(qn('w:fldCharType'),'begin')
    b = OxmlElement('w:instrText'); b.set(qn('xml:space'),'preserve'); b.text='PAGE'
    c = OxmlElement('w:fldChar'); c.set(qn('w:fldCharType'),'end')
    run._r.append(a); run._r.append(b); run._r.append(c)
foot = doc.sections[0].footer.paragraphs[0]; foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
fr = foot.add_run('Safal-AI — End-to-End User Stories  ·  Page '); fr.font.size = Pt(8); fr.font.color.rgb = MUTED
add_page_number(foot)

doc.save(OUT)
print('Stories:', total)
print('Saved:', OUT)
