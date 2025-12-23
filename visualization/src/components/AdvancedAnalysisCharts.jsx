import React from 'react'
import ReactECharts from 'echarts-for-react'
import { Table, Tag, Alert } from 'antd'

// 1. 未打卡但网络活跃员工检测
export const AbsentButActiveChart = ({ data }) => {
  const generateData = () => {
    // 模拟未打卡但网络活跃的员工数据
    const employees = []
    const suspiciousUsers = ['1041', '1238', '1125', '1230', '1087', '1007', '1180']
    
    suspiciousUsers.forEach((userId, idx) => {
      employees.push({
        userId,
        absentDays: Math.floor(Math.random() * 5) + 1,
        loginCount: Math.floor(Math.random() * 50) + 20,
        webAccessCount: Math.floor(Math.random() * 100) + 50,
        tcpConnections: Math.floor(Math.random() * 200) + 100,
        riskLevel: idx < 3 ? 'high' : 'medium'
      })
    })
    return employees.sort((a, b) => b.loginCount - a.loginCount)
  }

  const suspiciousData = data?.absentButActive || generateData()

  const columns = [
    {
      title: '员工ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (text) => <span style={{ fontWeight: 'bold' }}>用户{text}</span>
    },
    {
      title: '未打卡天数',
      dataIndex: 'absentDays',
      key: 'absentDays',
      render: (val) => <Tag color="orange">{val}天</Tag>
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount'
    },
    {
      title: '网页访问',
      dataIndex: 'webAccessCount',
      key: 'webAccessCount'
    },
    {
      title: 'TCP连接',
      dataIndex: 'tcpConnections',
      key: 'tcpConnections'
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level) => (
        <Tag color={level === 'high' ? 'red' : 'orange'}>
          {level === 'high' ? '高风险' : '中风险'}
        </Tag>
      )
    }
  ]

  const chartOption = {
    title: {
      text: '未打卡但网络活跃员工分析',
      subtext: '检测离岗但仍有网络活动的异常行为',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['登录次数', '网页访问', 'TCP连接'],
      top: 50
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '25%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: suspiciousData.map(d => `用户${d.userId}`)
    },
    yAxis: {
      type: 'value',
      name: '活动次数'
    },
    series: [
      {
        name: '登录次数',
        type: 'bar',
        data: suspiciousData.map(d => d.loginCount),
        itemStyle: { color: '#ff4d4f' }
      },
      {
        name: '网页访问',
        type: 'bar',
        data: suspiciousData.map(d => d.webAccessCount),
        itemStyle: { color: '#faad14' }
      },
      {
        name: 'TCP连接',
        type: 'bar',
        data: suspiciousData.map(d => d.tcpConnections),
        itemStyle: { color: '#1890ff' }
      }
    ]
  }

  return (
    <div>
      <Alert
        message="异常行为检测"
        description={`检测到 ${suspiciousData.length} 名员工存在未打卡但网络活跃的异常行为`}
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <ReactECharts option={chartOption} style={{ height: '350px' }} />
      <Table
        columns={columns}
        dataSource={suspiciousData.map((d, idx) => ({ ...d, key: idx }))}
        pagination={false}
        size="small"
        style={{ marginTop: 16 }}
      />
    </div>
  )
}

