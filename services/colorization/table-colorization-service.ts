import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IRGB, RGB} from "@/interfaces/i-rgb";

async function depthOfBookByOrder(data: Array<IDepthByOrder>,
                                  colours: {
                                      bid: IRGB,
                                      ask: IRGB
                                  },
                                  dataLength: number,
                                  showCount: number,
                                  cellCount: number,
                                  colorizeCount: number,
                                  isReverseAskColours: boolean
): Promise<Array<ITableRow>> {

    const bidPricesMap = new Map<string, number>();
    const askPricesMap = new Map<string, number>();
    let rows: Array<ITableRow> = [];
    let prevBidPrice: string | null = "";
    let prevAskPrice: string | null = "";
    let prevBidRGB = {};
    let prevAskRGB = {};
    let bidIdx = 0;
    let askIdx = 0;

    const limitedData = [...data.slice(0, dataLength)];

    const rgb = {
        bid: new RGB(colours.bid.red, colours.bid.green, colours.bid.blue),
        ask: new RGB(colours.ask.red, colours.ask.green, colours.ask.blue),
    }

    limitedData.forEach((s) => {
        const bidPrice = s.bid_price;
        if (bidPrice !== null && bidPricesMap.size < showCount) {
            bidPricesMap.set(bidPrice.toString(), (bidPricesMap.get(bidPrice.toString()) ?? 0) + 1);
        }

        const askPrice = s.offer_price;
        if (askPrice !== null && askPricesMap.size < showCount) {
            askPricesMap.set(askPrice.toString(), (askPricesMap.get(askPrice.toString()) ?? 0) + 1);
        }
    });


    const bidPricesMapSize = bidPricesMap.size
    const askPricesMapSize = askPricesMap.size

    limitedData.forEach((order: IDepthByOrder, index: number) => {
        const idx = index % showCount
        let cells: Array<ITableCell> = [];
        const bidPrice = order.bid_price;
        const askPrice = order.offer_price;
        let bidStyle = rgb.bid;
        let askStyle = rgb.ask;

        let bidRGB = {}
        let askRGB = {}

        if (bidPrice !== null) {
            const idx = Math.abs((((bidPricesMapSize === 1 && sumValues(bidPricesMap) > 1) ? sumValues(bidPricesMap) : bidPricesMapSize) - (bidIdx % showCount)) / showCount);
            bidRGB = bidStyle.toStyleString(idx);
            if (bidPrice === prevBidPrice && prevBidRGB && !(bidPricesMapSize === 1 && sumValues(bidPricesMap) > 1)) {
                bidRGB = prevBidRGB;
            } else {
                bidIdx += 1
            }
        }


        if (askPrice !== null) {
            const idx = Math.abs((((askPricesMapSize === 1 && sumValues(askPricesMap) > 1) ? sumValues(askPricesMap) : askPricesMapSize) - (askIdx % showCount)) / showCount);
            askRGB = askStyle.toStyleString(idx);

            if (askPrice === prevAskPrice && prevAskRGB && !(askPricesMapSize === 1 && sumValues(askPricesMap) > 1)) {
                askRGB = prevAskRGB;
            } else {
                askIdx += 1;
            }
        }

        for (let i = 0; i < cellCount / 2; i++) {
            cells.push({index: i, style: bidRGB});
        }

        for (let i = cellCount / 2; i < cellCount; i++) {
            cells.push({index: i, style: askRGB});
        }

        cells = cells.map(cell => ({...cell, className: 'colorize'}));


        rows.push({index, cell: cells});

        prevBidPrice = bidPrice;
        prevAskPrice = askPrice;
        prevBidRGB = bidRGB;
        prevAskRGB = askRGB;
    });

    if (isReverseAskColours) {
        const bidLength = sumValues(bidPricesMap);
        const rowsBid = rows.slice(0, bidLength);
        const rowsAsk = rows.slice(bidLength).reverse();
        rows = [...rowsBid, ...rowsAsk];
    }

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
