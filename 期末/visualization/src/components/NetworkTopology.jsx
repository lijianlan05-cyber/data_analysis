import React, { useEffect, useRef } from 'react'
import ReactECharts from 'echarts-for-react'

const NetworkTopology = () => {
  const generateTopologyData = () => {
    // 生成网络拓扑数据
    const nodes = []
    const links = []

    // 核心服务器
    const coreServers = [
      { id: '10.7.133.16', name: '邮件服务器', category: 0 },
      { id: '10.7.133.17', name: '数据库服务器', category: 0 },
      { id: '10.50.50.26', name: 'FTP服务器', category: 0 },
      { id: '10.5.71.60', name: 'Web服务器', category: 0 }
    ]

    // 员工终端
    const employees = []
    for (let i = 0; i < 20; i++) {
      employees.push({
        id: `10.64.105.${100 + i}`,
        name: `员工终端${i + 1}`,
        category: 1
      })
    }

    // 外部IP
    const externalIPs = [
      { id: '220.181.112.244', name: 'baidu.com', category: 2 },
      { id: '140.205.62.20', name: 'taobao.com', category: 2 },
      { id: '54.222.60.218', name: 'amazon.cn', category: 2 }
    ]

    nodes.push(...coreServers, ...employees, ...externalIPs)

    // 生成连接关系
    employees.forEach(emp => {
      // 员工连接到服务器
      coreServers.forEach(server => {
        if (Math.random() > 0.5) {
          links.push({
            source: emp.id,
            target: server.id,
            value: Math.floor(Math.random() * 100) + 10
          })
        }
      })

      // 员工访问外部网站
      externalIPs.forEach(ext => {
        if (Math.random() > 0.7) {
          links.push({
            source: emp.id,
            target: ext.id,
            value: Math.floor(Math.random() * 50) + 5
          })
        }
      })
    })

    return { nodes, links }
  }

  const getOption = () => {
    const { nodes, links } = generateTopologyData()

    return {
      title: {
        text: '企业网络拓扑图',
        left: 'center',
        top: 10
      },
      tooltip: {
        formatter: (params) => {
          if (params.dataType === 'edge') {
            return `${params.data.source} → ${params.data.target}<br/>流量: ${params.data.value} MB`
          } else {
            return `${params.data.name}<br/>${params.data.id}`
          }
        }
      },
      legend: [{
        data: ['服务器', '员工终端', '外部网站'],
        top: 40,
        left: 'center'
      }],
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes.map(node => ({
            ...node,
            symbolSize: node.category === 0 ? 60 : node.category === 1 ? 30 : 40,
            label: {
              show: node.category === 0 || node.category === 2,
              formatter: '{b}'
            }
          })),
          links: links,
          categories: [
            { name: '服务器', itemStyle: { color: '#ff4d4f' } },
            { name: '员工终端', itemStyle: { color: '#1890ff' } },
            { name: '外部网站', itemStyle: { color: '#52c41a' } }
          ],
          roam: true,
          label: {
            position: 'right',
            formatter: '{b}'
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3,
            opacity: 0.5
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 3,
              opacity: 0.8
            }
          },
          force: {
            repulsion: 200,
            gravity: 0.1,
            edgeLength: [50, 150],
            layoutAnimation: true
          }
        }
      ]
    }
  }

  return (
    <ReactECharts 
      option={getOption()} 
      style={{ height: '600px' }}
      notMerge={true}
      lazyUpdate={true}
    />
  )
}

export default NetworkTopology
