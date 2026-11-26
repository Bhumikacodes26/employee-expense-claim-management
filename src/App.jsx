import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Toolbar, Typography, Alert, Card, CardContent
} from "@mui/material";
import {
  Dashboard as DashboardIcon, ReceiptLong, AddCircleOutline, FactCheck, Payments,
  Assessment, History, People, Category, Menu as MenuIcon, Logout, DeleteOutline,
  Add, Search, CheckCircleOutline, CancelOutlined, Visibility, EditOutlined
} from "@mui/icons-material";
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const EMPLOYEES = [
  { id: "E001", name: "Bhumika Cheendra", department: "Engineering", manager: "Ravi Kumar" },
  { id: "E002", name: "Arjun Rao", department: "Sales", manager: "Meena Sharma" },
  { id: "E003", name: "Priya Nair", department: "Human Resources", manager: "Ravi Kumar" },
  { id: "E004", name: "Kiran Reddy", department: "Finance", manager: "Meena Sharma" }
];
const DEFAULT_CATEGORIES = [
  { id: "C1", name: "Travel", limit: 15000 }, { id: "C2", name: "Hotel", limit: 8000 },
  { id: "C3", name: "Food", limit: 3000 }, { id: "C4", name: "Internet", limit: 2000 },
  { id: "C5", name: "Office Supplies", limit: 5000 }, { id: "C6", name: "Others", limit: 5000 }
];
const money = n => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));
const today = () => new Date().toISOString().slice(0, 10);
const read = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const seedClaims = [
  { id: "EXP-1001", employeeId: "E001", title: "Client meeting in Bengaluru", date: today(), purpose: "Travel to meet the customer team and discuss project delivery.", status: "Submitted", items: [{ id: 1, category: "Travel", description: "Train tickets", date: today(), amount: 2400, receipt: "train-ticket.pdf" }, { id: 2, category: "Food", description: "Lunch with client", date: today(), amount: 850, receipt: "lunch.jpg" }], createdAt: new Date().toISOString(), history: [] },
  { id: "EXP-1002", employeeId: "E002", title: "Office internet reimbursement", date: today(), purpose: "Internet expense during remote customer support.", status: "Approved", items: [{ id: 3, category: "Internet", description: "Monthly internet", date: today(), amount: 1200, receipt: "internet.pdf" }], createdAt: new Date().toISOString(), history: [] },
  { id: "EXP-1003", employeeId: "E003", title: "Team workshop", date: today(), purpose: "Refreshments for internal workshop.", status: "Paid", items: [{ id: 4, category: "Food", description: "Workshop refreshments", date: today(), amount: 950, receipt: "receipt.png" }], payment: { reference: "UTR987654", date: today() }, createdAt: new Date().toISOString(), history: [] }
];

