import { ChartDimensions, Point } from '@/types'
import * as d3 from 'd3'

const createScales = (dimensions: ChartDimensions, userPaid: number, userProfit: number) => {
  const { width, height, margin } = dimensions

  return {
    xScale: d3
      .scaleLinear()
      .domain([0, userPaid + userProfit])
      .range([margin.left, width - margin.right]),

    yScale: d3
      .scaleLinear()
      .domain([-userPaid, userProfit])
      .range([height - margin.bottom, margin.top]),
  }
}

const generatePoints = (userPaid: number, userProfit: number): Point[] => [
  { x: userPaid * 0.2, y: -userPaid, label: 'Max Loss', color: 'red' },
  { x: userPaid, y: 0, label: 'Breakeven', color: 'black' },
  { x: userPaid + userProfit, y: userProfit, label: 'Max Profit', color: 'green' },
]

export { createScales, generatePoints }
