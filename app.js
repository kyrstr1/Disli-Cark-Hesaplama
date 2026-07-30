const PI = Math.PI;
const DEG = PI / 180;

/* ── Yardımcılar ── */

function fmt(value, decimals = 3) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function rad(deg) {
  return deg * DEG;
}

function deg(r) {
  return (r * 180) / PI;
}

function sinD(d) {
  return Math.sin(rad(d));
}

function cosD(d) {
  return Math.cos(rad(d));
}

function tanD(d) {
  return Math.tan(rad(d));
}

function atanD(v) {
  return deg(Math.atan(v));
}

function positive(val, name) {
  if (val === undefined || val === null || Number.isNaN(val) || val <= 0) {
    return `${name} pozitif bir sayı olmalıdır.`;
  }
  return null;
}

function positiveInt(val, name) {
  if (!Number.isInteger(val) || val <= 0) {
    return `${name} pozitif tam sayı olmalıdır.`;
  }
  return null;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.hidden = !msg;
  el.textContent = msg || "";
}

function renderResults(containerId, sections) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = sections
    .map(
      (section) => `
    <div class="result-section">
      <h3 class="result-section-title">${section.title}</h3>
      ${section.items
        .map(
          (item) => `
        <div class="result-row${item.primary ? " primary" : ""}">
          <div class="result-row-main">
            <span class="result-row-label">${item.label}</span>
            ${item.formula ? `<span class="result-row-formula">${item.formula}</span>` : ""}
          </div>
          <div class="result-row-value">
            <span class="result-row-num">${item.value}</span>
            ${item.unit ? `<span class="result-row-unit">${item.unit}</span>` : ""}
          </div>
        </div>`
        )
        .join("")}
    </div>`
    )
    .join("");
}

function bindInputs(ids, fn) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", fn);
    if (el && el.tagName === "SELECT") el.addEventListener("change", fn);
  });
}

function getNum(id) {
  return parseFloat(document.getElementById(id).value);
}

function getInt(id) {
  return parseInt(document.getElementById(id).value, 10);
}

/* ── Modül Hesaplayıcı ── */

function toggleModulFields() {
  const mode = document.getElementById("modul-mode").value;
  document.getElementById("modul-m-group").hidden = mode === "from-dz";
  document.getElementById("modul-z-group").hidden = mode === "from-dm";
  document.getElementById("modul-d-group").hidden = mode === "from-mdz";
}

