// Federal tax brackets for 2025
const FEDERAL_TAX_BRACKETS = {
    single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ],
    marriedJoint: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 }
    ],
    marriedSeparate: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 375800, rate: 0.35 },
        { min: 375800, max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 }
    ]
};

// State tax rates for lottery winnings - Based on professional tax analysis 2025
const STATE_TAX_DATA = {
    // States NOT participating in Powerball
    'AL': { name: 'Alabama', rate: 0, hasLottery: false, taxesWinnings: false },
    'AK': { name: 'Alaska', rate: 0, hasLottery: false, taxesWinnings: false },
    'HI': { name: 'Hawaii', rate: 0, hasLottery: false, taxesWinnings: false },
    'NV': { name: 'Nevada', rate: 0, hasLottery: false, taxesWinnings: false },
    'UT': { name: 'Utah', rate: 0, hasLottery: false, taxesWinnings: false },

    // Tax-Free States (No state income tax)
    'FL': { name: 'Florida', rate: 0, hasLottery: true, taxesWinnings: false },
    'NH': { name: 'New Hampshire', rate: 0, hasLottery: true, taxesWinnings: false },
    'SD': { name: 'South Dakota', rate: 0, hasLottery: true, taxesWinnings: false },
    'TN': { name: 'Tennessee', rate: 0, hasLottery: true, taxesWinnings: false },
    'TX': { name: 'Texas', rate: 0, hasLottery: true, taxesWinnings: false },
    'WA': { name: 'Washington', rate: 0, hasLottery: true, taxesWinnings: false },
    'WY': { name: 'Wyoming', rate: 0, hasLottery: true, taxesWinnings: false },

    // States with income tax but exempt in-state lottery winnings
    'CA': { name: 'California', rate: 0, hasLottery: true, taxesWinnings: false }, // Exempt for in-state lottery
    'DE': { name: 'Delaware', rate: 0, hasLottery: true, taxesWinnings: false }, // Exempt for in-state lottery
    'PA': { name: 'Pennsylvania', rate: 0, hasLottery: true, taxesWinnings: false }, // Exempt for in-state lottery

    // States that tax lottery winnings - Based on your professional analysis
    'AZ': { name: 'Arizona', rate: 0.025, hasLottery: true, taxesWinnings: true },
    'AR': { name: 'Arkansas', rate: 0.039, hasLottery: true, taxesWinnings: true }, // 3.9% withholding, progressive tax system
    'CO': { name: 'Colorado', rate: 0.044, hasLottery: true, taxesWinnings: true }, // Fixed rate
    'CT': { name: 'Connecticut', rate: 0.0699, hasLottery: true, taxesWinnings: true },
    'DC': { name: 'District of Columbia', rate: 0.1075, hasLottery: true, taxesWinnings: true },
    'GA': { name: 'Georgia', rate: 0.0575, hasLottery: true, taxesWinnings: true },
    'ID': { name: 'Idaho', rate: 0.058, hasLottery: true, taxesWinnings: true },
    'IL': { name: 'Illinois', rate: 0.0495, hasLottery: true, taxesWinnings: true }, // Fixed rate
    'IN': { name: 'Indiana', rate: 0.0315, hasLottery: true, taxesWinnings: true }, // Fixed rate
    'IA': { name: 'Iowa', rate: 0.057, hasLottery: true, taxesWinnings: true },
    'KS': { name: 'Kansas', rate: 0.057, hasLottery: true, taxesWinnings: true },
    'KY': { name: 'Kentucky', rate: 0.045, hasLottery: true, taxesWinnings: true },
    'LA': { name: 'Louisiana', rate: 0.0425, hasLottery: true, taxesWinnings: true },
    'ME': { name: 'Maine', rate: 0.0715, hasLottery: true, taxesWinnings: true },
    'MD': { name: 'Maryland', rate: 0.0895, hasLottery: true, taxesWinnings: true }, // Higher for non-residents
    'MA': { name: 'Massachusetts', rate: 0.05, hasLottery: true, taxesWinnings: true },
    'MI': { name: 'Michigan', rate: 0.0425, hasLottery: true, taxesWinnings: true },
    'MN': { name: 'Minnesota', rate: 0.0985, hasLottery: true, taxesWinnings: true },
    'MS': { name: 'Mississippi', rate: 0.05, hasLottery: true, taxesWinnings: true },
    'MO': { name: 'Missouri', rate: 0.0495, hasLottery: true, taxesWinnings: true },
    'MT': { name: 'Montana', rate: 0.069, hasLottery: true, taxesWinnings: true },
    'NE': { name: 'Nebraska', rate: 0.0664, hasLottery: true, taxesWinnings: true },
    'NJ': { name: 'New Jersey', rate: 0.1075, hasLottery: true, taxesWinnings: true }, // Highest rate
    'NM': { name: 'New Mexico', rate: 0.059, hasLottery: true, taxesWinnings: true },
    'NY': { name: 'New York', rate: 0.109, hasLottery: true, taxesWinnings: true }, // Plus NYC 3.876% for residents
    'NC': { name: 'North Carolina', rate: 0.0475, hasLottery: true, taxesWinnings: true },
    'ND': { name: 'North Dakota', rate: 0.029, hasLottery: true, taxesWinnings: true }, // Lowest taxing state
    'OH': { name: 'Ohio', rate: 0.0399, hasLottery: true, taxesWinnings: true },
    'OK': { name: 'Oklahoma', rate: 0.0475, hasLottery: true, taxesWinnings: true },
    'OR': { name: 'Oregon', rate: 0.099, hasLottery: true, taxesWinnings: true }, // High rate
    'RI': { name: 'Rhode Island', rate: 0.0599, hasLottery: true, taxesWinnings: true },
    'SC': { name: 'South Carolina', rate: 0.065, hasLottery: true, taxesWinnings: true },
    'VT': { name: 'Vermont', rate: 0.0875, hasLottery: true, taxesWinnings: true },
    'VA': { name: 'Virginia', rate: 0.0575, hasLottery: true, taxesWinnings: true },
    'WV': { name: 'West Virginia', rate: 0.065, hasLottery: true, taxesWinnings: true },
    'WI': { name: 'Wisconsin', rate: 0.0765, hasLottery: true, taxesWinnings: true }
};

// Constants
const FEDERAL_WITHHOLDING_RATE = 0.24;
const ANNUITY_GROWTH_RATE = 0.05;
const ANNUITY_YEARS = 30;