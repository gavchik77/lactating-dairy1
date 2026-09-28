const $ = id => document.getElementById(id);
const show = id => $(id).classList.remove("hidden");
const hide = id => $(id).classList.add("hidden");
const val = id => parseFloat($(id).value);
const close = (a,b,t) => Number.isFinite(a) && Math.abs(a-b) <= t;

const ANSWER = {
  targetCP:16,
  silagePct:33.3333333333,
  concPct:66.6666666667,
  weightedQ:0.6333333333,
  tableQ:0.65,
  maintenanceME:59.5,
  weightChangeME:0,
  milkMEperL:5.355,
  milkMEday:133.875,
  totalME:193.375
};

// The supplied handwritten solution rounds to approximately:
// 33/67, q~0.65, maintenance 59.5, milk 5.35 MJ/L, milk total 134,
// total ME 193.5, silage ME ~64, concentrate ME ~130,
// 5.8 kg silage DM + 10.0 kg concentrate DM,
// 23.2 kg fresh silage + 11.1 kg fresh concentrate.

function roundedWorked(){
  return {
    totalME:193.5,
    silageME:193.5*0.33,
    concME:193.5*0.67,
    silageDM:(193.5*0.33)/11,
    concDM:(193.5*0.67)/13
  };
}
const WORK=roundedWorked();
WORK.totalDMI=WORK.silageDM+WORK.concDM;
WORK.silageFresh=WORK.silageDM/0.25;
WORK.concFresh=WORK.concDM/0.90;

function setFeedback(id,type,text){
  const e=$(id);
  e.className=`feedback ${type}`;
  e.textContent=text;
}
function mark(inputId,feedbackId,ok,text="Correct"){
  const input=$(inputId), fb=$(feedbackId);
  input.classList.remove("good","bad");
  fb.className="field-feedback";
  if(!input.value){ fb.textContent=""; return; }
  input.classList.add(ok?"good":"bad");
  fb.classList.add(ok?"good":"bad");
  fb.textContent=ok?`✓ ${text}`:"Check this value";
}

// First-step question
document.querySelectorAll("[data-first]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll("[data-first]").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    if(btn.dataset.first==="cp"){
      setFeedback("firstFeedback","pass",
        "Correct. The worked example first chooses a suitable lactation CP target, then balances silage and concentrate to that target.");
      show("step1");
    }else{
      const msgs={
        milk:"Milk energy depends on ration quality q, which is calculated after the diet proportions are established.",
        fresh:"Fresh weight is calculated only after the energy allocation and dry-matter amounts are known.",
        maintenance:"Maintenance ME depends on ration quality q, so first establish the diet proportions and q."
      };
      setFeedback("firstFeedback","fail",msgs[btn.dataset.first]);
    }
  });
});

