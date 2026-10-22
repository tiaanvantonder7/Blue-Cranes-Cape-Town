(() => {
  const $ = id => document.getElementById(id);
  const config = window.BCSC_CONFIG || {};
  const configured = config.supabaseUrl && config.supabaseKey &&
    !config.supabaseUrl.includes("PASTE_") && !config.supabaseKey.includes("PASTE_");
  const setupNotice = $("setupNotice"), authPanel = $("authPanel"), appPanel = $("appPanel");
  if (!configured || !window.supabase) {
    setupNotice.classList.remove("hidden");
    $("authMessage").textContent = "Database not connected yet. Follow SETUP.md to connect Supabase.";
    $("loginForm").addEventListener("submit", e => e.preventDefault());
    return;
  }
  const db = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
  let currentUser = null, jobs = [], channel = null;
  const fields = {
    client:"client", area:"area", customer:"customer", poStatus:"po_status",
    farmCellar:"farm_cellar", location:"location", dateScheduled:"date_scheduled",
    contactPerson:"contact_person", contactNumber:"contact_number", inventory:"inventory",
    technician:"technician", dateCompleted:"date_completed", jobStatus:"job_status", notes:"notes"
  };
  function setMessage(id, text, good=false){const el=$(id);el.textContent=text||"";el.style.color=good?"#176438":""}
  function showSignedIn(user){
    currentUser=user; authPanel.classList.add("hidden");appPanel.classList.remove("hidden");
    $("signOutBtn").classList.remove("hidden");$("userLabel").textContent=`Signed in as ${user.email} · shared team access`;
    loadJobs();
    if(channel) db.removeChannel(channel);
    channel=db.channel("jobs-changes").on("postgres_changes",{event:"*",schema:"public",table:"job_records"},()=>loadJobs()).subscribe();
  }
  async function showSignedOut(){
    currentUser=null;appPanel.classList.add("hidden");authPanel.classList.remove("hidden");$("signOutBtn").classList.add("hidden");
    if(channel){await db.removeChannel(channel);channel=null;}
  }
  $("loginForm").addEventListener("submit",async e=>{
    e.preventDefault();setMessage("authMessage","Signing in…");
    const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
    if(error)setMessage("authMessage",error.message);else setMessage("authMessage","");
  });
  $("signOutBtn").addEventListener("click",async()=>{await db.auth.signOut();});
  db.auth.onAuthStateChange((_event,session)=>{if(session?.user)showSignedIn(session.user);else showSignedOut();});
  db.auth.getSession().then(({data})=>{if(data.session?.user)showSignedIn(data.session.user);});
  async function loadJobs(){
    setMessage("listMessage","Loading jobs…");
    const {data,error}=await db.from("job_records").select("*").order("date_scheduled",{ascending:true,nullsFirst:false}).order("created_at",{ascending:false});
    if(error){setMessage("listMessage",error.message);return;}
    jobs=data||[];renderJobs();setMessage("listMessage","");
  }
  function statusClass(s){return s==="Completed"?"green":s==="Not Completed"?"red":s==="PO Not Received"?"amber":""}
  function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function dateText(s){if(!s)return "—";const d=new Date(s+"T00:00:00");return Number.isNaN(d.valueOf())?s:d.toLocaleDateString("en-ZA",{day:"2-digit",month:"short",year:"numeric"});}
  function renderJobs(){
    const term=$("searchInput").value.toLowerCase().trim(),po=$("poFilter").value,st=$("jobFilter").value;
    $("statPo").textContent=jobs.filter(j=>j.po_status==="PO Not Received").length;
    $("statProgress").textContent=jobs.filter(j=>j.job_status==="In Progress").length;
    $("statCompleted").textContent=jobs.filter(j=>j.job_status==="Completed").length;
    $("statNotCompleted").textContent=jobs.filter(j=>j.job_status==="Not Completed").length;
    const filtered=jobs.filter(j=>{
      const hay=[j.client,j.area,j.customer,j.farm_cellar,j.location,j.contact_person,j.contact_number,j.inventory,j.technician,j.notes,j.po_status,j.job_status].join(" ").toLowerCase();
      return (!term||hay.includes(term))&&(!po||j.po_status===po)&&(!st||j.job_status===st);
    });
    $("jobsList").innerHTML=filtered.length?filtered.map(j=>`
      <article class="job-card"><div><h3>${safe(j.customer||"Unnamed customer")}${j.farm_cellar?" — "+safe(j.farm_cellar):""}</h3>
      <div class="job-meta"><span class="pill ${statusClass(j.po_status)}">${safe(j.po_status||"PO status not set")}</span><span class="pill ${statusClass(j.job_status)}">${safe(j.job_status||"Status not set")}</span></div>
      <div class="job-details">
        <div><b>Client:</b> ${safe(j.client||"—")}</div><div><b>Area:</b> ${safe(j.area||"—")}</div><div><b>Location:</b> ${safe(j.location||"—")}</div>
        <div><b>Scheduled:</b> ${dateText(j.date_scheduled)}</div><div><b>Technician:</b> ${safe(j.technician||"—")}</div><div><b>Completed:</b> ${dateText(j.date_completed)}</div>
        <div><b>Contact:</b> ${safe(j.contact_person||"—")}</div><div><b>Number:</b> ${safe(j.contact_number||"—")}</div><div><b>Inventory:</b> ${safe(j.inventory||"—")}</div>
        ${j.notes?`<div class="wide"><b>Notes:</b> ${safe(j.notes)}</div>`:""}
      </div></div><div class="job-actions"><button class="secondary" data-edit="${j.id}">Edit</button></div></article>`).join(""):'<div class="empty">No jobs match your search. Add a job or change the filters.</div>';
    $("jobsList").querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openJob(jobs.find(j=>j.id===b.dataset.edit))));
  }
  ["searchInput","poFilter","jobFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderJobs));
  function openJob(job=null){
    $("jobForm").reset();setMessage("formMessage","");$("jobId").value=job?.id||"";
    $("dialogTitle").textContent=job?"Edit job":"Add job";
    for(const [id,key] of Object.entries(fields))$(id).value=job?.[key]??(id==="jobStatus"?"In Progress":"");
    $("jobDialog").showModal();
  }
  $("addJobBtn").addEventListener("click",()=>openJob());
  $("closeDialog").addEventListener("click",()=>$("jobDialog").close());
  $("cancelBtn").addEventListener("click",()=>$("jobDialog").close());
  $("jobForm").addEventListener("submit",async e=>{
    e.preventDefault();const save=$("saveBtn");save.disabled=true;setMessage("formMessage","Saving…");
    const row={};for(const [id,key] of Object.entries(fields))row[key]=$(id).value.trim()||null;
    if(row.job_status==="Completed"&&!row.date_completed)row.date_completed=new Date().toISOString().slice(0,10);
    row.updated_by=currentUser.id;
    const id=$("jobId").value;
    const result=id?await db.from("job_records").update(row).eq("id",id):await db.from("job_records").insert({...row,created_by:currentUser.id});
    save.disabled=false;
    if(result.error){setMessage("formMessage",result.error.message);return;}
    $("jobDialog").close();await loadJobs();
  });
  $("exportBtn").addEventListener("click",()=>{
    const headers=[["client","BC/SC Client"],["area","Area"],["customer","Customer"],["po_status","PO Status"],["farm_cellar","Farm/Cellar name"],["location","Location"],["date_scheduled","Date Scheduled"],["contact_person","Contact Person"],["contact_number","Contact number"],["inventory","Inventory"],["technician","Technician"],["date_completed","Date Completed"],["job_status","Job status"],["notes","Notes"]];
    const csv=[headers.map(h=>h[1]),...jobs.map(j=>headers.map(h=>j[h[0]]??""))].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="bcsc-jobs.csv";a.click();URL.revokeObjectURL(url);
  });
})();