function calcModul() {
  toggleModulFields();
  const mode = document.getElementById("modul-mode").value;
  const alpha = getNum("modul-alpha");
  let m, z, d;

  if (mode === "from-mdz") {
    m = getNum("modul-m");
    z = getInt("modul-z");
    let err = positive(m, "Modül") || positiveInt(z, "Diş sayısı");
    if (err) {
      showError("modul-error", err);
      renderResults("modul-results", []);
      return;
    }
    d = m * z;
  } else if (mode === "from-dz") {
    d = getNum("modul-d");
    z = getInt("modul-z");
    let err = positive(d, "Orta çap") || positiveInt(z, "Diş sayısı");
    if (err) {
      showError("modul-error", err);
      renderResults("modul-results", []);
      return;
    }
    m = d / z;
  } else {
    d = getNum("modul-d");
    m = getNum("modul-m");
    let err = positive(d, "Orta çap") || positive(m, "Modül");
    if (err) {
      showError("modul-error", err);
      renderResults("modul-results", []);
      return;
    }
    z = Math.round(d / m);
  }

  if (alpha <= 0 || alpha >= 90) {
    showError("modul-error", "Basınç açısı 0° ile 90° arasında olmalıdır.");
    renderResults("modul-results", []);
    return;
  }

  showError("modul-error", null);

  const p = PI * m;
  const dp = 25.4 / m;
  const ha = m;
  const hf = 1.25 * m;
  const h = ha + hf;
  const da = m * (z + 2);
  const df = m * (z - 2.5);
  const db = d * cosD(alpha);
  const pb = PI * m * cosD(alpha);
  const toothThickness = (PI * m) / 2;
  const circularPitch = p;

  renderResults("modul-results", [
    {
      title: "Temel Parametreler",
      items: [
        { label: "Modül (m)", value: fmt(m, 4), unit: "mm", formula: "m = d / z", primary: true },
        { label: "Diş Sayısı (z)", value: fmt(z, 0), unit: "adet", formula: "z = d / m", primary: true },
        { label: "Orta Çap (d)", value: fmt(d, 4), unit: "mm", formula: "d = m × z", primary: true },
        { label: "Basınç Açısı (α)", value: fmt(alpha, 2), unit: "°" },
      ],
    },
    {
      title: "Diş Profili",
      items: [
        { label: "Addendum (ha)", value: fmt(ha, 4), unit: "mm", formula: "ha = 1 × m" },
        { label: "Dedendum (hf)", value: fmt(hf, 4), unit: "mm", formula: "hf = 1,25 × m" },
        { label: "Diş Yüksekliği (h)", value: fmt(h, 4), unit: "mm", formula: "h = ha + hf = 2,25 × m" },
        { label: "Diş Dış Çapı (da)", value: fmt(da, 4), unit: "mm", formula: "da = m × (z + 2)" },
        { label: "Diş Dip Çapı (df)", value: fmt(df, 4), unit: "mm", formula: "df = m × (z − 2,5)" },
        { label: "Taban Çap (db)", value: fmt(db, 4), unit: "mm", formula: "db = d × cos(α)" },
      ],
    },
    {
      title: "Adım ve Kalınlık",
      items: [
        { label: "Çevresel Adım (p)", value: fmt(circularPitch, 4), unit: "mm", formula: "p = π × m" },
        { label: "Taban Adım (pb)", value: fmt(pb, 4), unit: "mm", formula: "pb = π × m × cos(α)" },
        { label: "Diş Kalınlığı (s)", value: fmt(toothThickness, 4), unit: "mm", formula: "s = π × m / 2" },
        { label: "Boşluk (e)", value: fmt(toothThickness, 4), unit: "mm", formula: "e = s (standart)" },
      ],
    },
    {
      title: "Dönüşümler",
      items: [
        { label: "DP (Diametral Pitch)", value: fmt(dp, 4), unit: "1/inç", formula: "DP = 25,4 / m" },
        { label: "Modül (inç)", value: fmt(m / 25.4, 4), unit: "inç", formula: "m_inç = m / 25,4" },
        { label: "Orta Çap (inç)", value: fmt(d / 25.4, 4), unit: "inç", formula: "d_inç = d / 25,4" },
      ],
    },
  ]);
}

/* ── Düz Dişli ── */

