interface IDashboardSymbolRegistry {
    total_symbols: string;
    total_companies: string;
    unique_industries: string;
}


interface IDashboardCompanyProfile {
    average_market_cap: string;
    total_market_cap: string;
    number_of_companies: string;
}

interface IDashboardMarketDataSummary {
    total_volume: string;
    avg_sale_price: string;
    best_bid_price: string;
    best_offer_price: string;
    total_bid_volume: string;
    total_offer_volume: string;
    spread_price: string;
}

interface IDashboardBlockchainDataLastSale {
    total_volume: string;
    avg_amount: string;
}

interface IDashboardBlockchainDataBestBidAndBestOffer {
    total_volume: string;
    avg_amount: string;
    best_bid_price: string;
    best_offer_price: string;
}

interface IDashboardTOP5ActiveSymbols {
    symbol_name: string;
    logo: string | null;
    company_name: string;
    total_volume: string;
    avg_sale_price: string;
    best_bid_price: string;
    best_offer_price: string;
    total_bid_volume: string;
    total_offer_volume: string;
    spread_price: string;
}

interface IDashboardTOP5PercentageChange {
    symbol_name: string;
    logo: string | null;
    company_name: string;
    percentage_changed: string;
    volume: string;
    last_trade_price: string;
}


