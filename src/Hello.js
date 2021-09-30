import React from 'react'
import { useLangStrings } from './utils'

export default function Hello() {
    const STRINGS = useLangStrings("Dashboard")
    console.log(STRINGS)
    return <h1>{STRINGS.METRICS}</h1>
}