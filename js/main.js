window.addEventListener("load", function () {
  if (localStorage.getItem('total_prod_points') === null) {
    localStorage.setItem('total_prod_points', 0);
  }
  updatedProdPointUI();
  updateHighlightedRange();
  ifNotEmpty();
  ifUndoPossible();
  document.querySelector("#session-logs").innerHTML = localStorage.getItem("prod-calc-session-logs");
});

window.addEventListener('load', function () {
  let nyTime = new Date();
  let nyTimezoneOffset = -4;
  nyTime.setTime(nyTime.getTime() + (nyTimezoneOffset * 60 * 60 * 1000));
  document.getElementById('date-picker').valueAsDate = nyTime;
});

let prodUI = document.querySelector("#total-prod-points-ui");
let sessionLogsUI = document.querySelector("#session-logs");
let taskCount = document.querySelector("#task-count-input");

let conversion = 10;
let g3_min = 710;
let g2_min = 820;
let g1_min = 901;
let grade_reached = `<i class="bi bi-check"></i>`;

let spt_array = {
  'gen_edit_statutes': 4,
  'gen_edit_admin_code': 15,
  'general_edit_court_rules': 15,
  'cite_corrections': 2,
  'icce_exceptions': 2,
  'review_engrossed_content': 10,
  'noted_under_review': 10,
  'editor_charting': 3,
  'handle_charting_search_exception': 3,
  'handle_auto_update_exception': 10,
  'auto_update_validation': 10,
  'auto_update_correction': 10,
  'pdu_review': 10,
  'notes_writing': 10,
  'notes_placement': 1,
  'print_proof_review': 2,
  'print_proof_corrections_compare': 1,
  'rescheming': 0.5,
  'charting_admin_code': 3,
  'harmonization': 22
};

let prod_table = [
  {
    'task_name': 'Auto Update Correction',
    'variable': 'auto_update_correction',
    'spt': 11,
    'hr_1': 5,
    'hr_4': 22,
    'hr_8': 35,
  },
  {
    'task_name': 'Auto Update Validation',
    'variable': 'auto_update_validation',
    'spt': 7,
    'hr_1': 9,
    'hr_4': 34,
    'hr_8': 56,
  },
  {
    'task_name': 'Charting (Admin Code)',
    'variable': 'charting_admin_code',
    'spt': 3,
    'hr_1': 20,
    'hr_4': 80,
    'hr_8': 130,
  },
  {
    'task_name': 'Cite Corrections',
    'variable': 'cite_corrections',
    'spt': 2,
    'hr_1': 30,
    'hr_4': 120,
    'hr_8': 195,
  },
  {
    'task_name': 'Editor Charting',
    'variable': 'editor_charting',
    'spt': 3,
    'hr_1': 20,
    'hr_4': 80,
    'hr_8': 130,
  },
  {
    'task_name': 'General Edit (Admin Code)',
    'variable': 'gen_edit_admin_code',
    'spt': 15,
    'hr_1': 4,
    'hr_4': 16,
    'hr_8': 26,
  },
  {
    'task_name': 'General Edit (Court Rules)',
    'variable': 'general_edit_court_rules',
    'spt': 15,
    'hr_1': 4,
    'hr_4': 16,
    'hr_8': 26,
  },
  {
    'task_name': 'General Edit (Statutes)',
    'variable': 'gen_edit_statutes',
    'spt': 4,
    'hr_1': 15,
    'hr_4': 60,
    'hr_8': 98,
  },
  {
    'task_name': 'Handle Auto Update Exception',
    'variable': 'handle_auto_update_exception',
    'spt': 10,
    'hr_1': 6,
    'hr_4': 24,
    'hr_8': 39,
  },
  {
    'task_name': 'Handle Charting / Search Exception',
    'variable': 'handle_charting_search_exception',
    'spt': 3,
    'hr_1': 20,
    'hr_4': 80,
    'hr_8': 130,
  },
  {
    'task_name': 'Harmonization',
    'variable': 'harmonization',
    'spt': 22,
    'hr_1': 3,
    'hr_4': 11,
    'hr_8': 18,
  },
  {
    'task_name': 'ICCE Exception',
    'variable': 'icce_exceptions',
    'spt': 2,
    'hr_1': 30,
    'hr_4': 120,
    'hr_8': 195,
  },
  {
    'task_name': 'Noted Under Review',
    'variable': 'noted_under_review',
    'spt': 10,
    'hr_1': 6,
    'hr_4': 24,
    'hr_8': 39,
  },
  {
    'task_name': 'Notes Placement',
    'variable': 'notes_placement',
    'spt': 1,
    'hr_1': 60,
    'hr_4': 240,
    'hr_8': 390,
  },
  {
    'task_name': 'Notes Writing',
    'variable': 'notes_writing',
    'spt': 9,
    'hr_1': 7,
    'hr_4': 27,
    'hr_8': 43,
  },
  {
    'task_name': 'PDU Review',
    'variable': 'pdu_review',
    'spt': 11,
    'hr_1': 5,
    'hr_4': 22,
    'hr_8': 35,
  },
  {
    'task_name': 'Print Proof Corrections Compare',
    'variable': 'print_proof_corrections_compare',
    'spt': 1,
    'hr_1': 60,
    'hr_4': 240,
    'hr_8': 390,
  },
  {
    'task_name': 'Print Proof Review',
    'variable': 'print_proof_review',
    'spt': 2,
    'hr_1': 30,
    'hr_4': 120,
    'hr_8': 195,
  },
  {
    'task_name': 'Rescheming',
    'variable': 'rescheming',
    'spt': 0.5,
    'hr_1': '',
    'hr_4': '',
    'hr_8': '',
  },
  {
    'task_name': 'Review Engrossed Content',
    'variable': 'review_engrossed_content',
    'spt': 8,
    'hr_1': 8,
    'hr_4': 30,
    'hr_8': 49,
  }
]