function calcDuz() {
  const m = getNum("duz-m");
  const z = getInt("duz-z");
  const alpha = getNum("duz-alpha");
  const z2 = getInt("duz-z2");
  const haCoef = getNum("duz-ha");
  const hfCoef = getNum("duz-hf");

  let err =
    positive(m, "Modül") ||
    positiveInt(z, "Diş sayısı") ||
    positive(haCoef, "Addendum katsayısı") ||
    positive(hfCoef, "Dedendum katsayısı");
  if (err) {
    showError("duz-error", err);
    renderResults("duz-results", []);
    return;
  }
  if (alpha <= 0 || alpha >= 90) {
    showError("duz-error", "Basınç açısı 0° ile 90° arasında olmalıdır.");
    renderResults("duz-results", []);
    return;
  }

  showError("duz-error", null);

  const d = m * z;
  const ha = haCoef * m;
  const hf = hfCoef * m;
  const h = ha + hf;
  const da = d + 2 * ha;
  const df = d - 2 * hf;
  const db = d * cosD(alpha);
  const p = PI * m;
  const pb = p * cosD(alpha);
  const s = p / 2;
  const minTeethNoUndercut = Math.ceil(2 / (sinD(alpha) ** 2));

  const items = [
    {
      title: "Temel Boyutlar",
      items: [
        { label: "Modül (m)", value: fmt(m, 4), unit: "mm", primary: true },
        { label: "Diş Sayısı (z)", value: fmt(z, 0), unit: "adet", primary: true },
        { label: "Orta Çap (d)", value: fmt(d, 4), unit: "mm", formula: "d = m × z", primary: true },
        { label: "Basınç Açısı (α)", value: fmt(alpha, 2), unit: "°" },
      ],
    },
    {
      title: "Diş Geometrisi",
      items: [
        { label: "Addendum (ha)", value: fmt(ha, 4), unit: "mm", formula: `ha = ${haCoef} × m` },
        { label: "Dedendum (hf)", value: fmt(hf, 4), unit: "mm", formula: `hf = ${hfCoef} × m` },
        { label: "Diş Yüksekliği (h)", value: fmt(h, 4), unit: "mm", formula: "h = ha + hf" },
        { label: "Diş Dış Çapı (da)", value: fmt(da, 4), unit: "mm", formula: "da = d + 2×ha" },
        { label: "Diş Dip Çapı (df)", value: fmt(df, 4), unit: "mm", formula: "df = d − 2×hf" },
        { label: "Taban Çap (db)", value: fmt(db, 4), unit: "mm", formula: "db = d × cos(α)" },
      ],
    },
    {
      title: "Adım ve Profil",
      items: [
        { label: "Çevresel Adım (p)", value: fmt(p, 4), unit: "mm", formula: "p = π × m" },
        { label: "Taban Adım (pb)", value: fmt(pb, 4), unit: "mm", formula: "pb = π × m × cos(α)" },
        { label: "Diş Kalınlığı (s)", value: fmt(s, 4), unit: "mm", formula: "s = π × m / 2" },
        { label: "Diş Boşluğu (e)", value: fmt(s, 4), unit: "mm", formula: "e = s (standart)" },
        { label: "DP (Diametral Pitch)", value: fmt(25.4 / m, 4), unit: "1/inç", formula: "DP = 25,4 / m" },
      ],
    },
    {
      title: "Tasarım Notları",
      items: [
        {
          label: "Minimum Diş (undercut yok)",
          value: fmt(minTeethNoUndercut, 0),
          unit: "adet",
          formula: "zmin = 2 / sin²(α)",
        },
        {
          label: "Undercut Durumu",
          value: z >= minTeethNoUndercut ? "Undercut yok ✓" : "Undercut riski ⚠",
          unit: "",
        },
      ],
    },
  ];

  if (z2 > 0) {
    const a = (m * (z + z2)) / 2;
    const i = z2 / z;
    items.push({
      title: "Eş Dişli Çifti (z₂ = " + z2 + ")",
      items: [
        { label: "Merkez Mesafesi (a)", value: fmt(a, 4), unit: "mm", formula: "a = m × (z₁ + z₂) / 2", primary: true },
        { label: "Dişli Oranı (i)", value: fmt(i, 4), unit: "—", formula: "i = z₂ / z₁" },
        { label: "Eş Dişli Orta Çap (d₂)", value: fmt(m * z2, 4), unit: "mm", formula: "d₂ = m × z₂" },
        { label: "Kontakt Oranı (yaklaşık)", value: fmt(1.4 + 0.01 * (z + z2), 2), unit: "—", formula: "ε ≈ 1,4 + 0,01×(z₁+z₂)" },
      ],
    });
  }

  renderResults("duz-results", items);
}

/* ── Helisel Dişli ── */

