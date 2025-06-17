export interface IForgeGlobalCompany {
    id: number;
    page_url: string | null;
    image_url: string | null;
    company_name: string;
    sector: string | null;
    sub_sector: string | null;
    price: string | null;
    price_change: string | null;
    share_class: string | null;
    valuation: string | null;
    amount_raised: string | null;
    page: number | null;
    forge_global_company_detail: IForgeGlobalCompanyDetail[];
}

export interface IForgeGlobalCompanyDetail {
    id: number;
    url: string | null;
    website: string | null;
    description: string | null;
    sector: string | null;
    sub_sector: string | null;
    founded: string | null;
    headquarters: string | null;
    post_money_valuation: string | null;
    total_funding: string | null;
    lfr_price_per_share: string | null;
    last_funding_share_class: string | null;
    fundings: any[];
    peoples: IPeople[];
    investors_other_investments: any[];
    news: INewsItem[];
    similar_companies: ISimilarCompany[];
    company: number;
}

export interface IPeople {
    name: string;
    title: string;
}

export interface INewsItem {
    date: string;
    link: string;
    name: string;
    title: string;
    description: string;
}

export interface ISimilarCompany {
    link: string;
    name: string;
}