function buildProdTable() {
  let template = `
  <table class="table table-bordered border-dark table-sm align-middle">
  <thead>
  <tr>
    <th class="text-bg-info text-center" colspan="8">2022 SPTs</th>
  </tr>
  <tr>
    <th scope="col">Tasks</th>
    <th class="text-center bg-info" scope="col">SPT</th>
    <th scope="col">1 Hr</th>
    <th scope="col">4 Hr</th>
    <th scope="col">8 Hr</th>
    <th class="text-center" id="g3_heading" scope="col">G-3</th>
    <th class="text-center" id="g2_heading" scope="col">G-2</th>
    <th class="text-center" id="g1_heading" scope="col">G-1</th>
  </tr>
</thead>
<tbody>`;

  for (let data of prod_table) {
    template += `
      <tr>
        <td class="fw-bold">${data.task_name}</td>
        <td class="fw-bold text-center bg-info">${data.spt}</td>
        <td class="text-center">${data.hr_1}</td>
        <td class="text-center">${data.hr_4}</td>
        <td class="text-center">${data.hr_8}</td>
        <td class="text-center" id="g3_${data.variable}"></td>
        <td class="text-center" id="g2_${data.variable}"></td>
        <td class="text-center" id="g1_${data.variable}"></td>
      </tr>
      `;
  }
  template += '</tbody></table>';
  document.querySelector('#prod-table-data').innerHTML = template;
}
buildProdTable();

function getGradeRequirements(id, minPoints) {
  if (Number(localStorage.getItem('total_prod_points')) <= minPoints) {
    for (const data in spt_array) {
      document.querySelector(`#g${id}_${data}`).innerHTML = Math.round(Number(((minPoints - localStorage.getItem('total_prod_points')) * conversion) / spt_array[data]));
    }
  }
}

