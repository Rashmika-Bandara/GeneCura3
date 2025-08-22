import { useState } from 'react'
import { FileCheck, Users, Shield, TrendingUp } from 'lucide-react'

const AdminDashboardHome = () => {
  // Placeholder data - would come from API
  const stats = [
    {
      title: 'Pending Reports',
      value: '12',
      change: '+3',
      changeType: 'increase',
      icon: FileCheck,
      color: 'orange'
    },
    {
      title: 'Total Users',
      value: '156',
      change: '+8',
      changeType: 'increase',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Approved Reports',
      value: '234',
      change: '+12',
      changeType: 'increase',
      icon: Shield,
      color: 'green'
    },
    {
      title: 'System Activity',
      value: '89%',
      change: '+5%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'purple'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'report_submitted',
      user: 'Dr. Sarah Johnson',
      role: 'Doctor',
      action: 'submitted a new medical report',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'report_approved',
      user: 'Head of Genetics',
      role: 'Admin',
      action: 'approved genetic analysis report',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      type: 'user_registered',
      user: 'Dr. Michael Chen',
      role: 'Pharmacologist',
      action: 'registered as new user',
      timestamp: '1 day ago'
    },
    {
      id: 4,
      type: 'report_rejected',
      user: 'Head of Medicine',
      role: 'Admin',
      action: 'rejected treatment analysis report',
      timestamp: '2 days ago'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', icon: 'bg-green-500', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', icon: 'bg-orange-500', text: 'text-orange-600' }
    }
    return colors[color] || colors.blue
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'report_submitted':
        return '📄'
      case 'report_approved':
        return '✅'
      case 'report_rejected':
        return '❌'
      case 'user_registered':
        return '👤'
      default:
        return '📋'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Administrative Dashboard
        </h2>
        <p className="text-gray-600">
          Monitor system activity, review reports, and manage user access across the GeneCura platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colors = getColorClasses(stat.color)
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${colors.bg} rounded-md p-3`}>
                  <div className={`${colors.icon} rounded-md p-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="ml-2 flex items-baseline text-sm">
                      <span className={`${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-1">this week</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Review Pending Reports</div>
            <div className="text-sm opacity-90">12 reports awaiting approval</div>
          </button>
          <button className="btn-secondary text-left p-4 h-auto">
            <div className="font-medium">User Management</div>
            <div className="text-sm">Manage user accounts and permissions</div>
          </button>
          <button className="btn-secondary text-left p-4 h-auto">
            <div className="font-medium">System Analytics</div>
            <div className="text-sm">View detailed system reports</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span className="text-gray-600">({activity.role})</span>
                  {' '}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response Time</span>
              <span className="text-sm font-medium text-gray-900">142ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="text-sm font-medium text-gray-900">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium text-gray-900">68%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Doctors</span>
              <span className="text-sm font-medium text-gray-900">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Geneticists</span>
              <span className="text-sm font-medium text-gray-900">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pharmacologists</span>
              <span className="text-sm font-medium text-gray-900">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Administrators</span>
              <span className="text-sm font-medium text-gray-900">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardHome
