import React, { useState, useEffect } from 'react'
import { Layout, Menu, Card, Statistic, Row, Col, Alert, Tabs, Badge } from 'antd'
import { 
  Shield, 
  Activity, 
  Users, 
  Mail, 
  Network, 
  AlertTriangle,
  TrendingUp,
  Clock,
  Building2,
  FileWarning,
  Globe
} from 'lucide-react'
import LoginSecurityChart from './components/LoginSecurityChart'
import NetworkTrafficChart from './components/NetworkTrafficChart'
import EmployeeBehaviorChart from './components/EmployeeBehaviorChart'
import ThreatDetectionPanel from './components/ThreatDetectionPanel'
import NetworkTopology from './components/NetworkTopology'
import TimelineAnalysis from './components/TimelineAnalysis'
import { 
  AbsentButActiveChart, 
  SensitiveWebsiteChart, 
  EmailDomainRiskChart,
  DepartmentBehaviorChart,
  CrossDepartmentLoginChart,
  HourlyTrafficChart 
} from './components/AdvancedAnalysisCharts'

const { Header, Content, Sider } = Layout
const { TabPane } = Tabs

function App() {
  const [selectedMenu, setSelectedMenu] = useState('overview')
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 加载分析数据
    loadAnalysisData()
  }, [])

  const loadAnalysisData = async () => {
    try {
      // 在实际应用中，这里会从后端API加载数据
      // 这里使用模拟数据
      const mockData = {
        summary: {
          total_login_records: 87234,
          login_error_rate: 0.156,
          total_web_access: 221456,
          total_emails: 57893,
          spam_emails: 1247,
          total_traffic_gb: 458.67,
          total_threats: 47,
          high_severity_threats: 12
        },
        loginSecurity: {
          hourlyDistribution: generateHourlyData(),
          protocolStats: {
            ssh: 45234,
            ftp: 12456,
            mysql: 8934,
            tds: 6789,
            mongodb: 3421
          },
          errorRate: 0.156
        },
        networkTraffic: {
          dailyTraffic: generateDailyTraffic(),
          protocolTraffic: {
            smtp: 156.78,
            ssh: 89.34,
            http: 145.23,
            https: 67.32
          }
        },
        employeeBehavior: {
          workHours: generateWorkHoursData(),
          websiteCategories: {
            '内部系统': 145678,
            '搜索引擎': 23456,
            '电商': 12345,
            '新闻娱乐': 8765,
            '其他': 31212
          }
        },
        threats: generateThreats()
      }
      
      setAnalysisData(mockData)
      setLoading(false)
    } catch (error) {
      console.error('数据加载失败:', error)
      setLoading(false)
    }
  }

  const generateHourlyData = () => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      hours.push({
        hour: i,
        success: Math.floor(Math.random() * 5000) + 1000,
        error: Math.floor(Math.random() * 800) + 100
      })
    }
    return hours
  }

  const generateDailyTraffic = () => {
    const days = []
    for (let i = 1; i <= 30; i++) {
      days.push({
        date: `2017-11-${i.toString().padStart(2, '0')}`,
        traffic: Math.floor(Math.random() * 20) + 10
      })
    }
    return days
  }

  const generateWorkHoursData = () => {
    const data = []
    for (let i = 0; i < 200; i++) {
      data.push(Math.random() * 6 + 6) // 6-12小时
    }
    return data
  }

  const generateThreats = () => {
    return [
      {
        type: '暴力破解',
        severity: 'high',
        description: '用户 1234 登录失败 25 次',
        time: '2017-11-15 14:23:45'
      },
      {
        type: '异常流量',
        severity: 'high',
        description: 'IP 10.64.105.123 产生异常流量 2345.67 MB',
        time: '2017-11-18 09:15:32'
      },
      {
        type: '非工作时间活动',
        severity: 'medium',
        description: '用户 1456 在凌晨(0-6点)登录 8 次',
        time: '2017-11-20 03:45:12'
      },
      {
        type: '异常邮件发送',
        severity: 'medium',
        description: '1234@hightech.com 发送了 78 封邮件',
        time: '2017-11-22 16:30:21'
      }
    ]
  }

  const menuItems = [
    {
      key: 'overview',
      icon: <Activity size={18} />,
      label: '总览'
    },
    {
      key: 'login',
      icon: <Shield size={18} />,
      label: '登录安全'
    },
    {
      key: 'crossDeptLogin',
      icon: <Building2 size={18} />,
      label: '跨部门登录'
    },
    {
      key: 'network',
      icon: <Network size={18} />,
      label: '网络流量'
    },
    {
      key: 'employee',
      icon: <Users size={18} />,
      label: '员工行为'
    },
    {
      key: 'sensitiveAccess',
      icon: <FileWarning size={18} />,
      label: '敏感访问'
    },
    {
      key: 'emailRisk',
      icon: <Mail size={18} />,
      label: '邮件风险'
    },
    {
      key: 'department',
      icon: <Globe size={18} />,
      label: '部门对比'
    },
    {
      key: 'threats',
      icon: <AlertTriangle size={18} />,
      label: '威胁检测'
    },
    {
      key: 'timeline',
      icon: <Clock size={18} />,
      label: '时间线分析'
    }
  ]

  const renderOverview = () => {
    if (!analysisData) return null

    return (
      <div className="space-y-6">
        <Alert
          message="网络安全态势总览"
          description="基于2017年11月企业日志数据的综合分析结果"
          type="info"
          showIcon
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="登录记录总数"
                value={analysisData.summary.total_login_records}
                prefix={<Shield size={20} />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="登录失败率"
                value={analysisData.summary.login_error_rate * 100}
                precision={2}
                suffix="%"
                prefix={<AlertTriangle size={20} />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="总流量"
                value={analysisData.summary.total_traffic_gb}
                precision={2}
                suffix="GB"
                prefix={<TrendingUp size={20} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="检测到威胁"
                value={analysisData.summary.total_threats}
                prefix={<AlertTriangle size={20} />}
                valueStyle={{ color: '#faad14' }}
                suffix={
                  <Badge 
                    count={analysisData.summary.high_severity_threats} 
                    style={{ backgroundColor: '#f5222d', marginLeft: 8 }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="登录时间分布" bordered={false}>
              <LoginSecurityChart data={analysisData.loginSecurity} />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="网络流量趋势" bordered={false}>
              <NetworkTrafficChart data={analysisData.networkTraffic} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="网络拓扑" bordered={false}>
              <NetworkTopology />
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-96">加载中...</div>
    }

    switch (selectedMenu) {
      case 'overview':
        return renderOverview()
      case 'login':
        return (
          <Card title="登录安全分析">
            <LoginSecurityChart data={analysisData?.loginSecurity} detailed />
          </Card>
        )
      case 'crossDeptLogin':
        return (
          <Card title="跨部门登录检测">
            <CrossDepartmentLoginChart />
          </Card>
        )
      case 'network':
        return (
          <div className="space-y-6">
            <Card title="网络流量分析">
              <NetworkTrafficChart data={analysisData?.networkTraffic} detailed />
            </Card>
            <Card title="24小时流量趋势">
              <HourlyTrafficChart />
            </Card>
          </div>
        )
      case 'employee':
        return (
          <div className="space-y-6">
            <Card title="员工行为分析">
              <EmployeeBehaviorChart data={analysisData?.employeeBehavior} />
            </Card>
            <Card title="未打卡但网络活跃员工检测">
              <AbsentButActiveChart />
            </Card>
          </div>
        )
      case 'sensitiveAccess':
        return (
          <Card title="敏感网站访问分析">
            <SensitiveWebsiteChart />
          </Card>
        )
      case 'emailRisk':
        return (
          <Card title="邮件外部域名风险分析">
            <EmailDomainRiskChart />
          </Card>
        )
      case 'department':
        return (
          <Card title="部门行为特征对比">
            <DepartmentBehaviorChart />
          </Card>
        )
      case 'threats':
        return <ThreatDetectionPanel threats={analysisData?.threats} />
      case 'timeline':
        return <TimelineAnalysis />
      default:
        return renderOverview()
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="flex items-center justify-between px-6" style={{ background: '#001529' }}>
        <div className="flex items-center space-x-3">
          <Shield className="text-white" size={32} />
          <h1 className="text-white text-xl font-bold m-0">
            企业网络安全态势感知系统
          </h1>
        </div>
        <div className="text-white text-sm">
          数据周期: 2017-11-01 ~ 2017-11-30
        </div>
      </Header>
      
      <Layout>
        <Sider 
          width={200} 
          style={{ background: '#fff' }}
          breakpoint="lg"
          collapsedWidth="0"
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            onClick={({ key }) => setSelectedMenu(key)}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
