/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChartDimensions, Point } from '@/types'
import * as d3 from 'd3'
import { createScales } from './chartUtils'

export class ChartBuilder {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>
  private dimensions: ChartDimensions
  private scales: ReturnType<typeof createScales>
  private staticGroup: d3.Selection<SVGGElement, unknown, null, undefined>
  private dynamicGroup: d3.Selection<SVGGElement, unknown, null, undefined>

  constructor(svgRef: SVGSVGElement, dimensions: ChartDimensions, userPaid: number, userProfit: number) {
    this.svg = d3.select(svgRef)
    this.dimensions = dimensions
    this.scales = createScales(dimensions, userPaid, userProfit)
    this.svg.selectAll('*').remove()
    this.staticGroup = this.svg.append('g').attr('class', 'static-elements')
    this.dynamicGroup = this.svg.append('g').attr('class', 'dynamic-elements')
  }

  drawAxes() {
    const { xScale: x, yScale: y } = this.scales
    const { margin, width, height } = this.dimensions

    this.staticGroup
      .append('line')
      .attr('x1', margin.left)
      .attr('y1', y(0))
      .attr('x2', width - margin.right)
      .attr('y2', y(0))
      .attr('stroke', 'black')

    this.staticGroup
      .append('line')
      .attr('x1', x(0))
      .attr('y1', margin.top)
      .attr('x2', x(0))
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')

    return this.staticGroup
  }

  drawProfitLine(data: [number, number][]) {
    const line = d3
      .line<[number, number]>()
      .x(d => this.scales.xScale(d[0]))
      .y(d => this.scales.yScale(d[1]))

    this.staticGroup
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 2)
      .attr('d', line)
  }

  drawArea(data: [number, number][]) {
    const area = d3
      .area<[number, number]>()
      .x(d => this.scales.xScale(d[0]))
      .y0(this.scales.yScale(0))
      .y1(d => this.scales.yScale(d[1]))

    this.staticGroup
      .append('path')
      .datum(data.filter(d => d[1] <= 0))
      .attr('fill', 'rgba(255, 0, 0, 0.1)')
      .attr('d', area)

    this.staticGroup
      .append('path')
      .datum(data.filter(d => d[1] >= 0))
      .attr('fill', 'rgba(0, 255, 0, 0.1)')
      .attr('d', area)
  }

  drawProfitLine2(userPaid: number, userProfit: number) {
    this.staticGroup
      .append('line')
      .attr('x1', this.scales.xScale(0))
      .attr('y1', this.scales.yScale(userProfit))
      .attr('x2', this.scales.xScale(userPaid + userProfit))
      .attr('y2', this.scales.yScale(userProfit))
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '5,5')
  }

  drawPoints(points: Point[]) {
    const pointGroups = this.staticGroup
      .selectAll('.point-group')
      .data(points)
      .enter()
      .append('g')
      .attr('class', 'point-group')

    pointGroups
      .append('circle')
      .attr('cx', d => this.scales.xScale(d.x))
      .attr('cy', d => this.scales.yScale(d.y))
      .attr('r', 4)
      .attr('fill', d => d.color)

    pointGroups
      .append('text')
      .attr('x', d => this.scales.xScale(d.x))
      .attr('y', this.dimensions.height - this.dimensions.margin.bottom + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .text(d => d.label)

    return pointGroups
  }

  drawTitle() {
    this.staticGroup
      .append('text')
      .attr('x', this.dimensions.width / 2)
      .attr('y', this.dimensions.margin.top / 2 - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Expected Profit & Loss')
  }

  createDynamicElements() {
    const plText = this.dynamicGroup
      .append('text')
      .attr('x', this.dimensions.width / 2)
      .attr('y', this.dimensions.margin.top / 2 + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')

    const priceText = this.dynamicGroup
      .append('text')
      .attr('y', this.scales.yScale(0) - 10)
      .attr('text-anchor', 'end')
      .style('font-size', '14px')
      .style('font-weight', 'bold')

    const verticalLine = this.dynamicGroup
      .append('line')
      .attr('y1', this.dimensions.margin.top)
      .attr('y2', this.dimensions.height - this.dimensions.margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .style('opacity', 0)

    return { plText, priceText, verticalLine }
  }

  setupMouseInteraction(
    userPaid: number,
    userProfit: number,
    setCurrentPrice: (price: number) => void,
    dynamicElements: any,
    pointGroups: any
  ) {
    this.svg
      .append('rect')
      .attr('width', this.dimensions.width)
      .attr('height', this.dimensions.height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mousemove', (event: MouseEvent) => {
        const [xPos] = d3.pointer(event)
        const price = this.scales.xScale.invert(xPos)
        const profit = price - userPaid
        setCurrentPrice(price)

        const { verticalLine, plText, priceText } = dynamicElements

        verticalLine.attr('x1', xPos).attr('x2', xPos).style('opacity', 1)

        const plDisplay = `P/L: ${profit >= 0 ? '+' : ''}$${profit.toFixed(2)}`
        plText.text(plDisplay).attr('fill', profit >= 0 ? 'green' : 'red')

        priceText
          .text(`MEOW Price at Exp: $${price.toFixed(2)}`)
          .attr('x', xPos)
          .attr('y', this.scales.yScale(userProfit) - 10)

        pointGroups.attr('opacity', (d: { label: string }) => {
          if (d.label === 'Max Loss' && price <= userPaid * 0.2) return 1
          if (d.label === 'Breakeven' && price === userPaid) return 1
          if (d.label === 'Max Profit' && price >= userPaid + userProfit) return 1
          return 0.3
        })
      })
      .on('mouseout', () => {
        dynamicElements.verticalLine.style('opacity', 0)
        pointGroups.attr('opacity', 1)
      })
  }
}
