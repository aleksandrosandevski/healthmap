"use strict";

/* =========================
   STATE
========================= */

const state = {
    year: "2021-2022",
    age: "11",
    indicator: "overweight-obese",
    data: null
};

/* =========================
   DOM
========================= */

const countryGrid = document.getElementById("countryGrid");
const topFiveEl = document.getElementById("topFive");
const bottomFiveEl = document.getElementById("bottomFive");

const hbscAverageEl = document.getElementById("averageValue");
const countryCountEl = document.getElementById("countryCount");
const indicatorTitleEl = document.getElementById("indicatorTitle");

const searchInput = document.getElementById("search");

/* =========================
   MODAL
========================= */

const modal = document.getElementById("countryModal");
const closeModalBtn = document.getElementById("closeModal");

const modalFlag = document.getElementById("modalFlag");
const modalCountry = document.getElementById("modalCountry");
const modalIndicator = document.getElementById("modalIndicator");
const girlsValue = document.getElementById("girlsValue");
const boysValue = document.getElementById("boysValue");
const averageCountry = document.getElementById("averageCountry");
const averageHBSC = document.getElementById("averageHBSC");

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    setupListeners();
    loadData();
});

/* =========================
   LISTENERS
========================= */

function setupListeners() {

    document.querySelectorAll("input[name='year']").forEach(r => {
        r.addEventListener("change", () => {
            state.year = r.value;
            loadData();
        });
    });

    document.querySelectorAll("input[name='age']").forEach(r => {
        r.addEventListener("change", () => {
            state.age = r.value;
            loadData();
        });
    });

    document.getElementById("indicator").addEventListener("change", (e) => {
        state.indicator = e.target.value;
        loadData();
    });

    searchInput.addEventListener("input", render);

    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

/* =========================
   LOAD DATA
========================= */

async function loadData() {

    const path = `data/${state.year}/${state.age}/${state.indicator}.json`;

    try {
        const res = await fetch(path);
        const json = await res.json();

        state.data = json;

        updateHeader(json);
        render();

    } catch (err) {
        console.error("Failed to load:", path, err);
    }
}

/* =========================
   HEADER
========================= */

function updateHeader(json) {

    hbscAverageEl.textContent = json.summary.hbsc_average_total + "%";
    countryCountEl.textContent = json.data.length;
    indicatorTitleEl.textContent = json.title;
}

/* =========================
   MAIN RENDER
========================= */

function render() {

    if (!state.data) return;

    const query = searchInput.value.toLowerCase();
    let data = state.data.data;

    if (query) {
        data = data.filter(c =>
            c.country.toLowerCase().includes(query)
        );
    }

    const hbscAvg = state.data.summary.hbsc_average_total;

    const enriched = data.map(c => {
        const avg = (c.girls + c.boys) / 2;

        return {
            ...c,
            avg,
            diff: avg - hbscAvg
        };
    });

    renderCards(enriched);
    renderRanking(enriched);
}

/* =========================
   CARDS
========================= */

function renderCards(data) {

    countryGrid.innerHTML = "";

    data.forEach(c => {

        const diffClass = c.diff >= 0 ? "diff-high" : "diff-low";
        const diffSign = c.diff >= 0 ? "+" : "";

        const card = document.createElement("div");
        card.className = "country-card";

        card.innerHTML = `
            <div class="diff-badge ${diffClass}">
                ${diffSign}${c.diff.toFixed(1)}%
            </div>

            <img src="assets/flags/${formatFlag(c.country)}.svg" alt="${c.country} flag">

            <h3>${c.country}</h3>

            <div class="country-stats">

                <div>
                    <span>Girls</span>
                    <strong>${c.girls}%</strong>
                </div>

                <div>
                    <span>Boys</span>
                    <strong>${c.boys}%</strong>
                </div>

                <div>
                    <span>Average</span>
                    <strong>${c.avg.toFixed(1)}%</strong>
                </div>

            </div>
        `;

        card.addEventListener("click", () => openModal(c));

        countryGrid.appendChild(card);
    });
}

/* =========================
   RANKING
========================= */

function renderRanking(data) {

    const sorted = [...data].sort((a, b) => b.avg - a.avg);

    const top = sorted.slice(0, 5);
    const bottom = sorted.slice(-5).reverse();

    topFiveEl.innerHTML = top.map(c =>
        `<li>${c.country} <strong>${c.avg.toFixed(1)}%</strong></li>`
    ).join("");

    bottomFiveEl.innerHTML = bottom.map(c =>
        `<li>${c.country} <strong>${c.avg.toFixed(1)}%</strong></li>`
    ).join("");
}

/* =========================
   MODAL
========================= */

function openModal(country) {

    const hbscAvg = state.data.summary.hbsc_average_total;
    const avg = (country.girls + country.boys) / 2;

    modalFlag.src = `assets/flags/${formatFlag(country.country)}.svg`;
    modalFlag.alt = country.country;

    modalCountry.textContent = country.country;
    modalIndicator.textContent = state.data.title;

    girlsValue.textContent = country.girls + "%";
    boysValue.textContent = country.boys + "%";
    averageCountry.textContent = avg.toFixed(1) + "%";
    averageHBSC.textContent = hbscAvg + "%";

    modal.style.display = "flex";
}

/* =========================
   FLAGS
========================= */

function formatFlag(country) {

    const map = {
        "Czech Republic": "cz",
        "Portugal": "pt",
        "Spain es": "es",
        "Italy": "it",
        "Russian Federation": "ru",
        "Republic of Moldova": "md",
        "Macedonia": "mk",

        "Netherlands": "nl",
        "Belgium (Flemish)": "be",
        "Belgium (French)": "be"
    };

    return map[country] || country
        .toLowerCase()
        .replace(/\s/g, "-")
        .replace(/[()]/g, "");
}