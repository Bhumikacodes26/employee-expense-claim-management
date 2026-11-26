# Employee Expense Claim Management

A React + JavaScript + Material UI POC for employee reimbursement claims. Data is stored in browser `localStorage`; no backend or real authentication is required.

## Technology
- React + Vite
- JavaScript
- Material UI and MUI Icons
- React Router
- Recharts
- localStorage

## Run locally
```bash
npm install
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Roles
Use the role dropdown in the header to switch between Employee, Manager and Finance. Employee mode also has an employee selector for demo data.

## Main workflow
1. Employee creates a draft or submits a claim with one or more expense items.
2. Manager reviews submitted claims and approves or rejects them. Rejection comments are mandatory.
3. Finance records payment for approved claims using a payment reference and date.
4. Paid claims appear in dashboard, reports and activity history.

## Business rules implemented
- New claims begin in Draft state.
- A claim requires at least one expense item.
- Expense amounts must be greater than zero.
- Expense dates cannot be in the future.
- Claim totals are calculated from expense rows.
- Category maximum amounts are checked.
- Receipt filename is required for an expense above ₹1,000.
- Employees can edit Draft or Rejected claims; submitted claims are locked.
- Only Submitted claims can be reviewed by Manager.
- Only Approved claims can be paid.
- Payment reference and payment date are required.
- State changes are written to `expense_history`.
- Claims, categories, history and payments persist across browser refresh.

## localStorage keys
- `expense_employees` (employee directory is currently seeded in code)
- `expense_categories`
- `expense_claims`
- `expense_history`
- `expense_payments`
- `expense_current_role`
- `expense_current_employee`

## Important POC limitations / assumptions
- This is a front-end demonstration, not a production expense platform.
- Role selection simulates users; it is not authentication or authorization.
- Receipt input stores a filename only; it does not upload or persist file bytes.
- Employee and manager relationships are sample data.
- Manager self-approval is avoided by the demo role separation, but real user identity validation requires a backend.
- The ₹1,000 receipt threshold is the proposed training rule in the requirement, not an actual company reimbursement policy.
- Data is stored per browser and can be cleared by clearing site storage.
