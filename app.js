const $ = (s) => document.querySelector(s),
  $$ = (s) => document.querySelectorAll(s);
const raw = `BMW|M5 Competition|bmw|128000|625|3.3|Benzin;BMW|X7 M60i|bmw|112000|530|4.7|Benzin;BMW|i7 xDrive60|bmw|119000|544|4.5|Elektr;BMW|M8 Gran Coupe|bmw|138000|617|3.2|Benzin;BMW|XM Label|bmw|185000|738|3.7|Gibrid;BMW|iX M60|bmw|111000|610|3.6|Elektr
Mercedes|S580 4MATIC|mercedes|145000|496|4.4|Gibrid;Mercedes|Maybach S680|mercedes|240000|621|4.4|Benzin;Mercedes|G63 AMG|mercedes|182000|577|4.5|Benzin;Mercedes|EQS 580|mercedes|127000|536|4.1|Elektr;Mercedes|AMG GT 63|mercedes|176000|577|3.1|Benzin;Mercedes|GLS 600|mercedes|175000|550|4.8|Benzin
Porsche|911 Turbo S|porsche|230000|650|2.7|Benzin;Porsche|Taycan Turbo GT|porsche|231000|1019|2.2|Elektr;Porsche|Cayenne Turbo|porsche|148000|729|3.6|Gibrid;Porsche|Panamera 4S|porsche|125000|536|3.7|Gibrid;Porsche|911 GT3 RS|porsche|241000|518|3.0|Benzin
Audi|RS e-tron GT|audi|152000|912|2.5|Elektr;Audi|RS7 Performance|audi|128000|621|3.3|Benzin;Audi|R8 V10|audi|210000|602|3.1|Benzin;Audi|RS Q8|audi|135000|631|3.4|Benzin;Audi|A8 L|audi|98000|335|5.6|Gibrid
Toyota|Land Cruiser 300|toyota|95000|409|6.7|Benzin;Toyota|LC 300 GR Sport|toyota|108000|409|6.5|Benzin;Toyota|Camry 75|toyota|42000|203|8.3|Gibrid;Toyota|Sequoia TRD|toyota|78000|437|5.9|Gibrid;Toyota|Supra GR|toyota|62000|382|3.9|Benzin
Ferrari|812 Superfast|ferrari|365000|789|2.9|Benzin;Ferrari|SF90 Stradale|ferrari|524000|986|2.5|Gibrid;Ferrari|Roma Spider|ferrari|260000|612|3.4|Benzin;Ferrari|Purosangue|ferrari|398000|715|3.3|Benzin;Ferrari|296 GTB|ferrari|338000|819|2.9|Gibrid
Range Rover|SV Autobiography|rangerover|235000|606|4.5|Benzin;Range Rover|Sport SV|rangerover|182000|626|3.6|Gibrid;Range Rover|Velar|rangerover|68000|335|5.2|Gibrid;Range Rover|Defender 130|rangerover|98000|518|4.9|Benzin`;
const cars = raw.split(/[;\n]/).map((r, id) => {
  const [brand, name, img, price, hp, sp, fuel] = r.split("|");
  return {
    id,
    brand,
    name,
    img: `img/${img}.jpg`,
    price: +price,
    hp: +hp,
    sp: sp + "s",
    fuel,
    year: 2025 + (id % 2),
  };
});
const fmt = (n) => "$" + Math.round(n).toLocaleString("en-US");
const state = { brand: "Barchasi", q: "", sort: "" };
let cart = JSON.parse(localStorage.getItem("nur-cart") || "[]"),
  current = null;
const io = new IntersectionObserver(
  (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("v")),
  { threshold: 0.12 },
);

const carCard = (
  c,
  i,
) => `<article class="car" style="transition-delay:${(i % 3) * 0.12}s">
  <div class="im"><img src="${c.img}" alt="${c.brand} ${c.name}" loading="lazy"></div>
  <div class="in"><small>${c.brand.toUpperCase()} · ${c.year}</small><h3>${c.name}</h3>
  <div class="sp"><span>${c.hp} o.k.</span><span>0-100: ${c.sp}</span><span>${c.fuel}</span></div>
  <div class="row"><b>${fmt(c.price)}</b><button class="ghost" data-id="${c.id}">Batafsil</button></div></div></article>`;

