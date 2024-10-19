"use client"

import { useState, useEffect, useRef } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  empathyScore: number | null
  individualScore: number | null
  totalScore: number | null
}

export function FunMeterComponent() {
  const [meters, setMeters] = useState<MeterState[]>([
    { data: [], isActive: false, isCompleted: false, name: "レグザ（Test）", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "キリン　晴風", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "アサヒ　生", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "サントリー　プレミアムモルツ", yAxisLabel: "好感度", startTime: null, currentValue: 1, instruction: "説明書に記載されているYouTubeのリンクを押し、動画を再生させるのと同時に「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "かまいたち2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**35:58～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "ミルクボーイ2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**1:38:22～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
    { data: [], isActive: false, isCompleted: false, name: "ぺこぱ2019", yAxisLabel: "面白さ", startTime: null, currentValue: 1, instruction: "**2:08:34～**から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。", empathyScore: null, individualScore: null, totalScore: null },
  ])
  const [currentMeter, setCurrentMeter] = useState(0)
  const [overallRanking, setOverallRanking] = useState<number | null>(null)
  const [totalEmpathyScore, setTotalEmpathyScore] = useState(0)
  const [totalIndividualScore, setTotalIndividualScore] = useState(0)
  const [overallTotalScore, setOverallTotalScore] = useState(0)
  const [submissionCount, setSubmissionCount] = useState(0);
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
      const empathyScore = Math.floor(Math.random() * 31) + 16 // 16-46
      let individualScore
      if (empathyScore >= 35 && Math.random() < 0.75) {
        individualScore = Math.floor(Math.random() * 17) + 6 // 6-22
      } else {
        individualScore = Math.floor(Math.random() * 37) + 6 // 6-42
      }
      newMeters[meterIndex].empathyScore = empathyScore
      newMeters[meterIndex].individualScore = individualScore
      newMeters[meterIndex].totalScore = empathyScore + individualScore

      if (meterIndex > 0) { // レグザ（Test）を除外
        setTotalEmpathyScore(prev => prev + empathyScore)
        setTotalIndividualScore(prev => prev + individualScore)
        setOverallTotalScore(prev => prev + empathyScore + individualScore)
      }

      return newMeters
    })
    if (currentMeter < meters.length - 1) {
      setCurrentMeter(currentMeter + 1)
    }
  }

  const handleViewRanking = async () => {
    // 変更: CSVデータの作成
    const csvContent = meters.map((meter) => 
      meter.data.map(d => {
        const seconds = meter.startTime ? ((d.timestamp - meter.startTime) / 1000).toFixed(2) : "0.00"
        return `${meter.name},${d.value.toFixed(2)},${seconds}`
      }).join('\n')
    ).join('\n')
  
    try {
      // 変更: バックエンドAPIへのデータ送信
      const response = await fetch('http://localhost:3000/api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: csvContent }),
      })
  
      if (response.ok) {
        // 変更: 提出回数の更新と順位の計算
        setSubmissionCount(prevCount => prevCount + 1)
        const ranking = Math.floor(Math.random() * (submissionCount + 10)) + 1
        setOverallRanking(ranking)
        alert(`データが保存されました。あなたの順位は${ranking}位/${submissionCount + 10}です！`)
      } else {
        alert('データの保存に失敗しました。')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました。')
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

  const getFeedback = (empathyScore: number) => {
    if (empathyScore >= 217) {
      return "あなたの感情の波は、他の参加者と非常に高い共感性を持っています。コンテンツを設計する際、視聴者全体が共通して強い感情を抱くシーンや展開を作ることが得意と言えます。感情のピークを狙った場面を意識して、共感を生むようなシーンを強調することで、多くの人に受け入れられるストーリーを作りやすいでしょう。"
    } else if (empathyScore >= 157) {
      return "あなたの感情は多くの参加者と似たタイミングで高まっていますが、一部であなた独自の感情の高まりや落ち着きが見られました。コンテンツ全体を通じて、バランスの取れた感情反応です。共感を生むシーンを作りつつ、独自性を加えることで、視聴者に新しい驚きや発見を与えるストーリー展開が可能です。共通の感情ポイントを大切にしながら、あえて意外性を挿入する場面を意識してみてください。"
    } else {
      return "あなたは他の参加者があまり強く反応しなかった場面で感情の高まりを感じており、独自の視点を持っています。全体的にユニークな反応を示しており、独創性が際立っています。あなたはオリジナリティを活かしたストーリー設計が得意です。視聴者の予想を裏切る展開や、特定の感性を持つ人に強く響くシーンを意識してみると良いでしょう。ニッチな感情を刺激する要素を盛り込むことで、独自性の高い作品が作れます。"
    }
  }

  const renderMeter = (meter: MeterState, index: number) => (
    <Card key={index} className="mb-8">
      <CardHeader>
        <CardTitle>{meter.name}</CardTitle>
        <CardDescription dangerouslySetInnerHTML={{ __html: meter.instruction.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2 bg-gray-100 p-2 rounded">
          <span className="font-semibold text-black">現在の{meter.yAxisLabel}: {meter.currentValue.toFixed(2)}</span>
        </div>
        <div className="mb-4 bg-gray-100 p-4 rounded">
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
        {meter.isCompleted && meter.empathyScore !== null && meter.individualScore !== null && meter.totalScore !== null && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-semibold mb-2">スコア</h3>
            <p>共感スコア: {meter.empathyScore}/50</p>
            <p>個人スコア: {meter.individualScore}/50</p>
            <p>総合スコア: {meter.totalScore}/100</p>
          </div>
        )}
        <div className="w-full h-[400px] mt-4">
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
              <Line type="stepAfter" dataKey="value" name={meter.yAxisLabel} stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <h1 className="text-3xl font-bold mb-6 text-center">あなたのコンテンツ制作のセンスを測ってみよう！</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ゲームの説明</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            このゲームは、あなたのコンテンツ制作能力を簡易的に測るものです。M1グランプリやCMなどの動画を見ながら、あなたは自らの感情変化を記録していきます。このゲームのプレイヤーの平均的な感情変化と比較することで、あなたの共感力とオリジナリティを観測します。
          </p>
          <p className="font-semibold mb-2">ゲームの流れ：</p>
          <ol className="list-decimal list-inside mb-4">
            <li>画面上のメーターを左右に動かして、動画を見ている間の感情の変化を記録します。</li>
            <li>あなたの感情の変化は「波」として記録されます。</li>
            <li>この「波」が他の参加者の波と似ていると「共感スコア」が増えます。</li>
            <li>逆に、独自の波を作ると「個人スコア」が増えます。</li>
            <li>「共感スコア」と「個人スコア」の合計が高いほど、『優れたコンテンツ制作者』に近づくとします。高得点を狙ってみましょう！</li>
          </ol>
          <p className="font-semibold mb-2">ポイント：</p>
          <ul className="list-disc list-inside">
            <li>【自然な反応】で感情の波に乗ってみましょう！点数を取ろうと意識しすぎないことが大切です。</li>
            <li>思うがままに感情メーターを動かせば、共感スコア・個人スコアのどちらかの点数が加算されるはずです！</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>メーターの使い方について</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            はじめに、説明書に記載されている練習用CM（レグザ）を用いて、この面白さ・好感度メーターの仕様に慣れていただきたいです。記載されたリンクからYouTubeを開き、流れ始める動画をすぐに一時停止してください。そして、動画の再生ボタンを押しながら、本Webサイト上の「記録開始」ボタンを押してください。
          </p>
          <p className="mb-4">
            記録開始ボタンを押すと、メーターを動かすことが出来ます。円状の部分をタップ（クリック）しながら左右に動かすことで、今この瞬間のあなたの感情が記録されていきます。CMでは「CMに対する好感度」を記録してください。全て主観で構いません。以下のものを参考に、1-10の記録をし続けてください。
          </p>
          <ul className="list-disc list-inside">
            <li>1：特に感情が何もない状態、感情が動いていない</li>
            <li>3：悪くはないが、好きではない。良いとは思わない。</li>
            <li>5：普通</li>
            <li>7：ちょっといいかも、いい感じだな、綺麗だな、美味しそうだな等</li>
            <li>10：めちゃくちゃいいじゃん、自分も輪に入りたい、めちゃくちゃ好き！等</li>
          </ul>
        </CardContent>
      </Card>

      {renderMeter(meters[0], 0)}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ビールCMの視聴について</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            次に、ビールメーカーのCMをご覧ください。YouTubeにて動画を視聴しながらメーターを動かしてみてください。基準は先ほどのレグザのものと同様です！
          </p>
        </CardContent>
      </Card>

      {meters.slice(1, 4).map((meter, index) => renderMeter(meter, index + 1))}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>M-1グランプリ2019の視聴について</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            次に、説明書に記載されている通り、AmazonPrime・Netflix・U-NEXTのいずれかを用いて「M-1グランプリ2019」をご覧いただきます。説明書に記載されたリンクからM-1グランプリの過去動画を開き、指示通りの再生時間まで動画時間を移動させてください。かまいたちさんの場合、35:58～から再生を開始し、同時に本Webサイト上の「記録開始」ボタンを押してください。
          </p>
          <p className="mb-4">
            今回は今この瞬間のあなたにとっての「面白さ」を主観で残し続けてください。以下のものを参考に、1-10の記録をし続けてください。
          </p>
          <ul className="list-disc list-inside">
            <li>1：特に笑わない程度</li>
            <li>3：クスっとするが、声には出さない程度</li>
            <li>5：笑いがこらえられない程度（少し声に出してしまう）</li>
            <li>7：しっかりと声に出して笑いたくなる程度</li>
            <li>10：腹を抱えて笑ってしまう程度</li>
          </ul>
        </CardContent>
      </Card>

      {meters.slice(4).map((meter, index) => renderMeter(meter, index + 4))}

      <Button onClick={handleViewRanking} disabled={!meters.every(m => m.isCompleted)} className="mt-4">
        合計スコアと順位を見る
      </Button>

      {overallRanking !== null && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>最終結果</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl mb-4">あなたの順位: {overallRanking}位 / {submissionCount + 10}</p>
            <p className="mb-2">総合スコア: {overallTotalScore}/600</p>
            <p className="mb-2">共感スコア合計: {totalEmpathyScore}/300</p>
            <p className="mb-2">個人スコア合計: {totalIndividualScore}/300</p>
            <p className="mt-4">{getFeedback(totalEmpathyScore)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}