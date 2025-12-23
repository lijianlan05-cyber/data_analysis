import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Row, Col } from 'antd'
import { EmailKeywordCloud, EmailNetworkGraph, TcpTrafficLineChart } from './AdditionalCharts'

const EmployeeBehaviorChart = ({ data }) => {
  if (!data) return <div>暂无数据</div>

  const getWorkHoursOption = () => {
    // 计算工作时长分布
    const bins = [0, 4, 6, 8, 10, 12, 14]
    const distribution = bins.slice(0, -1).map((bin, idx) => {
      const nextBin = bins[idx + 1]
      const count = data.workHours?.filter(h => h >= bin && h < nextBin).length || 0
      return {
        name: `${bin}-${nextBin}小时`,
        value: count
      }
    })

    return {
      title: {
        text: '员工工作时长分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: distribution.map(d => d.name)
      },
      yAxis: {
        type: 'value',
        name: '人数'
      },
      series: [
        {
          name: '员工数',
          type: 'bar',
          data: distribution.map(d => d.value),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#83bff6' },
                { offset: 1, color: '#188df0' }
              ]
            }
          },
          barWidth: '60%'
        }
      ]
    }
  }

  const getWebsiteCategoryOption = () => {
    const categories = Object.keys(data.websiteCategories || {})
    const values = Object.values(data.websiteCategories || {})

    return {
      title: {
        text: '网站访问类别分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 次 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 40
      },
      series: [
        {
          name: '访问次数',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          data: categories.map((cat, idx) => ({
            value: values[idx],
            name: cat,
            itemStyle: {
              color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'][idx % 5]
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}\n{d}%'
          }
        }
      ]
    }
  }

  const getWorkTimeHeatmapOption = () => {
    // 生成工作时间热力图数据
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    
    const heatmapData = []
    days.forEach((day, dayIdx) => {
      hours.forEach(hour => {
        // 模拟活跃度数据
        let value = 0
        if (dayIdx < 5) { // 工作日
          if (hour >= 9 && hour <= 18) {
            value = Math.floor(Math.random() * 50) + 50
          } else if (hour >= 7 && hour <= 22) {
            value = Math.floor(Math.random() * 30) + 10
          } else {
            value = Math.floor(Math.random() * 10)
          }
        } else { // 周末
          if (hour >= 10 && hour <= 20) {
            value = Math.floor(Math.random() * 20) + 5
          } else {
            value = Math.floor(Math.random() * 5)
          }
        }
        heatmapData.push([hour, dayIdx, value])
      })
    })

    return {
      title: {
        text: '员工活跃时间热力图',
        left: 'center'
      },
      tooltip: {
        position: 'top',
        formatter: (params) => {
          return `${days[params.value[1]]} ${params.value[0]}:00<br/>活跃度: ${params.value[2]}`
        }
      },
      grid: {
        height: '60%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: hours.map(h => `${h}:00`),
        splitArea: {
          show: true
        },
        axisLabel: {
          interval: 2
        }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
        }
      },
      series: [
        {
          name: '活跃度',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
  }

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ReactECharts 
            option={getWorkHoursOption()} 
            style={{ height: '400px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Col>
        <Col xs={24} lg={12}>
          <ReactECharts 
            option={getWebsiteCategoryOption()} 
            style={{ height: '400px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Col>
      </Row>
      
      <Row>
        <Col xs={24}>
          <ReactECharts 
            option={getWorkTimeHeatmapOption()} 
            style={{ height: '500px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
            <TcpTrafficLineChart data={data} />
          </div>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
            <EmailKeywordCloud data={data} />
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
            <EmailNetworkGraph data={data} />
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default EmployeeBehaviorChart