const NAV = [
  { label: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { label: "My Claims", path: "/claims", icon: <ReceiptLong /> },
  { label: "Create Claim", path: "/create", icon: <AddCircleOutline /> },
  { label: "Manager Approvals", path: "/approvals", icon: <FactCheck />, roles: ["Manager"] },
  { label: "Finance Processing", path: "/finance", icon: <Payments />, roles: ["Finance"] },
  { label: "Employees", path: "/employees", icon: <People /> },
  { label: "Expense Categories", path: "/categories", icon: <Category /> },
  { label: "Reports", path: "/reports", icon: <Assessment /> },
  { label: "Activity History", path: "/history", icon: <History /> }
];

function Status({ value }) {
  const colors = { Draft: "default", Submitted: "info", Approved: "success", Rejected: "error", "Payment Processed": "warning", Paid: "success" };
  return <Chip size="small" label={value} color={colors[value] || "default"} variant="outlined" />;
}

export default function App() {
  const [role, setRole] = useState(() => localStorage.getItem("expense_current_role") || "Employee");
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem("expense_current_employee") || "E001");
  const [claims, setClaims] = useState(() => read("expense_claims", seedClaims));
  const [categories, setCategories] = useState(() => read("expense_categories", DEFAULT_CATEGORIES));
  const [history, setHistory] = useState(() => read("expense_history", []));
  const [payments, setPayments] = useState(() => read("expense_payments", []));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [dialog, setDialog] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const employee = EMPLOYEES.find(e => e.id === employeeId) || EMPLOYEES[0];

  useEffect(() => { localStorage.setItem("expense_claims", JSON.stringify(claims)); }, [claims]);
  useEffect(() => { localStorage.setItem("expense_categories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("expense_history", JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem("expense_payments", JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem("expense_current_role", role); }, [role]);
  useEffect(() => { localStorage.setItem("expense_current_employee", employeeId); }, [employeeId]);

  const log = (claimId, action, note = "") => setHistory(prev => [{ id: Date.now(), claimId, actor: role === "Employee" ? employee.name : role, action, note, date: new Date().toISOString() }, ...prev]);
  const visibleClaims = role === "Employee" ? claims.filter(c => c.employeeId === employeeId) : claims;
  const updateClaim = (id, patch) => setClaims(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const openClaim = c => { setSelectedClaim(c); setDialog("details"); };
  const filtered = visibleClaims.filter(c => [c.id, c.title, c.status].join(" ").toLowerCase().includes(search.toLowerCase()));

  const createClaim = (data, isDraft = false) => {
    const id = `EXP-${Date.now().toString().slice(-7)}`;
    const item = { ...data, id, employeeId, status: isDraft ? "Draft" : "Submitted", createdAt: new Date().toISOString(), history: [] };
    setClaims(prev => [item, ...prev]);
    log(id, isDraft ? "Draft saved" : "Claim submitted");
    navigate("/claims");
  };

  const navItems = NAV.filter(n => !n.roles || n.roles.includes(role));
  const pageTitle = NAV.find(n => n.path === location.pathname)?.label || "Expense Claim Management";

  return <Box sx={{ display: "flex", minHeight: "100vh" }}>
    <AppBar position="fixed" elevation={0} color="inherit" sx={{ borderBottom: "1px solid #e7e9ee", zIndex: 1201 }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { md: "none" } }}><MenuIcon /></IconButton>
        <Typography fontWeight={800} color="primary" sx={{ flexGrow: 1 }}>Expense<span style={{ color: "#64748b" }}>Flow</span></Typography>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Role</InputLabel><Select label="Role" value={role} onChange={e => { setRole(e.target.value); navigate("/"); }}>
            {["Employee", "Manager", "Finance"].map(x => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </Select>
        </FormControl>
        {role === "Employee" && <FormControl size="small" sx={{ minWidth: 155, display: { xs: "none", sm: "flex" } }}>
          <InputLabel>Employee</InputLabel><Select label="Employee" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
            {EMPLOYEES.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
          </Select>
        </FormControl>}
        <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34 }}>{role[0]}</Avatar>
      </Toolbar>
    </AppBar>
    <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: 255 } }}>
      <Sidebar items={navItems} close={() => setMobileOpen(false)} />
    </Drawer>
    <Drawer variant="permanent" sx={{ display: { xs: "none", md: "block" }, width: 255, flexShrink: 0, "& .MuiDrawer-paper": { width: 255, boxSizing: "border-box", borderRight: "1px solid #e7e9ee" } }}>
      <Toolbar /><Sidebar items={navItems} />
    </Drawer>
    <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, mt: 8 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box><Typography variant="h5" fontWeight={800}>{pageTitle}</Typography><Typography variant="body2" color="text.secondary">Manage employee reimbursements and approvals</Typography></Box>
        {role === "Employee" && <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/create")}>New Claim</Button>}
      </Stack>
      <Routes>
        <Route path="/" element={<Dashboard claims={visibleClaims} role={role} />} />
        <Route path="/claims" element={<Claims claims={filtered} search={search} setSearch={setSearch} role={role} onOpen={openClaim} onEdit={c => { setSelectedClaim(c); navigate("/create", { state: { edit: c } }); }} />} />
        <Route path="/create" element={<ClaimForm employee={employee} categories={categories} onSave={createClaim} onUpdate={(id, data) => { updateClaim(id, data); log(id, "Claim updated"); navigate("/claims"); }} />} />
        <Route path="/approvals" element={<Approvals claims={claims} onAction={(c, status, comment) => { updateClaim(c.id, { status, rejectionComment: comment }); log(c.id, status, comment); }} onOpen={openClaim} />} />
        <Route path="/finance" element={<Finance claims={claims} onPay={(c, payment) => { updateClaim(c.id, { status: "Paid", payment }); setPayments(p => [{ ...payment, claimId: c.id }, ...p]); log(c.id, "Payment recorded", payment.reference); }} onOpen={openClaim} />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/categories" element={<Categories categories={categories} setCategories={setCategories} />} />
        <Route path="/reports" element={<Reports claims={claims} />} />
        <Route path="/history" element={<HistoryPage history={history} />} />
        <Route path="*" element={<Paper sx={{ p: 4 }}>Page not found</Paper>} />
      </Routes>
    </Box>
    <Dialog open={dialog === "details"} onClose={() => setDialog("")} maxWidth="md" fullWidth>
      <DialogTitle>Claim details</DialogTitle><DialogContent>{selectedClaim && <ClaimDetails claim={selectedClaim} />}</DialogContent>
      <DialogActions><Button onClick={() => setDialog("")}>Close</Button></DialogActions>
    </Dialog>
  </Box>;
}

function Sidebar({ items, close }) {
  return <Box sx={{ p: 2, pt: 3 }}>
    <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>WORKSPACE</Typography>
    <Stack spacing={0.5} mt={1}>{items.map(n => <Button key={n.path} component={NavLink} to={n.path} onClick={close} startIcon={n.icon} sx={{ justifyContent: "flex-start", px: 1.5, py: 1.2, color: "text.secondary", "&.active": { bgcolor: "#edf1f6", color: "primary.main", fontWeight: 800 }, "&:hover": { bgcolor: "#f2f4f7" } }}>{n.label}</Button>)}</Stack>
    <Divider sx={{ my: 3 }} /><Typography variant="caption" color="text.secondary">POC • React + MUI • localStorage</Typography>
  </Box>;
}

function Dashboard({ claims, role }) {
  const total = claims.length, pending = claims.filter(c => c.status === "Submitted").length;
  const approved = claims.filter(c => ["Approved", "Paid"].includes(c.status)).length;
  const paid = claims.filter(c => c.status === "Paid").reduce((s, c) => s + sum(c), 0);
  const stats = [{ label: "Total Claims", value: total, color: "#253858" }, { label: "Pending Approval", value: pending, color: "#b7791f" }, { label: "Approved / Paid", value: approved, color: "#16845b" }, { label: "Total Paid Amount", value: money(paid), color: "#475569" }];
  const byCategory = Object.keys(Object.groupBy ? Object.groupBy(claims.flatMap(c => c.items), x => x.category) : {}).map(k => ({ name: k, amount: claims.flatMap(c => c.items).filter(i => i.category === k).reduce((s, i) => s + Number(i.amount), 0) }));
  const categoryData = ["Travel", "Hotel", "Food", "Internet", "Office Supplies", "Others"].map(k => ({ name: k, amount: claims.flatMap(c => c.items).filter(i => i.category === k).reduce((s, i) => s + Number(i.amount), 0) }));
  return <Stack spacing={3}>
    <Grid container spacing={2}>{stats.map(s => <Grid item xs={12} sm={6} xl={3} key={s.label}><Card className="stat-card"><CardContent><Typography color="text.secondary" variant="body2">{s.label}</Typography><Typography variant="h4" fontWeight={800} sx={{ color: s.color, mt: 1 }}>{s.value}</Typography></CardContent></Card></Grid>)}</Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}><Paper sx={{ p: 2.5, height: 340 }}><Typography fontWeight={800} mb={2}>Expenses by category</Typography><ResponsiveContainer width="100%" height="88%"><BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={v => money(v)} /><Bar dataKey="amount" fill="#344766" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Paper></Grid>
      <Grid item xs={12} lg={4}><Paper sx={{ p: 2.5, height: 340 }}><Typography fontWeight={800} mb={2}>Claim status</Typography><ResponsiveContainer width="100%" height="88%"><PieChart><Pie data={["Draft","Submitted","Approved","Rejected","Paid"].map(s => ({ name:s, value:claims.filter(c=>c.status===s).length })).filter(x=>x.value)} dataKey="value" nameKey="name" outerRadius={95} label>{["#64748b","#3b82f6","#16a34a","#dc5555","#0f766e"].map((c,i)=><Cell key={i} fill={c} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper></Grid>
    </Grid>
    <Paper sx={{ p: 2.5 }}><Typography fontWeight={800} mb={2}>Recent claims</Typography><ClaimTable claims={claims.slice(0, 5)} /></Paper>
  </Stack>;
}
const sum = c => (c.items || []).reduce((s, i) => s + Number(i.amount || 0), 0);
function ClaimTable({ claims, onOpen, onEdit }) {
  return <TableContainer><Table size="small"><TableHead><TableRow>{["Reference", "Title", "Date", "Amount", "Status", "Actions"].map(x => <TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{claims.map(c => <TableRow key={c.id} hover><TableCell sx={{ fontWeight: 700 }}>{c.id}</TableCell><TableCell>{c.title}</TableCell><TableCell>{c.date}</TableCell><TableCell>{money(sum(c))}</TableCell><TableCell><Status value={c.status} /></TableCell><TableCell><IconButton size="small" onClick={() => onOpen?.(c)}><Visibility fontSize="small" /></IconButton>{onEdit && ["Draft","Rejected"].includes(c.status) && <IconButton size="small" onClick={() => onEdit(c)}><EditOutlined fontSize="small" /></IconButton>}</TableCell></TableRow>)}</TableBody></Table></TableContainer>;
}
function Claims({ claims, search, setSearch, role, onOpen, onEdit }) {
  return <Paper sx={{ p: 2.5 }}><TextField fullWidth size="small" placeholder="Search by claim reference, title or status" value={search} onChange={e=>setSearch(e.target.value)} InputProps={{ startAdornment:<Search sx={{ mr:1, color:"text.secondary" }} /> }} sx={{ mb:2 }} /><ClaimTable claims={claims} onOpen={onOpen} onEdit={role==="Employee"?onEdit:null} /></Paper>;
}
function ClaimForm({ employee, categories, onSave, onUpdate }) {
  const loc = useLocation(), edit = loc.state?.edit;
  const [title,setTitle]=useState(edit?.title||"");
  const [date,setDate]=useState(edit?.date||today());
  const [purpose,setPurpose]=useState(edit?.purpose||"");
  const [items,setItems]=useState(edit?.items||[{id:Date.now(),category:"Travel",description:"",date:today(),amount:"",receipt:""}]);
  const [error,setError]=useState("");
  const total=items.reduce((s,i)=>s+Number(i.amount||0),0);
  const change=(id,key,value)=>setItems(prev=>prev.map(i=>i.id===id?{...i,[key]:value}:i));
  const submit=(draft)=> {
    if(!title.trim()||!purpose.trim()){setError("Please enter a claim title and business purpose.");return;}
    if(!items.length||items.some(i=>!i.description.trim()||Number(i.amount)<=0||!i.date)){setError("Each expense needs a description, date and amount greater than zero.");return;}
    if(items.some(i=>i.date>today())){setError("Expense dates cannot be in the future.");return;}
    if(items.some(i=>Number(i.amount)>1000&&!i.receipt)){setError("Receipt attachment is mandatory for each expense above ₹1,000.");return;}
    if(items.some(i=>Number(i.amount)>(categories.find(c=>c.name===i.category)?.limit||Infinity))){setError("One or more expenses exceed the category's maximum eligible amount.");return;}
    setError("");
    const data={title,date,purpose,items:items.map(i=>({...i,amount:Number(i.amount)}))};
    if(edit) onUpdate(edit.id,{...data,status:draft?"Draft":"Submitted"}); else onSave(data,draft);
  };
  return <Paper sx={{ p: {xs:2,md:3} }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Box><Typography variant="h6" fontWeight={800}>{edit?"Edit claim":"New expense claim"}</Typography><Typography variant="body2" color="text.secondary">Employee: {employee.name} • {employee.department}</Typography></Box><Chip label={edit?.status||"Draft"} /></Stack>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    <Grid container spacing={2}><Grid item xs={12} md={7}><TextField label="Claim title" fullWidth value={title} onChange={e=>setTitle(e.target.value)} /></Grid><Grid item xs={12} md={5}><TextField label="Claim date" type="date" fullWidth InputLabelProps={{shrink:true}} value={date} onChange={e=>setDate(e.target.value)} /></Grid><Grid item xs={12}><TextField label="Business purpose" multiline minRows={2} fullWidth value={purpose} onChange={e=>setPurpose(e.target.value)} /></Grid></Grid>
    <Divider sx={{my:3}} /><Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Typography fontWeight={800}>Expense items</Typography><Button startIcon={<Add/>} onClick={()=>setItems(p=>[...p,{id:Date.now(),category:categories[0]?.name||"Travel",description:"",date:today(),amount:"",receipt:""}])}>Add expense</Button></Stack>
    <Stack spacing={2}>{items.map((item,index)=><Paper key={item.id} variant="outlined" sx={{p:2}}><Stack direction="row" justifyContent="space-between" mb={1}><Typography fontWeight={700}>Expense {index+1}</Typography><IconButton color="error" onClick={()=>setItems(p=>p.filter(x=>x.id!==item.id))} disabled={items.length===1}><DeleteOutline/></IconButton></Stack><Grid container spacing={1.5}>
      <Grid item xs={12} sm={4}><TextField select label="Category" fullWidth size="small" value={item.category} onChange={e=>change(item.id,"category",e.target.value)}>{categories.map(c=><MenuItem key={c.id} value={c.name}>{c.name} (limit {money(c.limit)})</MenuItem>)}</TextField></Grid>
      <Grid item xs={12} sm={4}><TextField label="Description" fullWidth size="small" value={item.description} onChange={e=>change(item.id,"description",e.target.value)} /></Grid>
      <Grid item xs={6} sm={2}><TextField label="Expense date" type="date" fullWidth size="small" InputLabelProps={{shrink:true}} value={item.date} onChange={e=>change(item.id,"date",e.target.value)} /></Grid>
      <Grid item xs={6} sm={2}><TextField label="Amount ₹" type="number" fullWidth size="small" value={item.amount} onChange={e=>change(item.id,"amount",e.target.value)} /></Grid>
      <Grid item xs={12}><TextField label="Receipt filename (demo attachment)" helperText="Enter a filename; receipt is required when this expense exceeds ₹1,000." fullWidth size="small" value={item.receipt} onChange={e=>change(item.id,"receipt",e.target.value)} /></Grid>
    </Grid></Paper>)}</Stack>
    <Stack direction="row" justifyContent="flex-end" mt={3}><Typography variant="h6" fontWeight={800}>Total: {money(total)}</Typography></Stack>
    <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}><Button variant="outlined" onClick={()=>submit(true)}>Save draft</Button><Button variant="contained" onClick={()=>submit(false)}>Submit claim</Button></Stack>
  </Paper>;
}
function ClaimDetails({claim}) {
  return <Stack spacing={2}><Box><Typography variant="h6" fontWeight={800}>{claim.title}</Typography><Typography color="text.secondary">{claim.id} • {claim.date}</Typography></Box><Stack direction="row" spacing={1}><Status value={claim.status}/><Chip label={money(sum(claim))}/></Stack><Typography>{claim.purpose}</Typography><ClaimTable claims={[claim]}/><Typography fontWeight={700}>Expense breakdown</Typography>{claim.items.map(i=><Stack key={i.id} direction="row" justifyContent="space-between"><Typography>{i.category} — {i.description}</Typography><Typography>{money(i.amount)}</Typography></Stack>)}{claim.rejectionComment&&<Alert severity="error">Rejection reason: {claim.rejectionComment}</Alert>}{claim.payment&&<Alert severity="success">Payment reference: {claim.payment.reference} • Date: {claim.payment.date}</Alert>}</Stack>;
}
function Approvals({claims,onAction,onOpen}) {
  const [target,setTarget]=useState(null),[comment,setComment]=useState("");
  const pending=claims.filter(c=>c.status==="Submitted");
  return <Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Claims awaiting your review ({pending.length})</Typography><ClaimTable claims={pending} onOpen={onOpen}/><Divider sx={{my:2}}/><Typography fontWeight={700} mb={1}>Review a claim</Typography><FormControl fullWidth size="small" sx={{mb:2}}><InputLabel>Select claim</InputLabel><Select label="Select claim" value={target?.id||""} onChange={e=>setTarget(pending.find(c=>c.id===e.target.value)||null)}>{pending.map(c=><MenuItem key={c.id} value={c.id}>{c.id} — {c.title}</MenuItem>)}</Select></FormControl>{target&&<><ClaimDetails claim={target}/><TextField fullWidth multiline minRows={2} label="Comments (required for rejection)" value={comment} onChange={e=>setComment(e.target.value)} sx={{mt:2}}/><Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}><Button color="error" variant="outlined" startIcon={<CancelOutlined/>} onClick={()=>{if(!comment.trim())return alert("Rejection comments are mandatory.");onAction(target,"Rejected",comment);setTarget(null);setComment("");}}>Reject</Button><Button color="success" variant="contained" startIcon={<CheckCircleOutline/>} onClick={()=>{onAction(target,"Approved","Approved by manager");setTarget(null);setComment("");}}>Approve</Button></Stack></>}</Paper>;
}
function Finance({claims,onPay,onOpen}) {
  const approved=claims.filter(c=>c.status==="Approved");
  const [target,setTarget]=useState(null),[reference,setReference]=useState(""),[date,setDate]=useState(today());
  return <Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Approved claims ready for payment ({approved.length})</Typography><ClaimTable claims={approved} onOpen={onOpen}/><Divider sx={{my:2}}/><Typography fontWeight={700} mb={2}>Record payment</Typography><FormControl fullWidth size="small" sx={{mb:2}}><InputLabel>Approved claim</InputLabel><Select label="Approved claim" value={target?.id||""} onChange={e=>setTarget(approved.find(c=>c.id===e.target.value)||null)}>{approved.map(c=><MenuItem key={c.id} value={c.id}>{c.id} — {c.title} ({money(sum(c))})</MenuItem>)}</Select></FormControl>{target&&<Grid container spacing={2}><Grid item xs={12} md={6}><TextField fullWidth label="Payment reference number" value={reference} onChange={e=>setReference(e.target.value)}/></Grid><Grid item xs={12} md={6}><TextField fullWidth label="Payment date" type="date" InputLabelProps={{shrink:true}} value={date} onChange={e=>setDate(e.target.value)}/></Grid><Grid item xs={12}><Button variant="contained" onClick={()=>{if(!reference.trim()||!date)return alert("Payment reference and date are mandatory.");onPay(target,{reference,date});setTarget(null);setReference("");}}>Confirm payment</Button></Grid></Grid>}</Paper>;
}
function Employees(){return <Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Employee directory</Typography><Table size="small"><TableHead><TableRow>{["Employee ID","Name","Department","Manager"].map(x=><TableCell key={x}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{EMPLOYEES.map(e=><TableRow key={e.id}><TableCell>{e.id}</TableCell><TableCell>{e.name}</TableCell><TableCell>{e.department}</TableCell><TableCell>{e.manager}</TableCell></TableRow>)}</TableBody></Table><Alert severity="info" sx={{mt:2}}>Sample employee data for this POC.</Alert></Paper>}
function Categories({categories,setCategories}){const [name,setName]=useState(""),[limit,setLimit]=useState("");return <Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Expense categories and eligible limits</Typography><Grid container spacing={1} mb={2}><Grid item xs={12} sm={5}><TextField fullWidth size="small" label="Category name" value={name} onChange={e=>setName(e.target.value)}/></Grid><Grid item xs={12} sm={4}><TextField fullWidth size="small" type="number" label="Maximum amount ₹" value={limit} onChange={e=>setLimit(e.target.value)}/></Grid><Grid item xs={12} sm={3}><Button fullWidth variant="contained" onClick={()=>{if(!name.trim()||Number(limit)<=0)return;setCategories(p=>[...p,{id:Date.now(),name:name.trim(),limit:Number(limit)}]);setName("");setLimit("");}}>Add category</Button></Grid></Grid><Table size="small"><TableHead><TableRow><TableCell>Category</TableCell><TableCell>Maximum eligible amount</TableCell><TableCell>Action</TableCell></TableRow></TableHead><TableBody>{categories.map(c=><TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{money(c.limit)}</TableCell><TableCell><IconButton color="error" onClick={()=>setCategories(p=>p.filter(x=>x.id!==c.id))}><DeleteOutline/></IconButton></TableCell></TableRow>)}</TableBody></Table></Paper>}
function Reports({claims}){const data=["Draft","Submitted","Approved","Rejected","Paid"].map(s=>({status:s,count:claims.filter(c=>c.status===s).length,amount:claims.filter(c=>c.status===s).reduce((a,c)=>a+sum(c),0)}));return <Stack spacing={2}><Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Claims by status</Typography><Table size="small"><TableHead><TableRow><TableCell>Status</TableCell><TableCell>Count</TableCell><TableCell>Total amount</TableCell></TableRow></TableHead><TableBody>{data.map(d=><TableRow key={d.status}><TableCell><Status value={d.status}/></TableCell><TableCell>{d.count}</TableCell><TableCell>{money(d.amount)}</TableCell></TableRow>)}</TableBody></Table></Paper><Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>All claims report</Typography><ClaimTable claims={claims}/></Paper></Stack>}
function HistoryPage({history}){return <Paper sx={{p:2.5}}><Typography fontWeight={800} mb={2}>Activity log</Typography>{history.length===0?<Alert severity="info">No activity recorded yet. Create or update a claim to see events here.</Alert>:history.map(h=><Stack key={h.id} direction="row" spacing={2} py={1.5} alignItems="flex-start"><Avatar sx={{width:32,height:32,bgcolor:"#edf1f6",color:"#253858"}}><History fontSize="small"/></Avatar><Box sx={{flexGrow:1}}><Typography fontWeight={700}>{h.action} • {h.claimId}</Typography><Typography variant="body2" color="text.secondary">{h.actor}{h.note?` — ${h.note}`:""}</Typography></Box><Typography variant="caption" color="text.secondary">{new Date(h.date).toLocaleString()}</Typography></Stack>)}</Paper>}
