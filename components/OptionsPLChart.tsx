'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { userPaidAtom, userProfitAtom } from '../atoms/optionsAtoms'
import { ChartBuilder } from '@/utils/ChartBuilder'
import { defaultDimensions } from '@/config'
import { generatePoints } from '@/utils/chartUtils'

const OptimizedOptionsPLChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [userPaid] = useAtom(userPaidAtom)
  const [userProfit] = useAtom(userProfitAtom)
  const [currentPrice, setCurrentPrice] = useState(userPaid + userProfit)

  useEffect(() => {
    if (!svgRef.current) return

    const chartBuilder = new ChartBuilder(svgRef.current, defaultDimensions, userPaid, userProfit)

    chartBuilder.drawAxes()

    const data: [number, number][] = [
      [userPaid * 0.2, -userPaid],
      [userPaid, 0],
      [userPaid + userProfit, userProfit],
    ]

    chartBuilder.drawProfitLine(data)
    chartBuilder.drawArea(data)
    chartBuilder.drawProfitLine2(userPaid, userProfit)

    const points = generatePoints(userPaid, userProfit)
    const pointGroups = chartBuilder.drawPoints(points)

    chartBuilder.drawTitle()

    const dynamicElements = chartBuilder.createDynamicElements()

    chartBuilder.setupMouseInteraction(userPaid, userProfit, setCurrentPrice, dynamicElements, pointGroups)
  }, [currentPrice, userPaid, userProfit])

  return (
    <div>
      <svg ref={svgRef} width={defaultDimensions.width} height={defaultDimensions.height} />
    </div>
  )
}

export default OptimizedOptionsPLChart
