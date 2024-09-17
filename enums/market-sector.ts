export enum MarketSector {
    CONSUMER_DISCRETIONARY = 'Consumer Discretionary',
    COMMUNICATION_SERVICES = 'Communication Services',
    CONSUMER_STAPLES = 'Consumer Staples',
    EDUCATION = 'Education',
    ENERGY = 'Energy',
    ENTERPRISE = 'Enterprise',
    FINANCIALS = 'Financials',
    FINANCIAL_ASSET_CRYPTO = 'Financial Asset (Crypto)',
    HARDWARE = 'Hardware',
    HEALTHCARE = 'Healthcare',
    INDUSTRIALS = 'Industrials',
    INFORMATION_TECHNOLOGY = 'Information Technology',
    MATERIALS = 'Materials',
    REAL_ESTATE = 'Real Estate',
    UTILITIES = 'Utilities',
}

export enum MarketSectorCategory_1 {
    CONTENT = 'Content',
    GAMING = 'Gaming',
}

export enum MarketSectorCategory_2 {
    ONLINE_LEARNING_PLATFORMS = 'Online Learning Platforms',
    PROFESSIONAL_EDUCATION = 'Professional Education',
    STUDENT_AND_CLASSROOM_SERVICES = 'Student & Classroom Services'
}

export enum MarketSectorCategory_3 {
    BATTERIES_AND_CHARGING = 'Batteries & Charging'
}

export enum MarketSectorCategory_4 {
    AI_ML = "AI/ML",
    AUTONOMOUS_DRIVING_SYSTEMS = "Autonomous Driving Systems",
    CLOUD_INFRASTRUCTURE = "Cloud & Infrastructure",
    CYBERSECURITY = "Cybersecurity",
    DEVELOPER_TOOLS = "Developer Tools",
    ENGINEERING_ARCHITECTURE = "Engineering & Architecture",
    MARKETING = "Marketing",
    OTHER_SOFTWARE_SERVICES = "Other Software & Services",
    PRODUCTIVITY_COLLABORATION = "Productivity & Collaboration",
    SALES_SUPPORT = "Sales & Support",
    SECURITY_DEFENSE = "Security & Defense",
    TALENT_HR = "Talent & HR",
    VIDEO_COMMUNICATION = "Video & Communication"
}

export enum MarketSectorCategory_5 {
    CAPITAL_MARKETS = "Capital Markets",
    CARDS_BANKING_B2C = "Cards & Banking (B2C)",
    FINANCIAL_INFRASTRUCTURE = "Financial Infrastructure",
    FINANCIAL_INSIGHTS_ANALYTICS = "Financial Insights & Analytics",
    INSURANCE_SERVICES = "Insurance Services",
    INTEGRATED_PAYMENT_SYSTEMS = "Integrated Payment Systems",
    LIFE_HEALTH_INSURANCE = "Life & Health Insurance",
    MERCHANT_SERVICES = "Merchant Services",
    MULTI_LINE_OTHER_INSURANCE = "Multi-Line & Other Insurance"
}

export enum MarketSectorCategory_6 {
    CRYPTO_GAMING_NFTS = "Crypto Gaming & NFTs",
    CRYPTO_INFRASTRUCTURE = "Crypto Infrastructure",
    CRYPTO_BLOCKCHAIN = "Crypto / Blockchain"
}

export enum MarketSectorCategory_7 {
    MEDICAL_EQUIPMENT_DEVICES = "Medical Equipment & Devices",
    ROCKETS_SPACECRAFT = "Rockets & Spacecraft",
    SATELLITES_LEO = "Satellites & LEO",
    SEMICONDUCTORS = "Semiconductors"
}

export enum MarketSectorCategory_8 {
    BIOTECH_TOOLS_PLATFORMS = "Biotech Tools & Platforms",
    DRUG_DISCOVERY_DEVELOPMENT = "Drug Discovery & Development",
    HEALTHCARE_SYSTEMS = "Healthcare Systems",
    TELEHEALTH_TELEMED = "Telehealth / Telemed"
}

export enum MarketSectorCategory_9 {
    SPECIALTY_MATERIALS_TEXTILES = "Specialty Materials & Textiles"
}

export const MarketSectorCategory = {
    [MarketSector.CONSUMER_DISCRETIONARY]: MarketSectorCategory_1,
    [MarketSector.EDUCATION]: MarketSectorCategory_2,
    [MarketSector.ENERGY]: MarketSectorCategory_3,
    [MarketSector.ENTERPRISE]: MarketSectorCategory_4,
    [MarketSector.FINANCIALS]: MarketSectorCategory_5,
    [MarketSector.FINANCIAL_ASSET_CRYPTO]: MarketSectorCategory_6,
    [MarketSector.HARDWARE]: MarketSectorCategory_7,
    [MarketSector.HEALTHCARE]: MarketSectorCategory_8,
    [MarketSector.MATERIALS]: MarketSectorCategory_9,
}

export function getMarketSectorCategory(value: string): any {
    return MarketSectorCategory[value as keyof typeof MarketSectorCategory]
}