const sorters = {
  a: (x, y) => x.price - y.price,
  d: (x, y) => y.price - x.price,
  h: (x, y) => y.hp - x.hp,
};
function render() {
  let list = cars.filter(
    (c) =>
      (state.brand === "Barchasi" || c.brand === state.brand) &&
      (c.brand + c.name).toLowerCase().includes(state.q),
  );
  if (sorters[state.sort]) list.sort(sorters[state.sort]);
  $("#grid").innerHTML = list.map(carCard).join("");
  $("#found").textContent = `${list.length} ta avtomobil topildi`;
  $$(".car").forEach((el) => io.observe(el));
}

function renderFilters() {
  $("#filters").innerHTML = ["Barchasi", ...new Set(cars.map((c) => c.brand))]
    .map((b, i) => `<button class="${i ? "" : "on"}">${b}</button>`)
    .join("");
  $("#filters").onclick = (e) => {
    if (e.target.tagName !== "BUTTON") return;
    $("#filters .on").classList.remove("on");
    e.target.classList.add("on");
    state.brand = e.target.textContent;
    render();
  };
  $("#q").oninput = (e) => {
    state.q = e.target.value.toLowerCase();
    render();
  };
  $("#sort").onchange = (e) => {
    state.sort = e.target.value;
    render();
  };
}

function openModal(id) {
  current = cars[id];
  const spec = {
    Brend: current.brand,
    Yil: current.year,
    Quvvat: current.hp + " o.k.",
    "0-100 km/s": current.sp,
    "Yoqilg'i": current.fuel,
    "Oylik (24 oy)": fmt((current.price * 0.7) / 24),
    Narx: fmt(current.price),
  };
  $("#mimg").src = current.img;
  $("#mt").textContent = `${current.brand} ${current.name}`;
  $("#mspec").innerHTML = Object.entries(spec)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");
  $("#modal").classList.add("open");
}

function updateCart() {
  localStorage.setItem("nur-cart", JSON.stringify(cart));
  $("#count").textContent = cart.length;
  $("#items").innerHTML =
    cart
      .map(
        (c, i) =>
          `<li><img src="${c.img}" alt=""><div>${c.name}<br><small>${fmt(c.price)}</small></div><button data-rm="${i}">O'chirish</button></li>`,
      )
      .join("") || "<li>Savat bo'sh</li>";
  $("#sum").textContent = fmt(cart.reduce((s, c) => s + c.price, 0));
}

function calc() {
  const p = +$("#price").value,
    d = +$("#down").value,
    m = +$("#months").value;
  $("#cp").textContent = fmt(p);
  $("#cd").textContent = d + "%";
  $("#cm").textContent = m + " oy";
  $("#monthly").textContent = fmt((p * (1 - d / 100)) / m);
}

function countUp(el) {
  const end = +el.dataset.n,
    t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / 1400, 1);
    el.textContent = Math.floor(end * (1 - (1 - p) ** 3)) + "+";
    p < 1 && requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.addEventListener("click", (e) => {
  const { id, rm } = e.target.dataset;
  if (id) openModal(+id);
  if (rm) {
    cart.splice(+rm, 1);
    updateCart();
  }
});
$("#madd").onclick = () => {
  cart.push(current);
  updateCart();
  $("#modal").classList.remove("open");
  $("#cart").classList.add("open");
};
$("#mclose").onclick = () => $("#modal").classList.remove("open");
$("#cartBtn").onclick = () => $("#cart").classList.add("open");
$("#close").onclick = () => $("#cart").classList.remove("open");
$("#buy").onclick = () => {
  if (!cart.length) return;
  alert("Rahmat! Menejerimiz tez orada bog'lanadi.");
  cart = [];
  updateCart();
};
$("#form").onsubmit = (e) => {
  e.preventDefault();
  $("#msg").textContent =
    "So'rovingiz qabul qilindi! 15 daqiqada qo'ng'iroq qilamiz.";
  e.target.reset();
};
["price", "down", "months"].forEach((id) => ($("#" + id).oninput = calc));
window.onscroll = () => {
  $("header").classList.toggle("s", scrollY > 60);
  const b = $(".banner");
  $(".banner img").style.transform =
    `translateY(${b.getBoundingClientRect().top * -0.1}px)`;
};
document.onmousemove = (e) =>
  Object.assign($("#cursor").style, {
    left: e.clientX + "px",
    top: e.clientY + "px",
  });

$$(".r").forEach((el) => io.observe(el));
renderFilters();
render();
updateCart();
calc();
setTimeout(() => {
  document.body.classList.add("go");
  $$("[data-n]").forEach(countUp);
}, 900);
