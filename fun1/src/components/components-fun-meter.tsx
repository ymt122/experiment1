"use client"

import { useState, useEffect, useRef } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface MeterData {
  value: number
  timestamp: number
  isManual: boolean
}

interface MeterState {
  data: MeterData[]
  isActive: boolean
  isCompleted: boolean
  name: string
  yAxisLabel: string
  startTime: number | null
  currentValue: number
  instruction: string
}

export function FunMeterComponent() {
  const [meters, setMeters] = useState<MeterState[]>([
    { data: [], isActive: false, isCompleted: false, name: "レグザ（Test）", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "キリン　晴風", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "アサヒ　生", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "サントリー　プレミアムモルツ", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "かまいたち2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**35:58～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "ミルクボーイ2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**1:38:22～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
    { data: [], isActive: false, isCompleted: false, name: "ぺこぱ2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**2:08:34～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。視聴しているその瞬間の感情を残し続けてください。" },
  ])
  const [currentMeter, setCurrentMeter] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const intervals = meters.map((meter, index) => {
      if (meter.isActive) {
        return setInterval(() => {
          const now = Date.now()
          const elapsedSeconds = (now - (meter.startTime || now)) / 1000
          
          setMeters(prevMeters => {
            const newMeters = [...prevMeters]
            const currentValue = newMeters[index].currentValue
            
            newMeters[index].data.push({
              value: currentValue,
              timestamp: now,
              isManual: false
            })
            
            if (Math.abs(elapsedSeconds - Math.round(elapsedSeconds)) < 0.05) {
              newMeters[index].data.push({
                value: currentValue,
                timestamp: now,
                isManual: false
              })
            }
            
            return newMeters
          })
        }, 100)
      }
      return null
    })

    return () => {
      intervals.forEach(interval => {
        if (interval) clearInterval(interval)
      })
    }
  }, [meters])

  const handleSliderChange = (meterIndex: number) => (value: number[]) => {
    setMeters(prevMeters => {
      const newMeters = [...prevMeters]
      const newValue = Number(value[0].toFixed(2))
      newMeters[meterIndex].currentValue = newValue
      newMeters[meterIndex].data.push({
        value: newValue,
        timestamp: Date.now(),
        isManual: true
      })
      return newMeters
    })
  }

  const handleStart = (meterIndex: number) => () => {
    const startTime = Date.now()
    setMeters(prevMeters => {
      const newMeters = [...prevMeters]
      newMeters[meterIndex].isActive = true
      newMeters[meterIndex].startTime = startTime
      newMeters[meterIndex].data = [{
        value: 1,
        timestamp: startTime,
        isManual: false
      }]
      return newMeters
    })
  }

  const handleStop = (meterIndex: number) => () => {
    setMeters(prevMeters => {
      const newMeters = [...prevMeters]
      newMeters[meterIndex].isActive = false
      newMeters[meterIndex].isCompleted = true
      return newMeters
    })
    if (currentMeter < meters.length - 1) {
      setCurrentMeter(currentMeter + 1)
    }
  }

  const handleSave = async () => {
    const csvContent = meters.map((meter) => 
      meter.data.map(d => {
        const seconds = meter.startTime ? ((d.timestamp - meter.startTime) / 1000).toFixed(2) : "0.00"
        return `${meter.name},${d.value.toFixed(2)},${seconds}`
      }).join('\n')
    ).join('\n')

    const response = await fetch('/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: csvContent }),
    })

    if (response.ok) {
      alert('データが保存されました。')
    } else {
      alert('データの保存に失敗しました。')
    }
  }

  const getChartData = (meterIndex: number) => {
    const startTime = meters[meterIndex].startTime
    if (!startTime) return []
    return meters[meterIndex].data.map(d => ({
      time: Number(((d.timestamp - startTime) / 1000).toFixed(2)),
      value: d.value,
      isManual: d.isManual
    }))
  }

  const renderMeter = (meter: MeterState, index: number) => (
    <div key={index} className="mb-8 p-4 border rounded">
      <h2 className="text-xl font-semibold mb-2">{meter.name}</h2>
      <p className="mb-4" dangerouslySetInnerHTML={{ __html: meter.instruction.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
      <div className="mb-2 bg-gray-300 p-2 rounded">
        <span className="font-semibold text-black">現在の値: {meter.currentValue.toFixed(2)}</span>
      </div>
      <div className="mb-4 bg-gray-300 p-4 rounded">
        <Slider
          min={1}
          max={10}
          step={0.01}
          value={[meter.currentValue]}
          onValueChange={handleSliderChange(index)}
          disabled={meter.isCompleted}
          className="w-full"
        />
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <span key={num} className="text-xs">{num}</span>
          ))}
        </div>
      </div>
      <div className="flex space-x-2 mb-4">
        <Button onClick={handleStart(index)} disabled={meter.isActive || meter.isCompleted}>
          記録開始
        </Button>
        <Button onClick={handleStop(index)} disabled={!meter.isActive || meter.isCompleted}>
          記録終了
        </Button>
      </div>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getChartData(index)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: '時間 (秒)', position: 'insideBottomRight', offset: -10 }}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <YAxis 
              domain={[1, 10]} 
              label={{ value: meter.yAxisLabel, angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            />
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(2)}`}
              labelFormatter={(label: number) => `${label.toFixed(2)}秒`}
            />
            <Legend />
            <Line type="stepAfter" dataKey="value" name="値" stroke="#8884d8" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <h1 className="text-2xl font-bold mb-4">面白さ・好感度メーター</h1>
      <div className="mb-8 p-4 border rounded bg-gray-100">
        <p className="mb-4">
          はじめに、説明書に記載されている練習用CM（レグザ）を用いて、この面白さ・好感度メーターの仕様に慣れていただきたいです。記載されたリンクからYouTubeを開き、流れ始める動画をすぐに一時停止してください。そして、動画の再生ボタンを押しながら、本Webサイト上の「記録開始」ボタンを押してください。
        </p>
        <p className="mb-4">
          記録開始ボタンを押すと、メーターを動かすことが出来ます。円状の部分をクリックしながら左右に動かすことで、今この瞬間のあなたの感情が記録されていきます。CMでは「CMに対する好感度」を記録してください。全て主観で構いません。以下のものを参考に、1-10の記録をし続けてください。
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>1：特に感情が何もない状態、感情が動いていない</li>
          <li>3：悪くはないが、好きではない。良いとは思わない。</li>
          <li>5：普通</li>
          <li>7：ちょっといいかも、いい感じだな、綺麗だな、美味しそうだな</li>
          <li>10：めちゃくちゃいいじゃん、自分も輪に入りたい</li>
        </ul>
      </div>
      
      {renderMeter(meters[0], 0)}

      <div className="mb-8 p-4 border rounded bg-gray-100">
        <p className="mb-4">
          次に、ビールメーカーのCMをご覧ください。YouTubeにて動画を視聴しながらメーターを動かしてみてください。以下の基準を参考に、CMに対する好感度をあなたの主観で記録し続けてください。
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>1：特に感情が何もない状態、感情が動いていない</li>
          <li>3：悪くはないが、好きではない。良いとは思わない。</li>
          <li>5：普通</li>
          <li>7：ちょっといいかも、いい感じだな、綺麗だな、美味しそうだな</li>
          <li>10：めちゃくちゃいいじゃん、自分も輪に入りたい</li>
        </ul>
      </div>

      {meters.slice(1, 4).map((meter, index) => renderMeter(meter, index + 1))}

      <div className="mb-8 p-4 border rounded bg-gray-100">
        <p className="mb-4">
          
          次に、説明書に記載されている通り、AmazonPrime・Netflix・U-NEXTのいずれかを用いて「M-1グランプリ2019」をご覧いただきます。説明書に記載されたリンクからM-1グランプリの過去動画を開き、指示通りの再生時間まで動画時間を移動させてください。かまいたちさんの場合、35:58～から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。
        </p>
        <p className="mb-4">
          今回は今この瞬間のあなたにとっての「面白さ」を主観で残し続けてください。以下のものを参考に、1-10の記録をし続けてください。
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>1：特に笑わない程度</li>
          <li>3：クスっとするが、声には出さない程度</li>
          <li>5：笑いがこらえられない程度（少し声に出してしまう）</li>
          <li>7：しっかりと声に出して笑いたくなる程度</li>
          <li>10：腹を抱えて笑ってしまう程度</li>
        </ul>
      </div>

      {meters.slice(4).map((meter, index) => renderMeter(meter, index + 4))}

      <Button onClick={handleSave} disabled={!meters.every(m => m.isCompleted)}>
        データを保存
      </Button>
    </div>
  )
}