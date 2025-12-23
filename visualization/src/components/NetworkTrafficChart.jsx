import React from 'react'
import ReactECharts from 'echarts-for-react'

const NetworkTrafficChart = ({ data, detailed = false }) => {
  if (!data) return <div>暂无数据</div>

  const getOption = () => {
    const dates = data.dailyTraffic?.map(d => d.date.substring(5)) || []
    const traffic = data.dailyTraffic?.map(d => d.traffic) || []

    return {
      title: {
        text: detailed ? '每日网络流量趋势' : '',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c} GB'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: {
          interval: 2
        }
      },
      yAxis: {
        type: 'value',
        name: '流量 (GB)'
      },
      series: [
        {
          name: '流量',
          type: 'line',
          smooth: true,
          data: traffic,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.8)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.1)' }
              ]
            }
          },
          itemStyle: {
            color: '#1890ff'
          },
          lineStyle: {
            width: 2
          }
        }
      ]
    }
  }

  const getProtocolTrafficOption = () => {
    const protocols = Object.keys(data.protocolTraffic || {})
    const values = Object.values(data.protocolTraffic || {})

    return {
      title: {
        text: '各协议流量占比',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} GB ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 40
      },
      series: [
        {
          name: '协议流量',
          type: 'pie',
          radius: '60%',
          data: protocols.map((proto, idx) => ({
            value: values[idx],
            name: proto.toUpperCase(),
            itemStyle: {
              color: ['#5470c6', '#91cc75', '#fac858', '#ee6666'][idx % 4]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  return (
    <div className="space-y-4">
      <ReactECharts 
        option={getOption()} 
        style={{ height: detailed ? '400px' : '300px' }}
        notMerge={true}
        lazyUpdate={true}
      />
      
      {detailed && (
        <ReactECharts 
          option={getProtocolTrafficOption()} 
          style={{ height: '400px' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
    </div>
  )
}

export default NetworkTrafficChart
