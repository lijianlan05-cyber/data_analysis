import React, { useState } from 'react'
import { Card, Table, Tag, Badge, Alert, Tabs, Space, Row, Col } from 'antd'
import { AlertTriangle, Shield, Activity } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { RiskLevelPieChart } from './AdditionalCharts'

const { TabPane } = Tabs

const ThreatDetectionPanel = ({ threats = [] }) => {
  const [selectedSeverity, setSelectedSeverity] = useState('all')

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'red'
      case 'medium':
        return 'orange'
      case 'low':
        return 'blue'
      default:
        return 'default'
    }
  }

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high':
        return '高危'
      case 'medium':
        return '中危'
      case 'low':
        return '低危'
      default:
        return '未知'
    }
  }

  const columns = [
    {
      title: '威胁类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (
        <Space>
          <AlertTriangle size={16} />
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {getSeverityText(severity)}
        </Tag>
      ),
      filters: [
        { text: '高危', value: 'high' },
        { text: '中危', value: 'medium' },
        { text: '低危', value: 'low' }
      ],
      onFilter: (value, record) => record.severity === value
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '检测时间',
      dataIndex: 'time',
      key: 'time',
      width: 180
    }
  ]

  const getThreatDistributionOption = () => {
    const typeCount = {}
    threats.forEach(threat => {
      typeCount[threat.type] = (typeCount[threat.type] || 0) + 1
    })

    return {
      title: {
        text: '威胁类型分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '威胁类型',
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
            formatter: '{b}\n{c} 次'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          data: Object.entries(typeCount).map(([type, count], idx) => ({
            value: count,
            name: type,
            itemStyle: {
              color: ['#ff4d4f', '#faad14', '#1890ff', '#52c41a', '#722ed1'][idx % 5]
            }
          }))
        }
      ]
    }
  }

  const getSeverityDistributionOption = () => {
    const severityCount = {
      high: threats.filter(t => t.severity === 'high').length,
      medium: threats.filter(t => t.severity === 'medium').length,
      low: threats.filter(t => t.severity === 'low').length
    }

    return {
      title: {
        text: '威胁严重程度统计',
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
        data: ['高危', '中危', '低危']
      },
      yAxis: {
        type: 'value',
        name: '数量'
      },
      series: [
        {
          name: '威胁数量',
          type: 'bar',
          data: [
            {
              value: severityCount.high,
              itemStyle: { color: '#ff4d4f' }
            },
            {
              value: severityCount.medium,
              itemStyle: { color: '#faad14' }
            },
            {
              value: severityCount.low,
              itemStyle: { color: '#1890ff' }
            }
          ],
          barWidth: '50%'
        }
      ]
    }
  }

  const highThreats = threats.filter(t => t.severity === 'high')
  const mediumThreats = threats.filter(t => t.severity === 'medium')

  return (
    <div className="space-y-6">
      <Alert
        message="安全威胁检测"
        description={`系统共检测到 ${threats.length} 个安全威胁，其中高危威胁 ${highThreats.length} 个，中危威胁 ${mediumThreats.length} 个`}
        type="warning"
        showIcon
        icon={<AlertTriangle />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">总威胁数</div>
              <div className="text-2xl font-bold mt-1">{threats.length}</div>
            </div>
            <Activity size={40} className="text-blue-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">高危威胁</div>
              <div className="text-2xl font-bold mt-1 text-red-500">{highThreats.length}</div>
            </div>
            <AlertTriangle size={40} className="text-red-500" />
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-500 text-sm">中危威胁</div>
              <div className="text-2xl font-bold mt-1 text-orange-500">{mediumThreats.length}</div>
            </div>
            <Shield size={40} className="text-orange-500" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <ReactECharts 
            option={getThreatDistributionOption()} 
            style={{ height: '400px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>
        
        <Card>
          <ReactECharts 
            option={getSeverityDistributionOption()} 
            style={{ height: '400px' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </Card>
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card>
            <RiskLevelPieChart data={{ 
              riskLevels: [
                { name: '高危', value: highThreats.length, description: '研发服务器数据外泄、账户暴力破解' },
                { name: '中危', value: mediumThreats.length, description: '财务敏感邮件对外发送' },
                { name: '低危', value: threats.length - highThreats.length - mediumThreats.length, description: '员工未打卡但网络活跃' }
              ]
            }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="威胁详情列表">
            <Table
              columns={columns}
              dataSource={threats.map((threat, idx) => ({ ...threat, key: idx }))}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ThreatDetectionPanel
