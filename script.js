const budgetRows = [
    { month: "January", planned: 22500, actual: 21850, variance: -650, status: "On track" },
    { month: "February", planned: 23000, actual: 24200, variance: 1200, status: "Review" },
    { month: "March", planned: 24500, actual: 24450, variance: -50, status: "On track" },
    { month: "April", planned: 23800, actual: 22900, variance: -900, status: "On track" },
    { month: "May", planned: 25200, actual: 26100, variance: 900, status: "Review" },
    { month: "June", planned: 26000, actual: 25800, variance: -200, status: "On track" },
    { month: "July", planned: 24800, actual: 23950, variance: -850, status: "On track" },
    { month: "August", planned: 25500, actual: 26750, variance: 1250, status: "Review" },
    { month: "September", planned: 23900, actual: 23850, variance: -50, status: "On track" },
    { month: "October", planned: 26200, actual: 25600, variance: -600, status: "On track" },
    { month: "November", planned: 27000, actual: 28200, variance: 1200, status: "Over budget" },
    { month: "December", planned: 25430, actual: 28485, variance: 3055, status: "Over budget" }
];

const monthOrder = budgetRows.map((row) => row.month);
let activeSort = { key: "month", direction: "asc" };

const css = getComputedStyle(document.documentElement);
const colors = {
    primary: css.getPropertyValue("--primary").trim(),
    success: css.getPropertyValue("--success").trim(),
    warning: css.getPropertyValue("--warning").trim(),
    error: css.getPropertyValue("--error").trim(),
    textMuted: css.getPropertyValue("--text-muted").trim(),
    border: css.getPropertyValue("--border").trim()
};

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

const compactCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
});

function renderBudgetTable() {
    const tableBody = document.querySelector("#budgetTable tbody");
    const sortedRows = [...budgetRows].sort((a, b) => {
        let first = a[activeSort.key];
        let second = b[activeSort.key];

        if (activeSort.key === "month") {
            first = monthOrder.indexOf(first);
            second = monthOrder.indexOf(second);
        }

        if (typeof first === "string") {
            return activeSort.direction === "asc"
                ? first.localeCompare(second)
                : second.localeCompare(first);
        }

        return activeSort.direction === "asc" ? first - second : second - first;
    });

    tableBody.innerHTML = sortedRows.map((row) => {
        const varianceClass = row.variance > 0 ? "positive-var" : "negative-var";
        const statusClass = row.status.toLowerCase().replace(/\s+/g, "-");
        const variancePrefix = row.variance > 0 ? "+" : "";

        return `
            <tr>
                <td>${row.month}</td>
                <td class="money">${currency.format(row.planned)}</td>
                <td class="money">${currency.format(row.actual)}</td>
                <td class="${varianceClass}">${variancePrefix}${currency.format(row.variance)}</td>
                <td><span class="status-badge ${statusClass}">${row.status}</span></td>
            </tr>
        `;
    }).join("");

    document.querySelectorAll("[data-sort]").forEach((button) => {
        button.classList.toggle("sorted-asc", activeSort.key === button.dataset.sort && activeSort.direction === "asc");
        button.classList.toggle("sorted-desc", activeSort.key === button.dataset.sort && activeSort.direction === "desc");
    });
}

function setupTableSorting() {
    document.querySelectorAll("[data-sort]").forEach((button) => {
        button.addEventListener("click", () => {
            const key = button.dataset.sort;
            activeSort = {
                key,
                direction: activeSort.key === key && activeSort.direction === "asc" ? "desc" : "asc"
            };
            renderBudgetTable();
        });
    });
}

function baseChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: "index"
        },
        plugins: {
            legend: {
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    color: colors.textMuted,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: "#111827",
                padding: 12,
                titleFont: { weight: "700" },
                bodySpacing: 6,
                cornerRadius: 10,
                displayColors: false
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: colors.textMuted }
            },
            y: {
                border: { display: false },
                grid: { color: colors.border },
                ticks: {
                    color: colors.textMuted,
                    callback: (value) => compactCurrency.format(value)
                }
            }
        }
    };
}