function calcHelisel() {
  const mn = getNum("hel-mn");
  const z = getInt("hel-z");
  const beta = getNum("hel-beta");
  const alphaN = getNum("hel-alpha");
  const z2 = getInt("hel-z2");
  const hand = document.getElementById("hel-hand").value;

  let err = positive(mn, "Normal modül") || positiveInt(z, "Diş sayısı");
  if (err) {
    showError("helisel-error", err);
    renderResults("helisel-results", []);
    return;
  }
  if (beta <= 0 || beta >= 90) {
    showError("helisel-error", "Helis açısı 0° ile 90° arasında olmalıdır.");
    renderResults("helisel-results", []);
    return;
  }

  showError("helisel-error", null);

  const mt = mn / cosD(beta);
  const d = mt * z;
  const alphaT = deg(Math.atan(tanD(alphaN) / cosD(beta)));
  const ha = mn;
  const hf = 1.25 * mn;
  const h = ha + hf;
  const da = d + 2 * ha;
  const df = d - 2 * hf;
  const db = d * cosD(alphaT);
  const pn = PI * mn;
  const pt = PI * mt;
  const px = (PI * mn) / sinD(beta);
  const lead = (PI * d) / tanD(beta);
  const handLabel = hand === "sag" ? "Sağ (RH)" : "Sol (LH)";

  const items = [
    {
      title: "Temel Parametreler",
      items: [
        { label: "Normal Modül (mn)", value: fmt(mn, 4), unit: "mm", primary: true },
        { label: "Enine Modül (mt)", value: fmt(mt, 4), unit: "mm", formula: "mt = mn / cos(β)", primary: true },
        { label: "Diş Sayısı (z)", value: fmt(z, 0), unit: "adet", primary: true },
        { label: "Helis Açısı (β)", value: fmt(beta, 2), unit: "°" },
        { label: "Helis Yönü", value: handLabel, unit: "" },
        { label: "Normal Basınç Açısı (αn)", value: fmt(alphaN, 2), unit: "°" },
        { label: "Enine Basınç Açısı (αt)", value: fmt(alphaT, 4), unit: "°", formula: "tan(αt) = tan(αn) / cos(β)" },
      ],
    },
    {
      title: "Çaplar",
      items: [
        { label: "Orta Çap (d)", value: fmt(d, 4), unit: "mm", formula: "d = mt × z = mn × z / cos(β)", primary: true },
        { label: "Diş Dış Çapı (da)", value: fmt(da, 4), unit: "mm", formula: "da = d + 2×mn" },
        { label: "Diş Dip Çapı (df)", value: fmt(df, 4), unit: "mm", formula: "df = d − 2,5×mn" },
        { label: "Taban Çap (db)", value: fmt(db, 4), unit: "mm", formula: "db = d × cos(αt)" },
      ],
    },
    {
      title: "Adımlar",
      items: [
        { label: "Normal Adım (pn)", value: fmt(pn, 4), unit: "mm", formula: "pn = π × mn" },
        { label: "Enine Adım (pt)", value: fmt(pt, 4), unit: "mm", formula: "pt = π × mt" },
        { label: "Eksenel Adım (px)", value: fmt(px, 4), unit: "mm", formula: "px = π × mn / sin(β)" },
        { label: "Helis Adım / Lead (L)", value: fmt(lead, 4), unit: "mm", formula: "L = π × d / tan(β)" },
        { label: "Diş Yüksekliği (h)", value: fmt(h, 4), unit: "mm", formula: "h = 2,25 × mn" },
      ],
    },
  ];

  if (z2 > 0) {
    const a = (mt * (z + z2)) / 2;
    items.push({
      title: "Eş Dişli Çifti (z₂ = " + z2 + ")",
      items: [
        { label: "Merkez Mesafesi (a)", value: fmt(a, 4), unit: "mm", formula: "a = mt × (z₁ + z₂) / 2", primary: true },
        { label: "Dişli Oranı (i)", value: fmt(z2 / z, 4), unit: "—", formula: "i = z₂ / z₁" },
        { label: "Eş Dişli Orta Çap (d₂)", value: fmt(mt * z2, 4), unit: "mm" },
      ],
    });
  }

  renderResults("helisel-results", items);
}

/* ── Konik Dişli ── */

