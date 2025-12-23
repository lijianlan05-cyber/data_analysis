import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Row, Col, Card } from 'antd'

// 1. 失败登录统计 - 横向柱状图（账户 vs 失败次数）
export const FailedLoginChart = ({ data }) => {
  const generateFailedLoginData = () => {
    // 模拟失败登录TOP10账户数据
    const accounts = []
    for (let i = 0; i < 10; i++) {
      accounts.push({
        user: `${1000 + Math.floor(Math.random() * 500)}`,
        failures: Math.floor(Math.random() * 25) + 5
      })
    }
    return accounts.sort((a, b) => b.failures - a.failures)
  }

  const failedData = data?.failedLogins || generateFailedLoginData()

  const option = {
    title: {
      text: '登录失败次数TOP10账户',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => `账户 ${params[0].name}<br/>失败次数: ${params[0].value} 次`
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '失败次数'
    },
    yAxis: {
      type: 'category',
      data: failedData.map(d => `用户${d.user}`),
      inverse: true
    },
    series: [{
      name: '失败次数',
      type: 'bar',
      data: failedData.map(d => ({
        value: d.failures,
        itemStyle: {
          color: d.failures > 15 ? '#ff4d4f' : d.failures > 10 ? '#faad14' : '#1890ff'
        }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c} 次'
      }
    }]
  }

  return <ReactECharts option={option} style={{ height: '400px' }} />
}

// 2. 非工作时段登录热力图（日期 × 账户）
export const NonWorkHoursHeatmap = ({ data }) => {
  const generateHeatmapData = () => {
    const users = ['1102', '1234', '1345', '1456', '1523', '1678', '1789', '1890', '1901', '1999']
    const days = Array.from({ length: 30 }, (_, i) => i + 1)
    const heatmapData = []
    
    days.forEach((day, dayIdx) => {
      users.forEach((user, userIdx) => {
        // 模拟非工作时间登录次数（0-6点）
        const value = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0
        if (value > 0) {
          heatmapData.push([dayIdx, userIdx, value])
        }
      })
    })
    return { users, days, heatmapData }
  }

  const { users, days, heatmapData } = data?.nonWorkHours || generateHeatmapData()

  const option = {
    title: {
      text: '非工作时段登录热力图（0:00-6:00）',
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        return `日期: 11-${String(params.value[0] + 1).padStart(2, '0')}<br/>` +
               `账户: ${users[params.value[1]]}<br/>` +
               `登录次数: ${params.value[2]} 次`
      }
    },
    grid: {
      height: '60%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: days.map(d => `${d}日`),
      splitArea: { show: true },
      axisLabel: { interval: 2 }
    },
    yAxis: {
      type: 'category',
      data: users.map(u => `用户${u}`),
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: 5,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      text: ['高风险', '低风险'],
      inRange: {
        color: ['#e6f7e6', '#ffeda0', '#feb24c', '#f03b20']
      }
    },
    series: [{
      name: '非工作时段登录',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  return <ReactECharts option={option} style={{ height: '450px' }} />
}

// 3. TCP大流量传输折线图（带阈值线）
export const TcpTrafficLineChart = ({ data }) => {
  const generateTcpData = () => {
    const days = []
    for (let i = 1; i <= 30; i++) {
      days.push({
        date: `11-${String(i).padStart(2, '0')}`,
        count: Math.floor(Math.random() * 50) + 20,
        abnormal: Math.floor(Math.random() * 10)
      })
    }
    return days
  }

  const tcpData = data?.tcpTraffic || generateTcpData()
  const threshold = 60

  const option = {
    title: {
      text: 'TCP大流量传输趋势（标注阈值线）',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = params[0].axisValue + '<br/>'
        params.forEach(p => {
          if (p.seriesName !== '阈值线') {
            result += `${p.marker} ${p.seriesName}: ${p.value}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['正常传输', '异常传输', '阈值线'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: tcpData.map(d => d.date),
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '传输次数'
    },
    series: [
      {
        name: '正常传输',
        type: 'line',
        data: tcpData.map(d => d.count),
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24,144,255,0.3)' },
              { offset: 1, color: 'rgba(24,144,255,0.05)' }
            ]
          }
        }
      },
      {
        name: '异常传输',
        type: 'line',
        data: tcpData.map(d => d.abnormal),
        smooth: true,
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '阈值线',
        type: 'line',
        data: tcpData.map(() => threshold),
        lineStyle: {
          type: 'dashed',
          color: '#faad14',
          width: 2
        },
        symbol: 'none'
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '400px' }} />
}

// 4. 邮件关键词词云图
export const EmailKeywordCloud = ({ data }) => {
  const generateKeywords = () => {
    const keywords = [
      { name: '税务', value: 156, type: 'normal' },
      { name: '合同', value: 134, type: 'normal' },
      { name: '报表', value: 128, type: 'normal' },
      { name: '会议', value: 112, type: 'normal' },
      { name: '项目', value: 98, type: 'normal' },
      { name: '新葡京', value: 45, type: 'sensitive' },
      { name: '中奖', value: 38, type: 'sensitive' },
      { name: '红包', value: 32, type: 'sensitive' },
      { name: '财务', value: 89, type: 'normal' },
      { name: '密码', value: 23, type: 'sensitive' },
      { name: '资料', value: 76, type: 'normal' },
      { name: '通知', value: 145, type: 'normal' },
      { name: '审批', value: 67, type: 'normal' },
      { name: '账号', value: 34, type: 'sensitive' },
      { name: '彩票', value: 28, type: 'sensitive' }
    ]
    return keywords
  }

  const keywords = data?.emailKeywords || generateKeywords()

  // 使用柱状图展示关键词（词云需要额外插件，这里用柱状图替代展示效果）
  const normalKeywords = keywords.filter(k => k.type === 'normal').sort((a, b) => b.value - a.value)
  const sensitiveKeywords = keywords.filter(k => k.type === 'sensitive').sort((a, b) => b.value - a.value)

  const option = {
    title: {
      text: '邮件关键词分布',
      subtext: '红色：敏感关键词 | 蓝色：普通关键词',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['普通关键词', '敏感关键词'],
      top: 50
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [...normalKeywords, ...sensitiveKeywords].map(k => k.name),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '出现次数'
    },
    series: [
      {
        name: '普通关键词',
        type: 'bar',
        data: [...normalKeywords, ...sensitiveKeywords].map(k => 
          k.type === 'normal' ? k.value : 0
        ),
        itemStyle: { color: '#1890ff' }
      },
      {
        name: '敏感关键词',
        type: 'bar',
        data: [...normalKeywords, ...sensitiveKeywords].map(k => 
          k.type === 'sensitive' ? k.value : 0
        ),
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '400px' }} />
}

// 5. 异常流量散点图（IP vs 流量，颜色标风险等级）
export const AbnormalTrafficScatter = ({ data }) => {
  const generateScatterData = () => {
    const scatterData = []
    for (let i = 0; i < 50; i++) {
      const traffic = Math.random() * 5000 + 100
      const connections = Math.floor(Math.random() * 200) + 10
      let risk = 'low'
      if (traffic > 3000 || connections > 150) risk = 'high'
      else if (traffic > 1500 || connections > 80) risk = 'medium'
      
      scatterData.push({
        ip: `10.64.105.${100 + i}`,
        traffic: Math.round(traffic),
        connections,
        risk
      })
    }
    return scatterData
  }

  const scatterData = data?.abnormalTraffic || generateScatterData()

  const option = {
    title: {
      text: '异常流量连接散点图',
      subtext: '点击查看IP详情 | 颜色表示风险等级',
      left: 'center'
    },
    tooltip: {
      formatter: (params) => {
        const d = scatterData[params.dataIndex]
        return `IP: ${d.ip}<br/>` +
               `流量: ${d.traffic} MB<br/>` +
               `连接数: ${d.connections}<br/>` +
               `风险等级: ${d.risk === 'high' ? '高危' : d.risk === 'medium' ? '中危' : '低危'}`
      }
    },
    legend: {
      data: ['高危', '中危', '低危'],
      top: 50,
      right: 10
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '流量 (MB)',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    yAxis: {
      type: 'value',
      name: '连接数',
      splitLine: { lineStyle: { type: 'dashed' } }
    },
    series: [
      {
        name: '高危',
        type: 'scatter',
        symbolSize: 15,
        data: scatterData.filter(d => d.risk === 'high').map(d => [d.traffic, d.connections]),
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '中危',
        type: 'scatter',
        symbolSize: 12,
        data: scatterData.filter(d => d.risk === 'medium').map(d => [d.traffic, d.connections]),
        itemStyle: { color: '#faad14' }
      },
      {
        name: '低危',
        type: 'scatter',
        symbolSize: 8,
        data: scatterData.filter(d => d.risk === 'low').map(d => [d.traffic, d.connections]),
        itemStyle: { color: '#52c41a' }
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: '450px' }} />
}

// 6. 员工邮件沟通网络力导向图
export const EmailNetworkGraph = ({ data }) => {
  const generateNetworkData = () => {
    const employees = []
    for (let i = 0; i < 20; i++) {
      employees.push({
        id: `${1000 + i * 20}`,
        name: `员工${1000 + i * 20}`,
        category: i < 5 ? 0 : i < 12 ? 1 : 2, // 0:财务, 1:研发, 2:人力
        value: Math.floor(Math.random() * 50) + 10
      })
    }
    
    const links = []
    for (let i = 0; i < 40; i++) {
      const source = employees[Math.floor(Math.random() * employees.length)].id
      let target = employees[Math.floor(Math.random() * employees.length)].id
      while (target === source) {
        target = employees[Math.floor(Math.random() * employees.length)].id
      }
      links.push({
        source,
        target,
        value: Math.floor(Math.random() * 20) + 1
      })
    }
    
    return { employees, links }
  }

  const { employees, links } = data?.emailNetwork || generateNetworkData()

  const option = {
    title: {
      text: '员工邮件沟通网络',
      subtext: '节点大小表示邮件量，连线粗细表示交互频率',
      left: 'center'
    },
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>邮件数: ${params.data.value} 封`
        }
        return `${params.data.name}<br/>邮件量: ${params.data.value} 封`
      }
    },
    legend: {
      data: ['财务部门', '研发部门', '人力部门'],
      top: 50
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: employees.map(e => ({
        id: e.id,
        name: e.name,
        value: e.value,
        symbolSize: Math.min(e.value, 50),
        category: e.category
      })),
      links: links,
      categories: [
        { name: '财务部门', itemStyle: { color: '#ff7875' } },
        { name: '研发部门', itemStyle: { color: '#69c0ff' } },
        { name: '人力部门', itemStyle: { color: '#95de64' } }
      ],
      roam: true,
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3,
        opacity: 0.6
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 4, opacity: 1 }
      },
      force: {
        repulsion: 300,
        gravity: 0.1,
        edgeLength: [80, 200]
      }
    }]
  }

  return <ReactECharts option={option} style={{ height: '550px' }} />
}

// 7. 安全风险等级分布饼图
export const RiskLevelPieChart = ({ data }) => {
  const riskData = data?.riskLevels || [
    { name: '高危', value: 12, description: '研发服务器数据外泄、账户暴力破解' },
    { name: '中危', value: 28, description: '财务敏感邮件对外发送' },
    { name: '低危', value: 7, description: '员工未打卡但网络活跃' }
  ]

  const option = {
    title: {
      text: '安全风险等级分布',
      subtext: `总计 ${riskData.reduce((a, b) => a + b.value, 0)} 个风险`,
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const item = riskData.find(d => d.name === params.name)
        return `${params.name}: ${params.value} 个 (${params.percent}%)<br/>` +
               `<span style="font-size:12px;color:#666">${item?.description || ''}</span>`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 60
    },
    series: [{
      name: '风险等级',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['55%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{c} 个 ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: riskData[0].value, name: '高危', itemStyle: { color: '#ff4d4f' } },
        { value: riskData[1].value, name: '中危', itemStyle: { color: '#faad14' } },
        { value: riskData[2].value, name: '低危', itemStyle: { color: '#1890ff' } }
      ]
    }]
  }

  return <ReactECharts option={option} style={{ height: '400px' }} />
}

export default {
  FailedLoginChart,
  NonWorkHoursHeatmap,
  TcpTrafficLineChart,
  EmailKeywordCloud,
  AbnormalTrafficScatter,
  EmailNetworkGraph,
  RiskLevelPieChart
}
