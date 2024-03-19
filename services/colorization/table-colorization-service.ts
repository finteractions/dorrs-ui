import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IRGB} from "@/interfaces/i-rgb";


function depthOfBookByOrder(data: Array<IDepthByOrder>, colours: { bid: IRGB, ask: IRGB }): Array<ITableRow> {
    const reversedData = data.reverse();
    const rows: Array<ITableRow> = [];
    let prevBidPrice = "";
    let prevAskPrice = "";
    const colourPalette = { ...colours }

    // reversedData.forEach((order: IDepthByOrder, index: number) => {
    //     const cells: Array<ITableCell> = [];
    //     const bidPrice = order.bid_price;
    //     const askPrice = order.offer_price;
    //     let bidStyle = colourPalette.bid;
    //     let askStyle = colourPalette.ask;
    //
    //     let bidRGB = {}
    //
    //     if (bidPrice !== prevBidPrice && bidPrice !== null) {
    //         bidStyle.red -= 3
    //         bidStyle.blue -= 3
    //
    //         bidRGB = bidStyle.toStyleString();
    //     }
    //
    //     if (bidPrice === null) {
    //         bidRGB = bidStyle.toStyleString()
    //     }
    //
    //     let askRGB = {}
    //
    //     if (askPrice !== prevAskPrice && askPrice !== null) {
    //         askStyle.green -= 3
    //         askStyle.blue -= 3
    //
    //         askRGB = askStyle.toStyleString();
    //     }
    //
    //     if (bidPrice === null) {
    //         askRGB = askStyle.toStyleString()
    //     }
    //
    //     for (let i = 0; i < 5; i++) {
    //         cells.push({index: i + 1, style: bidRGB});
    //     }
    //
    //     for (let i = 5; i < 10; i++) {
    //         cells.push({index: i + 1, style: askRGB});
    //     }
    //
    //     rows.push({index, cell: cells});
    //
    //     prevBidPrice = bidPrice;
    //     prevAskPrice = askPrice;
    // });
    return rows.reverse();
}


const tableColorizationService = {
    depthOfBookByOrder
}

export default tableColorizationService;