function calcKonik() {
  const m = getNum("kon-m");
  const z1 = getInt("kon-z1");
  const z2 = getInt("kon-z2");
  const alpha = getNum("kon-alpha");
  const sigma = getNum("kon-shaft");

  let err =
    positive(m, "Modül") ||
    positiveInt(z1, "Küçük dişli sayısı") ||
    positiveInt(z2, "Büyük dişli sayısı");
  if (err) {
    showError("konik-error", err);
    renderResults("konik-results", []);
    return;
  }
  if (sigma <= 0 || sigma >= 180) {
    showError("konik-error", "Eksen açısı 0° ile 180° arasında olmalıdır.");
    renderResults("konik-results", []);
    return;
  }

  showError("konik-error", null);

  const sigmaRad = rad(sigma);
  const delta1 = deg(Math.atan(sinD(sigma) / (z2 / z1 + cosD(sigma))));
  const delta2 = sigma - delta1;
  const d1 = m * z1;
  const d2 = m * z2;
  const R = d1 / (2 * sinD(delta1));
  const b = Math.min(R / 3, 10 * m);
  const ha = m;
  const hf = 1.25 * m;
  const da1 = d1 + 2 * m * cosD(delta1);
  const da2 = d2 + 2 * m * cosD(delta2);
  const df1 = d1 - 2.5 * m * cosD(delta1);
  const df2 = d2 - 2.5 * m * cosD(delta2);
  const a = R * cosD(delta1);
  const i = z2 / z1;

  renderResults("konik-results", [
    {
      title: "Genel",
      items: [
        { label: "Modül (m)", value: fmt(m, 4), unit: "mm", primary: true },
        { label: "Eksen Açısı (Σ)", value: fmt(sigma, 2), unit: "°" },
        { label: "Basınç Açısı (α)", value: fmt(alpha, 2), unit: "°" },
        { label: "Dişli Oranı (i)", value: fmt(i, 4), unit: "—", formula: "i = z₂ / z₁" },
        { label: "Teorik Merkez Mesafesi (a)", value: fmt(a, 4), unit: "mm", formula: "a = R × cos(δ₁)" },
      ],
    },
    {
      title: "Küçük Dişli (Pinion) — z₁ = " + z1,
      items: [
        { label: "Pitch Cone Açısı (δ₁)", value: fmt(delta1, 4), unit: "°", formula: "δ₁ = atan(sin(Σ) / (z₂/z₁ + cos(Σ)))", primary: true },
        { label: "Orta Çap (d₁)", value: fmt(d1, 4), unit: "mm", formula: "d₁ = m × z₁" },
        { label: "Dış Çap (da₁)", value: fmt(da1, 4), unit: "mm", formula: "da₁ = d₁ + 2×m×cos(δ₁)" },
        { label: "Dip Çap (df₁)", value: fmt(df1, 4), unit: "mm", formula: "df₁ = d₁ − 2,5×m×cos(δ₁)" },
      ],
    },
    {
      title: "Büyük Dişli (Gear) — z₂ = " + z2,
      items: [
        { label: "Pitch Cone Açısı (δ₂)", value: fmt(delta2, 4), unit: "°", formula: "δ₂ = Σ − δ₁", primary: true },
        { label: "Orta Çap (d₂)", value: fmt(d2, 4), unit: "mm", formula: "d₂ = m × z₂" },
        { label: "Dış Çap (da₂)", value: fmt(da2, 4), unit: "mm", formula: "da₂ = d₂ + 2×m×cos(δ₂)" },
        { label: "Dip Çap (df₂)", value: fmt(df2, 4), unit: "mm", formula: "df₂ = d₂ − 2,5×m×cos(δ₂)" },
      ],
    },
    {
      title: "Konik Geometri",
      items: [
        { label: "Koni Mesafesi (R)", value: fmt(R, 4), unit: "mm", formula: "R = d₁ / (2×sin(δ₁))", primary: true },
        { label: "Yüz Genişliği (b)", value: fmt(b, 4), unit: "mm", formula: "b = min(R/3, 10×m)" },
        { label: "Addendum (ha)", value: fmt(ha, 4), unit: "mm", formula: "ha = m" },
        { label: "Dedendum (hf)", value: fmt(hf, 4), unit: "mm", formula: "hf = 1,25 × m" },
        { label: "Çevresel Adım (p)", value: fmt(PI * m, 4), unit: "mm", formula: "p = π × m" },
      ],
    },
  ]);
}

/* ── Sonsuz Vida ── */

