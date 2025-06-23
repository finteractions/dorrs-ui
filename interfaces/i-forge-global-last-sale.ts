export interface IForgeGlobalLastSale {
    quantity: number,
    price: number,
    price_changed: number;
    date_time: string;

    company_name?:string;
    page_url?: string;
    first_date?:string;
    last_date?:string;
    total_records?:number;
}
