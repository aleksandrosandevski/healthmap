"use strict";

/* =========================
   STATE
========================= */

const state = {

    year: "",
    age: "",
    indicator: "",
    data: null

};

const unavailable = {
    "2013-2014-11": [
        "vegetables-daily",
        "sweets-daily",
        "vigorous-activity",
        "underweight"
    ],

    "2013-2014-13": [
        "vegetables-daily",
        "sweets-daily",
        "vigorous-activity",
        "underweight"
    ],

    "2013-2014-15": [
        "vegetables-daily",
        "sweets-daily",
        "vigorous-activity",
        "underweight"
    ],

    "2017-2018-11": [
        "opinion-fat",
        "breakfast-weekday",
        "vigorous-activity"
    ],

    "2017-2018-13": [
        "opinion-fat"
    ],

    "2017-2018-15": [
        "breakfast-weekday",
        "opinion-fat",
        "soft-drinks-daily",
        "overweight-obese"
    ],

    "2021-2022-11": [
        "brush-teeth",
        "yearly-injury"
    ],

    "2021-2022-13": [
        "brush-teeth",
        "yearly-injury"
    ],

    "2021-2022-15": [
        "brush-teeth",
        "yearly-injury"
    ]
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
const currentSelection = document.getElementById("currentSelection");
const countryCounter = document.getElementById("countryCounter");

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
const differenceValue =  document.getElementById("differenceValue");

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
    state.year =
        document.querySelector("input[name='year']:checked").value;

    state.age =
        document.querySelector("input[name='age']:checked").value;

    state.indicator =
        document.getElementById("indicator").value;
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



    closeModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

}

function updateIndicatorAvailability() {

    const select = document.getElementById("indicator");

    let currentDisabled = false;

    [...select.options].forEach(option => {

        const key = `${state.year}-${state.age}`;

        const disabled =
            unavailable[key]?.includes(option.value);

        option.disabled = disabled;

        if (option.value === state.indicator && disabled)
            currentDisabled = true;

    });

    if (currentDisabled) {

        const firstAvailable =
            [...select.options].find(o => !o.disabled);

        select.value = firstAvailable.value;

        state.indicator = firstAvailable.value;
    }
}

/* =========================
   LOAD DATA
========================= */

async function loadData() {

    updateIndicatorAvailability();

    const path = `data/${state.year}/${state.age}/${state.indicator}.json`;

    try {
        const res = await fetch(path);
        const json = await res.json();

        state.data = json;

        updateHeader(json);
        render();

    } catch (err) {

        console.warn("Missing dataset:", path);

        state.data = null;

        countryGrid.innerHTML = `
        <div class="empty-state">

            <h2>No data available</h2>

            <p>

                This indicator was not collected
                for this survey year and age group.

            </p>

        </div>
    `;

        topFiveEl.innerHTML = "";
        bottomFiveEl.innerHTML = "";

        hbscAverageEl.textContent = "--";
        countryCountEl.textContent = "--";

        indicatorTitleEl.textContent =
            "No data available";

        currentSelection.textContent =
            `${state.year} • ${state.age} Years`;

        countryCounter.textContent =
            "Showing 0 Countries";
    }
}

/* =========================
   HEADER
========================= */

function updateHeader(json) {

    hbscAverageEl.textContent =
        json.summary.hbsc_average_total + "%";

    countryCountEl.textContent =
        json.data.length;

    indicatorTitleEl.textContent =
        json.title;

    currentSelection.textContent =
        `${state.year} • ${state.age} Years`;

    countryCounter.textContent =
        `Showing ${json.data.length} Countries`;
}

/* =========================
   MAIN RENDER
========================= */

function render() {

    if (!state.data) return;

    const hbscAvg = state.data.summary.hbsc_average_total;

    const enriched = state.data.data.map(c => {

        const girls = c.girls ?? 0;
        const boys = c.boys ?? 0;
        const avg = (girls + boys) / 2;

        return {
            ...c,
            girls,
            boys,
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
                    <strong>${c.girls ?? "-"}%</strong>
                </div>

                <div>
                    <span>Boys</span>
                    <strong>${c.boys ?? "-"}%</strong>
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

    const avg =
        ((country.girls ?? 0) + (country.boys ?? 0)) / 2;

    const diff = avg - hbscAvg;

    modalFlag.src =
        `assets/flags/${formatFlag(country.country)}.svg`;

    modalFlag.alt = `${country.country} flag`;

    modalCountry.textContent = country.country;

    modalIndicator.textContent = state.data.title;

    girlsValue.textContent = `${country.girls}%`;

    boysValue.textContent = `${country.boys}%`;

    averageCountry.textContent =
        avg.toFixed(1) + "%";

    averageHBSC.textContent =
        hbscAvg + "%";

    differenceValue.textContent =
        `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;

    modal.style.display = "flex";

}

/* =========================
   FLAGS
========================= */



function formatFlag(country) {

    const map = {
        "Czech Republic": "cz",
        "Czechia": "cz",
        "Portugal": "pt",
        "Spain": "es",
        "Italy": "it",
        "Russian Federation": "ru",
        "Republic of Moldova": "md",
        "Israel" : "il",
        "Azerbaijan" : "az",
        "Denmark (Greenland)" : "gl",
        "Macedonia": "mk",
        "Netherlands": "nl",
        "Belgium (Flemish)": "be",
        "Belgium (French)": "be",
        "Armenia" : "am",
        "Canada" : "ca",
        "Tajikistan" : "tj",
        "Kyrgyzstan" : "kg",
        "Kazakhstan" : "kz",
        "Albania": "al",
        "Austria": "at",
        "Bulgaria": "bg",
        "Croatia": "hr",
        "Cyprus": "cy",
        "Denmark": "dk",
        "England": "gb-eng",
        "Estonia": "ee",
        "Finland": "fi",
        "France": "fr",
        "Georgia": "ge",
        "Germany": "de",
        "Greece": "gr",
        "Greenland": "gl",
        "Hungary": "hu",
        "Iceland": "is",
        "Ireland": "ie",
        "Latvia": "lv",
        "Lithuania": "lt",
        "Luxembourg": "lu",
        "Malta": "mt",
        "Netherlands (Kingdom of the)": "nl",
        "Norway": "no",
        "Poland": "pl",
        "Romania": "ro",
        "Scotland": "gb-sct",
        "Serbia": "rs",
        "Slovakia": "sk",
        "Slovenia": "si",
        "Sweden": "se",
        "Switzerland": "ch",
        "Ukraine": "ua",
        "United Kingdom (England)": "gb-eng",
        "United Kingdom (Scotland)": "gb-sct",
        "United Kingdom (Wales)": "gb-wls",
        "Wales": "gb-wls"
    };
    return map[country] || country
        .toLowerCase()
        .replace(/\s/g, "-")
        .replace(/[()]/g, "");
}