function calcWorm() {
  const m = getNum("worm-m");
  const z1 = getInt("worm-z1");
  const z2 = getInt("worm-z2");
  const q = getNum("worm-q");
  const alpha = getNum("worm-alpha");
  const hand = document.getElementById("worm-hand").value;

  let err =
    positive(m, "Modül") ||
    positiveInt(z1, "Vida başlangıç sayısı") ||
    positiveInt(z2, "Dişli çark diş sayısı") ||
    positive(q, "Çap katsayısı");
  if (err) {
    showError("worm-error", err);
    renderResults("worm-results", []);
    return;
  }

  showError("worm-error", null);

  const dw1 = m * q;
  const dw2 = m * z2;
  const a = (dw1 + dw2) / 2;
  const gamma = atanD(z1 / q);
  const lead = z1 * PI * m;
  const i = z2 / z1;
  const ha = m;
  const hf = 1.25 * m;
  const da1 = dw1 + 2 * m;
  const da2 = dw2 + 2 * m;
  const df2 = dw2 - 2.5 * m;
  const p = PI * m;
  const efficiency = 0.85 - 0.02 * gamma;
  const handLabel = hand === "sag" ? "Sağ (RH)" : "Sol (LH)";
  const wormLength = dw2 / 2 + 2 * m;

  renderResults("worm-results", [
    {
      title: "Temel Parametreler",
      items: [
        { label: "Modül (m)", value: fmt(m, 4), unit: "mm", primary: true },
        { label: "Vida Başlangıç (z₁)", value: fmt(z1, 0), unit: "adet", primary: true },
        { label: "Dişli Çark Diş (z₂)", value: fmt(z2, 0), unit: "adet", primary: true },
        { label: "Çap Katsayısı (q)", value: fmt(q, 2), unit: "—", formula: "q = dw₁ / m" },
        { label: "Basınç Açısı (α)", value: fmt(alpha, 2), unit: "°" },
        { label: "Vida Yönü", value: handLabel, unit: "" },
      ],
    },
    {
      title: "Sonsuz Vida",
      items: [
        { label: "Vida Orta Çapı (dw₁)", value: fmt(dw1, 4), unit: "mm", formula: "dw₁ = m × q", primary: true },
        { label: "Vida Dış Çapı (da₁)", value: fmt(da1, 4), unit: "mm", formula: "da₁ = dw₁ + 2×m" },
        { label: "Vida Açısı (γ)", value: fmt(gamma, 4), unit: "°", formula: "γ = atan(z₁ / q)" },
        { label: "Vida Adımı / Lead (L)", value: fmt(lead, 4), unit: "mm", formula: "L = z₁ × π × m" },
        { label: "Önerilen Vida Uzunluğu", value: fmt(wormLength, 4), unit: "mm", formula: "≈ dw₂/2 + 2×m" },
      ],
    },
    {
      title: "Dişli Çark (Worm Wheel)",
      items: [
        { label: "Çark Orta Çapı (dw₂)", value: fmt(dw2, 4), unit: "mm", formula: "dw₂ = m × z₂", primary: true },
        { label: "Çark Dış Çapı (da₂)", value: fmt(da2, 4), unit: "mm", formula: "da₂ = dw₂ + 2×m" },
        { label: "Çark Dip Çapı (df₂)", value: fmt(df2, 4), unit: "mm", formula: "df₂ = dw₂ − 2,5×m" },
      ],
    },
    {
      title: "Montaj ve Performans",
      items: [
        { label: "Merkez Mesafesi (a)", value: fmt(a, 4), unit: "mm", formula: "a = (dw₁ + dw₂) / 2", primary: true },
        { label: "Dişli Oranı (i)", value: fmt(i, 4), unit: "—", formula: "i = z₂ / z₁" },
        { label: "Çevresel Adım (p)", value: fmt(p, 4), unit: "mm", formula: "p = π × m" },
        { label: "Verim (yaklaşık)", value: fmt(Math.max(efficiency, 0.3), 2), unit: "—", formula: "η ≈ 0,85 − 0,02×γ" },
        { label: "Kendinden Frenleme", value: gamma > 6 ? "Muhtemel ✓" : "Muhtemel değil", unit: "" },
      ],
    },
  ]);
}

/* ── Kremayer ── */