function validateStep1(){
  const cp=val("targetCP"), s=val("silagePct"), c=val("concPct");

  mark("targetCP","targetCPFeedback",close(cp,16,.11));
  mark("silagePct","silagePctFeedback",close(s,33.33,.25));
  mark("concPct","concPctFeedback",close(c,66.67,.25));

  if(![cp,s,c].every(Number.isFinite)) return;

  const ok=close(cp,16,.11)&&close(s,33.33,.25)&&close(c,66.67,.25)&&close(s+c,100,.3);
  if(ok){
    setFeedback("proteinFeedback","pass",
      "Correct. A 16% CP diet requires approximately 33% silage DM and 67% concentrate DM.");
    show("step2");
  }else{
    setFeedback("proteinFeedback","fail",
      "Use 12% CP silage and 18% CP concentrate to make a 16% CP diet. The two proportions must total 100%.");
    ["step2","step3","step4","step5","step6","step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["targetCP","silagePct","concPct"].forEach(id=>$(id).addEventListener("input",validateStep1));

function validateStep2(){
  const q=val("weightedQ"), tq=val("tableQ");
  mark("weightedQ","weightedQFeedback",close(q,ANSWER.weightedQ,.004));
  mark("tableQ","tableQFeedback",close(tq,.65,.011));

  if(!Number.isFinite(q)||!Number.isFinite(tq)) return;

  const ok=close(q,ANSWER.weightedQ,.004)&&close(tq,.65,.011);
  if(ok){
    setFeedback("qFeedback","pass",
      "Correct. The exact weighted value is about 0.633. The supplied worked example treats the ration as approximately q = 0.65 for interpolation between the q = 0.6 and q = 0.7 table values.");
    show("step3");
  }else{
    setFeedback("qFeedback","fail",
      "Calculate 0.33 × 0.5 + 0.67 × 0.7. Then follow the supplied worked example and use approximately q = 0.65 for the table interpolation.");
    ["step3","step4","step5","step6","step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["weightedQ","tableQ"].forEach(id=>$(id).addEventListener("input",validateStep2));

function validateStep3(){
  const m=val("maintenanceME"), w=val("weightChangeME");
  mark("maintenanceME","maintenanceMEFeedback",close(m,59.5,.16));
  mark("weightChangeME","weightChangeMEFeedback",close(w,0,.05));

  if(!Number.isFinite(m)||!Number.isFinite(w)) return;

  const ok=close(m,59.5,.16)&&close(w,0,.05);
  if(ok){
    setFeedback("maintenanceFeedback","pass",
      "Correct. At q ≈ 0.65, maintenance is approximately halfway between 58 and 61 = 59.5 MJ/day. No liveweight change is specified, so the worked example uses 0 MJ/day for that term.");
    show("step4");
  }else{
    setFeedback("maintenanceFeedback","fail",
      "For 550 kg, interpolate between 58 MJ at q = 0.6 and 61 MJ at q = 0.7. No liveweight change is specified.");
    ["step4","step5","step6","step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["maintenanceME","weightChangeME"].forEach(id=>$(id).addEventListener("input",validateStep3));

function validateStep4(){
  const per=val("milkMEperL"), day=val("milkMEday");
  mark("milkMEperL","milkMEperLFeedback",close(per,5.355,.025));
  // Accept the worked rounding 134 or the unrounded 133.9.
  const dayOk=close(day,133.875,.25)||close(day,134,.25);
  mark("milkMEday","milkMEdayFeedback",dayOk);

  if(!Number.isFinite(per)||!Number.isFinite(day)) return;

  if(close(per,5.355,.025)&&dayOk){
    setFeedback("milkFeedback","pass",
      "Correct. Midway between 5.50 and 5.21 is about 5.35 MJ/L. For 25 L this is approximately 134 MJ/day.");
    show("step5");
  }else{
    setFeedback("milkFeedback","fail",
      "Use the midpoint between 5.50 and 5.21 MJ/L, then multiply by 25 L.");
    ["step5","step6","step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["milkMEperL","milkMEday"].forEach(id=>$(id).addEventListener("input",validateStep4));

function validateStep5(){
  const t=val("totalME");
  // accept 193.4 to 193.6 around the worked solution
  const ok=close(t,193.5,.3);
  mark("totalME","totalMEFeedback",ok);

  if(!Number.isFinite(t)) return;

  if(ok){
    setFeedback("totalMEFeedbackBox","pass",
      "Correct. The worked example uses approximately 59.5 + 134 + 0 = 193.5 MJ ME/day.");
    show("step6");
  }else{
    setFeedback("totalMEFeedbackBox","fail",
      "Add maintenance ME, milk-production ME and the body-weight-change term.");
    ["step6","step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
$("totalME").addEventListener("input",validateStep5);

function validateStep6(){
  const s=val("silageME"), c=val("concME");
  // Worked source rounds these to 64 and 130. Accept both exact 33/67 split and rounded values.
  const sOk=close(s,WORK.silageME,.35)||close(s,64,.35);
  const cOk=close(c,WORK.concME,.45)||close(c,130,.45);
  mark("silageME","silageMEFeedback",sOk);
  mark("concME","concMEFeedback",cOk);

  if(!Number.isFinite(s)||!Number.isFinite(c)) return;

  if(sOk&&cOk){
    setFeedback("feedMEFeedback","pass",
      "Correct. The worked example allocates about 64 MJ/day to silage and 130 MJ/day to concentrate.");
    show("step7");
  }else{
    setFeedback("feedMEFeedback","fail",
      "Multiply the total ME by approximately 0.33 for silage and 0.67 for concentrate.");
    ["step7","step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["silageME","concME"].forEach(id=>$(id).addEventListener("input",validateStep6));

function validateStep7(){
  const s=val("silageDM"), c=val("concDM"), t=val("totalDMI");
  const sOk=close(s,5.8,.16);
  const cOk=close(c,10.0,.16);
  const tOk=close(t,15.8,.22);

  mark("silageDM","silageDMFeedback",sOk);
  mark("concDM","concDMFeedback",cOk);
  mark("totalDMI","totalDMIFeedback",tOk);

  if(Number.isFinite(t)){
    $("dmiVerdict").textContent=t<=16?"Within anticipated intake":"Above anticipated intake";
    $("dmiDifference").textContent=`${Math.abs(16-t).toFixed(1)} kg ${t<=16?"below":"above"}`;
  }else{
    $("dmiVerdict").textContent="—";
    $("dmiDifference").textContent="—";
  }

  if(![s,c,t].every(Number.isFinite)) return;

  if(sOk&&cOk&&tOk){
    setFeedback("dmiFeedback","pass",
      "Correct. About 5.8 kg silage DM + 10.0 kg concentrate DM = 15.8 kg DM/day, which fits within the anticipated 16 kg/day.");
    show("step8");
  }else{
    setFeedback("dmiFeedback","fail",
      "Divide the silage energy by 11 MJ/kg DM and the concentrate energy by 13 MJ/kg DM, then add the two DM amounts.");
    ["step8","step9","goodForageCard","finalCard"].forEach(hide);
  }
}
["silageDM","concDM","totalDMI"].forEach(id=>$(id).addEventListener("input",validateStep7));

function validateStep8(){
  const s=val("silageFresh"), c=val("concFresh");
  const sOk=close(s,23.2,.25);
  const cOk=close(c,11.1,.2);
  mark("silageFresh","silageFreshFeedback",sOk);
  mark("concFresh","concFreshFeedback",cOk);

  if(!Number.isFinite(s)||!Number.isFinite(c)) return;

  if(sOk&&cOk){
    setFeedback("freshFeedback","pass",
      "Correct. The mathematical ration is approximately 23.2 kg fresh silage and 11.1 kg fresh concentrate per cow per day. Now check whether that feeding rate is practically acceptable.");
    $("practicalConcAmount").textContent=`${c.toFixed(1)} kg/day`;
    show("step9");
    hide("finalCard");
  }else{
    setFeedback("freshFeedback","fail",
      "Silage is 25% DM, so divide silage DM by 0.25. Concentrate is 90% DM, so divide concentrate DM by 0.90.");
    hide("step9"); hide("goodForageCard"); hide("finalCard");
  }
}
["silageFresh","concFresh"].forEach(id=>$(id).addEventListener("input",validateStep8));


function validatePractical(){
  const cpChoice=$("cpPractical").value;
  const amountChoice=$("amountPractical").value;

  const cpOk=cpChoice==="yes";
  const amountOk=amountChoice==="yes";

  const cpFb=$("cpPracticalFeedback");
  const amountFb=$("amountPracticalFeedback");

  cpFb.className="field-feedback";
  amountFb.className="field-feedback";

  if(cpChoice){
    cpFb.classList.add(cpOk?"good":"bad");
    cpFb.textContent=cpOk?"✓ Correct":"18% CP is within the 16–18% range used here for average-to-poor silage.";
  }else{
    cpFb.textContent="";
  }

  if(amountChoice){
    amountFb.classList.add(amountOk?"good":"bad");
    amountFb.textContent=amountOk?"✓ Correct":"11.1 kg/day is above the 7–8 kg/day teaching benchmark.";
  }else{
    amountFb.textContent="";
  }

  if(!cpChoice || !amountChoice) return;

  if(cpOk && amountOk){
    setFeedback("practicalFeedback","warn",
      "Correct. The 18% CP concentrate is suitable in protein concentration, but 11.1 kg/cow/day exceeds the practical 7–8 kg/day teaching benchmark. Therefore the worked ration is mathematically balanced but should not be accepted automatically as the final on-farm recommendation. It should be reformulated using better forage and/or a different ration structure while recalculating energy and protein.");
    renderSummary();
    show("finalCard");
  }else{
    setFeedback("practicalFeedback","fail",
      "Check both rules: 18% CP is appropriate for average-to-poor silage, but 11.1 kg/day is above the practical concentrate allowance used in this exercise.");
    hide("finalCard");
  }
}

$("cpPractical").addEventListener("change",validatePractical);
$("amountPractical").addEventListener("change",validatePractical);

$("tryGoodForage").addEventListener("click",()=>{
  show("goodForageCard");
  updateGoodForage();
  $("goodForageCard").scrollIntoView({behavior:"smooth",block:"start"});
});

function goodScenario(concFresh, grassDMpct, grassCPpct, grassNDFpct, concNDFpct, pricePerTonne){
  const q=0.75;

  // Original source tables stop at q=.7, so q=.75 is a simple linear extrapolation.
  const maintenanceME = 58 + ((q-0.6)/(0.7-0.6))*(61-58);
  const milkMEperL = 5.50 + ((q-0.6)/(0.7-0.6))*(5.21-5.50);
  const milkMEday = milkMEperL*25;
  const totalME = maintenanceME + milkMEday;

  const concDM=concFresh*0.90;
  const concME=concDM*13.0;
  const grassME=Math.max(0,totalME-concME);
  const grassDM=grassME/11.5;
  const grassFresh=grassDM/(grassDMpct/100);
  const totalDMI=grassDM+concDM;

  // Standard dairy ration in this optional scenario = 16% CP.
  const cpKg=grassDM*(grassCPpct/100)+concDM*0.16;
  const dietCP=cpKg/totalDMI*100;

  const grassNDFkg=grassDM*(grassNDFpct/100);
  const concNDFkg=concDM*(concNDFpct/100);
  const totalNDFkg=grassNDFkg+concNDFkg;
  const dietNDF=totalNDFkg/totalDMI*100;

  const cost=concFresh*(pricePerTonne/1000);
  const costLow=concFresh*0.340;
  const costHigh=concFresh*0.380;

  const feasible = totalDMI<=16 && dietCP>=16 && concFresh>=4 && concFresh<=8;

  return {
    maintenanceME,milkMEperL,milkMEday,totalME,
    concDM,concME,grassME,grassDM,grassFresh,totalDMI,
    dietCP,grassNDFkg,concNDFkg,totalNDFkg,dietNDF,
    cost,costLow,costHigh,feasible
  };
}

function renderGoodCostTable(grassDMpct, grassCPpct, grassNDFpct, concNDFpct, pricePerTonne){
  const tbody=$("goodCostTable").querySelector("tbody");
  tbody.innerHTML="";
  let cheapest=null;

  [4,5,6,7,8].forEach(amount=>{
    const r=goodScenario(amount,grassDMpct,grassCPpct,grassNDFpct,concNDFpct,pricePerTonne);
    if(r.feasible && (!cheapest || r.cost<cheapest.r.cost)){
      cheapest={amount,r};
    }

    const tr=document.createElement("tr");
    if(r.feasible) tr.classList.add("feasible-row");
    tr.innerHTML=`
      <td>${amount.toFixed(1)}</td>
      <td>${r.grassDM.toFixed(2)}</td>
      <td>${r.totalDMI.toFixed(2)}</td>
      <td>${r.dietCP.toFixed(1)}</td>
      <td>${r.dietNDF.toFixed(1)}</td>
      <td>€${r.cost.toFixed(2)}</td>
      <td>€${r.costLow.toFixed(2)}–€${r.costHigh.toFixed(2)}</td>
      <td><span class="pill ${r.feasible?"pass-pill":"warn-pill"}">${r.feasible?"Feasible":"Reformulate"}</span></td>
    `;
    tbody.appendChild(tr);
  });

  if(cheapest){
    $("goodBestCost").className="feedback pass";
    $("goodBestCost").textContent=
      `Lowest purchased-feed cost among the tested feasible allowances: ${cheapest.amount.toFixed(0)} kg fresh concentrate/cow/day. At €${pricePerTonne.toFixed(0)}/t this costs about €${cheapest.r.cost.toFixed(2)}/cow/day. The remaining energy is supplied by high-quality grass.`;
  }else{
    $("goodBestCost").className="feedback warn";
    $("goodBestCost").textContent=
      "None of the 4–8 kg concentrate options meets both the 16% CP target and the 16 kg DMI check with the selected grass analysis. Reformulate rather than increasing concentrate automatically.";
  }
}

function updateGoodForage(){
  const grassDMpct=val("goodGrassDMpct");
  const grassCPpct=val("goodGrassCPpct");
  const grassNDFpct=val("goodGrassNDFpct");
  const concNDFpct=val("goodConcNDFpct");
  const pricePerTonne=val("goodConcPrice");
  const concFresh=val("goodConcFresh");

  const dmPctOk=Number.isFinite(grassDMpct) && grassDMpct>=15 && grassDMpct<=20;
  const cpPctOk=Number.isFinite(grassCPpct) && grassCPpct>=15 && grassCPpct<=20;
  const ndfPctOk=Number.isFinite(grassNDFpct) && grassNDFpct>=35 && grassNDFpct<=40;
  const concNdfOk=Number.isFinite(concNDFpct) && concNDFpct>=15 && concNDFpct<=25;
  const priceOk=Number.isFinite(pricePerTonne) && pricePerTonne>=340 && pricePerTonne<=380;
  const concOk=Number.isFinite(concFresh) && concFresh>=4 && concFresh<=8;

  mark("goodGrassDMpct","goodGrassDMpctFeedback",dmPctOk,"Within 15–20% DM range");
  mark("goodGrassCPpct","goodGrassCPpctFeedback",cpPctOk,"Within 15–20% CP range");
  mark("goodGrassNDFpct","goodGrassNDFpctFeedback",ndfPctOk,"Within 35–40% NDF range");
  mark("goodConcNDFpct","goodConcNDFpctFeedback",concNdfOk,"Within 15–25% NDF range");
  mark("goodConcPrice","goodConcPriceFeedback",priceOk,"Within €340–€380/t range");
  mark("goodConcFresh","goodConcFreshFeedback",concOk,"Within 4–8 kg/day range");

  if(!(dmPctOk && cpPctOk && ndfPctOk && concNdfOk && priceOk && concOk)){
    ["goodMaintenanceME","goodMilkMEperL","goodTotalMEcalc","goodConcDM","goodConcME",
     "goodGrassME","goodGrassDMkg","goodGrassFresh","goodTotalDMI","goodGrassNDFkg",
     "goodConcNDFkg","goodDietCP","goodCPcheck","goodDietNDF","goodDMIcheck",
     "goodConcCost","goodConcCostRange"].forEach(id=>$(id).textContent="—");
    $("goodCostTable").querySelector("tbody").innerHTML="";
    $("goodBestCost").className="feedback neutral";
    $("goodBestCost").textContent="The lowest-cost feasible concentrate allowance will appear here.";
    setFeedback("goodForageFeedback","fail",
      "Use grass DM 15–20%, grass CP 15–20%, grass NDF 35–40%, concentrate NDF 15–25%, concentrate price €340–€380/t and concentrate allowance 4–8 kg/day.");
    return;
  }

  const r=goodScenario(concFresh,grassDMpct,grassCPpct,grassNDFpct,concNDFpct,pricePerTonne);

  $("goodMaintenanceME").textContent=`${r.maintenanceME.toFixed(1)} MJ/day`;
  $("goodMilkMEperL").textContent=`${r.milkMEperL.toFixed(2)} MJ/L`;
  $("goodTotalMEcalc").textContent=`${r.totalME.toFixed(1)} MJ/day`;
  $("goodTotalMETarget").textContent=`${r.totalME.toFixed(1)} MJ/day`;
  $("goodConcDM").textContent=`${r.concDM.toFixed(2)} kg/day`;
  $("goodConcME").textContent=`${r.concME.toFixed(1)} MJ/day`;
  $("goodGrassME").textContent=`${r.grassME.toFixed(1)} MJ/day`;
  $("goodGrassDMkg").textContent=`${r.grassDM.toFixed(2)} kg/day`;
  $("goodGrassFresh").textContent=`${r.grassFresh.toFixed(1)} kg/day`;
  $("goodTotalDMI").textContent=`${r.totalDMI.toFixed(2)} kg/day`;
  $("goodGrassNDFkg").textContent=`${r.grassNDFkg.toFixed(2)} kg/day`;
  $("goodConcNDFkg").textContent=`${r.concNDFkg.toFixed(2)} kg/day`;
  $("goodDietCP").textContent=`${r.dietCP.toFixed(1)}%`;
  $("goodCPcheck").textContent=r.dietCP>=16?"Meets/exceeds target":"Below target";
  $("goodDietNDF").textContent=`${r.dietNDF.toFixed(1)}%`;
  $("goodDMIcheck").textContent=r.totalDMI<=16?"Within 16 kg":"Above 16 kg";
  $("goodConcCost").textContent=`€${r.cost.toFixed(2)}/day`;
  $("goodConcCostRange").textContent=`€${r.costLow.toFixed(2)}–€${r.costHigh.toFixed(2)}/day`;

  renderGoodCostTable(grassDMpct,grassCPpct,grassNDFpct,concNDFpct,pricePerTonne);

  if(r.feasible){
    setFeedback("goodForageFeedback","pass",
      `At q = 0.75 the extrapolated ME requirement is about ${r.totalME.toFixed(1)} MJ/day. With ${concFresh.toFixed(1)} kg fresh 16% concentrate and the selected high-quality grass, total DMI is ${r.totalDMI.toFixed(2)} kg/day, diet CP is ${r.dietCP.toFixed(1)}%, diet NDF is ${r.dietNDF.toFixed(1)}%, and purchased concentrate costs €${r.cost.toFixed(2)}/cow/day. Because good grass supplies the remaining energy, concentrate should not be increased unless the nutritional calculation requires it.`);
  }else{
    let reasons=[];
    if(r.totalDMI>16) reasons.push(`DMI ${r.totalDMI.toFixed(2)} kg/day exceeds 16 kg`);
    if(r.dietCP<16) reasons.push(`diet CP ${r.dietCP.toFixed(1)}% is below 16%`);
    setFeedback("goodForageFeedback","warn",
      `This setting needs reformulation: ${reasons.join("; ")}. Do not solve the problem simply by feeding more concentrate; use the grass analysis, energy requirement, protein balance and cost together.`);
  }
}
["goodGrassDMpct","goodGrassCPpct","goodGrassNDFpct","goodConcNDFpct","goodConcPrice","goodConcFresh"].forEach(id=>{
  $(id).addEventListener("input",updateGoodForage);
});

function renderSummary(){
  $("summaryGrid").innerHTML=`
    <div><span>Diet CP</span><strong>16%</strong></div>
    <div><span>Silage : concentrate</span><strong>33 : 67 DM basis</strong></div>
    <div><span>Ration q used</span><strong>≈ 0.65</strong></div>
    <div><span>Maintenance ME</span><strong>59.5 MJ/day</strong></div>
    <div><span>Milk ME</span><strong>≈ 134 MJ/day</strong></div>
    <div><span>Total ME</span><strong>≈ 193.5 MJ/day</strong></div>
    <div><span>Total DMI</span><strong>≈ 15.8 kg/day</strong></div>
    <div><span>Fresh ration calculated</span><strong>23.2 + 11.1 kg/day</strong></div>
    <div><span>Practical concentrate check</span><strong>11.1 kg exceeds 7–8 kg benchmark</strong></div>
  `;
}

$("restart").addEventListener("click",()=>location.reload());