function createGradient(chart, topColor, bottomColor) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return topColor;

    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    return gradient;
}

function createCharts() {
    Chart.defaults.font.family = "Inter, sans-serif";
    Chart.defaults.color = colors.textMuted;

    new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [{
                label: "Revenue",
                data: [38400, 40100, 43200, 42800, 45200, 47100, 46600, 48900, 50100, 51400, 53300, 54800],
                borderColor: colors.primary,
                backgroundColor: (context) => createGradient(context.chart, "rgba(37, 99, 235, 0.22)", "rgba(37, 99, 235, 0.02)"),
                borderWidth: 3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                tension: 0.38
            }]
        },
        options: baseChartOptions()
    });

    new Chart(document.getElementById("budgetChart"), {
        type: "bar",
        data: {
            labels: ["Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: "Planned",
                    data: [25500, 23900, 26200, 27000, 25430],
                    backgroundColor: "rgba(37, 99, 235, 0.18)",
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: "Actual",
                    data: [26750, 23850, 25600, 28200, 28485],
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    borderSkipped: false
                }
            ]
        },
        options: {
            ...baseChartOptions(),
            scales: {
                ...baseChartOptions().scales,
                x: { ...baseChartOptions().scales.x, stacked: false },
                y: { ...baseChartOptions().scales.y, beginAtZero: true }
            }
        }
    });

    new Chart(document.getElementById("cashFlowChart"), {
        type: "line",
        data: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
            datasets: [{
                label: "Cash flow",
                data: [10600, 12100, 11700, 14300, 15890],
                borderColor: colors.success,
                backgroundColor: (context) => createGradient(context.chart, "rgba(4, 120, 87, 0.22)", "rgba(4, 120, 87, 0.02)"),
                borderWidth: 3,
                fill: true,
                pointRadius: 0,
                tension: 0.42
            }]
        },
        options: baseChartOptions()
    });

    createSparkline("budgetSpark", [21, 23, 24, 23, 25, 26, 28], colors.error);
    createSparkline("revenueSpark", [36, 38, 41, 40, 44, 46, 48], colors.success);
    createSparkline("invoiceSpark", [18, 16, 15, 14, 13, 12, 12.3], colors.warning);
    createSparkline("cashSpark", [9, 10, 11, 13, 12, 14, 15.8], colors.primary);
}

function createSparkline(id, values, color) {
    new Chart(document.getElementById(id), {
        type: "line",
        data: {
            labels: values.map((_, index) => index + 1),
            datasets: [{
                data: values,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                line: { capBezierPoints: true }
            }
        }
    });
}

function setupInteractions() {
    const sidebar = document.querySelector(".sidebar");
    const mobileMenu = document.querySelector(".mobile-menu");

    mobileMenu.addEventListener("click", () => {
        const isOpen = sidebar.classList.toggle("open");
        mobileMenu.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelectorAll(".nav-item").forEach((item) => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach((link) => link.classList.remove("active"));
            item.classList.add("active");
            sidebar.classList.remove("open");
            mobileMenu.setAttribute("aria-expanded", "false");
        });
    });

    const profileButton = document.querySelector(".profile-button");
    const profileMenu = document.querySelector(".profile-menu");

    profileButton.addEventListener("click", () => {
        const isOpen = profileMenu.classList.toggle("open");
        profileButton.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".topbar-actions")) {
            profileMenu.classList.remove("open");
            profileButton.setAttribute("aria-expanded", "false");
        }

        if (!event.target.closest(".sidebar") && !event.target.closest(".mobile-menu")) {
            sidebar.classList.remove("open");
            mobileMenu.setAttribute("aria-expanded", "false");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderBudgetTable();
    setupTableSorting();
    setupInteractions();

    if (window.Chart) {
        createCharts();
    }
});