function calcKremayer() {
  const m = getNum("krem-m");
  const alpha = getNum("krem-alpha");
  const length = getNum("krem-length");
  const z = getInt("krem-z");

  let err = positive(m, "Modül") || positive(length, "Kremayer uzunluğu");
  if (err) {
    showError("kremayer-error", err);
    renderResults("kremayer-results", []);
    return;
  }

  showError("kremayer-error", null);

  const p = PI * m;
  const ha = m;
  const hf = 1.25 * m;
  const h = ha + hf;
  const toothCount = length / p;
  const fullTeeth = Math.floor(toothCount);
  const s = p / 2;
  const pitchLineToRoot = hf;
  const pitchLineToTip = ha;

  const items = [
    {
      title: "Kremayer Profili",
      items: [
        { label: "Modül (m)", value: fmt(m, 4), unit: "mm", primary: true },
        { label: "Basınç Açısı (α)", value: fmt(alpha, 2), unit: "°" },
        { label: "Diş Adımı (p)", value: fmt(p, 4), unit: "mm", formula: "p = π × m", primary: true },
        { label: "Addendum (ha)", value: fmt(ha, 4), unit: "mm", formula: "ha = m" },
        { label: "Dedendum (hf)", value: fmt(hf, 4), unit: "mm", formula: "hf = 1,25 × m" },
        { label: "Diş Yüksekliği (h)", value: fmt(h, 4), unit: "mm", formula: "h = 2,25 × m" },
      ],
    },
    {
      title: "Diş Ölçüleri",
      items: [
        { label: "Diş Kalınlığı (s)", value: fmt(s, 4), unit: "mm", formula: "s = π × m / 2" },
        { label: "Diş Boşluğu (e)", value: fmt(s, 4), unit: "mm", formula: "e = s" },
        { label: "Pitch Hattından Tepeye", value: fmt(pitchLineToTip, 4), unit: "mm" },
        { label: "Pitch Hattından Dibe", value: fmt(pitchLineToRoot, 4), unit: "mm" },
        { label: "DP (Diametral Pitch)", value: fmt(25.4 / m, 4), unit: "1/inç", formula: "DP = 25,4 / m" },
      ],
    },
    {
      title: "Uzunluk Hesabı (L = " + fmt(length, 0) + " mm)",
      items: [
        { label: "Teorik Diş Sayısı", value: fmt(toothCount, 2), unit: "adet", formula: "n = L / (π × m)", primary: true },
        { label: "Tam Diş Sayısı", value: fmt(fullTeeth, 0), unit: "adet" },
        { label: "Kalan (parsiyel)", value: fmt(toothCount - fullTeeth, 4), unit: "adet" },
        { label: "Tam Diş Uzunluğu", value: fmt(fullTeeth * p, 4), unit: "mm", formula: "n_tam × p" },
      ],
    },
  ];

  if (z > 0) {
    const d = m * z;
    const a = d / 2;
    items.push({
      title: "Eş Dişli ile (z = " + z + ")",
      items: [
        { label: "Dişli Orta Çapı (d)", value: fmt(d, 4), unit: "mm", formula: "d = m × z" },
        { label: "Merkez Mesafesi (a)", value: fmt(a, 4), unit: "mm", formula: "a = d / 2 (kremayer düz)", primary: true },
        { label: "Dişli Dış Çapı (da)", value: fmt(d + 2 * m, 4), unit: "mm", formula: "da = m × (z + 2)" },
      ],
    });
  }

  renderResults("kremayer-results", items);
}

/* ── Zincir Dişlisi ── */

const CHAIN_PRESETS = {
  "06B": { pitch: 9.525, roller: 6.35 },
  "08B": { pitch: 12.7, roller: 7.75 },
  "10B": { pitch: 15.875, roller: 10.16 },
  "12B": { pitch: 19.05, roller: 11.68 },
  "16B": { pitch: 25.4, roller: 17.02 },
};

