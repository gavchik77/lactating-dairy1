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

function updateGoodForage(){
  const grassDMpct=val("goodGrassDMpct");
  const grassCPpct=val("goodGrassCPpct");
  const grassNDFpct=val("goodGrassNDFpct");
  const concFresh=val("goodConcFresh");

  const dmPctOk=Number.isFinite(grassDMpct) && grassDMpct>=15 && grassDMpct<=20;
  const cpPctOk=Number.isFinite(grassCPpct) && grassCPpct>=15 && grassCPpct<=20;
  const ndfPctOk=Number.isFinite(grassNDFpct) && grassNDFpct>=35 && grassNDFpct<=40;
  const concOk=Number.isFinite(concFresh) && concFresh>=4 && concFresh<=8;

  mark("goodGrassDMpct","goodGrassDMpctFeedback",dmPctOk,"Within 15–20% DM range");
  mark("goodGrassCPpct","goodGrassCPpctFeedback",cpPctOk,"Within 15–20% CP range");
  mark("goodGrassNDFpct","goodGrassNDFpctFeedback",ndfPctOk,"Within 35–40% NDF range");
  mark("goodConcFresh","goodConcFreshFeedback",concOk,"Within 4–8 kg/day range");

  if(!(dmPctOk && cpPctOk && ndfPctOk && concOk)){
    ["goodMaintenanceME","goodMilkMEperL","goodTotalMEcalc","goodConcDM","goodConcME",
     "goodGrassME","goodGrassDMkg","goodGrassFresh","goodTotalDMI","goodGrassNDFkg",
     "goodDietCP","goodCPcheck","goodDMIcheck"].forEach(id=>$(id).textContent="—");
    setFeedback("goodForageFeedback","fail",
      "Keep leafy ryegrass DM and CP within 15–20%, NDF within 35–40%, and fresh concentrate within 4–8 kg/cow/day.");
    return;
  }

  // Teacher-supplied q = 0.75.
  // The source table only gives q = 0.6 and 0.7, so use linear extrapolation.
  const q=0.75;

  // Maintenance, 550 kg: 58 MJ at q=.6 and 61 MJ at q=.7
  const maintenanceME = 58 + ((q-0.6)/(0.7-0.6))*(61-58);

  // Milk, 4.5% fat and 3.4% protein: 5.50 MJ/L at q=.6 and 5.21 at q=.7
  const milkMEperL = 5.50 + ((q-0.6)/(0.7-0.6))*(5.21-5.50);
  const milkMEday = milkMEperL*25;
  const totalME = maintenanceME + milkMEday; // no BW change

  const concDM=concFresh*0.90;
  const concME=concDM*13.0;
  const grassME=Math.max(0,totalME-concME);
  const grassDM=grassME/11.5;
  const grassFresh=grassDM/(grassDMpct/100);
  const totalDMI=grassDM+concDM;

  const cpKg=grassDM*(grassCPpct/100)+concDM*0.18;
  const dietCP=cpKg/totalDMI*100;

  const grassNDFkg=grassDM*(grassNDFpct/100);

  $("goodMaintenanceME").textContent=`${maintenanceME.toFixed(1)} MJ/day`;
  $("goodMilkMEperL").textContent=`${milkMEperL.toFixed(2)} MJ/L`;
  $("goodTotalMEcalc").textContent=`${totalME.toFixed(1)} MJ/day`;
  $("goodTotalMETarget").textContent=`${totalME.toFixed(1)} MJ/day`;
  $("goodConcDM").textContent=`${concDM.toFixed(2)} kg/day`;
  $("goodConcME").textContent=`${concME.toFixed(1)} MJ/day`;
  $("goodGrassME").textContent=`${grassME.toFixed(1)} MJ/day`;
  $("goodGrassDMkg").textContent=`${grassDM.toFixed(2)} kg/day`;
  $("goodGrassFresh").textContent=`${grassFresh.toFixed(1)} kg/day`;
  $("goodTotalDMI").textContent=`${totalDMI.toFixed(2)} kg/day`;
  $("goodGrassNDFkg").textContent=`${grassNDFkg.toFixed(2)} kg/day`;
  $("goodDietCP").textContent=`${dietCP.toFixed(1)}%`;
  $("goodCPcheck").textContent=dietCP>=16?"Meets/exceeds target":"Below target";
  $("goodDMIcheck").textContent=totalDMI<=16?"Within 16 kg":"Above 16 kg";

  const passCP=dietCP>=16;
  const passDMI=totalDMI<=16;

  if(passCP && passDMI){
    setFeedback("goodForageFeedback","pass",
      `At q = 0.75 the extrapolated ME requirement is about ${totalME.toFixed(1)} MJ/day. With ${concFresh.toFixed(1)} kg fresh concentrate/day and leafy ryegrass at ${grassDMpct.toFixed(1)}% DM, ${grassCPpct.toFixed(1)}% CP and ${grassNDFpct.toFixed(1)}% NDF, total DMI is about ${totalDMI.toFixed(2)} kg/day and diet CP is ${dietCP.toFixed(1)}%. The grass contributes ${grassNDFkg.toFixed(2)} kg NDF/day. A complete diet-NDF percentage cannot be calculated until concentrate NDF is known.`);
  }else if(!passCP && passDMI){
    setFeedback("goodForageFeedback","warn",
      `Energy and DMI fit, but diet CP is only ${dietCP.toFixed(1)}%. Increase grass CP within the supplied range, adjust concentrate, or reformulate. Grass NDF contribution is ${grassNDFkg.toFixed(2)} kg/day.`);
  }else if(passCP && !passDMI){
    setFeedback("goodForageFeedback","warn",
      `Protein is adequate, but total DMI is ${totalDMI.toFixed(2)} kg/day, above the 16 kg anticipated intake. Reformulation is needed.`);
  }else{
    setFeedback("goodForageFeedback","warn",
      `This setting misses both the 16% CP target and the 16 kg DMI check. Adjust the forage analysis or concentrate allowance.`);
  }
}

["goodGrassDMpct","goodGrassCPpct","goodGrassNDFpct","goodConcFresh"].forEach(id=>{
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