// 2. 敏感网站访问分析
export const SensitiveWebsiteChart = ({ data }) => {
  const generateData = () => {
    return {
      categories: [
        { name: '网盘类', sites: ['pan.baidu.com', '115.com', 'weiyun.com'], count: 234, risk: 'high' },
        { name: '社交平台', sites: ['weixin.qq.com', 'weibo.com', 'zhihu.com'], count: 567, risk: 'medium' },
        { name: '求职网站', sites: ['zhaopin.com', '51job.com', 'liepin.com'], count: 89, risk: 'high' },
        { name: '邮箱服务', sites: ['mail.163.com', 'mail.qq.com'], count: 156, risk: 'medium' },
        { name: '云存储', sites: ['dropbox.com', 'onedrive.com'], count: 45, risk: 'high' },
        { name: '代码托管', sites: ['github.com', 'gitee.com'], count: 312, risk: 'medium' }
      ],
      topUsers: [
        { userId: '1234', sensitiveAccess: 78, category: '网盘类' },
        { userId: '1456', sensitiveAccess: 65, category: '社交平台' },
        { userId: '1678', sensitiveAccess: 52, category: '求职网站' },
        { userId: '1890', sensitiveAccess: 48, category: '网盘类' },
        { userId: '1123', sensitiveAccess: 41, category: '云存储' }
      ]
    }
  }

  const sensitiveData = data?.sensitiveWebsites || generateData()

  const pieOption = {
    title: {
      text: '敏感网站访问类别分布',
      subtext: '红色标记为高风险类别',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const cat = sensitiveData.categories.find(c => c.name === params.name)
        return `${params.name}<br/>访问次数: ${params.value}<br/>` +
               `包含: ${cat?.sites.join(', ')}<br/>` +
               `风险等级: ${cat?.risk === 'high' ? '高' : '中'}`
      }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 60
    },
    series: [{
      name: '敏感网站',
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['55%', '55%'],
      data: sensitiveData.categories.map(cat => ({
        value: cat.count,
        name: cat.name,
        itemStyle: {
          color: cat.risk === 'high' ? '#ff4d4f' : '#faad14'
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
        formatter: '{b}\n{c}次 ({d}%)'
      }
    }]
  }

  const barOption = {
    title: {
      text: '敏感网站访问TOP5员工',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '访问次数'
    },
    yAxis: {
      type: 'category',
      data: sensitiveData.topUsers.map(u => `用户${u.userId}`),
      inverse: true
    },
    series: [{
      name: '敏感访问次数',
      type: 'bar',
      data: sensitiveData.topUsers.map(u => ({
        value: u.sensitiveAccess,
        itemStyle: { color: u.sensitiveAccess > 60 ? '#ff4d4f' : '#faad14' }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: (params) => {
          const user = sensitiveData.topUsers[params.dataIndex]
          return `${params.value}次 (${user.category})`
        }
      }
    }]
  }

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 350 }}>
        <ReactECharts option={pieOption} style={{ height: '400px' }} />
      </div>
      <div style={{ flex: 1, minWidth: 350 }}>
        <ReactECharts option={barOption} style={{ height: '400px' }} />
      </div>
    </div>
  )
}

// 3. 邮件外部域名风险分析
export const EmailDomainRiskChart = ({ data }) => {
  const generateData = () => {
    return {
      domains: [
        { domain: 'qq.com', count: 456, type: 'personal', risk: 'medium' },
        { domain: 'sina.com', count: 234, type: 'personal', risk: 'medium' },
        { domain: '163.com', count: 189, type: 'personal', risk: 'low' },
        { domain: 'gmail.com', count: 67, type: 'foreign', risk: 'high' },
        { domain: 'outlook.com', count: 45, type: 'foreign', risk: 'medium' },
        { domain: 'unknown-domain.xyz', count: 23, type: 'suspicious', risk: 'high' },
        { domain: 'temp-mail.org', count: 12, type: 'suspicious', risk: 'high' }
      ],
      spamSources: [
        { domain: 'qq.com', spamCount: 89, subject: '新葡京、彩票类' },
        { domain: 'sina.com', spamCount: 45, subject: '个人资料、照片类' },
        { domain: '163.com', spamCount: 23, subject: '中奖通知类' }
      ]
    }
  }

  const domainData = data?.emailDomains || generateData()

  const option = {
    title: {
      text: '外部邮件域名风险分布',
      subtext: '颜色表示风险等级：红=高危 橙=中危 绿=低危',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const domain = domainData.domains[params[0].dataIndex]
        return `域名: ${domain.domain}<br/>` +
               `邮件数: ${domain.count}<br/>` +
               `类型: ${domain.type === 'personal' ? '个人邮箱' : 
                       domain.type === 'foreign' ? '境外邮箱' : '可疑域名'}<br/>` +
               `风险: ${domain.risk === 'high' ? '高' : domain.risk === 'medium' ? '中' : '低'}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: domainData.domains.map(d => d.domain),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '邮件数量'
    },
    series: [{
      name: '邮件数量',
      type: 'bar',
      data: domainData.domains.map(d => ({
        value: d.count,
        itemStyle: {
          color: d.risk === 'high' ? '#ff4d4f' : 
                 d.risk === 'medium' ? '#faad14' : '#52c41a'
        }
      })),
      label: {
        show: true,
        position: 'top'
      }
    }]
  }

  const spamOption = {
    title: {
      text: '垃圾邮件来源域名分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: '垃圾邮件',
      type: 'pie',
      radius: '60%',
      data: domainData.spamSources.map(s => ({
        value: s.spamCount,
        name: s.domain
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: {
        formatter: '{b}\n{c}封 ({d}%)'
      }
    }]
  }

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 2, minWidth: 400 }}>
        <ReactECharts option={option} style={{ height: '400px' }} />
      </div>
      <div style={{ flex: 1, minWidth: 300 }}>
        <ReactECharts option={spamOption} style={{ height: '400px' }} />
      </div>
    </div>
  )
}

// 4. 部门行为特征对比（按员工ID范围划分部门）
export const DepartmentBehaviorChart = ({ data }) => {
  const generateData = () => {
    // 假设：1000-1199研发部, 1200-1399财务部, 1400-1599人力部
    return {
      departments: ['研发部', '财务部', '人力部'],
      metrics: {
        loginCount: [45678, 12345, 8976],
        webAccess: [89012, 34567, 23456],
        tcpTraffic: [256.78, 89.34, 45.67], // GB
        emailCount: [23456, 18765, 12345],
        avgWorkHours: [9.8, 8.5, 8.2]
      },
      anomalies: {
        '研发部': { count: 12, types: ['异常登录', '大流量传输'] },
        '财务部': { count: 8, types: ['敏感邮件', '非工作时间活动'] },
        '人力部': { count: 3, types: ['外部网站访问'] }
      }
    }
  }

  const deptData = data?.departmentBehavior || generateData()

  const radarOption = {
    title: {
      text: '各部门网络行为特征雷达图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: deptData.departments,
      top: 30
    },
    radar: {
      indicator: [
        { name: '登录活动', max: 50000 },
        { name: '网页访问', max: 100000 },
        { name: 'TCP流量(GB)', max: 300 },
        { name: '邮件数量', max: 30000 },
        { name: '平均工时', max: 12 }
      ],
      center: ['50%', '55%'],
      radius: '60%'
    },
    series: [{
      type: 'radar',
      data: deptData.departments.map((dept, idx) => ({
        value: [
          deptData.metrics.loginCount[idx],
          deptData.metrics.webAccess[idx],
          deptData.metrics.tcpTraffic[idx],
          deptData.metrics.emailCount[idx],
          deptData.metrics.avgWorkHours[idx]
        ],
        name: dept,
        areaStyle: { opacity: 0.3 }
      }))
    }]
  }

  const barOption = {
    title: {
      text: '各部门异常行为统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const dept = params[0].name
        const anomaly = deptData.anomalies[dept]
        return `${dept}<br/>异常数: ${anomaly?.count || 0}<br/>` +
               `主要类型: ${anomaly?.types?.join(', ') || '无'}`
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
      data: deptData.departments
    },
    yAxis: {
      type: 'value',
      name: '异常数量'
    },
    series: [{
      name: '异常数量',
      type: 'bar',
      data: deptData.departments.map(dept => ({
        value: deptData.anomalies[dept]?.count || 0,
        itemStyle: {
          color: deptData.anomalies[dept]?.count > 10 ? '#ff4d4f' :
                 deptData.anomalies[dept]?.count > 5 ? '#faad14' : '#52c41a'
        }
      })),
      label: {
        show: true,
        position: 'top'
      }
    }]
  }

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 400 }}>
        <ReactECharts option={radarOption} style={{ height: '450px' }} />
      </div>
      <div style={{ flex: 1, minWidth: 400 }}>
        <ReactECharts option={barOption} style={{ height: '450px' }} />
      </div>
    </div>
  )
}

// 5. 跨部门登录检测
export const CrossDepartmentLoginChart = ({ data }) => {
  const generateData = () => {
    // 模拟跨部门登录数据
    return {
      crossLogins: [
        { user: '1234', dept: '财务部', targetServer: '研发服务器A', count: 15, time: '2017-11-15 02:30' },
        { user: '1456', dept: '人力部', targetServer: '财务数据库', count: 8, time: '2017-11-18 23:45' },
        { user: '1678', dept: '研发部', targetServer: '人力系统', count: 5, time: '2017-11-20 01:20' },
        { user: '1890', dept: '财务部', targetServer: '研发服务器B', count: 12, time: '2017-11-22 03:15' },
        { user: '1123', dept: '人力部', targetServer: '研发Git服务器', count: 3, time: '2017-11-25 22:30' }
      ],
      serverDeptMap: {
        '研发服务器A': '研发部',
        '研发服务器B': '研发部',
        '研发Git服务器': '研发部',
        '财务数据库': '财务部',
        '人力系统': '人力部'
      }
    }
  }

  const crossData = data?.crossDeptLogin || generateData()

  const columns = [
    {
      title: '员工ID',
      dataIndex: 'user',
      key: 'user',
      render: (text) => <span style={{ fontWeight: 'bold' }}>用户{text}</span>
    },
    {
      title: '所属部门',
      dataIndex: 'dept',
      key: 'dept',
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: '访问服务器',
      dataIndex: 'targetServer',
      key: 'targetServer',
      render: (server) => <Tag color="orange">{server}</Tag>
    },
    {
      title: '登录次数',
      dataIndex: 'count',
      key: 'count',
      render: (count) => (
        <span style={{ color: count > 10 ? '#ff4d4f' : '#faad14', fontWeight: 'bold' }}>
          {count}次
        </span>
      )
    },
    {
      title: '最近登录时间',
      dataIndex: 'time',
      key: 'time'
    },
    {
      title: '风险等级',
      key: 'risk',
      render: (_, record) => (
        <Tag color={record.count > 10 ? 'red' : record.count > 5 ? 'orange' : 'gold'}>
          {record.count > 10 ? '高危' : record.count > 5 ? '中危' : '低危'}
        </Tag>
      )
    }
  ]

  // 桑基图展示跨部门访问流向
  const sankeyOption = {
    title: {
      text: '跨部门服务器访问流向',
      subtext: '员工部门 → 目标服务器',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: {
        focus: 'adjacency'
      },
      data: [
        { name: '财务部员工' },
        { name: '人力部员工' },
        { name: '研发部员工' },
        { name: '研发服务器A' },
        { name: '研发服务器B' },
        { name: '研发Git服务器' },
        { name: '财务数据库' },
        { name: '人力系统' }
      ],
      links: [
        { source: '财务部员工', target: '研发服务器A', value: 15 },
        { source: '财务部员工', target: '研发服务器B', value: 12 },
        { source: '人力部员工', target: '财务数据库', value: 8 },
        { source: '人力部员工', target: '研发Git服务器', value: 3 },
        { source: '研发部员工', target: '人力系统', value: 5 }
      ],
      lineStyle: {
        color: 'gradient',
        curveness: 0.5
      }
    }]
  }

  return (
    <div>
      <Alert
        message="跨部门登录风险检测"
        description={`检测到 ${crossData.crossLogins.length} 条跨部门异常登录记录，请核实是否为授权访问`}
        type="error"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 500 }}>
          <ReactECharts option={sankeyOption} style={{ height: '400px' }} />
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={crossData.crossLogins.map((d, idx) => ({ ...d, key: idx }))}
        pagination={false}
        style={{ marginTop: 16 }}
      />
    </div>
  )
}

// 6. 每小时流量趋势
export const HourlyTrafficChart = ({ data }) => {
  const generateData = () => {
    const hourlyData = []
    for (let h = 0; h < 24; h++) {
      // 模拟工作时间流量高，非工作时间流量低
      let baseTraffic = 5
      if (h >= 9 && h <= 18) {
        baseTraffic = 25 + Math.random() * 15
      } else if (h >= 7 && h <= 22) {
        baseTraffic = 10 + Math.random() * 10
      } else {
        baseTraffic = 2 + Math.random() * 5
      }
      
      hourlyData.push({
        hour: h,
        traffic: Math.round(baseTraffic * 10) / 10,
        connections: Math.floor(baseTraffic * 100 + Math.random() * 500)
      })
    }
    return hourlyData
  }

  const hourlyData = data?.hourlyTraffic || generateData()
  
  // 计算平均值作为阈值
  const avgTraffic = hourlyData.reduce((sum, d) => sum + d.traffic, 0) / 24
  const threshold = Math.round(avgTraffic * 1.5 * 10) / 10

  const option = {
    title: {
      text: '24小时流量趋势分析',
      subtext: `阈值线: ${threshold} GB (平均值的1.5倍)`,
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `${params[0].axisValue}<br/>`
        params.forEach(p => {
          if (p.seriesName === '阈值') return
          const unit = p.seriesName === '流量' ? ' GB' : ' 次'
          result += `${p.marker} ${p.seriesName}: ${p.value}${unit}<br/>`
        })
        return result
      }
    },
    legend: {
      data: ['流量', '连接数', '阈值'],
      top: 50
    },
    grid: {
      left: '3%',
      right: '10%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(d => `${d.hour}:00`),
      boundaryGap: false
    },
    yAxis: [
      {
        type: 'value',
        name: '流量 (GB)',
        position: 'left'
      },
      {
        type: 'value',
        name: '连接数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '流量',
        type: 'line',
        data: hourlyData.map(d => d.traffic),
        smooth: true,
        itemStyle: { color: '#1890ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24,144,255,0.4)' },
              { offset: 1, color: 'rgba(24,144,255,0.05)' }
            ]
          }
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markArea: {
          silent: true,
          data: [[
            { xAxis: '0:00', itemStyle: { color: 'rgba(255,77,79,0.1)' } },
            { xAxis: '6:00' }
          ], [
            { xAxis: '22:00', itemStyle: { color: 'rgba(255,77,79,0.1)' } },
            { xAxis: '23:00' }
          ]]
        }
      },
      {
        name: '连接数',
        type: 'bar',
        yAxisIndex: 1,
        data: hourlyData.map(d => d.connections),
        itemStyle: { color: 'rgba(82,196,26,0.6)' }
      },
      {
        name: '阈值',
        type: 'line',
        data: hourlyData.map(() => threshold),
        lineStyle: {
          type: 'dashed',
          color: '#ff4d4f',
          width: 2
        },
        symbol: 'none'
      }
    ]
  }

  return (
    <div>
      <ReactECharts option={option} style={{ height: '450px' }} />
      <div style={{ 
        background: '#fff7e6', 
        padding: 12, 
        borderRadius: 8, 
        marginTop: 16,
        border: '1px solid #ffd591'
      }}>
        <strong>分析说明：</strong>
        <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
          <li>红色区域标记非工作时间段（0:00-6:00, 22:00-24:00）</li>
          <li>虚线为流量阈值（平均值的1.5倍），超过此值需要关注</li>
          <li>流量高峰通常出现在9:00-18:00工作时间</li>
        </ul>
      </div>
    </div>
  )
}

export default {
  AbsentButActiveChart,
  SensitiveWebsiteChart,
  EmailDomainRiskChart,
  DepartmentBehaviorChart,
  CrossDepartmentLoginChart,
  HourlyTrafficChart
}
