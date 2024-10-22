export interface Point {
  x: number
  y: number
  label: string
  color: string
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface ChartProps {
  userPaid: number
  userProfit: number
}
