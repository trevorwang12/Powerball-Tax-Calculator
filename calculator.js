// Core calculation functions

function calculateFederalTax(income, filingStatus) {
    const brackets = FEDERAL_TAX_BRACKETS[filingStatus];
    let tax = 0;

    for (const bracket of brackets) {
        if (income <= bracket.min) break;

        const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
        tax += taxableInThisBracket * bracket.rate;
    }

    return tax;
}

function calculateStateTax(income, state) {
    const stateData = STATE_TAX_DATA[state];
    if (!stateData || !stateData.taxesWinnings) return 0;

    return income * stateData.rate;
}

function calculateLumpSumResults(advertisedJackpot, lumpSumPercentage, state, filingStatus) {
    // Calculate actual cash value
    const cashValue = advertisedJackpot * (lumpSumPercentage / 100);

    // Federal calculations
    const federalWithholding = cashValue * FEDERAL_WITHHOLDING_RATE;
    const totalFederalTax = calculateFederalTax(cashValue, filingStatus);
    const federalShortage = totalFederalTax - federalWithholding;

    // State calculations
    const stateTax = calculateStateTax(cashValue, state);

    // Net amount
    const netAmount = cashValue - totalFederalTax - stateTax;

    return {
        cashValue,
        federalWithholding,
        totalFederalTax,
        federalShortage,
        stateTax,
        netAmount
    };
}

function calculateAnnuityResults(advertisedJackpot, state, filingStatus) {
    // Use the advertised jackpot directly for annuity calculations
    const annuityValue = advertisedJackpot;

    // Calculate first year payment using growing annuity formula
    const growthRate = ANNUITY_GROWTH_RATE;
    const years = ANNUITY_YEARS;

    // Correct growing annuity formula: PV = PMT * [(1 - (1+g)^-n) / (r - g)]
    // But we need to solve for PMT given the total payout, not PV
    // For growing annuity where total = sum of all payments:
    // PMT * [(1+g)^n - 1] / g = Total
    const denominator = (Math.pow(1 + growthRate, years) - 1) / growthRate;
    const firstYearPayment = annuityValue / denominator;

    // Calculate final year payment
    const finalYearPayment = firstYearPayment * Math.pow(1 + growthRate, years - 1);

    // Calculate total tax burden over 30 years
    let totalFederalTaxes = 0;
    let totalStateTaxes = 0;
    let totalNetPayments = 0;

    for (let year = 0; year < years; year++) {
        const yearlyPayment = firstYearPayment * Math.pow(1 + growthRate, year);
        const yearlyFederalTax = calculateFederalTax(yearlyPayment, filingStatus);
        const yearlyStateTax = calculateStateTax(yearlyPayment, state);
        const yearlyNet = yearlyPayment - yearlyFederalTax - yearlyStateTax;

        totalFederalTaxes += yearlyFederalTax;
        totalStateTaxes += yearlyStateTax;
        totalNetPayments += yearlyNet;
    }

    // First year after taxes
    const firstYearFederalTax = calculateFederalTax(firstYearPayment, filingStatus);
    const firstYearStateTax = calculateStateTax(firstYearPayment, state);
    const firstYearNet = firstYearPayment - firstYearFederalTax - firstYearStateTax;

    return {
        annuityValue,
        firstYearPayment: firstYearNet,
        finalYearPayment,
        totalNetPayments,
        totalFederalTaxes,
        totalStateTaxes,
        totalTaxes: totalFederalTaxes + totalStateTaxes
    };
}