function undoTask() {
  let date = document.querySelector('#date-picker').value;
  sessionLogsUI.innerHTML = `<span class="text-danger">Deducted <strong>${localStorage.getItem('last_added_points')}</strong> points from total production points.</span> (${date} | ${new Date().toLocaleTimeString()})  <br> ${sessionLogsUI.innerHTML}`
  localStorage.setItem('total_prod_points', Math.round(((Number(localStorage.getItem('total_prod_points')) - Number(localStorage.getItem('last_added_points'))) + Number.EPSILON) * 100) / 100);
  updatedProdPointUI();
  getGradeRequirements('3', g3_min);
  getGradeRequirements('2', g2_min);
  getGradeRequirements('1', g1_min);
  updateHighlightedRange();
  localStorage.setItem("prod-calc-session-logs", document.querySelector("#session-logs").innerHTML);
  localStorage.setItem('last_added_task', 0);
  localStorage.setItem('last_added_points', 0);
  ifUndoPossible();
}

function updateProdPoints() {
  let list = document.querySelector('#user-task-option');
  let date = document.querySelector('#date-picker').value;
  let userTask = list.options[list.selectedIndex].value;
  let userTaskName = list.options[list.selectedIndex].text;
  let prodPointLocal = Number(localStorage.getItem('total_prod_points'));
  let taskValue = taskCount.value;
  let pointsAdded;

  localStorage.setItem('last_added_task', userTaskName);

  if (userTask == "gen_edit_statutes") {
    pointsAdded = (taskValue * spt_array.gen_edit_statutes) / conversion;
  }

  else if (userTask == "gen_edit_admin_code") {
    pointsAdded = (taskValue * spt_array.gen_edit_admin_code) / conversion;
  }

  else if (userTask == "gen_edit_court_rules") {
    pointsAdded = (taskValue * spt_array.general_edit_court_rules) / conversion;
  }

  else if (userTask == "cite_corrections") {
    pointsAdded = (taskValue * spt_array.cite_corrections) / conversion;
  }

  else if (userTask == "icce_exceptions") {
    pointsAdded = (taskValue * spt_array.icce_exceptions) / conversion;
  }

  else if (userTask == "review_engrossed_content") {
    pointsAdded = (taskValue * spt_array.review_engrossed_content) / conversion;
  }

  else if (userTask == "noted_under_review") {
    pointsAdded = (taskValue * spt_array.noted_under_review) / conversion;
  }

  else if (userTask == "editor_charting") {
    pointsAdded = (taskValue * spt_array.editor_charting) / conversion;
  }

  else if (userTask == "handle_charting_search_exception") {
    pointsAdded = (taskValue * spt_array.handle_charting_search_exception) / conversion;
  }
  else if (userTask == "handle_auto_update_exception") {
    pointsAdded = (taskValue * spt_array.handle_auto_update_exception) / conversion;
  }

  else if (userTask == "auto_update_validation") {
    pointsAdded = (taskValue * spt_array.auto_update_validation) / conversion;
  }

  else if (userTask == "auto_update_correction") {
    pointsAdded = (taskValue * spt_array.auto_update_correction) / conversion;
  }

  else if (userTask == "pdu_review") {
    pointsAdded = (taskValue * spt_array.pdu_review) / conversion;
  }

  else if (userTask == "notes_writing") {
    pointsAdded = (taskValue * spt_array.notes_writing) / conversion;
  }

  else if (userTask == "notes_placement") {
    pointsAdded = (taskValue * spt_array.notes_placement) / conversion;
  }

  else if (userTask == "print_proof_review") {
    pointsAdded = (taskValue * spt_array.print_proof_review) / conversion;
  }

  else if (userTask == "print_proof_corrections_compare") {
    pointsAdded = (taskValue * spt_array.print_proof_corrections_compare) / conversion;
  }

  else if (userTask == "rescheming") {
    pointsAdded = (taskValue * spt_array.rescheming) / conversion;
  }

  else if (userTask == "charting_admin_code") {
    pointsAdded = (taskValue * spt_array.charting_admin_code) / conversion;
  }

  else if (userTask == "harmonization") {
    pointsAdded = (taskValue * spt_array.harmonization) / conversion;
  }

  let updatedPoint = prodPointLocal + pointsAdded;
  localStorage.setItem('total_prod_points', Math.round((updatedPoint + Number.EPSILON) * 100) / 100);
  sessionLogsUI.innerHTML = `<span class="text-success">Added <strong>${pointsAdded}</strong> ${pointsAdded === 1 ? 'point' : 'points'} from ${taskValue} ${userTaskName} ${parseInt(taskValue) === 1 ? 'task' : 'tasks'}.</span> (${date} | ${new Date().toLocaleTimeString()})  <br> ${sessionLogsUI.innerHTML}`;

  localStorage.setItem('last_added_points', pointsAdded);
  taskCount.value = '';
  localStorage.setItem("prod-calc-session-logs", document.querySelector("#session-logs").innerHTML);
  updatedProdPointUI();
  updateHighlightedRange();
  ifNotEmpty();
  ifUndoPossible();
}

