export interface IIndicator {
    type: string;
    total: number | null;
    new: number | null;
    points: Array<IIndicatorPoint>
}

export interface IIndicatorPoint {
    time: string;
    volume: number;
}
