import React from 'react'
import { Provider } from 'jotai'
import OptionPLChart from '../components/OptionsPLChart'

const Page: React.FC = () => {
  return (
    <Provider>
      <div>
        <h1>Option Profit & Loss Calculator</h1>
        <OptionPLChart />
      </div>
    </Provider>
  )
}

export default Page