function updatedProdPointUI() {
  prodUI.innerText = localStorage.getItem('total_prod_points');
  getGradeRequirements('3', g3_min);
  getGradeRequirements('2', g2_min);
  getGradeRequirements('1', g1_min);
}

function resetProdPoints() {
  localStorage.setItem('total_prod_points', 0);
  updatedProdPointUI();
  getGradeRequirements('3', g3_min);
  getGradeRequirements('2', g2_min);
  getGradeRequirements('1', g1_min);
  updateHighlightedRange();
  localStorage.removeItem('prod-calc-session-logs');
  document.querySelector("#session-logs").innerHTML = '';
  localStorage.setItem('last_added_task', 0);
  localStorage.setItem('last_added_points', 0);
  ifUndoPossible();
}

function updateHighlightedRange() {
  let prodPointLocal = localStorage.getItem('total_prod_points');
  let grade_1 = document.querySelector("#grade-1");
  let grade_2 = document.querySelector("#grade-2");
  let grade_3 = document.querySelector("#grade-3");
  let grade_4 = document.querySelector("#grade-4");
  let grade_1_heading = document.querySelector("#grade-1-heading");
  let grade_2_heading = document.querySelector("#grade-2-heading");
  let grade_3_heading = document.querySelector("#grade-3-heading");
  let grade_4_heading = document.querySelector("#grade-4-heading");
  let g1_heading = document.querySelector("#g1_heading");
  let g2_heading = document.querySelector("#g2_heading");
  let g3_heading = document.querySelector("#g3_heading");

  if (prodPointLocal >= g1_min) {
    grade_1.classList.add("text-bg-success");
    grade_2.classList.replace("text-bg-success", "text-bg-light");
    grade_3.classList.replace("text-bg-success", "text-bg-light");
    grade_4.classList.replace("text-bg-danger", "text-bg-light");
    grade_1_heading.classList.add("text-bg-success");
    grade_2_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_3_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_4_heading.classList.replace("text-bg-danger", "text-bg-light");
    g3_heading.classList.replace("text-bg-danger", "text-bg-success");
    g3_heading.classList.add("text-bg-success");
    g2_heading.classList.replace("text-bg-danger", "text-bg-success");
    g2_heading.classList.add("text-bg-success");
    g1_heading.classList.replace("text-bg-danger", "text-bg-success");
    g1_heading.classList.add("text-bg-success");
    for (const data in spt_array) {
      document.querySelector(`#g3_${data}`).innerHTML = grade_reached;
      document.querySelector(`#g3_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g3_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g2_${data}`).innerHTML = grade_reached;
      document.querySelector(`#g2_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g2_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g1_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g1_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g1_${data}`).innerHTML = grade_reached;
    }
  }

  if (prodPointLocal >= g2_min && prodPointLocal < g1_min) {
    grade_1.classList.replace("text-bg-success", "text-bg-light");
    grade_2.classList.add("text-bg-success");
    grade_3.classList.replace("text-bg-success", "text-bg-light");
    grade_4.classList.replace("text-bg-danger", "text-bg-light");
    grade_1_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_2_heading.classList.add("text-bg-success");
    grade_3_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_4_heading.classList.replace("text-bg-danger", "text-bg-light");
    g3_heading.classList.replace("text-bg-danger", "text-bg-success");
    g3_heading.classList.add("text-bg-success");
    g2_heading.classList.replace("text-bg-danger", "text-bg-success");
    g2_heading.classList.add("text-bg-success");
    g1_heading.classList.add("text-bg-danger");
    for (const data in spt_array) {
      document.querySelector(`#g3_${data}`).innerHTML = grade_reached;
      document.querySelector(`#g3_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g3_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g2_${data}`).innerHTML = grade_reached;
      document.querySelector(`#g2_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g2_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g1_${data}`).classList.add("text-bg-danger");
    }
  }

  if (prodPointLocal >= g3_min && prodPointLocal < g2_min) {
    grade_1.classList.replace("text-bg-success", "text-bg-light");
    grade_2.classList.replace("text-bg-success", "text-bg-light");
    grade_3.classList.add("text-bg-success");
    grade_4.classList.replace("text-bg-danger", "text-bg-light");
    grade_1_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_2_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_3_heading.classList.add("text-bg-success");
    grade_4_heading.classList.replace("text-bg-danger", "text-bg-light");
    g3_heading.classList.replace("text-bg-danger", "text-bg-success");
    g3_heading.classList.add("text-bg-success");
    g2_heading.classList.add("text-bg-danger");
    g1_heading.classList.add("text-bg-danger");
    for (const data in spt_array) {
      document.querySelector(`#g3_${data}`).innerHTML = grade_reached;
      document.querySelector(`#g3_${data}`).classList.replace("text-bg-danger", "text-bg-success");
      document.querySelector(`#g3_${data}`).classList.add("text-bg-success");
      document.querySelector(`#g2_${data}`).classList.add("text-bg-danger");
      document.querySelector(`#g1_${data}`).classList.add("text-bg-danger");
    }
  }

  if (prodPointLocal < g3_min) {
    grade_1.classList.replace("text-bg-success", "text-bg-light");
    grade_2.classList.replace("text-bg-success", "text-bg-light");
    grade_3.classList.replace("text-bg-success", "text-bg-light");
    grade_4.classList.add("text-bg-danger");
    grade_1_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_2_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_3_heading.classList.replace("text-bg-success", "text-bg-light");
    grade_4_heading.classList.add("text-bg-danger");
    g3_heading.classList.add("text-bg-danger");
    g2_heading.classList.add("text-bg-danger");
    g1_heading.classList.add("text-bg-danger");
    for (const data in spt_array) {
      document.querySelector(`#g3_${data}`).classList.add("text-bg-danger");
      document.querySelector(`#g2_${data}`).classList.add("text-bg-danger");
      document.querySelector(`#g1_${data}`).classList.add("text-bg-danger");
    }

  }
}

function ifNotEmpty() {
  if (document.querySelector("#task-count-input").value === "") {
    document.querySelector("#save-button").disabled = true;
  } else {
    document.querySelector("#save-button").disabled = false;
  }
}

function ifUndoPossible() {
  if (localStorage.getItem('last_added_points') === "0" || localStorage.getItem('last_added_points') === null) {
    document.querySelector("#undo-button").disabled = true;
  } else {
    document.querySelector("#undo-button").disabled = false;
  }
}

document.querySelector("#task-count-input").addEventListener('input', ifNotEmpty);