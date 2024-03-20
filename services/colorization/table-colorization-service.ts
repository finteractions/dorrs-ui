import {IDepthByOrder} from "@/interfaces/i-depth-by-order";
import {IRGB, RGB} from "@/interfaces/i-rgb";


function depthOfBookByOrder(data: Array<IDepthByOrder>,
                            colours: {
                                bid: IRGB,
                                ask: IRGB
                            },
                            isDark: boolean,
                            limit: number): Array<ITableRow> {
    const reversedData = [...data.slice(0, limit)].reverse();

    const rgb = {
        bid: new RGB(colours.bid.red, colours.bid.green, colours.bid.blue),
        ask: new RGB(colours.ask.red, colours.ask.green, colours.ask.blue),
    }


    const rows: Array<ITableRow> = [];
    let prevBidPrice = "";
    let prevAskPrice = "";

    reversedData.forEach((order: IDepthByOrder, index: number) => {
        const cells: Array<ITableCell> = [];
        const bidPrice = order.bid_price;
        const askPrice = order.offer_price;
        let bidStyle = rgb.bid;
        let askStyle = rgb.ask;

        let bidRGB = {}
        let askRGB = {}
        // isDark = false
        if (bidPrice !== prevBidPrice && bidPrice !== null && prevBidPrice !== '') {
            bidStyle.red -= isDark ? 3 : 15;
            bidStyle.green -= isDark? 0 : 8;
            bidStyle.blue -= isDark ? 3 : 8;
        }

        if (askPrice !== prevAskPrice && askPrice !== null && prevAskPrice !== '') {
            // askStyle.red -= isDark ? 3 : 15;
            askStyle.green -= isDark ? 3 : 8;
            askStyle.blue -= isDark ? 3 : 8;
        }

        bidRGB = bidStyle.toStyleString();
        askRGB = askStyle.toStyleString();


        if (bidPrice === null) {
            bidRGB = {}
        }

        if (askPrice === null) {
            askRGB = {}
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
    });

    return rows.reverse();
}

function isDarkTheme() {
    return document.documentElement.classList.contains('dark');
};


const tableColorizationService = {
    depthOfBookByOrder
}

export default tableColorizationService;
