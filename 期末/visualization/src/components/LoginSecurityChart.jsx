import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Row, Col } from 'antd'
import { FailedLoginChart, NonWorkHoursHeatmap } from './AdditionalCharts'

const LoginSecurityChart = ({ data, detailed = false }) => {
  if (!data) return <div>暂无数据</div>

  const getOption = () => {
    const hours = data.hourlyDistribution?.map(d => d.hour) || []
    const successData = data.hourlyDistribution?.map(d => d.success) || []
    const errorData = data.hourlyDistribution?.map(d => d.error) || []

    return {
      title: {
        text: detailed ? '24小时登录活动分布' : '',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['成功登录', '失败登录'],
        top: detailed ? 30 : 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: hours.map(h => `${h}:00`),
        axisLabel: {
          interval: 2
        }
      },
      yAxis: {
        type: 'value',
        name: '登录次数'
      },
      series: [
        {
          name: '成功登录',
          type: 'bar',
          stack: 'total',
          data: successData,
          itemStyle: {
            color: '#52c41a'
          }
        },
        {
          name: '失败登录',
          type: 'bar',
          stack: 'total',
          data: errorData,
          itemStyle: {
            color: '#ff4d4f'
          }
        }
      ]
    }
  }

  const getProtocolOption = () => {
    const protocols = Object.keys(data.protocolStats || {})
    const values = Object.values(data.protocolStats || {})

    return {
      title: {
        text: '登录协议分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 40
      },
      series: [
        {
          name: '登录协议',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: '{b}: {d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: protocols.map((proto, idx) => ({
            value: values[idx],
            name: proto.toUpperCase(),
            itemStyle: {
              color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'][idx % 5]
            }
          }))
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
          option={getProtocolOption()} 
          style={{ height: '400px' }}
          notMerge={true}
          lazyUpdate={true}
        />
      )}
      
      {detailed && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={12}>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <FailedLoginChart data={data} />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
              <NonWorkHoursHeatmap data={data} />
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default LoginSecurityChart
