import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IRGB, RGB} from "@/interfaces/i-rgb";

function depthOfBookByOrder(data: Array<IDepthByOrder>,
                            colours: {
                                bid: IRGB,
                                ask: IRGB
                            },
                            limit: number): Array<ITableRow> {

    const bidPricesMap = new Map<string, number>();
    const askPricesMap = new Map<string, number>();
    const rows: Array<ITableRow> = [];
    let prevBidPrice = "";
    let prevAskPrice = "";
    let prevBidRGB = {};
    let prevAskRGB = {};
    let bidIdx = 0;
    let askIdx = 0;
    const limitedData = [...data.slice(0, limit)];
    const rgb = {
        bid: new RGB(colours.bid.red, colours.bid.green, colours.bid.blue),
        ask: new RGB(colours.ask.red, colours.ask.green, colours.ask.blue),
    }

    limitedData.forEach((s) => {
        const bidPrice = s.bid_price;
        if (bidPrice !== null) {
            bidPricesMap.set(bidPrice.toString(), (bidPricesMap.get(bidPrice.toString()) ?? 0) + 1);
        }

        const askPrice = s.offer_price;
        if (askPrice !== null) {
            askPricesMap.set(askPrice.toString(), (askPricesMap.get(askPrice.toString()) ?? 0) + 1);
        }
    });

    const bidPricesMapSize = bidPricesMap.size
    const askPricesMapSize = askPricesMap.size

    limitedData.forEach((order: IDepthByOrder, index: number) => {
        const cells: Array<ITableCell> = [];
        const bidPrice = order.bid_price;
        const askPrice = order.offer_price;
        let bidStyle = rgb.bid;
        let askStyle = rgb.ask;

        let bidRGB = {}
        let askRGB = {}

        if (bidPrice !== null) {
            const idx = (((bidPricesMapSize === 1 && sumValues(bidPricesMap) > 1) ? sumValues(bidPricesMap) : bidPricesMapSize) - bidIdx) / 10;

            bidRGB = bidStyle.toStyleString(idx);
            if (bidPrice === prevBidPrice && prevBidRGB && !(bidPricesMapSize === 1 && sumValues(bidPricesMap) > 1)) {
                bidRGB = prevBidRGB;
            } else {
                bidIdx += 1
            }
        } else {
            bidIdx = index;
        }


        if (askPrice !== null) {
            const idx = (((askPricesMapSize === 1 && sumValues(askPricesMap) > 1) ? sumValues(askPricesMap) : askPricesMapSize) - askIdx) / 10;

            askRGB = askStyle.toStyleString(idx);

            if (askPrice === prevAskPrice && prevAskRGB && !(askPricesMapSize === 1 && sumValues(askPricesMap) > 1)) {
                askRGB = prevAskRGB;
            } else {
                askIdx += 1;
            }
        } else {
            askIdx = index;
        }

        for (let i = 0; i < 5; i++) {
            cells.push({index: i, style: bidRGB});
        }

        for (let i = 5; i < 10; i++) {
            cells.push({index: i, style: askRGB});
        }

        rows.push({index, cell: cells});

        prevBidPrice = bidPrice;
        prevAskPrice = askPrice;
        prevBidRGB = bidRGB;
        prevAskRGB = askRGB;
    });

    return rows;
}

function sumValues(map: Map<string, number>): number {
    let sum = 0;
    map.forEach((value) => {
        sum += value;
    });
    return sum;
}

const tableColorizationService = {
    depthOfBookByOrder
}

export default tableColorizationService;
