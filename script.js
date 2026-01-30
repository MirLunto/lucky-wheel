const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resultDiv = document.getElementById("result");
const prizeSelect = document.getElementById("prizeSelect");
const historyList = document.getElementById("historyList");

let employees = Array.from({ length: 100 }, (_, i) => i + 1);

let angle = 0;
let speed = 0;
let spinning = false;
let stopping = false;
let pendingRemoveIndex = null;

const radius = canvas.width / 2;
const center = radius;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (employees.length === 0) return;

  const slice = (2 * Math.PI) / employees.length;

  employees.forEach((num, i) => {
    const start = angle + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, start, end);
    ctx.fillStyle = i % 2 === 0 ? "#e3f2fd" : "#bbdefb";
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#333";
    ctx.font = "14px Arial";
    ctx.fillText(num, radius - 10, 5);
    ctx.restore();
  });
}

function animate() {
  if (!spinning) return;

  angle += speed;

  if (stopping) {
    speed *= 0.97;
    if (speed < 0.002) {
      spinning = false;
      stopping = false;
      speed = 0;
      finalizeResult();
      return;
    }
  }

  drawWheel();
  requestAnimationFrame(animate);
}

function finalizeResult() {
  const slice = (2 * Math.PI) / employees.length;
  const pointerAngle = (3 * Math.PI) / 2;

  let normalized = (pointerAngle - angle) % (2 * Math.PI);
  if (normalized < 0) normalized += 2 * Math.PI;

  let index = Math.floor(normalized / slice);
  if (index >= employees.length) index = employees.length - 1;

  const winner = employees[index];
  const prize = prizeSelect.value;

  pendingRemoveIndex = index;

  resultDiv.classList.remove("show");
  resultDiv.innerHTML = `
    <div class="number">${winner}</div>
    <div class="prize">${prize}</div>
  `;
  void resultDiv.offsetWidth;
  resultDiv.classList.add("show");

  const li = document.createElement("li");
  li.textContent = `${winner}  ${prize}`;
  historyList.prepend(li);

  startBtn.disabled = false;
  stopBtn.disabled = true;
}

startBtn.onclick = () => {
  if (employees.length === 0) {
    alert("已经没人可以抽了。");
    return;
  }

  if (pendingRemoveIndex !== null) {
    employees.splice(pendingRemoveIndex, 1);
    pendingRemoveIndex = null;
  }

  resultDiv.classList.remove("show");
  resultDiv.innerHTML = "";

  speed = 0.35;
  spinning = true;
  stopping = false;

  startBtn.disabled = true;
  stopBtn.disabled = false;

  drawWheel();
  animate();
};

stopBtn.onclick = () => {
  if (spinning) stopping = true;
};

drawWheel();
