"""
网络监测数据分析与可视化 - 数据处理模块
处理企业日志数据，提取关键特征用于安全态势感知
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import json
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')


class LogDataProcessor:
    """企业日志数据处理器"""
    
    def __init__(self, data_dir):
        """
        初始化数据处理器
        
        Args:
            data_dir: 数据目录路径
        """
        self.data_dir = Path(data_dir)
        self.output_dir = Path('output')
        self.output_dir.mkdir(exist_ok=True)
        
    def load_all_data(self):
        """加载所有30天的数据"""
        print("开始加载数据...")
        
        login_data = []
        weblog_data = []
        tcplog_data = []
        email_data = []
        checking_data = []
        
        # 遍历所有日期文件夹
        for day in range(1, 31):
            date_str = f"2017-11-{day:02d}"
            day_dir = self.data_dir / date_str
            
            if not day_dir.exists():
                continue
                
            print(f"加载 {date_str} 数据...")
            
            # 加载各类日志
            try:
                login_df = pd.read_csv(day_dir / 'login.csv', encoding='utf-8')
                login_data.append(login_df)
            except Exception as e:
                print(f"  Login数据加载失败: {e}")
            
            try:
                weblog_df = pd.read_csv(day_dir / 'weblog.csv', encoding='utf-8')
                weblog_data.append(weblog_df)
            except Exception as e:
                print(f"  Weblog数据加载失败: {e}")
            
            try:
                tcplog_df = pd.read_csv(day_dir / 'tcpLog.csv', encoding='utf-8')
                tcplog_data.append(tcplog_df)
            except Exception as e:
                print(f"  Tcplog数据加载失败: {e}")
            
            try:
                email_df = pd.read_csv(day_dir / 'email.csv', encoding='gbk')
                email_data.append(email_df)
            except Exception as e:
                print(f"  Email数据加载失败: {e}")
            
            try:
                checking_df = pd.read_csv(day_dir / 'checking.csv', encoding='utf-8')
                checking_data.append(checking_df)
            except Exception as e:
                print(f"  Checking数据加载失败: {e}")
        
        # 合并数据
        self.login_df = pd.concat(login_data, ignore_index=True) if login_data else pd.DataFrame()
        self.weblog_df = pd.concat(weblog_data, ignore_index=True) if weblog_data else pd.DataFrame()
        self.tcplog_df = pd.concat(tcplog_data, ignore_index=True) if tcplog_data else pd.DataFrame()
        self.email_df = pd.concat(email_data, ignore_index=True) if email_data else pd.DataFrame()
        self.checking_df = pd.concat(checking_data, ignore_index=True) if checking_data else pd.DataFrame()
        
        print(f"\n数据加载完成:")
        print(f"  Login记录: {len(self.login_df)}")
        print(f"  Weblog记录: {len(self.weblog_df)}")
        print(f"  Tcplog记录: {len(self.tcplog_df)}")
        print(f"  Email记录: {len(self.email_df)}")
        print(f"  Checking记录: {len(self.checking_df)}")
        
        return self
    
    def analyze_login_security(self):
        """分析登录安全问题"""
        print("\n=== 分析1: 登录安全态势 ===")
        
        # 1. 登录失败率分析
        login_stats = self.login_df.groupby('state').size()
        total_logins = len(self.login_df)
        error_rate = login_stats.get('error', 0) / total_logins if total_logins > 0 else 0
        
        print(f"总登录次数: {total_logins}")
        print(f"成功登录: {login_stats.get('success', 0)}")
        print(f"失败登录: {login_stats.get('error', 0)}")
        print(f"失败率: {error_rate:.2%}")
        
        # 2. 异常登录行为检测 - 高频失败用户
        if 'user' in self.login_df.columns:
            error_logins = self.login_df[self.login_df['state'] == 'error']
            user_errors = error_logins.groupby('user').size().sort_values(ascending=False)
            
            print(f"\n登录失败次数TOP10用户:")
            for user, count in user_errors.head(10).items():
                print(f"  用户 {user}: {count} 次失败")
        
        # 3. 协议使用分析
        proto_stats = self.login_df.groupby('proto').agg({
            'state': lambda x: (x == 'error').sum(),
            'user': 'count'
        }).rename(columns={'state': 'errors', 'user': 'total'})
        proto_stats['error_rate'] = proto_stats['errors'] / proto_stats['total']
        
        print(f"\n各协议登录统计:")
        print(proto_stats)
        
        # 4. 时间分布分析
        if 'time' in self.login_df.columns:
            self.login_df['datetime'] = pd.to_datetime(self.login_df['time'])
            self.login_df['hour'] = self.login_df['datetime'].dt.hour
            self.login_df['date'] = self.login_df['datetime'].dt.date
            
            # 非工作时间登录（可疑）
            non_work_hours = self.login_df[
                (self.login_df['hour'] < 7) | (self.login_df['hour'] > 22)
            ]
            print(f"\n非工作时间登录次数: {len(non_work_hours)} ({len(non_work_hours)/total_logins:.2%})")
        
        # 保存结果
        result = {
            'total_logins': int(total_logins),
            'success_logins': int(login_stats.get('success', 0)),
            'error_logins': int(login_stats.get('error', 0)),
            'error_rate': float(error_rate),
            'protocol_stats': proto_stats.to_dict('index'),
            'top_error_users': user_errors.head(20).to_dict() if 'user' in self.login_df.columns else {}
        }
        
        with open(self.output_dir / 'login_security_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        
        return result
    
    def analyze_employee_behavior(self):
        """分析员工行为异常"""
        print("\n=== 分析2: 员工行为分析 ===")
        
        # 1. 打卡异常分析
        self.checking_df['checkin'] = pd.to_datetime(self.checking_df['checkin'], errors='coerce')
        self.checking_df['checkout'] = pd.to_datetime(self.checking_df['checkout'], errors='coerce')
        
        # 计算工作时长
        valid_checks = self.checking_df[
            self.checking_df['checkin'].notna() & 
            self.checking_df['checkout'].notna()
        ].copy()
        
        valid_checks['work_hours'] = (
            valid_checks['checkout'] - valid_checks['checkin']
        ).dt.total_seconds() / 3600
        
        # 异常工作时长
        overtime_workers = valid_checks[valid_checks['work_hours'] > 12]
        undertime_workers = valid_checks[valid_checks['work_hours'] < 4]
        
        print(f"有效打卡记录: {len(valid_checks)}")
        print(f"平均工作时长: {valid_checks['work_hours'].mean():.2f} 小时")
        print(f"超时工作(>12h): {len(overtime_workers)} 次")
        print(f"工时不足(<4h): {len(undertime_workers)} 次")
        
        # 2. 员工网页访问分析
        if 'sip' in self.weblog_df.columns:
            # 提取员工IP
            employee_ips = self.weblog_df['sip'].value_counts()
            
            # 访问外部网站分析
            external_domains = [
                'baidu.com', 'taobao.com', 'sina.com', 'qq.com', 
                'ifeng.com', 'so.com', 'acfun.tv', '6.cn', 'amazon.cn', 'alibaba.com'
            ]
            
            self.weblog_df['is_external'] = self.weblog_df['host'].apply(
                lambda x: any(domain in str(x).lower() for domain in external_domains)
            )
            
            external_access = self.weblog_df[self.weblog_df['is_external']]
            employee_external = external_access.groupby('sip').size().sort_values(ascending=False)
            
            print(f"\n外部网站访问TOP10员工:")
            for ip, count in employee_external.head(10).items():
                print(f"  IP {ip}: {count} 次")
        
        # 3. 邮件行为分析
        if 'from' in self.email_df.columns:
            # 外部邮件检测
            self.email_df['is_external_sender'] = ~self.email_df['from'].str.contains(
                'hightech.com', na=False
            )
            
            external_emails = self.email_df[self.email_df['is_external_sender']]
            
            # 垃圾邮件检测（包含特定关键词）
            spam_keywords = ['新葡京', '赌博', '彩票', 'qq.com', '红包', '中奖']
            self.email_df['is_spam'] = self.email_df['subject'].apply(
                lambda x: any(kw in str(x) for kw in spam_keywords)
            )
            
            spam_emails = self.email_df[self.email_df['is_spam']]
            
            print(f"\n邮件统计:")
            print(f"  总邮件数: {len(self.email_df)}")
            print(f"  外部邮件: {len(external_emails)}")
            print(f"  疑似垃圾邮件: {len(spam_emails)}")
            
            # 接收垃圾邮件最多的员工
            if len(spam_emails) > 0 and 'to' in spam_emails.columns:
                spam_receivers = spam_emails['to'].value_counts().head(10)
                print(f"\n接收垃圾邮件TOP10:")
                for receiver, count in spam_receivers.items():
                    print(f"  {receiver}: {count} 封")
        
        # 保存结果
        result = {
            'checking_stats': {
                'total_records': int(len(valid_checks)),
                'avg_work_hours': float(valid_checks['work_hours'].mean()) if len(valid_checks) > 0 else 0,
                'overtime_count': int(len(overtime_workers)),
                'undertime_count': int(len(undertime_workers))
            },
            'web_access': {
                'total_access': int(len(self.weblog_df)),
                'external_access': int(len(external_access)) if 'is_external' in self.weblog_df.columns else 0,
                'top_external_users': employee_external.head(20).to_dict() if 'sip' in self.weblog_df.columns else {}
            },
            'email_stats': {
                'total_emails': int(len(self.email_df)),
                'external_emails': int(len(external_emails)) if 'is_external_sender' in self.email_df.columns else 0,
                'spam_emails': int(len(spam_emails)) if 'is_spam' in self.email_df.columns else 0
            }
        }
        
        with open(self.output_dir / 'employee_behavior_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        
        return result
    
    def analyze_network_traffic(self):
        """分析网络流量异常"""
        print("\n=== 分析3: 网络流量分析 ===")
        
        # 1. TCP流量统计
        if 'uplink_length' in self.tcplog_df.columns:
            self.tcplog_df['total_traffic'] = (
                self.tcplog_df['uplink_length'] + self.tcplog_df['downlink_length']
            )
            
            total_traffic = self.tcplog_df['total_traffic'].sum()
            avg_traffic = self.tcplog_df['total_traffic'].mean()
            
            print(f"总流量: {total_traffic / (1024**3):.2f} GB")
            print(f"平均连接流量: {avg_traffic / 1024:.2f} KB")
            
            # 异常大流量连接
            large_traffic = self.tcplog_df[
                self.tcplog_df['total_traffic'] > self.tcplog_df['total_traffic'].quantile(0.99)
            ]
            
            print(f"\n异常大流量连接(TOP 1%): {len(large_traffic)} 条")
            
            # 按协议统计流量
            proto_traffic = self.tcplog_df.groupby('proto')['total_traffic'].agg(['sum', 'mean', 'count'])
            proto_traffic['sum_gb'] = proto_traffic['sum'] / (1024**3)
            
            print(f"\n各协议流量统计:")
            print(proto_traffic.sort_values('sum', ascending=False))
        
        # 2. 时间分布分析
        if 'stime' in self.tcplog_df.columns:
            self.tcplog_df['datetime'] = pd.to_datetime(self.tcplog_df['stime'])
            self.tcplog_df['hour'] = self.tcplog_df['datetime'].dt.hour
            self.tcplog_df['date'] = self.tcplog_df['datetime'].dt.date
            
            # 每小时流量统计
            hourly_traffic = self.tcplog_df.groupby('hour')['total_traffic'].sum()
            
            print(f"\n流量高峰时段:")
            for hour in hourly_traffic.nlargest(5).index:
                traffic_gb = hourly_traffic[hour] / (1024**3)
                print(f"  {hour}:00 - {traffic_gb:.2f} GB")
        
        # 3. IP地址分析
        if 'sip' in self.tcplog_df.columns:
            # 源IP流量统计
            ip_traffic = self.tcplog_df.groupby('sip')['total_traffic'].sum().sort_values(ascending=False)
            
            print(f"\n流量TOP10源IP:")
            for ip, traffic in ip_traffic.head(10).items():
                print(f"  {ip}: {traffic / (1024**2):.2f} MB")
        
        # 保存结果
        result = {
            'total_traffic_gb': float(total_traffic / (1024**3)) if 'uplink_length' in self.tcplog_df.columns else 0,
            'avg_connection_kb': float(avg_traffic / 1024) if 'uplink_length' in self.tcplog_df.columns else 0,
            'total_connections': int(len(self.tcplog_df)),
            'protocol_stats': proto_traffic.to_dict('index') if 'uplink_length' in self.tcplog_df.columns else {},
            'top_traffic_ips': ip_traffic.head(20).to_dict() if 'sip' in self.tcplog_df.columns else {}
        }
        
        with open(self.output_dir / 'network_traffic_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        
        return result
    
    def detect_security_threats(self):
        """检测安全威胁"""
        print("\n=== 分析4: 安全威胁检测 ===")
        
        threats = []
        
        # 1. 暴力破解检测
        if 'user' in self.login_df.columns and 'state' in self.login_df.columns:
            error_logins = self.login_df[self.login_df['state'] == 'error']
            user_errors = error_logins.groupby('user').size()
            
            # 失败次数超过10次的用户
            brute_force_suspects = user_errors[user_errors > 10]
            
            for user, count in brute_force_suspects.items():
                threats.append({
                    'type': '暴力破解',
                    'severity': 'high' if count > 20 else 'medium',
                    'description': f'用户 {user} 登录失败 {count} 次',
                    'user': str(user),
                    'count': int(count)
                })
            
            print(f"检测到疑似暴力破解: {len(brute_force_suspects)} 个用户")
        
        # 2. 非工作时间异常活动
        if 'hour' in self.login_df.columns:
            night_logins = self.login_df[
                (self.login_df['hour'] >= 0) & (self.login_df['hour'] < 6)
            ]
            
            if len(night_logins) > 0:
                night_users = night_logins['user'].value_counts()
                
                for user, count in night_users.items():
                    if count > 5:
                        threats.append({
                            'type': '非工作时间活动',
                            'severity': 'medium',
                            'description': f'用户 {user} 在凌晨(0-6点)登录 {count} 次',
                            'user': str(user),
                            'count': int(count)
                        })
                
                print(f"检测到凌晨登录: {len(night_logins)} 次")
        
        # 3. 数据泄露风险 - 大量外发邮件
        if 'from' in self.email_df.columns:
            internal_senders = self.email_df[
                self.email_df['from'].str.contains('hightech.com', na=False)
            ]
            
            sender_counts = internal_senders['from'].value_counts()
            
            # 发送超过50封邮件的员工
            heavy_senders = sender_counts[sender_counts > 50]
            
            for sender, count in heavy_senders.items():
                threats.append({
                    'type': '异常邮件发送',
                    'severity': 'medium',
                    'description': f'{sender} 发送了 {count} 封邮件',
                    'user': str(sender),
                    'count': int(count)
                })
            
            print(f"检测到大量发送邮件: {len(heavy_senders)} 个账户")
        
        # 4. 异常流量检测
        if 'total_traffic' in self.tcplog_df.columns and 'sip' in self.tcplog_df.columns:
            ip_traffic = self.tcplog_df.groupby('sip')['total_traffic'].sum()
            
            # 流量超过平均值3倍的IP
            avg_traffic = ip_traffic.mean()
            abnormal_ips = ip_traffic[ip_traffic > avg_traffic * 3]
            
            for ip, traffic in abnormal_ips.items():
                threats.append({
                    'type': '异常流量',
                    'severity': 'high' if traffic > avg_traffic * 5 else 'medium',
                    'description': f'IP {ip} 产生异常流量 {traffic/(1024**2):.2f} MB',
                    'ip': str(ip),
                    'traffic_mb': float(traffic / (1024**2))
                })
            
            print(f"检测到异常流量IP: {len(abnormal_ips)} 个")
        
        # 5. 垃圾邮件攻击
        if 'is_spam' in self.email_df.columns:
            spam_count = self.email_df['is_spam'].sum()
            
            if spam_count > 100:
                threats.append({
                    'type': '垃圾邮件攻击',
                    'severity': 'high',
                    'description': f'检测到 {spam_count} 封垃圾邮件',
                    'count': int(spam_count)
                })
            
            print(f"检测到垃圾邮件: {spam_count} 封")
        
        print(f"\n总计检测到 {len(threats)} 个安全威胁")
        
        # 按严重程度分类
        high_threats = [t for t in threats if t['severity'] == 'high']
        medium_threats = [t for t in threats if t['severity'] == 'medium']
        
        print(f"  高危威胁: {len(high_threats)}")
        print(f"  中危威胁: {len(medium_threats)}")
        
        # 保存结果
        result = {
            'total_threats': len(threats),
            'high_severity': len(high_threats),
            'medium_severity': len(medium_threats),
            'threats': threats
        }
        
        with open(self.output_dir / 'security_threats.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        
        return result
    
    def generate_visualization_data(self):
        """生成可视化所需的数据"""
        print("\n=== 生成可视化数据 ===")
        
        viz_data = {}
        
        # 1. 登录时间分布
        if 'hour' in self.login_df.columns:
            hourly_logins = self.login_df.groupby(['hour', 'state']).size().unstack(fill_value=0)
            viz_data['hourly_logins'] = hourly_logins.to_dict()
        
        # 2. 协议使用分布
        if 'proto' in self.login_df.columns:
            proto_dist = self.login_df['proto'].value_counts().to_dict()
            viz_data['protocol_distribution'] = proto_dist
        
        # 3. 每日流量趋势
        if 'date' in self.tcplog_df.columns and 'total_traffic' in self.tcplog_df.columns:
            daily_traffic = self.tcplog_df.groupby('date')['total_traffic'].sum()
            viz_data['daily_traffic'] = {
                str(k): float(v / (1024**2)) for k, v in daily_traffic.to_dict().items()
            }
        
        # 4. 网站访问分类
        if 'host' in self.weblog_df.columns:
            # 分类网站
            def categorize_website(host):
                host = str(host).lower()
                if 'hightech.com' in host:
                    return '内部系统'
                elif any(x in host for x in ['baidu', 'so.com']):
                    return '搜索引擎'
                elif any(x in host for x in ['taobao', 'alibaba', 'amazon']):
                    return '电商'
                elif any(x in host for x in ['sina', 'ifeng', '6.cn']):
                    return '新闻娱乐'
                else:
                    return '其他'
            
            self.weblog_df['category'] = self.weblog_df['host'].apply(categorize_website)
            category_dist = self.weblog_df['category'].value_counts().to_dict()
            viz_data['website_categories'] = category_dist
        
        # 5. 员工工作时长分布
        if 'work_hours' in self.checking_df.columns:
            work_hours_dist = self.checking_df['work_hours'].dropna().tolist()
            viz_data['work_hours_distribution'] = work_hours_dist
        
        # 6. 邮件时间分布
        if 'time' in self.email_df.columns:
            self.email_df['datetime'] = pd.to_datetime(self.email_df['time'])
            self.email_df['hour'] = self.email_df['datetime'].dt.hour
            email_hourly = self.email_df['hour'].value_counts().sort_index().to_dict()
            viz_data['email_hourly'] = email_hourly
        
        # 7. 网络拓扑数据（IP关系）
        if 'sip' in self.tcplog_df.columns and 'dip' in self.tcplog_df.columns:
            # 取前100个连接用于可视化
            top_connections = self.tcplog_df.nlargest(100, 'total_traffic')[['sip', 'dip', 'total_traffic']]
            
            nodes = set()
            links = []
            
            for _, row in top_connections.iterrows():
                nodes.add(row['sip'])
                nodes.add(row['dip'])
                links.append({
                    'source': row['sip'],
                    'target': row['dip'],
                    'value': float(row['total_traffic'] / 1024)  # KB
                })
            
            viz_data['network_topology'] = {
                'nodes': [{'id': node} for node in nodes],
                'links': links
            }
        
        # 保存可视化数据
        with open(self.output_dir / 'visualization_data.json', 'w', encoding='utf-8') as f:
            json.dump(viz_data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"可视化数据已保存到 {self.output_dir / 'visualization_data.json'}")
        
        return viz_data
    
    def run_full_analysis(self):
        """运行完整分析流程"""
        print("=" * 60)
        print("网络监测数据分析系统")
        print("=" * 60)
        
        # 加载数据
        self.load_all_data()
        
        # 执行各项分析
        login_result = self.analyze_login_security()
        behavior_result = self.analyze_employee_behavior()
        traffic_result = self.analyze_network_traffic()
        threat_result = self.detect_security_threats()
        viz_data = self.generate_visualization_data()
        
        # 生成综合报告
        summary = {
            'analysis_time': datetime.now().isoformat(),
            'data_period': '2017-11-01 to 2017-11-30',
            'summary': {
                'total_login_records': login_result['total_logins'],
                'login_error_rate': login_result['error_rate'],
                'total_web_access': behavior_result['web_access']['total_access'],
                'total_emails': behavior_result['email_stats']['total_emails'],
                'spam_emails': behavior_result['email_stats']['spam_emails'],
                'total_traffic_gb': traffic_result['total_traffic_gb'],
                'total_threats': threat_result['total_threats'],
                'high_severity_threats': threat_result['high_severity']
            }
        }
        
        with open(self.output_dir / 'analysis_summary.json', 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        print("\n" + "=" * 60)
        print("分析完成！结果已保存到 output 目录")
        print("=" * 60)
        
        return summary


if __name__ == '__main__':
    # 数据目录路径 - 使用相对路径
    data_dir = Path(__file__).parent.parent / '选题二——企业日志数据'
    
    # 创建处理器并运行分析
    processor = LogDataProcessor(data_dir)
    summary = processor.run_full_analysis()
    
    print("\n分析摘要:")
    print(json.dumps(summary['summary'], indent=2, ensure_ascii=False))
