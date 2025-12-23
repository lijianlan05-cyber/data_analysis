import React from 'react'
import { Card, Timeline, Tag } from 'antd'
import { Clock, AlertTriangle, Shield, Activity, Mail, LogIn } from 'lucide-react'
import ReactECharts from 'echarts-for-react'

const TimelineAnalysis = () => {
  const events = [
    {
      time: '2017-11-01 02:00:00',
      type: 'normal',
      title: '系统定时任务执行',
      description: '邮件服务器执行定时备份任务',
      icon: <Activity size={16} />
    },
    {
      time: '2017-11-05 14:23:45',
      type: 'warning',
      title: '检测到暴力破解尝试',
      description: '用户 1234 连续登录失败 25 次',
      icon: <AlertTriangle size={16} />
    },
    {
      time: '2017-11-08 09:15:32',
      type: 'danger',
      title: '异常流量告警',
      description: 'IP 10.64.105.123 产生异常大流量 2.3 GB',
      icon: <Shield size={16} />
    },
    {
      time: '2017-11-12 03:45:12',
      type: 'warning',
      title: '非工作时间登录',
      description: '用户 1456 在凌晨时段登录系统',
      icon: <LogIn size={16} />
    },
    {
      time: '2017-11-15 16:30:21',
      type: 'warning',
      title: '异常邮件发送',
      description: '账户 1234@hightech.com 短时间内发送大量邮件',
      icon: <Mail size={16} />
    },
    {
      time: '2017-11-18 11:20:15',
      type: 'danger',
      title: '垃圾邮件攻击',
      description: '检测到大量垃圾邮件涌入',
      icon: <AlertTriangle size={16} />
    },
    {
      time: '2017-11-22 08:45:33',
      type: 'normal',
      title: '系统更新',
      description: '服务器安全补丁更新完成',
      icon: <Shield size={16} />
    },
    {
      time: '2017-11-25 19:12:44',
      type: 'warning',
      title: '数据库异常访问',
      description: '检测到多次数据库登录失败',
      icon: <AlertTriangle size={16} />
    }
  ]

  const getTimelineChartOption = () => {
    // 按天统计事件数量
    const dailyEvents = {}
    events.forEach(event => {
      const date = event.time.split(' ')[0]
      if (!dailyEvents[date]) {
        dailyEvents[date] = { normal: 0, warning: 0, danger: 0 }
      }
      dailyEvents[date][event.type]++
    })

    const dates = Object.keys(dailyEvents).sort()
    const normalData = dates.map(d => dailyEvents[d].normal)
    const warningData = dates.map(d => dailyEvents[d].warning)
    const dangerData = dates.map(d => dailyEvents[d].danger)

    return {
      title: {
        text: '安全事件时间线',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['正常事件', '警告事件', '危险事件'],
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
        boundaryGap: false,
        data: dates.map(d => d.substring(5))
      },
      yAxis: {
        type: 'value',
        name: '事件数量'
      },
      series: [
        {
          name: '正常事件',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          data: normalData,
          itemStyle: { color: '#52c41a' }
        },
        {
          name: '警告事件',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          data: warningData,
          itemStyle: { color: '#faad14' }
        },
        {
          name: '危险事件',
          type: 'line',
          stack: 'Total',
          areaStyle: {},
          data: dangerData,
          itemStyle: { color: '#ff4d4f' }
        }
      ]
    }
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'danger':
        return 'red'
      case 'warning':
        return 'orange'
      default:
        return 'blue'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <ReactECharts 
          option={getTimelineChartOption()} 
          style={{ height: '400px' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </Card>

      <Card title="事件详细时间线">
        <Timeline mode="left">
          {events.map((event, idx) => (
            <Timeline.Item
              key={idx}
              color={getEventTypeColor(event.type)}
              label={event.time}
            >
              <Card size="small" className="mb-2">
                <div className="flex items-start space-x-2">
                  <div className="mt-1">{event.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{event.title}</span>
                      <Tag color={getEventTypeColor(event.type)}>
                        {event.type === 'danger' ? '危险' : event.type === 'warning' ? '警告' : '正常'}
                      </Tag>
                    </div>
                    <div className="text-gray-600 text-sm">{event.description}</div>
                  </div>
                </div>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </div>
  )
}

export default TimelineAnalysis