function calculateBreakevenRate(lumpSumNet, annuityTotalNet) {
    // Calculate required annual return rate
    // lumpSumNet * (1 + r)^30 = annuityTotalNet
    // r = (annuityTotalNet / lumpSumNet)^(1/30) - 1

    if (lumpSumNet <= 0) return 0;

    const ratio = annuityTotalNet / lumpSumNet;
    const breakevenRate = Math.pow(ratio, 1/30) - 1;

    return Math.max(0, breakevenRate);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercentage(rate) {
    return (rate * 100).toFixed(2) + '%';
}

function populateStateDropdown() {
    const stateSelect = document.getElementById('state');

    // Clear existing options except the first one
    while (stateSelect.children.length > 1) {
        stateSelect.removeChild(stateSelect.lastChild);
    }

    // Add only states that participate in Powerball
    Object.entries(STATE_TAX_DATA)
        .filter(([code, data]) => data.hasLottery)
        .sort(([, a], [, b]) => a.name.localeCompare(b.name))
        .forEach(([code, data]) => {
            const option = document.createElement('option');
            option.value = code;

            // Add tax info to state name
            if (data.taxesWinnings) {
                option.textContent = `${data.name} (${(data.rate * 100).toFixed(1)}% tax)`;
            } else {
                option.textContent = `${data.name} (Tax-Free)`;
            }

            stateSelect.appendChild(option);
        });
}

function validate() {
    const advertisedJackpotRaw = document.getElementById('advertisedJackpot').value;
    const lumpSumPercentageRaw = document.getElementById('lumpSumPercentage').value;

    // Remove formatting for parsing
    const advertisedJackpot = parseFloat(unformatNumber(advertisedJackpotRaw));
    const lumpSumPercentage = parseFloat(unformatNumber(lumpSumPercentageRaw));
    const state = document.getElementById('state').value;
    const filingStatus = document.getElementById('filingStatus').value;

    let errors = [];

    if (!advertisedJackpot || advertisedJackpot <= 0) {
        errors.push('Please enter a valid advertised jackpot amount');
    }

    if (!lumpSumPercentage || lumpSumPercentage <= 0 || lumpSumPercentage > 100) {
        errors.push('Please enter a valid lump sum percentage (1-100)');
    }

    if (!state) {
        errors.push('Please select a state');
    }

    if (!filingStatus) {
        errors.push('Please select a filing status');
    }

    return {
        valid: errors.length === 0,
        errors,
        values: { advertisedJackpot, lumpSumPercentage, state, filingStatus }
    };
}

function calculate() {
    const validation = validate();

    if (!validation.valid) {
        alert('Please fix the following errors:\n' + validation.errors.join('\n'));
        return;
    }

    const { advertisedJackpot, lumpSumPercentage, state, filingStatus } = validation.values;

    // Calculate lump sum results
    const lumpSum = calculateLumpSumResults(advertisedJackpot, lumpSumPercentage, state, filingStatus);

    // Calculate annuity results
    const annuity = calculateAnnuityResults(advertisedJackpot, state, filingStatus);

    // Calculate breakeven rate
    const breakevenRate = calculateBreakevenRate(lumpSum.netAmount, annuity.totalNetPayments);

    // Display results
    displayResults(lumpSum, annuity, breakevenRate);
}

function displayResults(lumpSum, annuity, breakevenRate) {
    // Show results section
    document.getElementById('results').style.display = 'block';

    // Calculate additional federal tax (shortage)
    const lumpSumAddlFed = lumpSum.federalShortage;

    // Use the correctly calculated 30-year federal tax
    const annuityWithholdingTotal = annuity.annuityValue * FEDERAL_WITHHOLDING_RATE;
    const annuityAddlFed = annuity.totalFederalTaxes - annuityWithholdingTotal;

    // Gross payout row
    document.getElementById('lumpSumGross').textContent = formatCurrency(lumpSum.cashValue);
    document.getElementById('annuityGross').textContent = formatCurrency(annuity.annuityValue);
    document.getElementById('grossDifference').textContent = formatCurrency(annuity.annuityValue - lumpSum.cashValue);

    // Federal withholding 24% row
    const lumpSumWithholding = lumpSum.cashValue * FEDERAL_WITHHOLDING_RATE;
    document.getElementById('lumpSumWithholding').textContent = formatCurrency(lumpSumWithholding);
    document.getElementById('annuityWithholding').textContent = formatCurrency(annuityWithholdingTotal);
    document.getElementById('withholdingDifference').textContent = formatCurrency(annuityWithholdingTotal - lumpSumWithholding);

    // Additional federal tax row
    document.getElementById('lumpSumAddlFed').textContent = formatCurrency(lumpSumAddlFed);
    document.getElementById('annuityAddlFed').textContent = formatCurrency(Math.max(0, annuityAddlFed));
    document.getElementById('addlFedDifference').textContent = formatCurrency(Math.max(0, annuityAddlFed) - lumpSumAddlFed);

    // State tax row - use correctly calculated 30-year state tax
    document.getElementById('lumpSumStateTax').textContent = formatCurrency(lumpSum.stateTax);
    document.getElementById('annuityStateTax').textContent = formatCurrency(annuity.totalStateTaxes);
    document.getElementById('stateTaxDifference').textContent = formatCurrency(annuity.totalStateTaxes - lumpSum.stateTax);

    // Net payout row (final results)
    document.getElementById('lumpSumNet').textContent = formatCurrency(lumpSum.netAmount);
    document.getElementById('annuityNet').textContent = formatCurrency(annuity.totalNetPayments);
    document.getElementById('netDifference').textContent = formatCurrency(annuity.totalNetPayments - lumpSum.netAmount);

    // Breakeven analysis
    document.getElementById('breakevenRate').textContent = formatPercentage(breakevenRate);
    document.getElementById('firstYearAnnuity').textContent = formatCurrency(annuity.firstYearPayment);

    // Generate and display annuity schedule
    generateAnnuitySchedule(annuity);

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function generateAnnuitySchedule(annuity) {
    const { advertisedJackpot, lumpSumPercentage, state, filingStatus } = validate().values;

    // Show the annuity schedule section
    document.getElementById('annuitySchedule').style.display = 'block';

    // Calculate detailed year-by-year breakdown
    const scheduleData = calculateDetailedAnnuitySchedule(advertisedJackpot, state, filingStatus);

    // Populate summary information
    document.getElementById('scheduleTotalNet').textContent = formatCurrency(annuity.totalNetPayments);
    document.getElementById('scheduleTotalTax').textContent = formatCurrency(annuity.totalTaxes);
    document.getElementById('scheduleAverage').textContent = formatCurrency(annuity.totalNetPayments / 30);

    // Populate the table
    const tableBody = document.getElementById('scheduleTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    let cumulativeNet = 0;

    scheduleData.forEach((yearData, index) => {
        cumulativeNet += yearData.netPayment;

        const row = document.createElement('tr');

        // Highlight milestone years
        if ([0, 4, 9, 14, 19, 24, 29].includes(index)) {
            row.classList.add('milestone-year');
        }

        row.innerHTML = `
            <td class="year-cell">${yearData.year}</td>
            <td class="currency-cell">${formatCurrency(yearData.grossPayment)}</td>
            <td class="currency-cell">${formatCurrency(yearData.federalTax)}</td>
            <td class="currency-cell">${formatCurrency(yearData.stateTax)}</td>
            <td class="currency-cell net-payment">${formatCurrency(yearData.netPayment)}</td>
            <td class="currency-cell cumulative">${formatCurrency(cumulativeNet)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function calculateDetailedAnnuitySchedule(advertisedJackpot, state, filingStatus) {
    const annuityValue = advertisedJackpot;
    const growthRate = ANNUITY_GROWTH_RATE;
    const years = ANNUITY_YEARS;

    // Calculate first year payment using growing annuity formula
    const denominator = (Math.pow(1 + growthRate, years) - 1) / growthRate;
    const firstYearPayment = annuityValue / denominator;

    const scheduleData = [];

    for (let year = 0; year < years; year++) {
        const grossPayment = firstYearPayment * Math.pow(1 + growthRate, year);
        const federalTax = calculateFederalTax(grossPayment, filingStatus);
        const stateTax = calculateStateTax(grossPayment, state);
        const netPayment = grossPayment - federalTax - stateTax;

        scheduleData.push({
            year: year + 1,
            grossPayment,
            federalTax,
            stateTax,
            netPayment
        });
    }

    return scheduleData;
}

// Toggle schedule visibility
function initializeScheduleToggle() {
    const toggleButton = document.getElementById('toggleSchedule');
    const scheduleContent = document.getElementById('scheduleContent');

    toggleButton.addEventListener('click', function() {
        const isVisible = scheduleContent.style.display !== 'none';

        if (isVisible) {
            scheduleContent.style.display = 'none';
            toggleButton.textContent = '▼ Show Full Schedule';
            toggleButton.classList.remove('expanded');
        } else {
            scheduleContent.style.display = 'block';
            toggleButton.textContent = '▲ Hide Full Schedule';
            toggleButton.classList.add('expanded');
        }
    });
}

// Initialize FAQ accordion
function initializeFAQAccordion() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                const otherAnswer = item.querySelector('.faq-answer');
                otherAnswer.style.maxHeight = null;
            });

            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// Number formatting functions
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function unformatNumber(str) {
    return str.replace(/,/g, '');
}

function formatNumberInput(input) {
    let value = input.value;
    let cursorPosition = input.selectionStart;
    let unformattedValue = unformatNumber(value);

    // Only format if it's a valid number
    if (!isNaN(unformattedValue) && unformattedValue !== '') {
        let formattedValue = formatNumber(unformattedValue);

        // Calculate new cursor position
        let commasBeforeCursor = (value.substring(0, cursorPosition).match(/,/g) || []).length;
        let commasInFormatted = (formattedValue.match(/,/g) || []).length;
        let newCursorPosition = cursorPosition + (commasInFormatted - commasBeforeCursor);

        input.value = formattedValue;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
}

function initializeNumberFormatting() {
    // Target specific inputs that need formatting
    const jackpotInput = document.getElementById('advertisedJackpot');

    if (jackpotInput) {
        // Format on input
        jackpotInput.addEventListener('input', function(e) {
            formatNumberInput(this);
        });

        // Handle paste events
        jackpotInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                formatNumberInput(this);
            }, 10);
        });

        // Restrict to numbers only
        jackpotInput.addEventListener('keydown', function(e) {
            // Allow: backspace, delete, tab, escape, enter, comma
            if ([46, 8, 9, 27, 13, 188].indexOf(e.keyCode) !== -1 ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (e.keyCode === 65 && e.ctrlKey === true) ||
                (e.keyCode === 67 && e.ctrlKey === true) ||
                (e.keyCode === 86 && e.ctrlKey === true) ||
                (e.keyCode === 88 && e.ctrlKey === true) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    populateStateDropdown();
    initializeScheduleToggle();
    initializeFAQAccordion();
    initializeNumberFormatting();
});