function calcZincir() {
  const p = getNum("zincir-pitch");
  const N = getInt("zincir-n");
  const roller = getNum("zincir-roller");

  let err = positive(p, "Zincir adımı") || (N < 4 ? "Diş sayısı en az 4 olmalıdır." : null);
  if (err) {
    showError("zincir-error", err);
    renderResults("zincir-results", []);
    return;
  }

  showError("zincir-error", null);

  const pitchAngle = 360 / N;
  const PD = p / sinD(pitchAngle / 2);
  const OD = roller > 0 ? PD + roller : PD * 1.05;
  const rootDiameter = PD - p * 0.35;
  const chordalPitch = p;
  const circumference = PI * PD;
  const teethPerRev = N;
  const chainLengthPerRev = N * p;

  renderResults("zincir-results", [
    {
      title: "Girdi Parametreleri",
      items: [
        { label: "Zincir Adımı (p)", value: fmt(p, 4), unit: "mm", primary: true },
        { label: "Diş Sayısı (N)", value: fmt(N, 0), unit: "adet", primary: true },
        { label: "Rulo Çapı (dr)", value: roller > 0 ? fmt(roller, 4) : "—", unit: "mm" },
        { label: "Diş Açısı (360°/N)", value: fmt(pitchAngle, 4), unit: "°", formula: "360° / N" },
      ],
    },
    {
      title: "Dişli Çapları",
      items: [
        {
          label: "Pitch Çapı (PD)",
          value: fmt(PD, 4),
          unit: "mm",
          formula: "PD = p / sin(180°/N)",
          primary: true,
        },
        {
          label: "Dış Çap (OD)",
          value: fmt(OD, 4),
          unit: "mm",
          formula: roller > 0 ? "OD = PD + dr" : "OD ≈ PD × 1,05",
          primary: true,
        },
        { label: "Dip Çapı (RD)", value: fmt(rootDiameter, 4), unit: "mm", formula: "RD ≈ PD − 0,35×p" },
        { label: "Yarıçap (PD/2)", value: fmt(PD / 2, 4), unit: "mm" },
      ],
    },
    {
      title: "Zincir Uyumu",
      items: [
        { label: "Kiriş Adımı", value: fmt(chordalPitch, 4), unit: "mm", formula: "≈ p" },
        { label: "Pitch Çevresi", value: fmt(circumference, 4), unit: "mm", formula: "π × PD" },
        { label: "1 Devirde Zincir Adımı", value: fmt(chainLengthPerRev, 4), unit: "mm", formula: "N × p" },
        { label: "Diş Başına Zincir", value: fmt(1, 0), unit: "adım", formula: "Standart: 1 diş = 1 adım" },
      ],
    },
    {
      title: "Modül Karşılığı (yaklaşık)",
      items: [
        { label: "Eşdeğer Modül", value: fmt(p / PI, 4), unit: "mm", formula: "m ≈ p / π" },
        { label: "DP Karşılığı", value: fmt(PI / p, 4), unit: "1/inç", formula: "DP ≈ π / p" },
      ],
    },
  ]);
}

/* ── Sekmeler ── */

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => {
        t.classList.toggle("active", t === tab);
        t.setAttribute("aria-selected", t === tab ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === target);
      });

      tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    });
  });
}

function initModul() {
  bindInputs(["modul-mode", "modul-m", "modul-z", "modul-d", "modul-alpha"], calcModul);
  calcModul();
}

function initDuz() {
  bindInputs(["duz-m", "duz-z", "duz-alpha", "duz-z2", "duz-ha", "duz-hf"], calcDuz);
  calcDuz();
}

function initHelisel() {
  bindInputs(["hel-mn", "hel-z", "hel-beta", "hel-alpha", "hel-z2", "hel-hand"], calcHelisel);
  calcHelisel();
}

function initKonik() {
  bindInputs(["kon-m", "kon-z1", "kon-z2", "kon-alpha", "kon-shaft"], calcKonik);
  calcKonik();
}

function initWorm() {
  bindInputs(["worm-m", "worm-z1", "worm-z2", "worm-q", "worm-alpha", "worm-hand"], calcWorm);
  calcWorm();
}

function initKremayer() {
  bindInputs(["krem-m", "krem-alpha", "krem-length", "krem-z"], calcKremayer);
  calcKremayer();
}

function initZincir() {
  bindInputs(["zincir-pitch", "zincir-n", "zincir-roller", "zincir-preset"], calcZincir);

  document.getElementById("zincir-preset").addEventListener("change", (e) => {
    const preset = CHAIN_PRESETS[e.target.value];
    if (preset) {
      document.getElementById("zincir-pitch").value = preset.pitch;
      document.getElementById("zincir-roller").value = preset.roller;
      calcZincir();
    }
  });

  calcZincir();
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initModul();
  initDuz();
  initHelisel();
  initKonik();
  initWorm();
  initKremayer();
  initZincir();
});
